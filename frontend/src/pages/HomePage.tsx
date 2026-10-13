import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegis } from '../context/AegisContext';
import FlowingMenu, { MenuItemData } from '../components/react-bits/FlowingMenu';
import { RadialGlowButton } from '../components/ui/radial-glow-button';
import { Shield, Sparkles, Activity, Layers, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { theme, brands, findings, scans, setIsScanWizardOpen, currentUser } = useAegis();
  const navigate = useNavigate();

  const activeScansCount = scans.filter(s => s.status === 'running').length;
  const highPriorityCount = findings.filter(f => f.risk === 'critical' || f.risk === 'high').length;

  const featureItems: MenuItemData[] = [
    {
      link: '/app/overview',
      text: 'Dashboard Overview',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
    },
    {
      link: '/app/brands',
      text: 'Brand Profiles',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
    },
    {
      link: '/app/social',
      text: 'Social Monitoring',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
    },
    {
      link: '/app/apps',
      text: 'App Monitoring',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
    },
    {
      link: '/app/threat-intelligence',
      text: 'Threat Intelligence',
      image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
    },
    {
      link: '/app/findings',
      text: 'Findings & Investigations',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&h=400&fit=crop&sat=-100&auto=format'
    }
  ];

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* 1. Center Greeting Hero Section */}
      <section
        className="w-full rounded-2xl border p-8 sm:p-12 text-center relative overflow-hidden transition-all duration-300 aegis-card"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--card-glow)'
        }}
      >
        {/* Ambient background glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 blur-3xl -z-10"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${theme === 'dark' ? '#38BDF8' : '#FF8D5C'
              } 0%, transparent 70%)`
          }}
        />

        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center space-y-4">
          {/* Main Greeting Headline */}
          <h1
            className="tracking-tight flex items-baseline justify-center gap-2.5 sm:gap-3 flex-wrap"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="text-3xl sm:text-5xl font-semibold">Good morning,</span>
            <span className="text-4xl sm:text-6xl font-extrabold">{currentUser?.name?.split(' ')[0] || 'Alex'}</span>
          </h1>

          {/* Subtitle / Description */}
          <p
            className="text-sm sm:text-base max-w-2xl leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Welcome to your Autonomous Brand Protection command hub. Continuous intelligence is actively
            monitoring {brands.length > 0 ? brands.length : 4} brand identities across rogue mobile apps,
            impersonation accounts, and malicious domains.
          </p>

          {/* Key Metrics Summary Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Shield size={14} style={{ color: 'var(--primary-accent)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Brands:</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {brands.length > 0 ? brands.length : 4}
              </span>
            </div>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <div className="flex items-center gap-1.5">
              <Layers size={14} style={{ color: 'var(--primary-accent)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Findings:</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {findings.length > 0 ? findings.length : 248}
              </span>
            </div>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <div className="flex items-center gap-1.5">
              <Activity size={14} style={{ color: 'var(--primary-accent)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Active Scans:</span>
              <span className="font-bold text-emerald-400">
                {activeScansCount > 0 ? activeScansCount : 2} running
              </span>
            </div>
            {highPriorityCount > 0 && (
              <>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <span className="text-amber-500 font-semibold font-mono">
                  {highPriorityCount} High Priority
                </span>
              </>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <RadialGlowButton
              onClick={() => setIsScanWizardOpen(true)}
              className="!px-5 !py-2.5 !text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} style={{ color: 'var(--primary-accent)' }} />
              Run New Scan →
            </RadialGlowButton>

            <button
              onClick={() => navigate('/app/overview')}
              className="px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:opacity-90 flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: 'var(--card-sub-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <span>Open Full Overview</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Features Flowing Menu at Bottom */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono uppercase tracking-widest font-bold"
              style={{ color: 'var(--primary-accent)' }}
            >
              Explore Capabilities
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              // Hover to preview & click to launch
            </span>
          </div>
          <span
            className="text-[11px] font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            {featureItems.length} Features Available
          </span>
        </div>

        {/* Integrated FlowingMenu Component */}
        <div
          className="w-full h-[460px] sm:h-[480px] rounded-2xl border overflow-hidden relative aegis-card shadow-xl transition-all"
          style={{
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--card-glow)'
          }}
        >
          <FlowingMenu
            items={featureItems}
            speed={14}
            bgColor={theme === 'dark' ? '#0B111E' : '#F1E2D4'}
            textColor={theme === 'dark' ? '#F0F6FC' : '#331F14'}
            marqueeBgColor={theme === 'dark' ? '#38BDF8' : '#FF8D5C'}
            marqueeTextColor={theme === 'dark' ? '#06090F' : '#FFFFFF'}
            borderColor={theme === 'dark' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(255, 141, 92, 0.25)'}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
