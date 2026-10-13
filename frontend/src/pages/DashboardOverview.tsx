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
  const { brands, findings, scans, setIsScanWizardOpen, theme, dashboardStats, backendStatus } = useAegis();
  const navigate = useNavigate();

  const highPriorityCount = findings.filter(f => f.risk === 'critical' || f.risk === 'high').length;
  const activeScansCount = scans.filter(s => s.status === 'running').length;
  const brandAccent = theme === 'dark' ? '#38BDF8' : '#FF8D5C';

  const monitoredBrandsCount = dashboardStats ? dashboardStats.overview.total_brands : brands.length;
  const totalFindingsCount = dashboardStats ? dashboardStats.overview.total_findings : findings.length;
  const highPriorityValue = dashboardStats ? dashboardStats.overview.active_threats : highPriorityCount;

  return (
    <div className="space-y-6">
      {/* Welcome Greeting & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold block" style={{ color: 'var(--primary-accent)' }}>
              Welcome Back
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                backendStatus === 'connected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              ● {backendStatus === 'connected' ? 'FastAPI Connected' : 'Local Mode'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
            Good morning, Alex
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Real-time digital risk protection, typosquatting discovery, and official-asset defense.
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

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Monitored Brands"
          value={monitoredBrandsCount}
          changeText="↑ Active Portfolios"
          isPositive={true}
          icon={Shield}
          accentColor={brandAccent}
          sparklineData={[3, 5, 4, 7, 8, 10, monitoredBrandsCount || 12]}
          onClick={() => navigate('/app/brands')}
        />
        <KpiCard
          title="Total Findings"
          value={totalFindingsCount}
          changeText="↑ Triaged Signals"
          isPositive={false}
          icon={FileText}
          accentColor={brandAccent}
          sparklineData={[4, 6, 8, 5, 9, 12, totalFindingsCount || 15]}
          onClick={() => navigate('/app/findings')}
        />
        <KpiCard
          title="High Priority"
          value={highPriorityValue}
          changeText="Flagged Threats"
          isPositive={false}
          icon={AlertTriangle}
          accentColor="#F43F5E"
          sparklineData={[2, 3, 4, 3, 5, 6, highPriorityValue || 8]}
          onClick={() => navigate('/app/findings')}
        />
        <KpiCard
          title="Active Scans"
          value={activeScansCount}
          changeText={`${activeScansCount} in progress`}
          isPositive={true}
          icon={Radio}
          accentColor="#10B981"
          sparklineData={[1, 2, 2, 3, 2, 3, activeScansCount || 1]}
          onClick={() => navigate('/app/scan-history')}
        />
      </div>

      {/* Middle Row: Risk Distribution & Scan Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskDistributionChart onSelectSeverity={() => navigate('/app/findings')} />
        <ScanActivityCard />
      </div>

      {/* Bottom Row: Recent Findings & Threat Intelligence Relationship Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentFindingsTable />
        </div>
        <div className="lg:col-span-1">
          <ThreatIntelligenceWidget />
        </div>
      </div>
    </div>
  );
};
