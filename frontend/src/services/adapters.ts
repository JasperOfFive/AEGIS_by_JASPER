import { Finding, Brand, Scan, Severity, FindingStatus, FindingType } from '../types';

export interface BackendSignalBreakdownItem {
  signal_name: string;
  category: string;
  score_contribution: number;
  max_weight: number;
  raw_score: number;
  observed_value?: string;
  target_value?: string;
  explanation: string;
}

export interface BackendCandidateResponse {
  id: string;
  candidate_type: string;
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
  risk_level: string;
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
    rule_triggers?: string[];
    evidence_supported?: string[];
    uncertainties?: string[];
    suggested_actions?: string[];
    key_factors?: string[];
    threat_assessment?: string;
    recommended_actions?: string[];
    provider_status?: string;
    model?: string;
  };
  ai_explanation_model?: string;
  ai_explanation_generated_at?: string;
  ai_explanation_status?: string;
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
  schedule_enabled?: boolean;
  schedule_interval_hours?: number;
  last_scheduled_run_at?: string;
  next_scheduled_run_at?: string;
}

export interface BackendScanRunResponse {
  id: string;
  brand_id: string;
  requested_source_types?: string[];
  status: string;
  progress_percent?: number;
  total_candidates_found?: number;
  total_findings_flagged?: number;
  high_priority_findings?: number;
  created_at: string;
  completed_at?: string;
  failure_details?: string;
}

export interface BackendDashboardStatsResponse {
  monitored_brands_count: number;
  active_findings_count: number;
  critical_high_count: number;
  triage_resolved_count: number;
  scans_completed_24h: number;
  avg_risk_score: number;
  findings_by_risk: Record<string, number>;
  findings_by_platform: Record<string, number>;
  recent_activity: any[];
}

export function mapBackendPlatform(platform: string): Finding['platform'] {
  const p = (platform || '').toLowerCase();
  if (p.includes('instagram')) return 'instagram';
  if (p.includes('tiktok')) return 'tiktok';
  if (p.includes('google_play') || p.includes('playstore')) return 'playstore';
  if (p.includes('facebook')) return 'facebook';
  if (p.includes('apple')) return 'apple';
  if (p.includes('twitter') || p.includes('x')) return 'twitter';
  if (p.includes('telegram')) return 'telegram';
  return 'web';
}

export function mapBackendReviewStatus(status: string): FindingStatus {
  switch ((status || '').toLowerCase()) {
    case 'under_review':
    case 'investigating':
      return 'under_review';
    case 'resolved':
      return 'resolved';
    case 'confirmed_threat':
    case 'escalated':
      return 'escalated';
    case 'false_positive':
      return 'false_positive';
    case 'ignored':
      return 'ignored';
    case 'new':
    default:
      return 'new';
  }
}

