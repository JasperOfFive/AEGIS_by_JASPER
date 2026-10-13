import { Finding, Brand, Scan } from '../types';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-acme',
    name: 'Acme Corporation',
    domain: 'acme-corp.com',
    logo: 'A',
    status: 'active',
    monitoredAssets: 184,
    riskScore: 78,
    lastScanTime: '2 hours ago',
    activeFindingsCount: 248,
    description: 'Global enterprise delivering mission-critical cloud infrastructure and industrial logistics.',
    socialHandles: [
      { platform: 'Instagram', handle: '@acmecorporation' },
      { platform: 'Twitter / X', handle: '@AcmeCorpGlobal' },
      { platform: 'LinkedIn', handle: 'acme-corporation' }
    ],
    protectedKeywords: ['acme', 'acme-pay', 'acme-secure', 'acme cloud', 'acme-banking']
  },
  {
    id: 'brand-globex',
    name: 'Globex Inc.',
    domain: 'globex.net',
    logo: 'G',
    status: 'investigating',
    monitoredAssets: 96,
    riskScore: 64,
    lastScanTime: 'In progress',
    activeFindingsCount: 67,
    description: 'International consumer electronics, financial software, and modern retail solutions.',
    socialHandles: [
      { platform: 'TikTok', handle: '@globex_official' },
      { platform: 'Instagram', handle: '@globex' }
    ],
    protectedKeywords: ['globex', 'globexpay', 'globex-auth', 'globexcareers']
  },
  {
    id: 'brand-soylent',
    name: 'Soylent Corp.',
    domain: 'soylent.co',
    logo: 'S',
    status: 'active',
    monitoredAssets: 42,
    riskScore: 28,
    lastScanTime: '5 hours ago',
    activeFindingsCount: 12,
    description: 'Biotech nutritional consumer foods and automated direct-to-consumer distribution.',
    socialHandles: [
      { platform: 'Twitter / X', handle: '@soylentcorp' },
      { platform: 'Instagram', handle: '@soylentnutrition' }
    ],
    protectedKeywords: ['soylent', 'soylentnutrition', 'soylent-store']
  },
  {
    id: 'brand-umbrella',
    name: 'Umbrella Co.',
    domain: 'umbrella-pharma.org',
    logo: 'U',
    status: 'paused',
    monitoredAssets: 110,
    riskScore: 84,
    lastScanTime: '8 hours ago',
    activeFindingsCount: 89,
    description: 'Pharmaceutical research, specialized bio-technologies, and clinical health networks.',
    socialHandles: [
      { platform: 'LinkedIn', handle: 'umbrella-pharmaceuticals' }
    ],
    protectedKeywords: ['umbrella-lab', 'umbrella-health', 'umbrellapharma']
  }
];

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'find-101',
    type: 'social',
    title: '@acme_corporation_official',
    targetUrl: 'https://instagram.com/acme_corporation_official',
    associatedBrand: 'Acme Corporation',
    brandId: 'brand-acme',
    risk: 'high',
    similarity: 92,
    status: 'new',
    detectedTime: '2 hours ago',
    detectedTimestamp: Date.now() - 2 * 3600 * 1000,
    platform: 'instagram',
    dnsHost: 'instagram.cdn-edge.net',
    ipAddress: '157.240.22.174',
    registrar: 'Meta Platform Host',
    asn: 'AS32934 Fastly / Cloud',
    assignedAnalyst: 'Alex Carter',
    notes: [
      'Account created 3 days ago impersonating Acme corporate communications.',
      'Active DM campaign redirecting users to fake token presale link in bio.'
    ]
  },
  {
    id: 'find-102',
    type: 'social',
    title: '@globex.inc',
    targetUrl: 'https://tiktok.com/@globex.inc',
    associatedBrand: 'Globex Inc.',
    brandId: 'brand-globex',
    risk: 'medium',
    similarity: 78,
    status: 'under_review',
    detectedTime: '4 hours ago',
    detectedTimestamp: Date.now() - 4 * 3600 * 1000,
    platform: 'tiktok',
    ipAddress: '104.244.42.1',
    dnsHost: 'tiktok-edge.bytedance.net',
    registrar: 'TikTok Internal',
    asn: 'AS138699',
    assignedAnalyst: 'Sarah Lin',
    notes: [
      'Posting clone promotional videos with altered referral links in bio.'
    ]
  },
  {
    id: 'find-103',
    type: 'app',
    title: 'Acme Banking Pro',
    targetUrl: 'https://play.google.com/store/apps/details?id=com.acme.bankingpro.fake',
    associatedBrand: 'Acme Corporation',
    brandId: 'brand-acme',
    risk: 'critical',
    similarity: 95,
    status: 'new',
    detectedTime: '6 hours ago',
    detectedTimestamp: Date.now() - 6 * 3600 * 1000,
    platform: 'playstore',
    ipAddress: '185.199.108.153',
    dnsHost: 'api.acme-banking-backend.ru',
    registrar: 'NameCheap Inc.',
    asn: 'AS200019 RU-CLOAK',
    assignedAnalyst: 'Alex Carter',
    notes: [
      'Trojanized banking app requesting SMS intercept and accessibility permissions.',
      'Signature matches known banking malware variant Cerberus-v4.',
      'Automated takedown request dispatched to Google Play Trust & Safety.'
    ]
  },
  {
    id: 'find-104',
    type: 'social',
    title: 'Globex Careers',
    targetUrl: 'https://facebook.com/globexcareers.hiring',
    associatedBrand: 'Globex Inc.',
    brandId: 'brand-globex',
    risk: 'medium',
    similarity: 76,
    status: 'resolved',
    detectedTime: '8 hours ago',
    detectedTimestamp: Date.now() - 8 * 3600 * 1000,
    platform: 'facebook',
    ipAddress: '31.13.71.36',
    dnsHost: 'edge-star-mini-shv-01-frt3.facebook.com',
    registrar: 'Meta Platforms',
    asn: 'AS32934',
    assignedAnalyst: 'Elena Rostova',
    notes: [
      'Recruiting scam attempting to harvest passports and identity docs.',
      'Account suspended following abuse report ticket #884920.'
    ]
  },
  {
    id: 'find-105',
    type: 'domain',
    title: 'acme-corp-secure.com',
    targetUrl: 'https://acme-corp-secure.com/login',
    associatedBrand: 'Acme Corporation',
    brandId: 'brand-acme',
    risk: 'high',
    similarity: 88,
    status: 'under_review',
    detectedTime: '12 hours ago',
    detectedTimestamp: Date.now() - 12 * 3600 * 1000,
    platform: 'web',
    ipAddress: '198.54.117.210',
    dnsHost: 'dns1.namecheaphosting.com',
    registrar: 'NameCheap, Inc.',
    asn: 'AS22612 Namecheap Cloud',
    assignedAnalyst: 'Alex Carter',
    notes: [
      'Reverse-proxy phishing toolkit targeting Okta employee single sign-on.',
      'Hosted behind Let’s Encrypt automated TLS certificate.'
    ]
  },
  {
    id: 'find-106',
    type: 'domain',
    title: 'acme-employee-portal.xyz',
    targetUrl: 'https://acme-employee-portal.xyz',
    associatedBrand: 'Acme Corporation',
    brandId: 'brand-acme',
    risk: 'critical',
    similarity: 94,
    status: 'escalated',
    detectedTime: '14 hours ago',
    detectedTimestamp: Date.now() - 14 * 3600 * 1000,
    platform: 'web',
    ipAddress: '45.145.66.12',
    dnsHost: 'ns1.bulletproof-dns.org',
    registrar: 'Reg.ru',
    asn: 'AS44050 Hosting Services',
    assignedAnalyst: 'Marcus Vance',
    notes: [
      'Credential harvester actively collecting MFA tokens with evilginx2 framework.'
    ]
  },
  {
    id: 'find-107',
    type: 'app',
    title: 'Globex Wallet - Quick Loan',
    targetUrl: 'https://apps.apple.com/us/app/globex-wallet-instant/id98492019',
    associatedBrand: 'Globex Inc.',
    brandId: 'brand-globex',
    risk: 'high',
    similarity: 85,
    status: 'new',
    detectedTime: '18 hours ago',
    detectedTimestamp: Date.now() - 18 * 3600 * 1000,
    platform: 'apple',
    ipAddress: '17.253.144.10',
    dnsHost: 'apple-review-cdn.net',
    registrar: 'Apple App Store Ecosystem',
    asn: 'AS714 Apple Inc.',
    assignedAnalyst: 'Sarah Lin',
    notes: [
      'Predatory financial app reusing Globex registered trademarks without authorization.'
    ]
  },
  {
    id: 'find-108',
    type: 'threat',
    title: 'umbrella-pharma-clinical.biz',
    targetUrl: 'https://umbrella-pharma-clinical.biz',
    associatedBrand: 'Umbrella Co.',
    brandId: 'brand-umbrella',
    risk: 'critical',
    similarity: 97,
    status: 'escalated',
    detectedTime: '1 day ago',
    detectedTimestamp: Date.now() - 24 * 3600 * 1000,
    platform: 'web',
    ipAddress: '91.215.85.19',
    dnsHost: 'ns1.dark-infra.cc',
    registrar: 'Tucows Domains Inc.',
    asn: 'AS59600 Host Europe',
    assignedAnalyst: 'Alex Carter',
    notes: [
      'Counterfeit prescription portal selling unauthorized compound batches.'
    ]
  }
];

