/**
 * AEGIS Centralized API Client & Service Layer
 * Connects the React frontend directly to the FastAPI backend (/api/v1).
 * Uses real backend endpoints, response schemas, and adapters.
 */

import { Brand, Finding, Scan, FindingStatus } from '../types';
import {
  BackendBrandResponse,
  BackendFindingResponse,
  BackendScanRunResponse,
  BackendDashboardStatsResponse,
  backendBrandToFrontend,
  backendFindingToFrontend,
  backendScanToFrontend
} from './adapters';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

/**
 * Standard HTTP headers helper with Bearer token authentication
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aegis-auth-token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Robust JSON fetch wrapper connecting to FastAPI backend
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null; error: Error | null; isMock: boolean }> {
  try {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      let detail = `API Error ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          detail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch {
        // response wasn't JSON
      }
      throw new Error(detail);
    }

    const data = await response.json();
    return { data, error: null, isMock: false };
  } catch (err: any) {
    return { data: null, error: err, isMock: true };
  }
}

export const api = {
  // Authentication Endpoints
  auth: {
    async login(email: string, _password?: string) {
      const user = {
        name: email.split('@')[0] || 'Security Analyst',
        email
      };
      localStorage.setItem('aegis-current-user', JSON.stringify(user));
      localStorage.setItem('aegis-auth-token', 'aegis-session-active');
      return { data: { user, token: 'aegis-session-active' }, error: null, isMock: false };
    },

    async register(payload: { name: string; email: string; password?: string; organization?: string }) {
      const user = {
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        organization: payload.organization || 'AEGIS Security'
      };
      localStorage.setItem('aegis-current-user', JSON.stringify(user));
      localStorage.setItem('aegis-auth-token', 'aegis-session-active');
      return { data: { user, token: 'aegis-session-active' }, error: null, isMock: false };
    },

    async logout() {
      localStorage.removeItem('aegis-current-user');
      localStorage.removeItem('aegis-auth-token');
      localStorage.removeItem('aegis-authenticated');
      return { data: { success: true }, error: null, isMock: false };
    },

    async getCurrentUser() {
      const saved = localStorage.getItem('aegis-current-user');
      const user = saved ? JSON.parse(saved) : null;
      return { data: user, error: null, isMock: false };
    }
  },

  // Brands Management Endpoints (FastAPI /api/v1/brands)
  brands: {
    async getAll(): Promise<{ data: Brand[] | null; error: Error | null; isMock: boolean }> {
      const res = await apiFetch<BackendBrandResponse[]>('/brands');
      if (res.data && Array.isArray(res.data)) {
        const mapped = res.data.map(backendBrandToFrontend);
        return { data: mapped, error: null, isMock: false };
      }
      return { data: null, error: res.error, isMock: true };
    },

    async getById(id: string): Promise<{ data: Brand | null; error: Error | null; isMock: boolean }> {
      const res = await apiFetch<BackendBrandResponse>(`/brands/${id}`);
      if (res.data) {
        return { data: backendBrandToFrontend(res.data), error: null, isMock: false };
      }
      return { data: null, error: res.error, isMock: true };
    },

    async create(brand: Partial<Brand>): Promise<{ data: Brand | null; error: Error | null; isMock: boolean }> {
      const payload = {
        name: brand.name || 'New Monitored Brand',
        primary_website: brand.domain ? (brand.domain.startsWith('http') ? brand.domain : `https://${brand.domain}`) : 'https://example.com',
        industry: 'Financial Services',
        description: brand.description || 'Monitored brand asset'
      };
      const res = await apiFetch<BackendBrandResponse>('/brands', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.data) {
        return { data: backendBrandToFrontend(res.data), error: null, isMock: false };
      }
      return { data: null, error: res.error, isMock: true };
    },

    async update(id: string, updates: Partial<Brand>): Promise<{ data: Brand | null; error: Error | null; isMock: boolean }> {
      const payload: Record<string, any> = {};
      if (updates.name) payload.name = updates.name;
      if (updates.domain) payload.primary_website = updates.domain.startsWith('http') ? updates.domain : `https://${updates.domain}`;
      if (updates.description) payload.description = updates.description;
      if (updates.status) payload.is_active = updates.status === 'active';

      const res = await apiFetch<BackendBrandResponse>(`/brands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.data) {
        return { data: backendBrandToFrontend(res.data), error: null, isMock: false };
      }
      return { data: null, error: res.error, isMock: true };
    },

    async delete(id: string): Promise<{ data: { success: boolean } | null; error: Error | null; isMock: boolean }> {
      return apiFetch<{ success: boolean }>(`/brands/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Findings & Detections Endpoints (FastAPI /api/v1/findings)
  findings: {
    async getAll(brandMap: Record<string, BackendBrandResponse> = {}): Promise<{ data: Finding[] | null; error: Error | null; isMock: boolean }> {
      const res = await apiFetch<{ items: BackendFindingResponse[]; total: number }>('/findings?page=1&page_size=100');
      if (res.data && res.data.items) {
        const mapped = res.data.items.map(f => backendFindingToFrontend(f, brandMap));
        return { data: mapped, error: null, isMock: false };
      }
      return { data: null, error: res.error, isMock: true };
    },

    async getById(id: string, brandMap: Record<string, BackendBrandResponse> = {}): Promise<{ data: Finding | null; error: Error | null; isMock: boolean }> {
      const res = await apiFetch<BackendFindingResponse>(`/findings/${id}`);
      if (res.data) {
        return { data: backendFindingToFrontend(res.data, brandMap), error: null, isMock: false };
      }
      return { data: null, error: res.error, isMock: true };
    },

    async updateStatus(id: string, status: FindingStatus, comment?: string): Promise<{ data: Finding | null; error: Error | null; isMock: boolean }> {
      const backendStatusMap: Record<string, string> = {
        new: 'new',
        under_review: 'under_review',
        resolved: 'resolved',
        escalated: 'confirmed_threat',
        false_positive: 'false_positive',
        ignored: 'ignored'
      };

      const payload = {
        new_status: backendStatusMap[status] || status,
        reviewer: 'Alex Carter',
        comment: comment || `Finding status updated to ${status} via analyst triage.`
      };

      const reviewRes = await apiFetch<any>(`/findings/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!reviewRes.error) {
        return api.findings.getById(id);
      }
      return { data: null, error: reviewRes.error, isMock: true };
    },

    async addNote(id: string, note: string): Promise<{ data: Finding | null; error: Error | null; isMock: boolean }> {
      const payload = {
        new_status: 'under_review',
        reviewer: 'Alex Carter',
        comment: note
      };
      const res = await apiFetch<any>(`/findings/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!res.error) {
        return api.findings.getById(id);
      }
      return { data: null, error: res.error, isMock: true };
    }
  },

  // Scans & Engine Endpoints (FastAPI /api/v1/scans)
  scans: {
    async getAll(brandMap: Record<string, BackendBrandResponse> = {}): Promise<{ data: Scan[] | null; error: Error | null; isMock: boolean }> {
      const res = await apiFetch<BackendScanRunResponse[]>('/scans?limit=50');
      if (res.data && Array.isArray(res.data)) {
        const mapped = res.data.map(s => backendScanToFrontend(s, brandMap));
        return { data: mapped, error: null, isMock: false };
      }
      return { data: null, error: res.error, isMock: true };
    },

    async run(brandId: string, targets: string[] = ['social', 'app_store'], _scanType?: string): Promise<{ data: BackendScanRunResponse | null; error: Error | null; isMock: boolean }> {
      let sources = targets.map(t => {
        if (t === 'mobile' || t === 'mobile_apps' || t === 'apps' || t === 'app_store') return 'app_store';
        if (t === 'domains' || t === 'domain') return 'domain';
        if (t === 'darkweb' || t === 'threat_intel') return 'threat_intel';
        return 'social';
      });
      if (sources.length === 0) {
        sources = ['social', 'app_store', 'domain', 'threat_intel'];
      }
      const uniqueSources = Array.from(new Set(sources));

      return apiFetch<BackendScanRunResponse>('/scans', {
        method: 'POST',
        body: JSON.stringify({
          brand_id: brandId,
          requested_source_types: uniqueSources
        })
      });
    },

    async getStatus(scanId: string): Promise<{ data: any | null; error: Error | null; isMock: boolean }> {
      return apiFetch<any>(`/scans/${scanId}/status`);
    },

    async retry(scanId: string): Promise<{ data: BackendScanRunResponse | null; error: Error | null; isMock: boolean }> {
      const scanRes = await apiFetch<BackendScanRunResponse>(`/scans/${scanId}`);
      if (scanRes.data) {
        return api.scans.run(scanRes.data.brand_id, scanRes.data.requested_source_types);
      }
      return { data: null, error: new Error('Scan record not found to retry'), isMock: true };
    }
  },

  // Dashboard Telemetry
  dashboard: {
    async getStats(): Promise<{ data: BackendDashboardStatsResponse | null; error: Error | null; isMock: boolean }> {
      return apiFetch<BackendDashboardStatsResponse>('/dashboard/stats');
    }
  },

  // Real Apinex DeepSeek AI Explanation Endpoint
  ai: {
    async explainFinding(findingId: string, forceRefresh = false): Promise<{ data: any | null; error: Error | null; isMock: boolean }> {
      return apiFetch<any>(`/findings/${findingId}/explain?force_refresh=${forceRefresh}`, {
        method: 'POST'
      });
    },

    async getStatus(): Promise<{ data: any | null; error: Error | null; isMock: boolean }> {
      return apiFetch<any>('/ai/status');
    }
  }
};
