import React from 'react';
import { useAegis } from '../context/AegisContext';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { ScanActivityCard } from '../components/dashboard/ScanActivityCard';
import { RecentFindingsTable } from '../components/dashboard/RecentFindingsTable';
import { ThreatIntelligenceWidget } from '../components/dashboard/ThreatIntelligenceWidget';
import { RadialGlowButton } from '../components/ui/radial-glow-button';
import { Shield, FileText, AlertTriangle, Radio, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const { brands, findings, scans, setIsScanWizardOpen, theme } = useAegis();
  const navigate = useNavigate();

  const highPriorityCount = findings.filter(f => f.risk === 'critical' || f.risk === 'high').length;
  const criticalCount = findings.filter(f => f.risk === 'critical').length;
  const activeScansCount = scans.filter(s => s.status === 'running').length;
  const newFindingsCount = findings.filter(f => f.status === 'new').length;
  const activeBrandsCount = brands.filter(b => b.status === 'active').length;
  const brandAccent = theme === 'dark' ? '#38BDF8' : '#FF8D5C';

  return (
    <div className="space-y-6">
      {/* Welcome Greeting & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold block" style={{ color: 'var(--primary-accent)' }}>
              Welcome Back
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE ENGINE SYNC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            DASHBOARD
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Here's what's happening with your brand protection.
          </p>
        </div>

        <div>
          <RadialGlowButton
            onClick={() => setIsScanWizardOpen(true)}
            className="!px-5 !py-2.5 !text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} style={{ color: 'var(--primary-accent)' }} />
            Run New Scan →
          </RadialGlowButton>
        </div>
      </div>

      {/* 4 KPI Cards Grid - Fully Synced with Real System Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Monitored Brands"
          value={brands.length}
          changeText={`${activeBrandsCount} active`}
          isPositive={true}
          icon={Shield}
          accentColor={brandAccent}
          sparklineData={[3, 4, 4, 5, 5, Math.max(1, brands.length), Math.max(1, brands.length)]}
          onClick={() => navigate('/app/brands')}
        />
        <KpiCard
          title="Total Findings"
          value={findings.length}
          changeText={findings.length > 0 ? `${newFindingsCount} new unreviewed` : '0 issues'}
          isPositive={findings.length === 0}
          icon={FileText}
          accentColor={brandAccent}
          sparklineData={[
            Math.max(1, Math.round(findings.length * 0.4)),
            Math.max(1, Math.round(findings.length * 0.6)),
            Math.max(1, Math.round(findings.length * 0.5)),
            Math.max(1, Math.round(findings.length * 0.8)),
            Math.max(1, findings.length)
          ]}
          onClick={() => navigate('/app/findings')}
        />
        <KpiCard
          title="High Priority"
          value={highPriorityCount}
          changeText={highPriorityCount > 0 ? `${criticalCount} critical` : '0 critical risks'}
          isPositive={highPriorityCount === 0}
          icon={AlertTriangle}
          accentColor="#F43F5E"
          sparklineData={[
            Math.max(0, highPriorityCount - 2),
            Math.max(0, highPriorityCount - 1),
            highPriorityCount,
            highPriorityCount
          ]}
          onClick={() => navigate('/app/findings')}
        />
        <KpiCard
          title="Active Scans"
          value={activeScansCount}
          changeText={activeScansCount > 0 ? `${activeScansCount} scanning now` : `${scans.length} completed`}
          isPositive={activeScansCount > 0}
          icon={Radio}
          accentColor="#10B981"
          sparklineData={[1, 2, 2, 3, 2, 3, Math.max(1, activeScansCount)]}
          onClick={() => navigate('/app/scan-history')}
        />
      </div>

      {/* Main Grid: Row 1 (7 cols & 5 cols) - Risk Distribution & Scan Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <RiskDistributionChart onSelectSeverity={() => navigate('/app/findings')} />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <ScanActivityCard />
        </div>
      </div>

      {/* Main Grid: Row 2 (7 cols & 5 cols) - Recent Findings Table & Threat Intelligence Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <RecentFindingsTable />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <ThreatIntelligenceWidget />
        </div>
      </div>
    </div>
  );
};
