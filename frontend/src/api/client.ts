/**
 * AEGIS Digital Risk Protection Platform
 * Strongly-typed API client connecting the React frontend to the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

// Backend Schemas & Responses
export interface BackendHealthResponse {
  status: string;
  app: string;
  version: string;
}

export interface BackendSignalBreakdownItem {
  signal_name: string;
  category: string;
  score_contribution: float;
  max_weight: float;
  raw_score: float;
  observed_value?: string;
  target_value?: string;
  explanation: string;
}

export type float = number;

export interface BackendCandidateResponse {
  id: string;
  candidate_type: string; // 'social_profile' | 'mobile_app'
  platform: string;
  canonical_identifier?: string;
  display_name: string;
  username_or_package?: string;
  publisher_or_developer?: string;
  description?: string;
  external_url?: string;
  logo_reference?: string;
  source_provenance?: string;
  metadata_json?: Record<string, any>;
  first_seen_at: string;
  last_seen_at: string;
}

export interface BackendReviewResponse {
  id: string;
  finding_id: string;
  previous_status: string;
  new_status: string;
  reviewer: string;
  comment: string;
  created_at: string;
}

export interface BackendFindingResponse {
  id: string;
  brand_id: string;
  candidate_id: string;
  scan_run_id: string;
  risk_score: number;
  risk_level: string; // 'critical' | 'high' | 'medium' | 'low'
  decision: string;
  detection_reasons: string[];
  signal_breakdown: BackendSignalBreakdownItem[];
  evidence_summary: string;
  review_status: string;
  first_detected_at: string;
  last_detected_at: string;
  resolved_at?: string;
  candidate?: BackendCandidateResponse;
  reviews?: BackendReviewResponse[];
  ai_explanation?: {
    summary?: string;
    key_factors?: string[];
    technical_details?: string[];
    threat_assessment?: string;
    recommended_actions?: string[];
    provider_status?: string;
    model?: string;
    simulated?: boolean;
    raw_response?: string;
  };
  ai_explanation_model?: string;
  ai_explanation_generated_at?: string;
  ai_explanation_status?: string;
}

export interface BackendBrandAssetResponse {
  id: string;
  brand_id: string;
  asset_type: string;
  platform: string;
  display_value: string;
  normalized_identifier?: string;
  url?: string;
  image_reference?: string;
  is_verified: boolean;
  verification_status: string;
  created_at: string;
}

export interface BackendBrandResponse {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  primary_website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assets_count?: number;
  scans_count?: number;
  findings_count?: number;
}

export interface BackendBrandDetailResponse extends BackendBrandResponse {
  assets: BackendBrandAssetResponse[];
}

export interface BackendScanSourceResultResponse {
  id: string;
  source_name: string;
  status: string;
  records_collected: number;
  started_at: string;
  completed_at: string;
  error_message?: string;
}

export interface BackendScanRunResponse {
  id: string;
  brand_id: string;
  requested_source_types: string[];
  status: string;
  started_at?: string;
  completed_at?: string;
  total_candidates_found: number;
  total_findings_flagged: number;
  failure_details?: string;
  created_at: string;
  source_results?: BackendScanSourceResultResponse[];
}

export interface BackendPaginatedFindingsResponse {
  items: BackendFindingResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendDashboardStatsResponse {
  overview: {
    total_brands: number;
    total_scans: number;
    total_findings: number;
    total_candidates_observed: number;
    active_threats: number;
  };
  risk_breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  status_breakdown: {
    new: number;
    under_review: number;
    confirmed_threat: number;
    false_positive: number;
    resolved: number;
    ignored: number;
  };
  platform_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  recent_scans: BackendScanRunResponse[];
  recent_threats: BackendFindingResponse[];
}

export interface BackendAIStatusResponse {
  provider: string;
  status: string;
  base_url: string;
  model: string;
  auth_configured: boolean;
  has_live_credentials: boolean;
  timeout_seconds: number;
  description: string;
}

export const apiClient = {
  // Health
  getHealth: () => request<BackendHealthResponse>('/health'),

  // Dashboard
  getDashboardStats: () => request<BackendDashboardStatsResponse>('/dashboard/stats'),

  // Brands
  getBrands: (activeOnly = false) =>
    request<BackendBrandResponse[]>(`/brands?active_only=${activeOnly}`),

  getBrand: (id: string) => request<BackendBrandDetailResponse>(`/brands/${id}`),

  createBrand: (payload: {
    name: string;
    description?: string;
    industry?: string;
    primary_website?: string;
    is_active?: boolean;
  }) =>
    request<BackendBrandResponse>('/brands', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateBrand: (
    id: string,
    payload: {
      name?: string;
      description?: string;
      industry?: string;
      primary_website?: string;
      is_active?: boolean;
    }
  ) =>
    request<BackendBrandResponse>(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  createBrandAsset: (
    brandId: string,
    payload: {
      asset_type: string;
      platform: string;
      display_value: string;
      normalized_identifier?: string;
      url?: string;
      image_reference?: string;
      verification_status?: string;
    }
  ) =>
    request<BackendBrandAssetResponse>(`/brands/${brandId}/assets`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getBrandAssets: (brandId: string) =>
    request<BackendBrandAssetResponse[]>(`/brands/${brandId}/assets`),

  // Scans
  getScans: (limit = 50) => request<BackendScanRunResponse[]>(`/scans?limit=${limit}`),

  getScan: (id: string) => request<BackendScanRunResponse>(`/scans/${id}`),

  triggerScan: (payload: {
    brand_id: string;
    requested_source_types?: string[];
    simulate_unavailable_source?: string;
  }) =>
    request<BackendScanRunResponse>('/scans', {
      method: 'POST',
      body: JSON.stringify({
        brand_id: payload.brand_id,
        requested_source_types: payload.requested_source_types || ['social', 'app_store'],
        simulate_unavailable_source: payload.simulate_unavailable_source || null,
      }),
    }),

  // Findings
  getFindings: (params?: {
    brand_id?: string;
    risk_level?: string;
    review_status?: string;
    platform?: string;
    candidate_type?: string;
    decision?: string;
    min_score?: number;
    max_score?: number;
    page?: number;
    page_size?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return request<BackendPaginatedFindingsResponse>(`/findings${qs ? `?${qs}` : ''}`);
  },

  getFinding: (id: string) => request<BackendFindingResponse>(`/findings/${id}`),

  reviewFinding: (
    id: string,
    payload: {
      new_status: string;
      reviewer?: string;
      comment: string;
    }
  ) =>
    request<BackendReviewResponse>(`/findings/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        new_status: payload.new_status,
        reviewer: payload.reviewer || 'Security Analyst',
        comment: payload.comment || 'Triage review submitted via analyst workbench.',
      }),
    }),

  getFindingReviews: (id: string) =>
    request<BackendReviewResponse[]>(`/findings/${id}/reviews`),

  explainFinding: (id: string, forceRefresh = false) =>
    request<{
      finding_id: string;
      ai_explanation: any;
      provider_status: string;
      model: string;
      generated_at: string;
      cached: boolean;
    }>(`/findings/${id}/explain?force_refresh=${forceRefresh}`, {
      method: 'POST',
    }),

  // AI Service Telemetry
  getAIStatus: () => request<BackendAIStatusResponse>('/ai/status'),

  // Demo Seeding & Reset
  seedDemoData: () =>
    request<{
      success: boolean;
      message: string;
      brand_id: string;
      brand_name: string;
      scan_id: string;
      findings_flagged: number;
      candidates_discovered: number;
    }>('/demo/seed', {
      method: 'POST',
    }),

  resetDemoData: () =>
    request<{
      success: boolean;
      message: string;
    }>('/demo/reset', {
      method: 'POST',
    }),
};
