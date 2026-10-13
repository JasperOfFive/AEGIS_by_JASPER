import React, { useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Sparkles,
  Compass
} from 'lucide-react';
import { useAegis } from '../../context/AegisContext';
import { OptionWheel } from '../react-bits/OptionWheel';

interface SidebarProps {
  onCloseMobile?: () => void;
}

const NAV_ROUTES = [
  { label: 'Home', path: '/app' },
  { label: 'Overview', path: '/app/overview' },
  { label: 'Brand Profiles', path: '/app/brands' },
  { label: 'Social Monitoring', path: '/app/social' },
  { label: 'App Monitoring', path: '/app/apps' },
  { label: 'Threat Intelligence', path: '/app/threat-intelligence' },
  { label: 'Findings & Investigations', path: '/app/findings' },
  { label: 'Scan History', path: '/app/scan-history' },
  { label: 'Reports', path: '/app/reports' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { theme } = useAegis();
  const location = useLocation();
  const navigate = useNavigate();

  const labels = useMemo(() => NAV_ROUTES.map(r => r.label), []);

  const activeIdx = useMemo(() => {
    const idx = NAV_ROUTES.findIndex(r => {
      if (r.path === '/app') return location.pathname === '/app';
      return location.pathname.startsWith(r.path);
    });
    return idx >= 0 ? idx : 0;
  }, [location.pathname]);

  const handleWheelChange = (idx: number) => {
    const target = NAV_ROUTES[idx];
    if (target && location.pathname !== target.path) {
      navigate(target.path);
      onCloseMobile?.();
    }
  };

  return (
    <aside
      className="w-72 h-full flex flex-col justify-between border-r select-none transition-colors duration-200 overflow-hidden"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)'
      }}
    >
      {/* Brand Header */}
      <div className="p-4 pb-2 flex flex-col gap-3">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-2 py-1 group cursor-pointer"
          onClick={onCloseMobile}
        >
          <img
            src="/aegis-logo.png"
            alt="AEGIS Logo"
            className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.35)] group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="flex flex-col">
            <span
              className="font-bold text-lg tracking-wider font-mono"
              style={{ color: 'var(--text-primary)' }}
            >
              AEGIS
            </span>
            <span
              className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: 'var(--primary-accent)' }}
            >
              Brand Intelligence
            </span>
          </div>
        </NavLink>

        <div className="flex items-center justify-between px-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
            Navigation Radar
          </span>
          <span className="text-[9px] font-mono flex items-center gap-1" style={{ color: 'var(--primary-accent)' }}>
            <Compass size={11} /> Scroll / Drag
          </span>
        </div>
      </div>

      {/* REACT BITS OPTION WHEEL NAVIGATION CONTAINER */}
      <div className="flex-1 w-full relative min-h-[300px] overflow-hidden my-1">
        <OptionWheel
          items={labels}
          defaultSelected={activeIdx}
          onChange={handleWheelChange}
          textColor={theme === 'dark' ? '#64748B' : '#745E50'}
          activeColor={theme === 'dark' ? '#38BDF8' : '#FF8D5C'}
          side="left"
          fontSize={1.05}
          spacing={2.2}
          curve={0.8}
          tilt={11}
          blur={0.6}
          fade={0.3}
          minOpacity={0.2}
          smoothing={180}
          inset={24}
          loop={false}
          draggable={true}
        />
      </div>

      {/* Footer / Account Section */}
      <div
        className="p-4 pt-2 flex flex-col gap-3 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {/* Pro Plan Card */}
        <div
          className="p-3 rounded-xl border relative overflow-hidden"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: 'var(--primary-accent)' }}
            >
              <Sparkles size={13} />
              <span>Pro Plan</span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Renews Nov 1</span>
          </div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            320 scans remaining
          </p>
          <div
            className="w-full h-1.5 rounded-full mt-2 overflow-hidden border"
            style={{
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div
              className="h-full rounded-full w-[64%]"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            />
          </div>
          <div className="mt-1.5 text-[10px] flex justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>180 / 500 used</span>
            <NavLink to="/app/settings" className="underline hover:opacity-80">Upgrade</NavLink>
          </div>
        </div>

        {/* User Card */}
        <NavLink
          to="/app/settings"
          className="flex items-center justify-between p-2 rounded-xl transition-colors border border-transparent hover:border-black/10 dark:hover:border-white/10"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--primary-accent-muted)',
                color: 'var(--primary-accent)',
                borderColor: 'var(--primary-accent)'
              }}
            >
              AC
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Alex Carter</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Security Analyst</span>
            </div>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
