import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckCircle2, RotateCw, XCircle, ArrowRight } from 'lucide-react';
import { useAegis } from '../../context/AegisContext';

export const ScanActivityCard: React.FC = () => {
  const { scans, retryScan } = useAegis();

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--card-glow)'
      }}
      className="p-5 rounded-2xl border flex flex-col justify-between h-full transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Scan Activity
        </h3>
        <NavLink
          to="/app/scan-history"
          className="text-xs hover:underline flex items-center gap-1 font-medium"
          style={{ color: 'var(--primary-accent)' }}
        >
          View All <ArrowRight size={13} />
        </NavLink>
      </div>

      {/* Activity List */}
      <div className="flex flex-col gap-3 my-auto">
        {scans.slice(0, 4).map((scan) => {
          const isCompleted = scan.status === 'completed';
          const isRunning = scan.status === 'running';
          const isFailed = scan.status === 'failed';

          return (
            <div
              key={scan.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent"
            >
              {/* Status Icon & Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  {isCompleted && (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={15} />
                    </div>
                  )}
                  {isRunning && (
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-spin">
                      <RotateCw size={14} />
                    </div>
                  )}
                  {isFailed && (
                    <div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                      <XCircle size={15} />
                    </div>
                  )}
                </div>

                <div className="truncate">
                  <div
                    className="text-xs font-semibold truncate flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {scan.brandName}
                  </div>
                  <div className="text-[11px] flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {isCompleted && <span>Completed • {scan.findingsCount} findings</span>}
                    {isRunning && <span>Running • {scan.progress}% complete</span>}
                    {isFailed && <span className="text-rose-500">Failed • Source error</span>}
                  </div>
                </div>
              </div>

              {/* Progress Bar & Time */}
              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{scan.timeAgo}</span>
                <div
                  className="w-24 h-1.5 rounded-full overflow-hidden border"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-500 w-full'
                        : isRunning
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${scan.progress}%` }}
                  />
                </div>
                {isFailed && (
                  <button
                    onClick={() => retryScan(scan.id)}
                    className="text-[9px] hover:underline"
                    style={{ color: 'var(--primary-accent)' }}
                  >
                    Retry scan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
