import React from 'react';
import { useAegis } from '../context/AegisContext';
import { Play, Apple } from 'lucide-react';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';

export const AppMonitoringPage: React.FC = () => {
  const { findings, setSelectedFinding } = useAegis();
  const appFindings = findings.filter(f => f.type === 'app');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Mobile App Store Monitoring
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Scanning authorized marketplaces and rogue third-party APK distributors for trojanized clones and credential stealer payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appFindings.map((app) => (
          <div
            key={app.id}
            onClick={() => setSelectedFinding(app)}
            className="p-6 rounded-2xl border transition-all shadow-xl flex flex-col justify-between cursor-pointer group"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {app.platform === 'playstore' ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Play size={10} fill="currentColor" /> Google Play Mirror
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                      <Apple size={10} fill="currentColor" /> iOS Ecosystem
                    </span>
                  )}
                </div>
                <SeverityBadge severity={app.risk} showDot />
              </div>

              <div className="flex items-center gap-3.5 mt-4">
                <div
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: 'var(--primary-accent-muted)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--primary-accent)'
                  }}
                >
                  📱
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                    {app.title}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Associated: <strong style={{ color: 'var(--text-primary)' }}>{app.associatedBrand}</strong>
                  </p>
                </div>
              </div>

              <div
                className="mt-4 p-3 rounded-xl border grid grid-cols-2 gap-2 text-xs"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Heuristic Match</span>
                  <span className="font-mono font-bold block mt-0.5" style={{ color: 'var(--text-primary)' }}>{app.similarity}%</span>
                </div>
                <div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Registry Host</span>
                  <span className="font-mono truncate block mt-0.5" style={{ color: 'var(--text-secondary)' }}>{app.dnsHost || 'unauthorized-apk.net'}</span>
                </div>
                <div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Status</span>
                  <div className="mt-0.5"><StatusBadge status={app.status} /></div>
                </div>
                <div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Detection Time</span>
                  <span className="block mt-0.5" style={{ color: 'var(--text-secondary)' }}>{app.detectedTime}</span>
                </div>
              </div>

              {app.notes && (
                <div className="mt-3 space-y-1">
                  {app.notes.slice(0, 2).map((n, i) => (
                    <p key={i} className="text-xs line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                      • {n}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div
              className="pt-4 mt-4 border-t flex items-center justify-between text-xs"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span className="font-medium group-hover:underline" style={{ color: 'var(--primary-accent)' }}>
                View Signature & APK Disassembly →
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Ref: {app.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
