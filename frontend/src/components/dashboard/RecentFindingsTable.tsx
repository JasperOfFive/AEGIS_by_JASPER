import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Globe,
  MoreHorizontal,
  ArrowRight,
  Play
} from 'lucide-react';
import { useAegis } from '../../context/AegisContext';
import { SeverityBadge } from '../ui/SeverityBadge';
import { StatusBadge } from '../ui/StatusBadge';

export const RecentFindingsTable: React.FC = () => {
  const { findings, setSelectedFinding } = useAegis();

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return (
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 font-bold text-[10px]">
            IG
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-6 h-6 rounded-lg bg-black border border-white/20 flex items-center justify-center text-[#25F4EE] shrink-0 font-bold text-xs">
            ♪
          </div>
        );
      case 'playstore':
        return (
          <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Play size={11} fill="currentColor" />
          </div>
        );
      case 'facebook':
        return (
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 font-bold text-xs">
            f
          </div>
        );
      case 'web':
      default:
        return (
          <div
            className="w-6 h-6 rounded-lg border flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--primary-accent)'
            }}
          >
            <Globe size={13} />
          </div>
        );
    }
  };

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
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Recent Findings
        </h3>
        <NavLink
          to="/app/findings"
          className="text-xs hover:underline flex items-center gap-1 font-medium"
          style={{ color: 'var(--primary-accent)' }}
        >
          View All <ArrowRight size={13} />
        </NavLink>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
          <thead>
            <tr
              className="border-b text-[11px] font-mono uppercase tracking-wider"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)'
              }}
            >
              <th className="pb-3 font-semibold pl-2">Type</th>
              <th className="pb-3 font-semibold">Name / Title</th>
              <th className="pb-3 font-semibold hidden md:table-cell">Associated Brand</th>
              <th className="pb-3 font-semibold text-center">Risk</th>
              <th className="pb-3 font-semibold text-center hidden sm:table-cell">Similarity</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold hidden lg:table-cell">Detected</th>
              <th className="pb-3 font-semibold text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {findings.slice(0, 5).map((f) => (
              <tr
                key={f.id}
                onClick={() => setSelectedFinding(f)}
                className="hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                {/* Type Icon */}
                <td className="py-3 pl-2">
                  {getPlatformIcon(f.platform)}
                </td>

                {/* Title */}
                <td className="py-3 font-medium max-w-[180px] sm:max-w-[240px] truncate" style={{ color: 'var(--text-primary)' }}>
                  <div className="truncate font-mono">{f.title}</div>
                </td>

                {/* Brand */}
                <td className="py-3 hidden md:table-cell font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {f.associatedBrand}
                </td>

                {/* Risk */}
                <td className="py-3 text-center">
                  <SeverityBadge severity={f.risk} />
                </td>

                {/* Similarity */}
                <td className="py-3 text-center hidden sm:table-cell font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                  {f.similarity}%
                </td>

                {/* Status */}
                <td className="py-3">
                  <StatusBadge status={f.status} />
                </td>

                {/* Detected */}
                <td className="py-3 hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>
                  {f.detectedTime}
                </td>

                {/* Actions */}
                <td className="py-3 text-right pr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFinding(f);
                    }}
                    className="p-1 rounded-md opacity-70 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
                    style={{ color: 'var(--text-secondary)' }}
                    aria-label="View options"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
