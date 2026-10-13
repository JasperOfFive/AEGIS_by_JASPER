import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown
} from 'lucide-react';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';

export const FindingsPage: React.FC = () => {
  const { findings, setSelectedFinding } = useAegis();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortField, setSortField] = useState<'similarity' | 'detectedTimestamp'>('detectedTimestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtering
  const filtered = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.associatedBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.dnsHost && f.dnsHost.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = selectedSeverity === 'all' || f.risk === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;
    const matchesPlatform = selectedPlatform === 'all' || f.platform === selectedPlatform;

    return matchesSearch && matchesSeverity && matchesStatus && matchesPlatform;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const factor = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'similarity') {
      return (a.similarity - b.similarity) * factor;
    }
    return (a.detectedTimestamp - b.detectedTimestamp) * factor;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Brand', 'Risk', 'Similarity', 'Status', 'Platform', 'Detected'];
    const rows = sorted.map((f) => [
      f.id,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.associatedBrand}"`,
      f.risk,
      `${f.similarity}%`,
      f.status,
      f.platform,
      `"${f.detectedTime}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aegis_findings_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Findings & Investigations
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Triaged threat detections across public web, mobile stores, and social networks.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <Download size={14} style={{ color: 'var(--primary-accent)' }} />
          Export CSV ({sorted.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 rounded-2xl border shadow-xl space-y-3"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-3" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by keyword, title, host, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none"
              style={{
                backgroundColor: 'var(--card-sub-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border rounded-xl px-3 py-2 text-xs focus:outline-none"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-xl px-3 py-2 text-xs focus:outline-none"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="border rounded-xl px-3 py-2 text-xs focus:outline-none"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <option value="all">All Channels</option>
            <option value="web">Web Domains</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
            <option value="playstore">Google Play</option>
            <option value="apple">Apple App Store</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div
        className="rounded-2xl border shadow-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
            <thead>
              <tr
                className="border-b text-[11px] font-mono uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)'
                }}
              >
                <th className="p-4 font-semibold">Incident / Asset</th>
                <th className="p-4 font-semibold">Brand</th>
                <th className="p-4 font-semibold text-center">Severity</th>
                <th
                  className="p-4 font-semibold text-center cursor-pointer hover:opacity-80"
                  onClick={() => {
                    setSortField('similarity');
                    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    Similarity <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th
                  className="p-4 font-semibold cursor-pointer hover:opacity-80"
                  onClick={() => {
                    setSortField('detectedTimestamp');
                    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <div className="flex items-center gap-1">
                    Detected <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 font-semibold text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    No threat findings matching current filter parameters.
                  </td>
                </tr>
              ) : (
                sorted.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedFinding(item)}
                    className="hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm group-hover:underline">
                          {item.title}
                        </span>
                        <span className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>
                          {item.platform} • {item.type}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.associatedBrand}
                    </td>

                    <td className="p-4 text-center">
                      <SeverityBadge severity={item.risk} showDot />
                    </td>

                    <td className="p-4 text-center font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {item.similarity}%
                    </td>

                    <td className="p-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="p-4" style={{ color: 'var(--text-muted)' }}>
                      {item.detectedTime}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFinding(item);
                        }}
                        className="px-3 py-1.5 rounded-lg border font-medium transition-colors"
                        style={{
                          backgroundColor: 'var(--card-sub-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--primary-accent)'
                        }}
                      >
                        Investigate →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
