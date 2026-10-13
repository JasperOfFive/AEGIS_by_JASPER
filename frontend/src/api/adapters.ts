import { Finding, Brand, Scan, Severity, FindingStatus, FindingType } from '../types';
import {
  BackendFindingResponse,
  BackendBrandResponse,
  BackendScanRunResponse,
} from './client';

export function mapBackendPlatform(platform: string): Finding['platform'] {
  const p = platform.toLowerCase();
  if (p.includes('instagram')) return 'instagram';
  if (p.includes('tiktok')) return 'tiktok';
  if (p.includes('google_play') || p.includes('playstore')) return 'playstore';
  if (p.includes('facebook')) return 'facebook';
  if (p.includes('apple')) return 'apple';
  if (p.includes('twitter') || p.includes('x')) return 'twitter';
  return 'web';
}

export function mapBackendReviewStatus(status: string): FindingStatus {
  switch (status.toLowerCase()) {
    case 'under_review':
    case 'investigating':
      return 'under_review';
    case 'resolved':
      return 'resolved';
    case 'confirmed_threat':
    case 'escalated':
      return 'escalated';
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

  // Add reviews to notes if present
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
    status === 'completed' ? 100 : status === 'running' ? 65 : 0;

  const reqSources = s.requested_source_types || [];
  let scanType: Scan['scanType'] = 'comprehensive';
  if (reqSources.includes('social') && !reqSources.includes('app_store')) {
    scanType = 'social';
  } else if (!reqSources.includes('social') && reqSources.includes('app_store')) {
    scanType = 'mobile_apps';
  }

  return {
    id: s.id,
    brandName,
    brandId: s.brand_id,
    status,
    progress,
    findingsCount: s.total_findings_flagged || 0,
    highPriorityCount: Math.round((s.total_findings_flagged || 0) * 0.45),
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
