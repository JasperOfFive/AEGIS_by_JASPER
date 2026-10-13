import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';

export const SocialMonitoringPage: React.FC = () => {
  const { findings, setSelectedFinding } = useAegis();
  const [platformFilter, setPlatformFilter] = useState('all');

  const socialFindings = findings.filter(f => f.type === 'social');
  const filtered = socialFindings.filter(f => platformFilter === 'all' || f.platform === platformFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Social Media Monitoring
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Continuous reconnaissance targeting fake executive profiles, rogue VIP support accounts, and brand impersonation.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <option value="all">All Networks</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedFinding(item)}
            className="p-5 rounded-2xl border transition-all shadow-xl flex flex-col justify-between cursor-pointer group"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {item.platform}
                </span>
                <SeverityBadge severity={item.risk} />
              </div>

              <div className="flex items-center gap-3 my-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow text-white"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  {item.title.charAt(1).toUpperCase()}
                </div>
                <div className="truncate">
                  <h3 className="font-semibold text-sm group-hover:underline transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>
                    Target: {item.associatedBrand}
                  </span>
                </div>
              </div>

              <div
                className="mt-4 p-3 rounded-xl border space-y-2 text-xs"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Similarity Score:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{item.similarity}%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Triage Status:</span>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>First Observed:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.detectedTime}</span>
                </div>
              </div>

              {item.notes && item.notes[0] && (
                <p className="text-xs mt-3 line-clamp-2 italic" style={{ color: 'var(--text-secondary)' }}>
                  "{item.notes[0]}"
                </p>
              )}
            </div>

            <div
              className="pt-4 mt-4 border-t flex items-center justify-between text-xs"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span className="group-hover:underline font-medium" style={{ color: 'var(--primary-accent)' }}>
                Inspect Evidence →
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>ID: {item.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
