import React, { useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Sparkles,
  PanelLeftClose
} from 'lucide-react';
import { useAegis } from '../../context/AegisContext';
import MetallicPaint from '../react-bits/MetallicPaint';

interface SidebarProps {
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}

const NAV_ROUTES = [
  { label: 'Home', path: '/app' },
  { label: 'Dashboard', path: '/app/overview' },
  { label: 'Brand Profiles', path: '/app/brands' },
  { label: 'Social Monitoring', path: '/app/social' },
  { label: 'App Monitoring', path: '/app/apps' },
  { label: 'Threat Intelligence', path: '/app/threat-intelligence' },
  { label: 'Findings & Investigations', path: '/app/findings' },
  { label: 'Scan History', path: '/app/scan-history' },
  { label: 'Reports', path: '/app/reports' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile, onToggleCollapse }) => {
  const { theme } = useAegis();
  const location = useLocation();
  const navigate = useNavigate();

  const activeIdx = useMemo(() => {
    const idx = NAV_ROUTES.findIndex(r => {
      if (r.path === '/app') return location.pathname === '/app';
      return location.pathname.startsWith(r.path);
    });
    return idx >= 0 ? idx : 1; // Default to overview if not matched
  }, [location.pathname]);

  // No sidebar on the home tab
  if (location.pathname === '/app' || location.pathname === '/app/' || location.pathname === '/') {
    return null;
  }

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
        <div className="flex items-center justify-between">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-2 py-1 group cursor-pointer"
            onClick={onCloseMobile}
          >
            <div
              className="w-9 h-9 relative shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{
                filter: theme === 'dark'
                  ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.45))'
                  : 'drop-shadow(0 0 10px rgba(255, 141, 92, 0.4))'
              }}
            >
              <MetallicPaint
                imageSrc="/aegis-logo.png"
                scale={0.88}
                color={theme === 'dark' ? '#FFFFFF' : '#FF8D5C'}
                gradientColor={theme === 'dark' ? '#0070F3' : '#C2410C'}
                lightMode={theme === 'light'}
                edgeBend={0.7}
                distortion={0.08}
                mouseTilt={0.6}
                speed={0.8}
                density={2.5}
              />
            </div>
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

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg border hover:scale-105 transition-all text-xs cursor-pointer mr-1"
              style={{
                backgroundColor: 'var(--card-sub-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)'
              }}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </span>
          <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--primary-accent)' }}>
            System Core
          </span>
        </div>
      </div>

      {/* VERTICALLY STRAIGHT NAVIGATION - STATIC & IN VIEW */}
      <nav className="flex-1 w-full px-3 py-2 flex flex-col justify-center gap-1 overflow-hidden select-none">
        {NAV_ROUTES.map((route, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={route.path}
              type="button"
              onClick={() => {
                navigate(route.path);
                onCloseMobile?.();
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl cursor-pointer origin-left flex items-center justify-between group transform-gpu ${isActive
                  ? 'font-bold scale-[1.03] shadow-xs'
                  : 'font-normal hover:scale-[1.04] hover:opacity-100 hover:filter-none'
                }`}
              style={{
                backgroundColor: isActive
                  ? (theme === 'dark' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(194, 65, 12, 0.12)')
                  : 'transparent',
                borderColor: isActive
                  ? (theme === 'dark' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(194, 65, 12, 0.3)')
                  : 'transparent',
                borderWidth: '1px',
                borderStyle: 'solid',
                color: isActive
                  ? (theme === 'dark' ? '#38BDF8' : '#C2410C')
                  : 'var(--text-secondary)',
                filter: isActive ? 'none' : 'blur(0.85px)',
                opacity: isActive ? 1 : 0.62,
                transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease, filter 0.22s ease, background-color 0.2s ease, border-color 0.2s ease',
                willChange: 'transform, filter, opacity'
              }}
            >
              <div className="flex items-center gap-2.5">
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: theme === 'dark' ? '#38BDF8' : '#C2410C',
                      boxShadow: theme === 'dark' ? '0 0 8px #38BDF8' : '0 0 6px #C2410C'
                    }}
                  />
                )}
                <span className="text-[13.5px] tracking-tight leading-tight select-none">
                  {route.label}
                </span>
              </div>

              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 opacity-70"
                  style={{ backgroundColor: theme === 'dark' ? '#38BDF8' : '#C2410C' }}
                />
              )}
            </button>
          );
        })}
      </nav>

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
