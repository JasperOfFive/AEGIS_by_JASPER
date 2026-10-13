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
  Eye,
  Sun,
  Moon,
  Network,
  CircleHelp,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { RadialGlowButton } from '../components/ui/radial-glow-button';
import { SpotlightNavbar } from '../components/ui/spotlight-navbar';
import { useAegis } from '../context/AegisContext';
import Lightfall from '../components/react-bits/Lightfall';
import Aurora from '../components/react-bits/Aurora';
import GradientWaves from '../components/react-bits/GradientWaves';
import TiltedCard from '../components/react-bits/TiltedCard';
import MetallicPaint from '../components/react-bits/MetallicPaint';
import LogoLoop, { LogoItem } from '../components/react-bits/LogoLoop';
import {
  SiCloudflare,
  SiGooglecloud,
  SiOkta,
  SiGithub,
  SiMeta,
  SiApple,
  SiGoogleplay,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiDocker,
  SiPython
} from 'react-icons/si';

interface Creator {
  id: string;
  name: string;
  role: string;
  dept: string;
  badgeId: string;
  status: string;
  photoUrl: string;
  specialty: string;
}

const CREATORS: Creator[] = [
  {
    id: 'joshua-b-paul',
    name: 'Joshua B. Paul',
    role: 'Principal Threat Researcher',
    dept: 'SecOps & OSINT Intelligence',
    badgeId: 'AEGIS-SEC-0941',
    status: 'ONLINE',
    photoUrl: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Joshua&backgroundColor=b6e3f4',
    specialty: 'Autonomous OSINT collection, APK reverse engineering, and adversary cluster mapping.'
  },
  {
    id: 'piyush-sharma',
    name: 'Piyush Sharma',
    role: 'Lead Interaction Architect',
    dept: 'UX Architecture & Visual Systems',
    badgeId: 'AEGIS-ENG-1182',
    status: 'ACTIVE RECON',
    photoUrl: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Piyush&backgroundColor=c0aede',
    specialty: 'High-density threat telemetry dashboards, low-latency WebGL visualization, and champagne ergonomics.'
  },
  {
    id: 'adarsh-maurya',
    name: 'Adarsh Maurya',
    role: 'Head of Legal Countermeasures',
    dept: 'Brand Abuse Enforcement',
    badgeId: 'AEGIS-LEG-8840',
    status: 'ONLINE',
    photoUrl: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Adarsh&backgroundColor=d1d4f9',
    specialty: 'Automated DMCA pipelines, registrar takedown protocols, and cross-jurisdictional brand protection.'
  },
  {
    id: 'sumit-mishra',
    name: 'Sumit Mishra',
    role: 'Senior Adversary Profiler',
    dept: 'Social Vector Intelligence',
    badgeId: 'AEGIS-INT-5521',
    status: 'FIELD OPS',
    photoUrl: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Sumit&backgroundColor=ffd5dc',
    specialty: 'Detecting synthetic VIP social impersonation, fraud networks, and weaponized AI clone accounts.'
  },
  {
    id: 'ravneet-singh',
    name: 'Ravneet Singh',
    role: 'Chief Systems Architect',
    dept: 'Autonomous AI Defense',
    badgeId: 'AEGIS-SYS-4490',
    status: 'ONLINE',
    photoUrl: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Ravneet&backgroundColor=ffdfbf',
    specialty: 'Distributed edge intelligence, zero-latency sensor fabrics, and automated incident containment.'
  }
];

