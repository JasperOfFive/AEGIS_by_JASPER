import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const ThreatIntelligencePage: React.FC = () => {
  const { brands } = useAegis();
  const [selectedEntity, setSelectedEntity] = useState<string>('acme');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeNodeDetails, setActiveNodeDetails] = useState<any>(null);

  const selectedBrand = brands.find(b => b.id.includes(selectedEntity)) || brands[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Threat Intelligence Graph
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Interactive relational topology exposing infrastructure clusters, fake profiles, and malicious hosts.
          </p>
        </div>

        {/* Brand Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Target Brand:</label>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
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

      {/* Main Interactive Graph Canvas */}
      <div
        className="relative h-[550px] w-full rounded-2xl border overflow-hidden shadow-2xl flex flex-col justify-between"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        {/* Controls Toolbar */}
        <div
          className="absolute top-4 left-4 z-10 flex items-center gap-2 border rounded-xl p-1.5 backdrop-blur-md"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
            className="p-1.5 rounded-lg hover:opacity-100 opacity-70"
            title="Zoom In"
            style={{ color: 'var(--text-primary)' }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
            className="p-1.5 rounded-lg hover:opacity-100 opacity-70"
            title="Zoom Out"
            style={{ color: 'var(--text-primary)' }}
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-lg hover:opacity-100 opacity-70"
            title="Reset Graph"
            style={{ color: 'var(--text-primary)' }}
          >
            <RotateCcw size={15} />
          </button>
          <span className="text-[11px] font-mono px-2 font-bold" style={{ color: 'var(--primary-accent)' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Legend */}
        <div
          className="absolute top-4 right-4 z-10 hidden sm:flex flex-col gap-1.5 border rounded-xl p-3 backdrop-blur-md text-[11px]"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
            Node Topology
          </span>
          <div className="flex items-center gap-2 text-rose-500">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Malicious / Impersonator
          </div>
          <div className="flex items-center gap-2 text-orange-500">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High-Risk App / Mirror
          </div>
          <div className="flex items-center gap-2 text-emerald-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Typosquat / Lookalike Domain
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--primary-accent)' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--primary-accent)' }} /> Protected Brand Core
          </div>
        </div>

        {/* SVG Graph Viewport */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg className="w-full h-full max-w-4xl" viewBox="0 0 800 500">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.05" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Connecting Links */}
            <path d="M 400 250 Q 520 180 620 140" stroke="#F43F5E" strokeWidth="2" strokeDasharray="6 3" opacity="0.7" fill="none" />
            <path d="M 620 140 L 710 110" stroke="#F43F5E" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" fill="none" />
            <path d="M 620 140 L 730 180" stroke="#F43F5E" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" fill="none" />

            <path d="M 400 250 Q 280 180 180 140" stroke="#10B981" strokeWidth="2" strokeDasharray="6 3" opacity="0.7" fill="none" />
            <path d="M 180 140 L 90 100" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" fill="none" />
            <path d="M 180 140 L 80 180" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" fill="none" />

            <path d="M 400 250 Q 550 330 630 360" stroke="#F97316" strokeWidth="2" strokeDasharray="6 3" opacity="0.7" fill="none" />
            <path d="M 630 360 L 720 390" stroke="#F97316" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" fill="none" />

            <path d="M 400 250 Q 280 340 200 370" stroke="var(--primary-accent)" strokeWidth="2" strokeDasharray="6 3" opacity="0.7" fill="none" />
            <path d="M 200 370 L 110 400" stroke="var(--primary-accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" fill="none" />

            {/* Center Brand Node */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveNodeDetails({
                title: selectedBrand.name,
                type: 'Protected Core Asset',
                risk: 'Protected',
                meta: `${selectedBrand.monitoredAssets} monitored endpoints • Primary Domain: ${selectedBrand.domain}`
              })}
            >
              <circle cx="400" cy="250" r="42" fill="var(--card-sub-bg)" stroke="var(--primary-accent)" strokeWidth="3" />
              <circle cx="400" cy="250" r="48" fill="none" stroke="var(--primary-accent)" strokeWidth="1" opacity="0.4" />
              <text x="400" y="246" textAnchor="middle" fill="var(--text-primary)" fontSize="13" fontWeight="bold">{selectedBrand.name}</text>
              <text x="400" y="262" textAnchor="middle" fill="var(--primary-accent)" fontSize="9" fontFamily="monospace">CORE ASSET</text>
            </g>

            {/* Cluster 1: Suspicious Social Profiles */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveNodeDetails({
                title: 'Suspicious Profiles Cluster (12)',
                type: 'Social Impersonation Network',
                risk: 'Critical',
                meta: 'Coordinated fake Instagram & TikTok handles soliciting seed funds and gift vouchers.'
              })}
            >
              <circle cx="620" cy="140" r="28" fill="var(--card-sub-bg)" stroke="#F43F5E" strokeWidth="2.5" />
              <text x="620" y="145" textAnchor="middle" fill="#F43F5E" fontSize="18">👤</text>
              <text x="620" y="180" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold">Suspicious Profiles</text>
              <text x="620" y="194" textAnchor="middle" fill="var(--text-muted)" fontSize="9">12 linked accounts</text>
            </g>
            <circle cx="710" cy="110" r="10" fill="var(--card-sub-bg)" stroke="#F43F5E" strokeWidth="1" />
            <circle cx="730" cy="180" r="10" fill="var(--card-sub-bg)" stroke="#F43F5E" strokeWidth="1" />

            {/* Cluster 2: Lookalike Domains */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveNodeDetails({
                title: 'Lookalike Domains (8)',
                type: 'Typosquat Infrastructure',
                risk: 'High',
                meta: 'Resolving to ASN 22612 with active MX records and SSL certificates issued by Let’s Encrypt.'
              })}
            >
              <circle cx="180" cy="140" r="28" fill="var(--card-sub-bg)" stroke="#10B981" strokeWidth="2.5" />
              <text x="180" y="145" textAnchor="middle" fill="#10B981" fontSize="18">🌐</text>
              <text x="180" y="180" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold">Lookalike Domains</text>
              <text x="180" y="194" textAnchor="middle" fill="var(--text-muted)" fontSize="9">8 resolving domains</text>
            </g>
            <circle cx="90" cy="100" r="10" fill="var(--card-sub-bg)" stroke="#10B981" strokeWidth="1" />
            <circle cx="80" cy="180" r="10" fill="var(--card-sub-bg)" stroke="#10B981" strokeWidth="1" />

            {/* Cluster 3: Mobile Apps */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveNodeDetails({
                title: 'Mobile App Trojans (5)',
                type: 'APK Mirror Distribution',
                risk: 'High',
                meta: 'Contains banking malware overlay payloads targeting customer SMS verifications.'
              })}
            >
              <circle cx="630" cy="360" r="26" fill="var(--card-sub-bg)" stroke="#F97316" strokeWidth="2.5" />
              <text x="630" y="365" textAnchor="middle" fill="#F97316" fontSize="18">📱</text>
              <text x="630" y="398" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold">Mobile Clones</text>
              <text x="630" y="411" textAnchor="middle" fill="var(--text-muted)" fontSize="9">5 APK signatures</text>
            </g>
            <circle cx="720" cy="390" r="10" fill="var(--card-sub-bg)" stroke="#F97316" strokeWidth="1" />

            {/* Cluster 4: Related Findings */}
            <g
              className="cursor-pointer"
              onClick={() => setActiveNodeDetails({
                title: 'Related Incident IOCs (24)',
                type: 'Correlated Evidence',
                risk: 'Medium',
                meta: 'Cross-referenced SSL fingerprints, common WHOIS emails, and shared reverse proxy nodes.'
              })}
            >
              <circle cx="200" cy="370" r="26" fill="var(--card-sub-bg)" stroke="var(--primary-accent)" strokeWidth="2.5" />
              <text x="200" y="375" textAnchor="middle" fill="var(--primary-accent)" fontSize="18">📄</text>
              <text x="200" y="408" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold">Related Findings</text>
              <text x="200" y="421" textAnchor="middle" fill="var(--text-muted)" fontSize="9">24 correlated IOCs</text>
            </g>
            <circle cx="110" cy="400" r="10" fill="var(--card-sub-bg)" stroke="var(--primary-accent)" strokeWidth="1" />
          </svg>
        </div>

        {/* Selected Entity Inspector Bottom Card */}
        {activeNodeDetails ? (
          <div
            className="p-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in z-20"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{activeNodeDetails.title}</span>
                <span
                  className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--primary-accent)'
                  }}
                >
                  {activeNodeDetails.type}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{activeNodeDetails.meta}</p>
            </div>
            <button
              onClick={() => setActiveNodeDetails(null)}
              className="px-3 py-1.5 rounded-lg border text-xs"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <div
            className="p-3 border-t flex items-center justify-between text-xs"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            <span>Click any node on the graph to inspect correlated telemetry & infrastructure.</span>
            <span className="font-mono text-[10px]" style={{ color: 'var(--primary-accent)' }}>Interactive Mode</span>
          </div>
        )}
      </div>
    </div>
  );
};
