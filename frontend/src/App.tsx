import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AegisProvider, useAegis } from './context/AegisContext';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { DashboardOverview } from './pages/DashboardOverview';
import { BrandProfilesPage } from './pages/BrandProfilesPage';
import { SocialMonitoringPage } from './pages/SocialMonitoringPage';
import { AppMonitoringPage } from './pages/AppMonitoringPage';
import { ThreatIntelligencePage } from './pages/ThreatIntelligencePage';
import { FindingsPage } from './pages/FindingsPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import TargetCursor from './components/react-bits/TargetCursor';

function AppContent() {
  const { theme } = useAegis();

  return (
    <>
      {/* Target Cursor with dynamic theme colors and interactive element snapping */}
      <TargetCursor
        cursorColor={theme === 'dark' ? '#38BDF8' : '#C2410C'}
        cursorColorOnTarget={theme === 'dark' ? '#FFFFFF' : '#9A3412'}
        blendMode={theme === 'dark' ? 'difference' : 'normal'}
        targetSelector="button, a, input, select, textarea, [role='button'], .cursor-target, .aegis-card"
        size={30}
        cornerSize={9}
        thickness={2.5}
      />

      <BrowserRouter>
        <Routes>
          {/* Public Marketing Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/signup" element={<AuthPage initialMode="signup" />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Connected Authenticated App Shell */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="brands" element={<BrandProfilesPage />} />
            <Route path="social" element={<SocialMonitoringPage />} />
            <Route path="apps" element={<AppMonitoringPage />} />
            <Route path="threat-intelligence" element={<ThreatIntelligencePage />} />
            <Route path="findings" element={<FindingsPage />} />
            <Route path="scan-history" element={<ScanHistoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export function App() {
  return (
    <AegisProvider>
      <AppContent />
    </AegisProvider>
  );
}

export default App;