const ECOSYSTEM_LOGOS: LogoItem[] = [
  { node: <SiCloudflare style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#F38020] transition-colors" />, title: 'Cloudflare' },
  { node: <SiGooglecloud style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#4285F4] transition-colors" />, title: 'Google Cloud' },
  { node: <SiOkta style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#007DC1] transition-colors" />, title: 'Okta Identity' },
  { node: <SiGithub style={{ color: 'var(--text-secondary)' }} className="hover:!text-slate-100 transition-colors" />, title: 'GitHub' },
  { node: <SiMeta style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#0081FB] transition-colors" />, title: 'Meta' },
  { node: <SiApple style={{ color: 'var(--text-secondary)' }} className="hover:!text-slate-100 transition-colors" />, title: 'Apple App Store' },
  { node: <SiGoogleplay style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#01875F] transition-colors" />, title: 'Google Play' },
  { node: <SiReact style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#61DAFB] transition-colors" />, title: 'React' },
  { node: <SiNextdotjs style={{ color: 'var(--text-secondary)' }} className="hover:!text-slate-100 transition-colors" />, title: 'Next.js' },
  { node: <SiTypescript style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#3178C6] transition-colors" />, title: 'TypeScript' },
  { node: <SiTailwindcss style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#06B6D4] transition-colors" />, title: 'Tailwind CSS' },
  { node: <SiDocker style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#2496ED] transition-colors" />, title: 'Docker' },
  { node: <SiPython style={{ color: 'var(--text-secondary)' }} className="hover:!text-[#3776AB] transition-colors" />, title: 'Python' }
];

const FAQS = [
  {
    q: 'How does AEGIS detect brand impersonation?',
    a: 'Continuous autonomous scanners monitor DNS zone modifications, Certificate Transparency (CT) logs, newly registered domain clusters, social platform handles, and rogue mobile app repositories in real time.'
  },
  {
    q: 'How are automated takedowns executed?',
    a: 'Once a threat is classified with high confidence, AEGIS generates cryptographically timestamped evidence dossiers and dispatches formal DMCA and trademark enforcement notices directly to hosting providers, registrars, and cloud ASNs.'
  },
  {
    q: 'Does AEGIS access internal corporate infrastructure?',
    a: 'No. AEGIS operates exclusively on external perimeter intelligence and public attack surface telemetry. We never require credentials, agent installations, or access to your internal corporate network.'
  },
  {
    q: 'How does AEGIS minimize false positives?',
    a: 'AEGIS utilizes multi-modal verification combining DOM visual comparison, trademark vector distance, MX record presence, and historical brand telemetry to ensure legitimate brand assets and partners are never flagged.'
  }
];

const PRIVACY_POLICIES = [
  {
    title: 'Zero Internal Telemetry Ingestion',
    desc: 'AEGIS strictly observes public-facing perimeter threat vectors. We never intercept internal employee communications, ingest customer PII, or access proprietary tenant databases.'
  },
  {
    title: 'Tenant Intelligence Isolation',
    desc: 'All detected threat dossiers, customized indicators of compromise (IOCs), and investigation artifacts are strictly isolated per tenant and never shared with third parties or external models.'
  },
  {
    title: 'Enterprise Encryption Standards',
    desc: 'All telemetry in transit is secured using TLS 1.3 with forward secrecy. Threat archives and analyst notes at rest are encrypted using AES-256 with tenant-managed key rotation.'
  },
  {
    title: 'Autonomous 90-Day Data Retention',
    desc: 'In compliance with strict data minimization principles, transient scanning cache and non-actionable external telemetry logs are permanently expunged after 90 days.'
  }
];

const PLATFORM_RULES = [
  {
    rule: 'Rule 01',
    title: 'Verified Brand Authority',
    desc: 'Automated takedown dispatch and registrar dispute workflows require authenticated ownership of registered trademarks or authoritative domain credentials.'
  },
  {
    rule: 'Rule 02',
    title: 'Strictly Defensive Operations',
    desc: 'AEGIS is designed solely for brand protection and perimeter defense. Offensive penetration testing, denial of service, or unauthorized disruption against third parties is strictly prohibited.'
  },
  {
    rule: 'Rule 03',
    title: 'Coordinated Vulnerability Disclosure',
    desc: 'Perimeter credential or API token exposures identified during scans must adhere to standardized 30-day coordinated industry disclosure before public remediation reporting.'
  },
  {
    rule: 'Rule 04',
    title: 'Tamper-Evident Audit Trails',
    desc: 'Every analyst intervention, heuristic override, scan trigger, and enforcement submission is irreversibly recorded in immutable audit logs to maintain regulatory accountability.'
  }
];

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme, isAuthenticated } = useAegis();
  const [bottomTab, setBottomTab] = useState<'all' | 'faq' | 'privacy' | 'rules'>('all');

  const sectionCardStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(11, 17, 30, 0.88)' : 'rgba(241, 226, 212, 0.92)',
    borderColor: 'var(--border-color)',
    boxShadow: theme === 'dark'
      ? '0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 35px rgba(56, 189, 248, 0.08)'
      : '0 25px 60px -15px rgba(51, 31, 20, 0.16), 0 0 35px rgba(255, 141, 92, 0.10)'
  };

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
              <span className="font-black text-lg tracking-widest font-mono" style={{ color: 'var(--text-primary)' }}>
                AEGIS
              </span>
              <span className="text-[9px] uppercase tracking-widest font-medium -mt-1" style={{ color: 'var(--primary-accent)' }}>
                DIGITAL RISK PROTECTION
              </span>
            </div>
          </NavLink>

          {/* Centered Dynamic Spotlight Navbar */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl">
            <SpotlightNavbar
              items={[
                { label: 'Overview', href: '#overview' },
                { label: 'Capabilities', href: '#features' },
                { label: 'Platform Preview', href: '#preview' },
                { label: 'Our Mission', href: '#about' },
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

            {isAuthenticated ? (
              <NavLink to="/app">
                <RadialGlowButton className="!py-2 !px-4 !text-xs !min-w-[110px] !min-h-[36px]">
                  Go to App →
                </RadialGlowButton>
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors hidden sm:inline-block hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Sign In
                </NavLink>
                <NavLink to="/signup">
                  <RadialGlowButton className="!py-2 !px-4 !text-xs !min-w-[110px] !min-h-[36px]">
                    Sign Up →
                  </RadialGlowButton>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Header height spacer */}
      <div className="h-16 w-full pointer-events-none" aria-hidden="true" />

      {/* 2. Hero Section (Floating over the full-page wave background) */}
      <section id="overview" className="relative z-10 min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center px-6 sm:px-12 py-16 overflow-hidden bg-transparent">
        {/* Main Hero Content (100% transparent backdrop ensuring animated wave is unobstructed) */}
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-transparent">
          {/* Brand Name & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-4xl sm:text-6xl font-black tracking-widest font-mono" style={{ color: 'var(--text-primary)' }}>
              AEGIS INTELLIGENCE
            </h2>
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] font-semibold" style={{ color: 'var(--primary-accent)' }}>
              DIGITAL RISK PROTECTION & BRAND SECURITY
            </p>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
            See the Threat. <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: theme === 'dark'
                  ? 'linear-gradient(to right, #F0F6FC, #93C5FD, #38BDF8)'
                  : 'linear-gradient(to right, #541C09, #9A3412, #C2410C)'
              }}
            >
              Stop the Damage.
            </span>
          </h1>

          <p className="text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            From phishing sites and lookalike domains to fake social profiles and malicious app mirrors, AEGIS helps security teams identify digital threats, investigate suspicious activity, and respond with greater clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <NavLink to={isAuthenticated ? '/app' : '/login'}>
              <RadialGlowButton className="!px-7 !py-3 !text-sm !font-semibold">
                Explore the Platform →
              </RadialGlowButton>
            </NavLink>
            <a
              href="#features"
              className="px-6 py-3 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2"
              style={{
                backgroundColor: 'var(--card-sub-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <Eye size={14} style={{ color: 'var(--primary-accent)' }} /> Discover Our Capabilities
            </a>
          </div>

          <p className="text-[11px] sm:text-xs font-mono tracking-wide pt-2" style={{ color: 'var(--text-muted)' }}>
            Interactive evaluation environment • Preloaded with illustrative incident scenarios
          </p>
        </div>
      </section>

      {/* 3. Main Sections Container with Gap Breaks */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8 sm:space-y-12">
        {/* Platform Overview Section (In separate rectangular container with round corners) */}
        <section
          className="rounded-3xl border shadow-2xl backdrop-blur-2xl overflow-hidden px-6 sm:px-12 py-12 text-center transition-all duration-300"
          style={sectionCardStyle}
        >
          <div className="max-w-4xl mx-auto space-y-3">
            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.2em] font-bold" style={{ color: 'var(--primary-accent)' }}>
              PLATFORM OVERVIEW
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Your Brand Deserves Better Protection.
            </h2>
            <p className="text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Digital threats move across domains, social networks, and mobile platforms. AEGIS brings these signals into one place so teams can investigate suspicious activity and make better-informed decisions.
            </p>
          </div>
        </section>

        {/* Section A: Inside AEGIS / Miniature Dashboard Preview */}
        <section
          id="preview"
          className="rounded-3xl border shadow-2xl backdrop-blur-2xl overflow-hidden px-6 sm:px-12 py-16 transition-all duration-300"
          style={sectionCardStyle}
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.2em] font-bold" style={{ color: 'var(--primary-accent)' }}>
                INSIDE AEGIS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Clarity in the Face of Digital Threats.
              </h2>
              <p className="text-xs sm:text-sm font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Explore a unified workspace for reviewing findings, understanding risk, and tracking investigation activity.
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
                  <span className="text-xs font-mono ml-2" style={{ color: 'var(--text-muted)' }}>
                    aegis.app/overview • illustrative demo console
                  </span>
                </div>
              </div>

              {/* 3 Illustrative Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {/* Card 1: Critical */}
                <div
                  className="p-5 rounded-xl border space-y-3 transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      CRITICAL
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      4m ago
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                    acme-secure-login.xyz
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Suspicious credential harvesting page configured with lookalike DNS naming.
                  </p>
                </div>

                {/* Card 2: High */}
                <div
                  className="p-5 rounded-xl border space-y-3 transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      HIGH
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      18m ago
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                    @acme_official_help_bot
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Unverified social profile impersonating corporate customer support.
                  </p>
                </div>

                {/* Card 3: Resolved */}
                <div
                  className="p-5 rounded-xl border space-y-3 transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      RESOLVED
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      1h ago
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                    Acme Mobile Pro v4.9.apk
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Takedown notice issued for repackaged APK uploaded to third-party mirror.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section B: Threat Vectors Cards */}
        <section
          id="features"
          className="rounded-3xl border shadow-2xl backdrop-blur-2xl overflow-hidden px-6 sm:px-12 py-20 transition-all duration-300"
          style={sectionCardStyle}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.2em] font-bold" style={{ color: 'var(--primary-accent)' }}>
                WHAT AEGIS HELPS YOU PROTECT
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                One Platform. Multiple Threat Vectors.
              </h2>
              <p className="text-xs sm:text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Purpose-built workflows for assessing risk across brand attack surfaces.
              </p>
            </div>

            {/* Threat Vector Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  title: 'Lookalike Domains & Phishing',
                  desc: 'Identify suspicious domains and websites designed to impersonate trusted brands.',
                  icon: Globe,
                  color: 'var(--primary-accent)',
                  focusArea: 'Domain Permutations'
                },
                {
                  title: 'Social Impersonation',
                  desc: 'Review suspicious accounts and fake profiles that misuse brand or executive identities.',
                  icon: Users,
                  color: '#A855F7',
                  focusArea: 'Channel Analysis'
                },
                {
                  title: 'Malicious App Mirrors',
                  desc: 'Investigate suspicious applications and unofficial distribution sources.',
                  icon: Smartphone,
                  color: '#F97316',
                  focusArea: 'Package Inspection'
                },
                {
                  title: 'Threat Intelligence',
                  desc: 'Correlate available indicators to help analysts understand relationships between suspicious assets.',
                  icon: Network,
                  color: 'var(--primary-accent)',
                  focusArea: 'Infrastructure Mapping'
                },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-2xl border transition-all shadow-xl group hover:scale-[1.01] flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--card-sub-bg)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <div>
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
                      <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {card.title}
                      </h3>
                      <p className="text-xs mt-2.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {card.desc}
                      </p>
                    </div>

                    <div
                      className="mt-6 pt-3.5 border-t flex items-center justify-between text-xs"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Focus Area</span>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--primary-accent)' }}>
                        {card.focusArea}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LogoLoop Integration Below Cards */}
            <div className="mt-14 pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-center mb-5">
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
                  Threat Surface Coverage & Ecosystem Telemetry
                </span>
              </div>
              <div className="relative overflow-hidden py-1">
                <LogoLoop
                  logos={ECOSYSTEM_LOGOS}
                  speed={70}
                  direction="left"
                  logoHeight={32}
                  gap={44}
                  hoverSpeed={0}
                  scaleOnHover
                  fadeOut
                  fadeOutColor={theme === 'dark' ? 'rgba(11, 17, 30, 0.95)' : 'rgba(241, 226, 212, 0.95)'}
                  ariaLabel="Threat Surface Coverage and Ecosystem Telemetry"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section C: Creators & Mission with 5 TiltedCard Elements */}
        <section
          id="about"
          className="rounded-3xl border shadow-2xl backdrop-blur-2xl overflow-hidden px-6 sm:px-12 py-20 transition-all duration-300"
          style={sectionCardStyle}
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

            {/* Rectangle Body Container holding the 5 Creators Cards */}
            <div
              className="p-5 sm:p-7 rounded-2xl border shadow-xl transition-all"
              style={{
                backgroundColor: 'var(--card-sub-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {CREATORS.map((creator) => (
                  <div key={creator.id} className="w-full flex justify-center">
                    <TiltedCard
                      imageSrc={creator.photoUrl}
                      altText={`${creator.name} - ${creator.role}`}
                      captionText={`${creator.name} • ${creator.badgeId}`}
                      containerHeight="340px"
                      containerWidth="100%"
                      imageHeight="340px"
                      imageWidth="100%"
                      rotateAmplitude={12}
                      scaleOnHover={1.08}
                      showMobileWarning={false}
                      showTooltip={true}
                      displayOverlayContent={true}
                      overlayContent={
                        <div className="w-full h-full p-3.5 flex flex-col justify-between rounded-[15px] pointer-events-none select-none">
                          <div className="flex items-center justify-between gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400 font-semibold shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {creator.badgeId}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-mono text-white/80 font-medium">
                              {creator.status}
                            </span>
                          </div>

                          <div className="bg-gradient-to-t from-black/95 via-black/65 to-transparent -mx-3.5 -mb-3.5 p-3.5 rounded-b-[15px] space-y-1">
                            <h3 className="text-white font-bold text-sm tracking-tight drop-shadow-md">
                              {creator.name}
                            </h3>
                            <p className="text-[10px] font-semibold tracking-wide" style={{ color: 'var(--primary-accent)' }}>
                              {creator.role}
                            </p>
                            <p className="text-[9px] text-white/70 line-clamp-2 leading-relaxed">
                              {creator.specialty}
                            </p>
                          </div>
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Core Technology Stack & Footer Bar inside the rectangle body */}
              <div
                className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>
                    Core Technology Stack:
                  </span>
                  <span className="text-[11px]">
                    React 19, TypeScript, Vite, Tailwind CSS, Motion React, Tilted Card 3D, and Recharts.
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>
                  INTERACTIVE 3D TILT • HOVER TO ENGAGE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Integrated Uniform Footer: FAQ, Privacy Policy, Platform Rules */}
        <footer
          id="faq-privacy-rules"
          className="rounded-3xl border shadow-xl backdrop-blur-2xl px-6 sm:px-12 py-10 text-xs transition-all duration-300"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: theme === 'dark' ? 'rgba(8, 12, 21, 0.75)' : 'rgba(241, 226, 212, 0.92)',
            boxShadow: theme === 'dark'
              ? '0 20px 50px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.05)'
              : '0 20px 50px -15px rgba(51, 31, 20, 0.12), 0 0 25px rgba(255, 141, 92, 0.08)',
            color: 'var(--text-muted)'
          }}
        >
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Top Bar: Brand Logo & Interactive Tab Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 relative shrink-0 flex items-center justify-center"
                  style={{
                    filter: theme === 'dark'
                      ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.45))'
                      : 'drop-shadow(0 0 8px rgba(255, 141, 92, 0.4))'
                  }}
                >
                  <MetallicPaint
                    imageSrc="/aegis-logo.png"
                    scale={0.9}
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
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                      AEGIS Brand Protection
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono border"
                      style={{
                        borderColor: 'var(--border-color)',
                        color: 'var(--primary-accent)'
                      }}
                    >
                      GOVERNANCE & TRUST
                    </span>
                  </div>
                </div>
              </div>

              {/* Element Navigation Tabs (Replaced Dashboard, Threat Matrix, Settings) */}
              <div
                className="flex items-center gap-1 p-1 rounded-xl border text-[11px] font-medium"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setBottomTab(bottomTab === 'faq' ? 'all' : 'faq')}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: bottomTab === 'faq'
                      ? (theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 141, 92, 0.15)')
                      : 'transparent',
                    color: bottomTab === 'faq' ? 'var(--primary-accent)' : 'var(--text-secondary)',
                    fontWeight: bottomTab === 'faq' ? 600 : 400
                  }}
                >
                  FAQ
                </button>
                <button
                  type="button"
                  onClick={() => setBottomTab(bottomTab === 'privacy' ? 'all' : 'privacy')}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: bottomTab === 'privacy'
                      ? (theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 141, 92, 0.15)')
                      : 'transparent',
                    color: bottomTab === 'privacy' ? 'var(--primary-accent)' : 'var(--text-secondary)',
                    fontWeight: bottomTab === 'privacy' ? 600 : 400
                  }}
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setBottomTab(bottomTab === 'rules' ? 'all' : 'rules')}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    backgroundColor: bottomTab === 'rules'
                      ? (theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 141, 92, 0.15)')
                      : 'transparent',
                    color: bottomTab === 'rules' ? 'var(--primary-accent)' : 'var(--text-secondary)',
                    fontWeight: bottomTab === 'rules' ? 600 : 400
                  }}
                >
                  Platform Rules
                </button>
              </div>
            </div>

            {/* Bottom Most Element: FAQ, Privacy Policy, and Rules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* FAQ Section */}
              {(bottomTab === 'all' || bottomTab === 'faq') && (
                <div
                  className={`p-5 rounded-2xl border transition-all ${bottomTab === 'faq' ? 'lg:col-span-3' : ''}`}
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div
                      className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--primary-accent)'
                      }}
                    >
                      <CircleHelp size={15} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Frequently Asked Questions
                      </h3>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Detection pipelines & takedown automation
                      </p>
                    </div>
                  </div>

                  <div className={`space-y-3 ${bottomTab === 'faq' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''}`}>
                    {FAQS.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          borderColor: 'var(--border-color)'
                        }}
                      >
                        <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                          {faq.q}
                        </p>
                        <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Policy Section */}
              {(bottomTab === 'all' || bottomTab === 'privacy') && (
                <div
                  className={`p-5 rounded-2xl border transition-all ${bottomTab === 'privacy' ? 'lg:col-span-3' : ''}`}
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div
                      className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        color: '#10B981'
                      }}
                    >
                      <ShieldCheck size={15} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Privacy Policy
                      </h3>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Data sovereignty & telemetry isolation
                      </p>
                    </div>
                  </div>

                  <div className={`space-y-3 ${bottomTab === 'privacy' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''}`}>
                    {PRIVACY_POLICIES.map((policy, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          borderColor: 'var(--border-color)'
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                            {policy.title}
                          </p>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {policy.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Rules Section */}
              {(bottomTab === 'all' || bottomTab === 'rules') && (
                <div
                  className={`p-5 rounded-2xl border transition-all ${bottomTab === 'rules' ? 'lg:col-span-3' : ''}`}
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div
                      className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        color: '#F59E0B'
                      }}
                    >
                      <Scale size={15} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Platform Rules
                      </h3>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Operational boundaries & responsible usage
                      </p>
                    </div>
                  </div>

                  <div className={`space-y-3 ${bottomTab === 'rules' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''}`}>
                    {PLATFORM_RULES.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          borderColor: 'var(--border-color)'
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                            {rule.title}
                          </p>
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono border"
                            style={{
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-muted)'
                            }}
                          >
                            {rule.rule}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {rule.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Copyright & Security Standards Bar */}
            <div
              className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)'
              }}
            >
              <p>
                © 2026 AEGIS Security Intelligence. Defensive Brand Protection Platform.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