export const INITIAL_SCANS: Scan[] = [
  {
    id: 'scan-01',
    brandName: 'Acme Corporation',
    brandId: 'brand-acme',
    status: 'completed',
    progress: 100,
    findingsCount: 248,
    highPriorityCount: 37,
    timeAgo: '2 hours ago',
    timestamp: Date.now() - 2 * 3600 * 1000,
    targetCount: 1420,
    scanType: 'comprehensive'
  },
  {
    id: 'scan-02',
    brandName: 'Globex Inc.',
    brandId: 'brand-globex',
    status: 'running',
    progress: 67,
    findingsCount: 45,
    highPriorityCount: 8,
    timeAgo: 'In progress',
    timestamp: Date.now() - 20 * 60 * 1000,
    targetCount: 890,
    scanType: 'social'
  },
  {
    id: 'scan-03',
    brandName: 'Soylent Corp.',
    brandId: 'brand-soylent',
    status: 'completed',
    progress: 100,
    findingsCount: 12,
    highPriorityCount: 2,
    timeAgo: '5 hours ago',
    timestamp: Date.now() - 5 * 3600 * 1000,
    targetCount: 420,
    scanType: 'domains'
  },
  {
    id: 'scan-04',
    brandName: 'Umbrella Co.',
    brandId: 'brand-umbrella',
    status: 'failed',
    progress: 42,
    findingsCount: 0,
    highPriorityCount: 0,
    timeAgo: '8 hours ago',
    timestamp: Date.now() - 8 * 3600 * 1000,
    targetCount: 650,
    scanType: 'mobile_apps',
    errorMessage: 'Source error — Gateway rate limit exceeded on mobile registry API'
  }
];
