import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ScanWizardModal } from '../scans/ScanWizardModal';
import { FindingDetailDrawer } from '../findings/FindingDetailDrawer';
import { X } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="flex h-screen w-full overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
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
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        
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
