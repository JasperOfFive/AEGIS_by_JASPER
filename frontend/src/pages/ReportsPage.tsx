import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { Printer, Download, Shield } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { findings, brands } = useAegis();
  const [reportDateRange, setReportDateRange] = useState('30d');

  const criticalCount = findings.filter(f => f.risk === 'critical').length;
  const highCount = findings.filter(f => f.risk === 'high').length;
  const resolvedCount = findings.filter(f => f.status === 'resolved').length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSummary = () => {
    const reportData = `AEGIS EXECUTIVE RISK BRIEFING
Date Generated: ${new Date().toLocaleDateString()}
Coverage Window: ${reportDateRange}

SUMMARY METRICS:
- Total Monitored Brands: ${brands.length}
- Total Discovered Threats: ${findings.length}
- Critical Risk Findings: ${criticalCount}
- High Risk Findings: ${highCount}
- Successfully Takedown / Resolved: ${resolvedCount}

MONITORED BRANDS:
${brands.map(b => `• ${b.name} (${b.domain}) - Risk Index: ${b.riskScore}/100`).join('\n')}

TOP THREATS IDENTIFIED:
${findings.map(f => `[${f.risk.toUpperCase()}] ${f.title} (${f.associatedBrand}) - Status: ${f.status}`).join('\n')}
`;
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AEGIS_Brand_Risk_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Security & Risk Reports
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Executive briefs, brand exposure analytics, and automated compliance summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <Printer size={14} /> Print Brief
          </button>
          <button
            onClick={handleDownloadSummary}
            className="px-3.5 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            <Download size={14} /> Download Summary
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div
        className="p-6 rounded-2xl border shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--primary-accent)' }}>
          <Shield size={16} /> Executive Risk Overview • Current Quarter
        </div>

        <p className="text-sm mt-3 max-w-2xl leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          AEGIS automated radar monitored <strong>{brands.length} brand perimeters</strong>, intercepting{' '}
          <strong>{findings.length} anomalous threat vectors</strong> across mobile stores, lookalike domains, and social networks.
          Mitigation teams have resolved <strong>{resolvedCount} verified malicious impersonations</strong> with zero reported core domain compromises.
        </p>

        {/* 4 Stat Highlights */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t text-center"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <span className="text-[11px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Monitored Assets</span>
            <div className="text-2xl font-black font-mono mt-1" style={{ color: 'var(--text-primary)' }}>332</div>
          </div>
          <div>
            <span className="text-[11px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Critical Incidents</span>
            <div className="text-2xl font-black text-rose-500 font-mono mt-1">{criticalCount}</div>
          </div>
          <div>
            <span className="text-[11px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Mean Time to Takedown</span>
            <div className="text-2xl font-black text-emerald-500 font-mono mt-1">4.2 hrs</div>
          </div>
          <div>
            <span className="text-[11px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Trademark Defense Rate</span>
            <div className="text-2xl font-black font-mono mt-1" style={{ color: 'var(--primary-accent)' }}>98.4%</div>
          </div>
        </div>
      </div>

      {/* Brand Breakdown */}
      <div
        className="p-6 rounded-2xl border shadow-xl space-y-4"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Organization Exposure Matrix
        </h3>
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {brands.map(b => (
            <div key={b.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center border"
                  style={{
                    backgroundColor: 'var(--primary-accent-muted)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--primary-accent)'
                  }}
                >
                  {b.logo}
                </span>
                <div>
                  <span className="font-semibold text-xs block" style={{ color: 'var(--text-primary)' }}>{b.name}</span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{b.domain}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] block uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Risk Index</span>
                  <span className={`text-xs font-bold font-mono ${b.riskScore > 70 ? 'text-rose-500' : 'text-amber-500'}`}>
                    {b.riskScore} / 100
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] block uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Active Threats</span>
                  <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{b.activeFindingsCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
