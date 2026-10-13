import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Bell, Moon, Sun, Command, X, ShieldAlert, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAegis } from '../../context/AegisContext';
import { NavLink, useNavigate } from 'react-router-dom';
import MetallicPaint from '../react-bits/MetallicPaint';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  isHomePage?: boolean;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  isHomePage = false,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  const { theme, toggleTheme, searchQuery, setSearchQuery, findings, brands } = useAegis();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const filteredFindings = searchQuery.trim()
    ? findings.filter(
        f =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.associatedBrand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredBrands = searchQuery.trim()
    ? brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header
      className="h-16 border-b backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--topbar-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Left: Brand Logo & Sidebar Controls */}
      <div className="flex items-center gap-3 shrink-0 z-10">
        {/* On Home Page OR when Sidebar is Collapsed on other pages: Show AEGIS Brand Logo */}
        {(isHomePage || isSidebarCollapsed) && (
          <NavLink to="/app" className="flex items-center gap-2.5 mr-1 shrink-0 group cursor-pointer">
            <div
              className="w-8 h-8 relative shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{
                filter: theme === 'dark'
                  ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.45))'
                  : 'drop-shadow(0 0 8px rgba(255, 141, 92, 0.4))'
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
              <span className="font-bold text-sm tracking-wider font-mono leading-none" style={{ color: 'var(--text-primary)' }}>
                AEGIS
              </span>
              <span className="text-[9px] uppercase tracking-widest font-medium hidden sm:inline" style={{ color: 'var(--primary-accent)' }}>
                Brand Intel
              </span>
            </div>
          </NavLink>
        )}

        {/* If NOT on Home page: Show Mobile Menu and Desktop Collapse/Expand Controls */}
        {!isHomePage && (
          <>
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 shrink-0"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border hover:scale-105 transition-all text-xs font-medium shrink-0 cursor-pointer"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
                title={isSidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                <span className="text-[11px] hidden md:inline">
                  {isSidebarCollapsed ? "Expand Radar" : "Collapse"}
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Center: Search Bar (Centered across navbar) */}
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4 hidden sm:block pointer-events-auto z-10">
        <div className="relative w-full">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all w-full shadow-inner"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <Search size={15} style={{ color: 'var(--primary-accent)' }} />
            <span className="flex-1 text-left truncate">Search for brands, findings, domains, or profiles...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded border font-mono opacity-70">
              <Command size={10} /> K
            </kbd>
          </div>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3 shrink-0 z-10">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl border p-4 shadow-2xl z-50 text-xs"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <div
                className="flex items-center justify-between pb-3 border-b mb-3"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Alerts & Notifications</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                  style={{
                    backgroundColor: 'var(--primary-accent-muted)',
                    color: 'var(--primary-accent)'
                  }}
                >
                  3 unread
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 cursor-pointer">
                  <p className="text-rose-500 font-medium">Critical App Impersonation</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Acme Banking Pro detected on unauthorized mirror repo.</p>
                  <span className="text-[9px] mt-1 block opacity-60">15 min ago</span>
                </div>
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 cursor-pointer">
                  <p className="text-orange-500 font-medium">Reverse Proxy Credential Harvest</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>acme-corp-secure.com active with valid SSL cert.</p>
                  <span className="text-[9px] mt-1 block opacity-60">2 hours ago</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 cursor-pointer">
                  <p className="text-emerald-500 font-medium">Automated Takedown Success</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Fake Globex Careers Facebook group removed.</p>
                  <span className="text-[9px] mt-1 block opacity-60">5 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle - Clickable and fully functional */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border transition-all hover:scale-105"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--card-sub-bg)',
            color: 'var(--primary-accent)'
          }}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Badge */}
        <button
          onClick={() => navigate('/app/settings')}
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border transition-colors"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div
            className="w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center text-white"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            AC
          </div>
          <span className="text-xs font-medium hidden sm:inline" style={{ color: 'var(--text-primary)' }}>Alex</span>
        </button>
      </div>

      {/* Global Search Dialog Modal (Portal mounted to document.body for full-screen blur) */}
      {isSearchOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 backdrop-blur-md bg-black/20 dark:bg-black/50 transition-all"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        >
          <div
            className="border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-3.5 border-b flex items-center gap-3"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <Search size={18} style={{ color: 'var(--primary-accent)' }} />
              <input
                type="text"
                autoFocus
                placeholder="Search threats, brands, URLs, IOCs, or analysts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm flex-1"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 rounded-lg hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Results */}
            <div className="max-h-96 overflow-y-auto p-3 text-xs flex flex-col gap-3">
              {searchQuery.trim() === '' ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-secondary)' }}>
                  <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Quick Search</p>
                  <p className="text-[11px]">Type an organization name, keyword, or threat finding title.</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <span className="px-2 py-1 rounded border font-mono text-[10px]" style={{ borderColor: 'var(--border-color)' }}>Acme</span>
                    <span className="px-2 py-1 rounded border font-mono text-[10px]" style={{ borderColor: 'var(--border-color)' }}>Globex</span>
                    <span className="px-2 py-1 rounded border font-mono text-[10px]" style={{ borderColor: 'var(--border-color)' }}>Banking</span>
                  </div>
                </div>
              ) : (
                <>
                  {filteredBrands.length > 0 && (
                    <div>
                      <div
                        className="text-[10px] uppercase font-mono tracking-wider mb-1.5 px-2"
                        style={{ color: 'var(--primary-accent)' }}
                      >
                        Brands
                      </div>
                      {filteredBrands.map(b => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigate('/app/brands');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px]"
                              style={{
                                backgroundColor: 'var(--primary-accent-muted)',
                                color: 'var(--primary-accent)'
                              }}
                            >
                              {b.logo}
                            </span>
                            <span style={{ color: 'var(--text-primary)' }}>{b.name}</span>
                          </div>
                          <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{b.domain}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredFindings.length > 0 && (
                    <div>
                      <div
                        className="text-[10px] uppercase font-mono tracking-wider mb-1.5 px-2"
                        style={{ color: 'var(--primary-accent)' }}
                      >
                        Findings
                      </div>
                      {filteredFindings.map(f => (
                        <div
                          key={f.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigate('/app/findings');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ShieldAlert size={14} className="text-rose-500 shrink-0" />
                            <span className="truncate" style={{ color: 'var(--text-primary)' }}>{f.title}</span>
                          </div>
                          <span className="text-[10px] uppercase shrink-0 font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {f.risk}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
