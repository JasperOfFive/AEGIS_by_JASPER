import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  Users,
  Smartphone,
  Globe,
  Database,
  FileCheck2,
  Sparkles,
  ExternalLink,
  Eye,
  Sun,
  Moon
} from 'lucide-react';
import { RadialGlowButton } from '../components/ui/radial-glow-button';
import { SpotlightNavbar } from '../components/ui/spotlight-navbar';
import { useAegis } from '../context/AegisContext';
import Lightfall from '../components/react-bits/Lightfall';
import Aurora from '../components/react-bits/Aurora';
import GradientWaves from '../components/react-bits/GradientWaves';
import Lanyard, { DEMO_MEMBERS } from '../components/react-bits/Lanyard';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useAegis();
  const [selectedMember, setSelectedMember] = useState(DEMO_MEMBERS[0]);

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Full Landing Page Animated Gradient Wave Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full">
        <GradientWaves
          horizonColor={theme === 'dark' ? '#5227FF' : '#E87A4D'}
          waveColor={theme === 'dark' ? '#FF9FFC' : '#FF8D5C'}
          crestColor={theme === 'dark' ? '#FFFFFF' : '#FFF5EE'}
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1}
          height={5.5}
          fogDepth={theme === 'dark' ? 16 : 22}
          detail="medium"
          brightness={1}
          opacity={theme === 'dark' ? 1.3 : 2.0}
          mouseInteraction={true}
          parallaxStrength={0.5}
          grain={true}
          grainIntensity={0.05}
          whiteEdge={false}
        />
      </div>

      {/* 1. Header Navigation with Integrated SpotlightNavbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl px-4 sm:px-12 py-3 transition-colors duration-200"
        style={{
          backgroundColor: 'var(--topbar-bg)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/aegis-logo.png"
              alt="AEGIS Logo"
              className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.35)] group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-widest font-mono" style={{ color: 'var(--text-primary)' }}>
                AEGIS
              </span>
              <span className="text-[9px] uppercase tracking-widest font-medium -mt-1" style={{ color: 'var(--primary-accent)' }}>
                Digital Risk Protection
              </span>
            </div>
          </NavLink>

          {/* Centered Dynamic Spotlight Navbar */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl">
            <SpotlightNavbar
              items={[
                { label: 'Overview', href: '#overview' },
                { label: 'Features', href: '#features' },
                { label: 'Platform Preview', href: '#preview', badge: 'Live' },
                { label: 'Mission & Team', href: '#about' },
              ]}
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border transition-all hover:scale-105"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--card-sub-bg)',
                color: 'var(--primary-accent)'
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <NavLink
              to="/app"
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors hidden sm:inline-block"
              style={{ color: 'var(--text-secondary)' }}
            >
              Sign In
            </NavLink>
            <NavLink to="/app">
              <RadialGlowButton className="!py-2 !px-4 !text-xs !min-w-[130px] !min-h-[36px]">
                Launch Platform →
              </RadialGlowButton>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Header height spacer */}
      <div className="h-16 w-full pointer-events-none" aria-hidden="true" />

      {/* 2. Hero Section (Floating over the full-page wave background) */}
      <section id="overview" className="relative z-10 min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center px-6 sm:px-12 py-16 overflow-hidden bg-transparent">
        {/* Main Hero Content (100% transparent backdrop ensuring animated wave is unobstructed) */}
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-transparent">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
            Your Brand. <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: theme === 'dark'
                  ? 'linear-gradient(to right, #F0F6FC, #93C5FD, #38BDF8)'
                  : 'linear-gradient(to right, #331F14, #FF8D5C, #C25E35)'
              }}
            >
              Your Digital Perimeter.
            </span>
          </h1>

          <p className="text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            See threats before they become damage. AEGIS delivers autonomous brand protection across lookalike domains,
            social impersonators, rogue mobile apps, and credential harvesting kits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <NavLink to="/app">
              <RadialGlowButton className="!px-7 !py-3 !text-sm !font-semibold">
                Start Protecting Your Brand →
              </RadialGlowButton>
            </NavLink>
            <a
              href="#preview"
              className="px-6 py-3 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2"
              style={{
                backgroundColor: 'var(--card-sub-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              Explore Live Prototype <Eye size={14} style={{ color: 'var(--primary-accent)' }} />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Unified Sections Container (Elevated rectangular sheet rising over full-page wave) */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div
          className="rounded-3xl border shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(11, 17, 30, 0.88)' : 'rgba(241, 226, 212, 0.92)',
            borderColor: 'var(--border-color)',
            boxShadow: theme === 'dark'
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 35px rgba(56, 189, 248, 0.08)'
              : '0 25px 60px -15px rgba(51, 31, 20, 0.16), 0 0 35px rgba(255, 141, 92, 0.10)'
          }}
        >
          {/* Section A: Interactive Miniature Dashboard Preview */}
          <section
            id="preview"
            className="px-6 sm:px-12 py-16 transition-colors duration-200"
          >
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold" style={{ color: 'var(--primary-accent)' }}>
                  Autonomous Operations
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>
                  Precision Intelligence Interface
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  The exact dashboard SecOps teams use daily to triage brand abuse.
                </p>
              </div>

              <div
                className="rounded-2xl border p-5 shadow-2xl relative group overflow-hidden"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div
                  className="flex items-center justify-between pb-4 border-b"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono ml-2" style={{ color: 'var(--text-muted)' }}>aegis.cloud/secops/overview</span>
                  </div>
                  <NavLink
                    to="/app"
                    className="text-xs hover:underline font-semibold flex items-center gap-1"
                    style={{ color: 'var(--primary-accent)' }}
                  >
                    Open Full Interactive App <ExternalLink size={12} />
                  </NavLink>
                </div>

                {/* Quick Mini Dashboard Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div
                    className="p-4 rounded-xl border space-y-2"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>Threat Surface</span>
                    <div className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>248 Active</div>
                    <div className="text-xs text-rose-500 font-medium">37 High Priority • 14 Critical</div>
                  </div>
                  <div
                    className="p-4 rounded-xl border space-y-2"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>Active Scans</span>
                    <div className="text-2xl font-bold font-mono text-emerald-500">3 Running</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Acme Corp, Globex, Soylent</div>
                  </div>
                  <div
                    className="p-4 rounded-xl border space-y-2"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>Active Takedowns</span>
                    <div className="text-2xl font-bold font-mono" style={{ color: 'var(--primary-accent)' }}>18 Dispatched</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Meta, Google Play, NameCheap</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section B: Feature Cards Bento Grid */}
          <section
            id="features"
            className="px-6 sm:px-12 py-20 border-t transition-colors duration-200"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold" style={{ color: 'var(--primary-accent)' }}>
                  Full-Spectrum Surveillance
                </span>
                <h2 className="text-3xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>
                  Built for Modern Enterprise Threat Vectors
                </h2>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Comprehensive discovery from typosquatting to rogue application store mirrors.
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { title: 'Lookalike & Phishing Domains', desc: 'Algorithmic scanning for IDN homograph attacks, typosquatting, bit-flipping, and reverse-proxy SSO phish kits.', icon: Globe, color: 'var(--primary-accent)' },
                  { title: 'Social Media Impersonation', desc: 'Real-time recognition across Instagram, TikTok, Facebook, and X identifying rogue executive profiles and fake customer support handles.', icon: Users, color: '#A855F7' },
                  { title: 'Malicious Mobile Applications', desc: 'Probing authorized stores and rogue APK repositories for weaponized banking trojans, repackaged brand apps, and fake wallets.', icon: Smartphone, color: '#F97316' },
                  { title: 'Dark Web & Credential Leaks', desc: 'Interception of compromised employee session tokens, internal code leaks, and database paste dumps before threat actor exploitation.', icon: Database, color: '#F43F5E' },
                  { title: 'Automated Legal Enforcement', desc: 'One-click DMCA and trademark takedown notices formatted for registrars, hosting ASNs, and major social safety teams.', icon: FileCheck2, color: '#10B981' },
                  { title: 'Graph Entity Correlation', desc: 'Interactive threat topology linking related IP ranges, DNS name servers, and adversary infrastructure fingerprints.', icon: Sparkles, color: 'var(--primary-accent)' },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={i}
                      className="p-6 rounded-2xl border transition-all shadow-xl group hover:scale-[1.01]"
                      style={{
                        backgroundColor: 'var(--card-sub-bg)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          borderColor: 'var(--border-color)',
                          color: card.color
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
                      <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {card.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section C: Creators & Mission with Lanyard 3D Badge */}
          <section
            id="about"
            className="px-6 sm:px-12 py-20 border-t transition-colors duration-200"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold" style={{ color: 'var(--primary-accent)' }}>
                  Engineering Architecture
                </span>
                <h2 className="text-3xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>
                  Creators & Mission
                </h2>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Built by security architects and interaction engineers to redefine digital brand defense.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Lanyard Interactive Badge with member tabs */}
                <div
                  className="relative min-h-[440px] w-full rounded-2xl border overflow-hidden flex items-center justify-center p-4 shadow-xl"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <Lanyard
                    members={DEMO_MEMBERS}
                    onSelectMember={(m) => setSelectedMember(m)}
                  />
                </div>

                {/* Creators Bio for All Demo Members */}
                <div className="space-y-3">
                  {DEMO_MEMBERS.map((m) => {
                    const isActive = selectedMember.id === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="p-4 rounded-xl border transition-all cursor-pointer"
                        style={{
                          backgroundColor: isActive ? 'var(--card-sub-bg)' : 'var(--card-bg)',
                          borderColor: isActive ? 'var(--primary-accent)' : 'var(--border-color)',
                          transform: isActive ? 'translateX(4px)' : 'none'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold" style={{ color: isActive ? 'var(--primary-accent)' : 'var(--text-primary)' }}>
                            {m.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                            {m.badgeId}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--primary-accent)' }}>
                          {m.role} • {m.dept}
                        </p>
                        <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {m.specialty}
                        </p>
                      </div>
                    );
                  })}

                  <div
                    className="p-3.5 rounded-xl border text-xs"
                    style={{
                      backgroundColor: 'var(--card-sub-bg)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Core Technology Stack</span>
                    <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      React 19, TypeScript, Vite, Tailwind CSS, Framer Motion Spotlight Navbar, Aurora WebGL Curtains, Canvas Lightfall, 3D Flipping Lanyard Badge, and Recharts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Integrated Uniform Footer */}
          <footer
            className="border-t px-6 sm:px-12 py-10 text-xs transition-colors duration-200"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: theme === 'dark' ? 'rgba(8, 12, 21, 0.65)' : 'rgba(232, 210, 190, 0.65)',
              color: 'var(--text-muted)'
            }}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="/aegis-logo.png"
                  alt="AEGIS Logo"
                  className="w-7 h-7 object-contain shrink-0"
                />
                <span className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>AEGIS Brand Protection</span>
              </div>

              <div className="flex items-center gap-6" style={{ color: 'var(--text-secondary)' }}>
                <NavLink to="/app" className="hover:opacity-80">Dashboard</NavLink>
                <NavLink to="/app/findings" className="hover:opacity-80">Threat Matrix</NavLink>
                <NavLink to="/app/settings" className="hover:opacity-80">Settings</NavLink>
                <a href="#about" className="hover:opacity-80">About</a>
              </div>

              <p className="text-[11px]">
                © 2026 AEGIS Security Intelligence. Interactive Prototype Edition.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
