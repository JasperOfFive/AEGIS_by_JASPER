import React, { useState, useEffect, useMemo } from 'react';
import { useAegis } from '../context/AegisContext';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Search,
  ChevronDown,
  Shield,
  Globe,
  User,
  FileText,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  X
} from 'lucide-react';

export const ThreatIntelligencePage: React.FC = () => {
  const { brands, findings } = useAegis();
  const [selectedEntity, setSelectedEntity] = useState<string>('acme');
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [selectedCluster, setSelectedCluster] = useState<string>('All Entities');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNodeDetails, setActiveNodeDetails] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [telemetryTime, setTelemetryTime] = useState<string>(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
  );

  // Live telemetry clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTime(
        new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedBrand = useMemo(() => {
    return brands.find(b => b.id.includes(selectedEntity) || b.id === selectedEntity) || brands[0] || {
      id: 'brand-acme',
      name: 'Acme Finance Group',
      domain: 'acmefinance.com',
      logo: 'A',
      status: 'active' as const,
      monitoredAssets: 12,
      riskScore: 35,
      lastScanTime: 'Just now',
      activeFindingsCount: 6,
      description: 'Global digital banking and financial services.',
      socialHandles: [
        { platform: 'Twitter / X', handle: '@acmefinance' },
        { platform: 'Instagram', handle: '@acmefinance_official' }
      ],
      protectedKeywords: ['acme', 'finance']
    };
  }, [brands, selectedEntity]);

  // Correlated data for the current brand
  const brandFindings = useMemo(() => {
    return selectedBrand ? findings.filter(f => f.brandId === selectedBrand.id) : findings;
  }, [findings, selectedBrand]);

  const domainFindings = useMemo(() => {
    return brandFindings.filter(f => f.type === 'domain');
  }, [brandFindings]);

  const socialFindings = useMemo(() => {
    return brandFindings.filter(f => f.type === 'social');
  }, [brandFindings]);

  const appFindings = useMemo(() => {
    return brandFindings.filter(f => f.type === 'app');
  }, [brandFindings]);

  // Satellites with actual telemetry
  const d1Finding = domainFindings[0] || {
    id: 'D1',
    title: 'acme-corp-secure.com',
    targetUrl: 'https://acme-corp-secure.com/login',
    ipAddress: '198.54.117.210',
    dnsHost: 'dns1.namecheaphosting.com',
    registrar: 'NameCheap, Inc.',
    risk: 'high',
    asn: 'AS22612 Namecheap Cloud',
    status: 'under_review',
    notes: ['Reverse-proxy phishing toolkit targeting Okta employee SSO.', 'TLS issued by Let\'s Encrypt.']
  };

  const d2Finding = domainFindings[1] || {
    id: 'D2',
    title: 'acme-employee-portal.xyz',
    targetUrl: 'https://acme-employee-portal.xyz',
    ipAddress: '45.145.66.12',
    dnsHost: 'ns1.bulletproof-dns.org',
    registrar: 'Reg.ru',
    risk: 'critical',
    asn: 'AS44050 Hosting Services',
    status: 'escalated',
    notes: ['Credential harvester collecting MFA tokens with evilginx2 framework.']
  };

  const p1Finding = socialFindings[0] || {
    id: 'P1',
    title: '@acme_corporation_official',
    targetUrl: 'https://instagram.com/acme_corporation_official',
    platform: 'Instagram',
    ipAddress: '157.240.22.174',
    dnsHost: 'instagram.cdn-edge.net',
    risk: 'high',
    similarity: 92,
    status: 'new',
    notes: ['Account created 3 days ago impersonating corporate communications.', 'Active DM campaign targeting followers.']
  };

  const p2Finding = socialFindings[1] || {
    id: 'P2',
    title: selectedBrand.socialHandles?.[1] ? `${selectedBrand.socialHandles[1].handle}` : '@acme_support_desk',
    targetUrl: 'https://twitter.com/AcmeCorpGlobal',
    platform: 'Twitter / X',
    ipAddress: '104.244.42.1',
    dnsHost: 'twitter-edge.twttr.com',
    risk: 'medium',
    similarity: 78,
    status: 'under_review',
    notes: ['Automated reply bot hijacking support queries under brand mentions.']
  };

  const f1Finding = brandFindings[0] || {
    id: 'F1',
    title: 'Correlated Incident IOCs',
    targetUrl: 'https://ioc.aegis-intel.internal/case-409',
    ipAddress: '198.54.117.210, 45.145.66.12',
    dnsHost: 'Shared ASN Cluster 22612',
    risk: 'high',
    status: 'investigating',
    notes: ['Cross-referenced SSL fingerprints, WHOIS registrar emails, and reverse proxy nodes.']
  };

  const m1Finding = appFindings[0] || {
    id: 'M1',
    title: 'Acme Banking Pro',
    targetUrl: 'https://play.google.com/store/apps/details?id=com.acme.bankingpro.fake',
    platform: 'Google Play Store',
    ipAddress: '185.199.108.153',
    dnsHost: 'api.acme-banking-backend.ru',
    risk: 'critical',
    status: 'new',
    notes: ['Trojanized banking app requesting SMS intercept and accessibility permissions.', 'Matches Cerberus-v4 banking malware overlay.']
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Check if a node is matched by search query
  const isSearchMatch = (name: string, extra?: string) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || (extra && extra.toLowerCase().includes(q));
  };

  // Node highlight logic
  const isClusterActive = (clusterType: string) => {
    if (selectedCluster === 'All Entities') return true;
    if (selectedCluster === 'Domains' && clusterType === 'domains') return true;
    if (selectedCluster === 'Profiles' && clusterType === 'profiles') return true;
    if (selectedCluster === 'IOC Findings' && clusterType === 'findings') return true;
    if (selectedCluster === 'Mobile Apps' && clusterType === 'mobile') return true;
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Bar matching Image 2 */}
      <div
        className="p-3 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm transition-colors duration-200"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        {/* Search Input */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search entity, IOC, domain, or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* CLUSTERS: Filter group */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span
            className="text-[10px] font-mono uppercase tracking-wider font-bold mr-1 shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            CLUSTERS:
          </span>
          {['All Entities', 'Domains', 'Profiles', 'IOC Findings', 'Mobile Apps'].map(cluster => {
            const isActive = selectedCluster === cluster;
            return (
              <button
                key={cluster}
                type="button"
                onClick={() => setSelectedCluster(cluster)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'font-bold shadow-xs'
                    : 'hover:opacity-100 opacity-80'
                }`}
                style={{
                  backgroundColor: isActive
                    ? 'var(--card-sub-bg)'
                    : 'transparent',
                  borderColor: isActive
                    ? 'var(--primary-accent)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--primary-accent)'
                    : 'var(--text-secondary)'
                }}
              >
                {cluster}
              </button>
            );
          })}
        </div>

        {/* All Severities Dropdown & Brand Switcher */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Quick Target Brand Switcher */}
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="border rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none cursor-pointer hidden sm:block"
            title="Target Brand"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            {brands.map(b => (
              <option key={b.id} value={b.id.replace('brand-', '')}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Graph Canvas Container matching Image 2 */}
      <div
        className="relative h-[600px] w-full rounded-2xl border overflow-hidden shadow-xl flex flex-col justify-between select-none"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        {/* Controls Toolbar (Top Left) */}
        <div
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 border rounded-xl p-1 shadow-sm backdrop-blur-md"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.6))}
            className="p-1.5 rounded-lg hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            title="Zoom In"
            style={{ color: 'var(--text-primary)' }}
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.55))}
            className="p-1.5 rounded-lg hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            title="Zoom Out"
            style={{ color: 'var(--text-primary)' }}
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-lg hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            title="Fit to Screen"
            style={{ color: 'var(--text-primary)' }}
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={() => setZoomLevel(0.85)}
            className="p-1.5 rounded-lg hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            title="Reset to 85%"
            style={{ color: 'var(--text-primary)' }}
          >
            <RotateCcw size={13} />
          </button>
          <span
            className="text-[11px] font-mono px-2 font-bold min-w-[38px] text-center"
            style={{ color: 'var(--primary-accent)' }}
          >
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Topology Legend Card (Top Right) */}
        <div
          className="absolute top-4 right-4 z-20 flex flex-col gap-2 border rounded-xl p-3 shadow-sm backdrop-blur-md text-[11px]"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span
              className="text-[9px] font-mono uppercase tracking-widest font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              TOPOLOGY LEGEND
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10">
              Live
            </span>
          </div>

          <div className="flex flex-col gap-1.5 pt-0.5">
            <div className="flex items-center gap-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: '#A3582D' }} />
              Protected Core Asset
            </div>
            <div className="flex items-center gap-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#059669]" />
              Lookalike Domains
            </div>
            <div className="flex items-center gap-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#E11D48]" />
              Suspicious Profiles
            </div>
            <div className="flex items-center gap-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#D97706]" />
              Related Findings
            </div>
            <div className="flex items-center gap-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#EA580C]" />
              Mobile Clones
            </div>
          </div>
        </div>

        {/* SVG Graph Canvas Viewport */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg className="w-full h-full max-w-5xl" viewBox="0 0 800 500">
            <defs>
              {/* Subtle background grid pattern */}
              <pattern id="topology-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.06" />
              </pattern>

              {/* Glowing filter for nodes */}
              <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid background */}
            <rect width="100%" height="100%" fill="url(#topology-grid)" />

            {/* Concentric radar circles centered at (400, 250) */}
            <circle cx="400" cy="250" r="115" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.12" />
            <circle cx="400" cy="250" r="205" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.1" />
            <circle cx="400" cy="250" r="295" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.08" />

            {/* Roaming Telemetry Blip Dot at (398, 45) with gentle orbit/pulse */}
            <circle cx="398" cy="45" r="3.5" fill="#0284C7">
              <animate attributeName="r" values="3;4.5;3" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.4s" repeatCount="indefinite" />
            </circle>

            {/* CONNECTING DASHED LINES BETWEEN CENTER & 4 CLUSTERS */}
            {/* 1. Lookalike Domains: (400, 250) -> (140, 140) */}
            <path
              id="path-domains"
              d="M 400 250 L 140 140"
              stroke="#059669"
              strokeWidth="1.8"
              strokeDasharray="5 3"
              opacity={isClusterActive('domains') ? 0.8 : 0.25}
              fill="none"
            />

            {/* 2. Suspicious Profiles: (400, 250) -> (655, 140) */}
            <path
              id="path-profiles"
              d="M 400 250 L 655 140"
              stroke="#E11D48"
              strokeWidth="1.8"
              strokeDasharray="5 3"
              opacity={isClusterActive('profiles') ? 0.8 : 0.25}
              fill="none"
            />

            {/* 3. Related Findings: (400, 250) -> (150, 375) */}
            <path
              id="path-findings"
              d="M 400 250 L 150 375"
              stroke="#D97706"
              strokeWidth="1.8"
              strokeDasharray="5 3"
              opacity={isClusterActive('findings') ? 0.8 : 0.25}
              fill="none"
            />

            {/* 4. Mobile Clones: (400, 250) -> (645, 375) */}
            <path
              id="path-mobile"
              d="M 400 250 L 645 375"
              stroke="#EA580C"
              strokeWidth="1.8"
              strokeDasharray="5 3"
              opacity={isClusterActive('mobile') ? 0.8 : 0.25}
              fill="none"
            />

            {/* MOVING CONNECTOR DOTS TRAVELING ALONG THE LINES */}
            {/* Moving dot 1: Domains (Green) */}
            <circle r="4.5" fill="#059669" style={{ filter: 'drop-shadow(0 0 5px rgba(5, 150, 105, 0.9))' }}>
              <animateMotion
                dur="2.5s"
                repeatCount="indefinite"
                path="M 400 250 L 140 140"
              />
            </circle>
            <circle r="3" fill="#059669" opacity="0.6">
              <animateMotion
                dur="2.5s"
                begin="1.25s"
                repeatCount="indefinite"
                path="M 400 250 L 140 140"
              />
            </circle>

            {/* Moving dot 2: Profiles (Crimson) */}
            <circle r="4.5" fill="#E11D48" style={{ filter: 'drop-shadow(0 0 5px rgba(225, 29, 72, 0.9))' }}>
              <animateMotion
                dur="3.0s"
                repeatCount="indefinite"
                path="M 400 250 L 655 140"
              />
            </circle>
            <circle r="3" fill="#E11D48" opacity="0.6">
              <animateMotion
                dur="3.0s"
                begin="1.5s"
                repeatCount="indefinite"
                path="M 400 250 L 655 140"
              />
            </circle>

            {/* Moving dot 3: Findings (Amber) */}
            <circle r="4.5" fill="#D97706" style={{ filter: 'drop-shadow(0 0 5px rgba(217, 119, 6, 0.9))' }}>
              <animateMotion
                dur="2.7s"
                repeatCount="indefinite"
                path="M 400 250 L 150 375"
              />
            </circle>
            <circle r="3" fill="#D97706" opacity="0.6">
              <animateMotion
                dur="2.7s"
                begin="1.35s"
                repeatCount="indefinite"
                path="M 400 250 L 150 375"
              />
            </circle>

            {/* Moving dot 4: Mobile Clones (Orange) */}
            <circle r="4.5" fill="#EA580C" style={{ filter: 'drop-shadow(0 0 5px rgba(234, 88, 12, 0.9))' }}>
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                path="M 400 250 L 645 375"
              />
            </circle>
            <circle r="3" fill="#EA580C" opacity="0.6">
              <animateMotion
                dur="3.2s"
                begin="1.6s"
                repeatCount="indefinite"
                path="M 400 250 L 645 375"
              />
            </circle>

            {/* SATELLITE CONNECTING DASHED LINES */}
            {/* Domains Satellites: D1 (65, 100) & D2 (60, 180) */}
            <line x1="140" y1="140" x2="65" y2="100" stroke="#059669" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.55" />
            <line x1="140" y1="140" x2="60" y2="180" stroke="#059669" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.55" />

            {/* Profiles Satellites: P1 (735, 100) & P2 (745, 175) */}
            <line x1="655" y1="140" x2="735" y2="100" stroke="#E11D48" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.55" />
            <line x1="655" y1="140" x2="745" y2="175" stroke="#E11D48" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.55" />

            {/* Findings Satellite: F1 (75, 410) */}
            <line x1="150" y1="375" x2="75" y2="410" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.55" />

            {/* Mobile Satellite: M1 (735, 410) */}
            <line x1="645" y1="375" x2="735" y2="410" stroke="#EA580C" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.55" />

            {/* SATELLITE NODES */}
            {/* D1 Satellite */}
            <g
              className="cursor-pointer group"
              onClick={() => setActiveNodeDetails({
                title: d1Finding.title,
                type: 'Lookalike Domain (D1)',
                risk: d1Finding.risk,
                meta: `Target: ${d1Finding.targetUrl} • IP: ${d1Finding.ipAddress} • Registrar: ${d1Finding.registrar}`,
                asn: d1Finding.asn,
                notes: d1Finding.notes,
                url: d1Finding.targetUrl
              })}
            >
              <circle
                cx="65" cy="100" r="13"
                fill="var(--card-sub-bg)"
                stroke="#059669"
                strokeWidth="1.8"
                className="transition-all duration-200 group-hover:scale-[1.08] group-active:scale-[1.02] group-hover:drop-shadow-[0_2px_6px_rgba(5,150,105,0.45)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <text x="65" y="103.5" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold" fontFamily="monospace" className="pointer-events-none">
                D1
              </text>
            </g>

            {/* D2 Satellite */}
            <g
              className="cursor-pointer group"
              onClick={() => setActiveNodeDetails({
                title: d2Finding.title,
                type: 'Credential Harvester (D2)',
                risk: d2Finding.risk,
                meta: `Target: ${d2Finding.targetUrl} • IP: ${d2Finding.ipAddress} • ASN: ${d2Finding.asn}`,
                asn: d2Finding.asn,
                notes: d2Finding.notes,
                url: d2Finding.targetUrl
              })}
            >
              <circle
                cx="60" cy="180" r="13"
                fill="var(--card-sub-bg)"
                stroke="#059669"
                strokeWidth="1.8"
                className="transition-all duration-200 group-hover:scale-[1.08] group-active:scale-[1.02] group-hover:drop-shadow-[0_2px_6px_rgba(5,150,105,0.45)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <text x="60" y="183.5" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold" fontFamily="monospace" className="pointer-events-none">
                D2
              </text>
            </g>

            {/* P1 Satellite */}
            <g
              className="cursor-pointer group"
              onClick={() => setActiveNodeDetails({
                title: p1Finding.title,
                type: 'Social Impersonation (P1)',
                risk: p1Finding.risk,
                meta: `Platform: ${p1Finding.platform} • Similarity: ${p1Finding.similarity || 92}% • IP: ${p1Finding.ipAddress}`,
                notes: p1Finding.notes,
                url: p1Finding.targetUrl
              })}
            >
              <circle
                cx="735" cy="100" r="13"
                fill="var(--card-sub-bg)"
                stroke="#E11D48"
                strokeWidth="1.8"
                className="transition-all duration-200 group-hover:scale-[1.08] group-active:scale-[1.02] group-hover:drop-shadow-[0_2px_6px_rgba(225,29,72,0.45)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <text x="735" y="103.5" textAnchor="middle" fill="#E11D48" fontSize="9" fontWeight="bold" fontFamily="monospace" className="pointer-events-none">
                P1
              </text>
            </g>

            {/* P2 Satellite */}
            <g
              className="cursor-pointer group"
              onClick={() => setActiveNodeDetails({
                title: p2Finding.title,
                type: 'Linked Social Account (P2)',
                risk: p2Finding.risk,
                meta: `Platform: ${p2Finding.platform} • Status: ${p2Finding.status}`,
                notes: p2Finding.notes,
                url: p2Finding.targetUrl
              })}
            >
              <circle
                cx="745" cy="175" r="13"
                fill="var(--card-sub-bg)"
                stroke="#E11D48"
                strokeWidth="1.8"
                className="transition-all duration-200 group-hover:scale-[1.08] group-active:scale-[1.02] group-hover:drop-shadow-[0_2px_6px_rgba(225,29,72,0.45)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <text x="745" y="178.5" textAnchor="middle" fill="#E11D48" fontSize="9" fontWeight="bold" fontFamily="monospace" className="pointer-events-none">
                P2
              </text>
            </g>

            {/* F1 Satellite */}
            <g
              className="cursor-pointer group"
              onClick={() => setActiveNodeDetails({
                title: f1Finding.title,
                type: 'Incident IOC (F1)',
                risk: f1Finding.risk,
                meta: `Correlated IPs: ${f1Finding.ipAddress} • Infrastructure: ${f1Finding.dnsHost}`,
                notes: f1Finding.notes,
                url: f1Finding.targetUrl
              })}
            >
              <circle
                cx="75" cy="410" r="13"
                fill="var(--card-sub-bg)"
                stroke="#D97706"
                strokeWidth="1.8"
                className="transition-all duration-200 group-hover:scale-[1.08] group-active:scale-[1.02] group-hover:drop-shadow-[0_2px_6px_rgba(217,119,6,0.45)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <text x="75" y="413.5" textAnchor="middle" fill="#D97706" fontSize="9" fontWeight="bold" fontFamily="monospace" className="pointer-events-none">
                F1
              </text>
            </g>

            {/* M1 Satellite */}
            <g
              className="cursor-pointer group"
              onClick={() => setActiveNodeDetails({
                title: m1Finding.title,
                type: 'Mobile APK Signature (M1)',
                risk: m1Finding.risk,
                meta: `Host: ${m1Finding.dnsHost} • Malware: Cerberus-v4 Banking Trojan`,
                notes: m1Finding.notes,
                url: m1Finding.targetUrl
              })}
            >
              <circle
                cx="735" cy="410" r="13"
                fill="var(--card-sub-bg)"
                stroke="#EA580C"
                strokeWidth="1.8"
                className="transition-all duration-200 group-hover:scale-[1.08] group-active:scale-[1.02] group-hover:drop-shadow-[0_2px_6px_rgba(234,88,12,0.45)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <text x="735" y="413.5" textAnchor="middle" fill="#EA580C" fontSize="9" fontWeight="bold" fontFamily="monospace" className="pointer-events-none">
                M1
              </text>
            </g>

            {/* 4 MAJOR CLUSTERS */}
            {/* CLUSTER 1: Lookalike Domains (Top-Left, 140, 140) */}
            <g
              className="cursor-pointer group"
              opacity={isClusterActive('domains') ? 1 : 0.35}
              onClick={() => setActiveNodeDetails({
                title: `Lookalike Domains Cluster (${domainFindings.length || 2})`,
                type: 'Typosquat / Lookalike Domain',
                risk: 'High',
                meta: `Correlated resolving domains actively squatting ${selectedBrand.name} trademarks.`,
                findingsList: domainFindings
              })}
            >
              <circle
                cx="140" cy="140" r="28"
                fill="var(--card-sub-bg)"
                stroke="#059669"
                strokeWidth="2.5"
                className="transition-all duration-200 group-hover:scale-[1.05] group-active:scale-[1.02] group-hover:stroke-[3] group-hover:drop-shadow-[0_3px_8px_rgba(5,150,105,0.4)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              {/* Globe Icon */}
              <g transform="translate(128, 128)" fill="none" stroke="#0284C7" strokeWidth="1.8" className="pointer-events-none">
                <circle cx="12" cy="12" r="10" />
                <path d="M 2 12 h 20" />
                <path d="M 12 2 a 15 15 0 0 1 0 20 a 15 15 0 0 1 0 -20" />
              </g>

              {/* White/Ivory Card Badge Below */}
              <g transform="translate(75, 176)">
                <rect
                  width="130" height="38" rx="8"
                  fill="var(--card-sub-bg)"
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.06))"
                />
                <text x="65" y="16" textAnchor="middle" fill="var(--text-primary)" fontSize="10.5" fontWeight="bold">
                  Lookalike Domains
                </text>
                <text x="65" y="29" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                  {domainFindings.length || 2} resolving domains
                </text>
              </g>
            </g>

            {/* CLUSTER 2: Suspicious Profiles (Top-Right, 655, 140) */}
            <g
              className="cursor-pointer group"
              opacity={isClusterActive('profiles') ? 1 : 0.35}
              onClick={() => setActiveNodeDetails({
                title: `Suspicious Profiles Cluster (${socialFindings.length || 1})`,
                type: 'Social Impersonation Network',
                risk: 'High',
                meta: `Coordinated handles impersonating ${selectedBrand.name} executive & support channels.`,
                findingsList: socialFindings
              })}
            >
              <circle
                cx="655" cy="140" r="28"
                fill="var(--card-sub-bg)"
                stroke="#E11D48"
                strokeWidth="2.5"
                className="transition-all duration-200 group-hover:scale-[1.05] group-active:scale-[1.02] group-hover:stroke-[3] group-hover:drop-shadow-[0_3px_8px_rgba(225,29,72,0.4)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              {/* User Icon */}
              <g transform="translate(643, 128)" fill="#4C1D95" stroke="#4C1D95" className="pointer-events-none">
                <circle cx="12" cy="7" r="4" />
                <path d="M 4 21 a 8 8 0 0 1 16 0" />
              </g>

              {/* White/Ivory Card Badge Below */}
              <g transform="translate(590, 176)">
                <rect
                  width="130" height="38" rx="8"
                  fill="var(--card-sub-bg)"
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.06))"
                />
                <text x="65" y="16" textAnchor="middle" fill="var(--text-primary)" fontSize="10.5" fontWeight="bold">
                  Suspicious Profiles
                </text>
                <text x="65" y="29" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                  {socialFindings.length || 1} linked accounts
                </text>
              </g>
            </g>

            {/* CLUSTER 3: Related Findings (Bottom-Left, 150, 375) */}
            <g
              className="cursor-pointer group"
              opacity={isClusterActive('findings') ? 1 : 0.35}
              onClick={() => setActiveNodeDetails({
                title: `Related Findings IOCs (${brandFindings.length || 4})`,
                type: 'Correlated Evidence Cluster',
                risk: 'Medium',
                meta: `Cross-referenced incident indicators, SSL certificates, and DNS associations.`,
                findingsList: brandFindings
              })}
            >
              <circle
                cx="150" cy="375" r="28"
                fill="var(--card-sub-bg)"
                stroke="#D97706"
                strokeWidth="2.5"
                className="transition-all duration-200 group-hover:scale-[1.05] group-active:scale-[1.02] group-hover:stroke-[3] group-hover:drop-shadow-[0_3px_8px_rgba(217,119,6,0.4)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              {/* Document/File Icon */}
              <g transform="translate(138, 363)" fill="none" stroke="#818CF8" strokeWidth="1.8" className="pointer-events-none">
                <path d="M 6 2 h 8 l 5 5 v 13 a 2 2 0 0 1 -2 2 h -11 a 2 2 0 0 1 -2 -2 v -16 a 2 2 0 0 1 2 -2" />
                <path d="M 14 2 v 5 h 5" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="14" y2="16" />
              </g>

              {/* White/Ivory Card Badge Below */}
              <g transform="translate(85, 411)">
                <rect
                  width="130" height="38" rx="8"
                  fill="var(--card-sub-bg)"
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.06))"
                />
                <text x="65" y="16" textAnchor="middle" fill="var(--text-primary)" fontSize="10.5" fontWeight="bold">
                  Related Findings
                </text>
                <text x="65" y="29" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                  {brandFindings.length || 4} correlated IOCs
                </text>
              </g>
            </g>

            {/* CLUSTER 4: Mobile Clones (Bottom-Right, 645, 375) */}
            <g
              className="cursor-pointer group"
              opacity={isClusterActive('mobile') ? 1 : 0.35}
              onClick={() => setActiveNodeDetails({
                title: `Mobile Clones (${appFindings.length || 1})`,
                type: 'High-Risk App / Mirror',
                risk: 'Critical',
                meta: `Rogue APK packages and third-party store clones targeting customer credentials.`,
                findingsList: appFindings
              })}
            >
              <circle
                cx="645" cy="375" r="28"
                fill="var(--card-sub-bg)"
                stroke="#EA580C"
                strokeWidth="2.5"
                className="transition-all duration-200 group-hover:scale-[1.05] group-active:scale-[1.02] group-hover:stroke-[3] group-hover:drop-shadow-[0_3px_8px_rgba(234,88,12,0.4)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              {/* Smartphone Icon */}
              <g transform="translate(633, 363)" fill="none" stroke="#4F46E5" strokeWidth="1.8" className="pointer-events-none">
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </g>

              {/* White/Ivory Card Badge Below */}
              <g transform="translate(580, 411)">
                <rect
                  width="130" height="38" rx="8"
                  fill="var(--card-sub-bg)"
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.06))"
                />
                <text x="65" y="16" textAnchor="middle" fill="var(--text-primary)" fontSize="10.5" fontWeight="bold">
                  Mobile Clones
                </text>
                <text x="65" y="29" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                  {appFindings.length || 1} APK signatures
                </text>
              </g>
            </g>

            {/* CENTER BRAND NODE: Core Asset (400, 250) */}
            <g
              className="cursor-pointer group"
              onClick={() => setActiveNodeDetails({
                title: selectedBrand.name,
                type: 'Protected Core Asset',
                risk: 'Protected',
                meta: `Domain: ${selectedBrand.domain} • Monitored Assets: ${selectedBrand.monitoredAssets} • Risk Score: ${selectedBrand.riskScore}/100`,
                brandInfo: selectedBrand
              })}
            >
              {/* Concentric outer rings */}
              <circle cx="400" cy="250" r="72" fill="none" stroke="var(--primary-accent)" strokeWidth="1" opacity="0.35" strokeDasharray="3 2" />
              <circle
                cx="400" cy="250" r="62"
                fill="var(--card-sub-bg)"
                stroke="#A3582D"
                strokeWidth="2.8"
                className="transition-all duration-200 group-hover:scale-[1.04] group-active:scale-[1.01] group-hover:stroke-[3.3] group-hover:drop-shadow-[0_3px_10px_rgba(163,88,45,0.4)]"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />

              {/* Brown Shield Icon */}
              <g transform="translate(393, 212)" fill="#9C5B32">
                <path d="M 7 1 L 13 4 V 9 C 13 13 7 16 7 16 C 7 16 1 13 1 9 V 4 Z" />
              </g>

              {/* Brand Title */}
              <text x="400" y="246" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="bold">
                {selectedBrand.name}
              </text>

              {/* Small pill below: CORE PERIMETER */}
              <g transform="translate(358, 257)">
                <rect
                  width="84" height="15" rx="4.5"
                  fill="var(--card-bg)"
                  stroke="var(--border-color)"
                  strokeWidth="1"
                />
                <text x="42" y="11" textAnchor="middle" fill="var(--primary-accent)" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                  CORE PERIMETER
                </text>
              </g>
            </g>
          </svg>
        </div>

        {/* BOTTOM TELEMETRY STRIP matching Image 2 */}
        <div
          className="p-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 z-20 transition-colors"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          {/* Left message with pulsing emerald dot */}
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span>Click on any core asset, cluster, or peripheral satellite to inspect correlated intelligence.</span>
          </div>

          {/* Right telemetry readout */}
          <div
            className="text-xs font-mono font-medium tracking-tight shrink-0 flex items-center gap-2"
            style={{ color: 'var(--primary-accent)' }}
          >
            <span>Telemetry: {telemetryTime}</span>
            <span>•</span>
            <span style={{ color: 'var(--text-muted)' }}>5 Clusters Monitored</span>
          </div>
        </div>

        {/* Interactive Node Details Modal / Drawer */}
        {activeNodeDetails && (
          <div
            className="absolute inset-x-4 bottom-14 z-30 p-4 rounded-xl border shadow-2xl backdrop-blur-md animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {activeNodeDetails.title}
                </span>
                <span
                  className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--primary-accent)',
                    backgroundColor: 'var(--card-sub-bg)'
                  }}
                >
                  {activeNodeDetails.type}
                </span>
                {activeNodeDetails.risk && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    activeNodeDetails.risk.toLowerCase() === 'critical'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : activeNodeDetails.risk.toLowerCase() === 'high'
                      ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {activeNodeDetails.risk}
                  </span>
                )}
              </div>

              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {activeNodeDetails.meta}
              </p>

              {activeNodeDetails.notes && activeNodeDetails.notes.length > 0 && (
                <div className="text-[11px] font-mono mt-1 opacity-80" style={{ color: 'var(--text-muted)' }}>
                  Note: {activeNodeDetails.notes[0]}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeNodeDetails.url && (
                <button
                  type="button"
                  onClick={() => handleCopy(activeNodeDetails.url)}
                  className="px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {copiedText === activeNodeDetails.url ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedText === activeNodeDetails.url ? 'Copied' : 'Copy IOC'}</span>
                </button>
              )}

              {activeNodeDetails.url && (
                <a
                  href={activeNodeDetails.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  style={{
                    backgroundColor: 'var(--primary-accent)',
                    borderColor: 'var(--primary-accent)',
                    color: '#FFFFFF'
                  }}
                >
                  Inspect Evidence <ExternalLink size={12} />
                </a>
              )}

              <button
                type="button"
                onClick={() => setActiveNodeDetails(null)}
                className="p-1.5 rounded-lg border hover:opacity-100 opacity-70 transition-all cursor-pointer"
                title="Close"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatIntelligencePage;