export function backendFindingToFrontend(
  f: BackendFindingResponse,
  brandMap: Record<string, BackendBrandResponse> = {}
): Finding & { raw?: BackendFindingResponse } {
  const brand = brandMap[f.brand_id];
  const brandName = brand?.name || 'Acme Finance Group';
  const candidate = f.candidate;

  const candidateType = candidate?.candidate_type || 'social_profile';
  const type: FindingType =
    candidateType === 'social_profile'
      ? 'social'
      : candidateType === 'mobile_app'
      ? 'app'
      : candidateType === 'phishing_url'
      ? 'phishing'
      : 'domain';

  const title =
    candidate?.display_name ||
    candidate?.username_or_package ||
    `Discovered Threat ${f.id.slice(0, 8)}`;

  const notes =
    f.detection_reasons && f.detection_reasons.length > 0
      ? [...f.detection_reasons]
      : f.evidence_summary
      ? [f.evidence_summary]
      : ['Candidate flagged by AEGIS automated detection engine.'];

  if (f.reviews && f.reviews.length > 0) {
    f.reviews.forEach((r) => {
      notes.push(`[${r.reviewer}]: ${r.comment} (${r.new_status})`);
    });
  }

  const riskLevel = (f.risk_level?.toLowerCase() as Severity) || 'high';

  return {
    id: f.id,
    type,
    title,
    targetUrl: candidate?.external_url,
    associatedBrand: brandName,
    brandId: f.brand_id,
    risk: riskLevel,
    similarity: Math.round(f.risk_score || 85),
    status: mapBackendReviewStatus(f.review_status),
    detectedTime: new Date(f.first_detected_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    detectedTimestamp: new Date(f.first_detected_at).getTime(),
    platform: mapBackendPlatform(candidate?.platform || 'web'),
    notes,
    ipAddress:
      candidate?.metadata_json?.ip ||
      candidate?.metadata_json?.resolved_ip ||
      '198.51.100.42',
    dnsHost:
      candidate?.metadata_json?.dns_host ||
      candidate?.metadata_json?.package_id ||
      candidate?.username_or_package ||
      'dns1.threat-protection.net',
    registrar:
      candidate?.metadata_json?.registrar ||
      candidate?.publisher_or_developer ||
      'NameCheap Inc.',
    asn: candidate?.metadata_json?.asn || 'AS13335 Cloudflare',
    assignedAnalyst:
      f.reviews && f.reviews.length > 0
        ? f.reviews[f.reviews.length - 1].reviewer
        : 'Alex Carter',
    raw: f,
  };
}

export function backendBrandToFrontend(b: BackendBrandResponse): Brand {
  const domain = b.primary_website
    ? b.primary_website.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : `${b.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  const cleanHandle = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');

  return {
    id: b.id,
    name: b.name,
    domain,
    logo: b.name.charAt(0).toUpperCase(),
    status: b.is_active ? 'active' : 'paused',
    monitoredAssets: b.assets_count || 6,
    riskScore: b.findings_count ? Math.min(95, b.findings_count * 10 + 25) : 32,
    lastScanTime: b.updated_at
      ? new Date(b.updated_at).toLocaleDateString()
      : 'Just now',
    activeFindingsCount: b.findings_count || 0,
    description:
      b.description ||
      'Enterprise organization monitored for brand impersonation and typosquatting.',
    socialHandles: [
      { platform: 'Instagram', handle: `@${cleanHandle}` },
      { platform: 'Twitter / X', handle: `@${cleanHandle}_official` },
      { platform: 'LinkedIn', handle: cleanHandle },
    ],
    protectedKeywords: [b.name.toLowerCase(), cleanHandle, `${cleanHandle}-pay`],
    scheduleEnabled: b.schedule_enabled,
    scheduleIntervalHours: b.schedule_interval_hours,
    lastScheduledRunAt: b.last_scheduled_run_at,
    nextScheduledRunAt: b.next_scheduled_run_at,
  };
}

export function backendScanToFrontend(
  s: BackendScanRunResponse,
  brandMap: Record<string, BackendBrandResponse> = {}
): Scan {
  const brandName = brandMap[s.brand_id]?.name || 'Acme Finance Group';

  let status: Scan['status'] = 'completed';
  if (s.status === 'running') status = 'running';
  else if (s.status === 'failed') status = 'failed';
  else if (s.status === 'queued') status = 'queued';

  const progress =
    s.progress_percent !== undefined
      ? s.progress_percent
      : status === 'completed'
      ? 100
      : status === 'running'
      ? 65
      : 0;

  const reqSources = s.requested_source_types || [];
  let scanType: Scan['scanType'] = 'comprehensive';
  if (reqSources.includes('social') && !reqSources.includes('mobile_apps')) {
    scanType = 'social';
  } else if (!reqSources.includes('social') && reqSources.includes('mobile_apps')) {
    scanType = 'mobile_apps';
  } else if (reqSources.includes('domains')) {
    scanType = 'domains';
  }

  return {
    id: s.id,
    brandName,
    brandId: s.brand_id,
    status,
    progress,
    findingsCount: s.total_findings_flagged || 0,
    highPriorityCount: s.high_priority_findings || Math.round((s.total_findings_flagged || 0) * 0.45),
    timeAgo: new Date(s.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    timestamp: new Date(s.created_at).getTime(),
    targetCount: s.total_candidates_found || 12,
    scanType,
    errorMessage: s.failure_details,
  };
}
