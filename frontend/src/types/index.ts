export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type FindingStatus = 'new' | 'under_review' | 'resolved' | 'escalated';
export type FindingType = 'social' | 'app' | 'domain' | 'phishing' | 'threat';

export interface Finding {
  id: string;
  type: FindingType;
  title: string;
  targetUrl?: string;
  associatedBrand: string;
  brandId: string;
  risk: Severity;
  similarity: number; // e.g. 92
  status: FindingStatus;
  detectedTime: string;
  detectedTimestamp: number;
  platform: 'instagram' | 'tiktok' | 'playstore' | 'facebook' | 'web' | 'apple' | 'twitter' | 'telegram';
  notes?: string[];
  evidenceUrl?: string;
  ipAddress?: string;
  dnsHost?: string;
  registrar?: string;
  asn?: string;
  screenshot?: string;
  assignedAnalyst?: string;
}

export interface Brand {
  id: string;
  name: string;
  domain: string;
  logo: string;
  status: 'active' | 'paused' | 'investigating';
  monitoredAssets: number;
  riskScore: number; // 0 - 100
  lastScanTime: string;
  activeFindingsCount: number;
  description?: string;
  socialHandles: {
    platform: string;
    handle: string;
  }[];
  protectedKeywords: string[];
}

export interface Scan {
  id: string;
  brandName: string;
  brandId: string;
  status: 'completed' | 'running' | 'queued' | 'failed';
  progress: number; // 0 - 100
  findingsCount: number;
  highPriorityCount: number;
  timeAgo: string;
  timestamp: number;
  targetCount: number;
  scanType: 'comprehensive' | 'domains' | 'social' | 'mobile_apps' | 'darkweb';
  errorMessage?: string;
}

export interface ThreatNode {
  id: string;
  label: string;
  type: 'brand' | 'profiles' | 'domains' | 'mobile' | 'findings';
  count?: number;
  risk?: Severity;
  connectedTo: string[];
}
