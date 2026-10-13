import React from 'react';
import { motion } from 'framer-motion';
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
        {appFindings.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 70, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
            onClick={() => setSelectedFinding(app)}
            className="p-6 rounded-2xl border transition-all shadow-xl flex flex-col justify-between cursor-pointer group hover:shadow-2xl"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {app.platform === 'playstore' ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-400 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500/40">
                      <Play size={10} fill="currentColor" /> Google Play Mirror
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300 shadow-xs dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700">
                      <Apple size={11} fill="currentColor" /> iOS Ecosystem
                    </span>
                  )}
                </div>
                <SeverityBadge severity={app.risk} showDot />
              </div>

              <div className="flex items-center gap-3.5 mt-4">
                <div
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform shrink-0 shadow-sm"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--primary-accent)'
                  }}
                >
                  📱
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {app.title}
                  </h3>
                  <p className="text-xs mt-0.5 text-stone-700 dark:text-slate-300">
                    Associated: <strong className="font-bold text-stone-950 dark:text-white">{app.associatedBrand}</strong>
                  </p>
                </div>
              </div>

              <div
                className="mt-4 p-3.5 rounded-xl border grid grid-cols-2 gap-2.5 text-xs shadow-inner"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-700 dark:text-slate-300">Heuristic Match</span>
                  <span className="font-mono font-extrabold text-sm block mt-0.5" style={{ color: 'var(--text-primary)' }}>{app.similarity}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-700 dark:text-slate-300">Registry Host</span>
                  <span className="font-mono font-bold text-xs truncate block mt-0.5 text-stone-900 dark:text-slate-200">{app.dnsHost || 'unauthorized-apk.net'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-700 dark:text-slate-300">Status</span>
                  <div className="mt-1"><StatusBadge status={app.status} /></div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-700 dark:text-slate-300">Detection Time</span>
                  <span className="font-bold text-xs block mt-1 text-stone-900 dark:text-slate-200">{app.detectedTime}</span>
                </div>
              </div>

              {app.notes && (
                <div className="mt-3.5 space-y-1">
                  {app.notes.slice(0, 2).map((n, i) => (
                    <p key={i} className="text-xs font-medium leading-relaxed text-stone-800 dark:text-slate-200 line-clamp-1">
                      • {n}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div
              className="pt-3 mt-3 border-t flex items-center justify-end text-xs"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span className="font-mono text-[11px] font-semibold text-stone-700 dark:text-slate-400">Ref: {app.id}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
