import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ScanWizardModal } from '../scans/ScanWizardModal';
import { FindingDetailDrawer } from '../findings/FindingDetailDrawer';
import { X } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Detect if user is on the Home page of the dashboard
  const isHomePage = location.pathname === '/app' || location.pathname === '/app/' || location.pathname === '/';

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar on pages other than Home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !isHomePage) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHomePage]);

  return (
    <div
      className="flex h-screen w-full overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Desktop Persistent Sidebar: Hidden on Home page, visible & collapsible on other sections */}
      {!isHomePage && (
        <div
          className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            isSidebarCollapsed
              ? 'w-0 opacity-0 -translate-x-4 border-r-0 pointer-events-none'
              : 'w-72 opacity-100 translate-x-0'
          }`}
        >
          <Sidebar onToggleCollapse={() => setIsSidebarCollapsed(true)} />
        </div>
      )}

      {/* Mobile Sidebar Overlay: Only on sections other than Home */}
      {!isHomePage && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-64 h-full relative">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 text-white"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          isHomePage={isHomePage}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        />
        
        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <ScanWizardModal />
      <FindingDetailDrawer />
    </div>
  );
};
