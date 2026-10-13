import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAegis } from '../context/AegisContext';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  SiInstagram,
  SiTiktok,
  SiFacebook,
  SiX,
  SiYoutube,
  SiTelegram
} from 'react-icons/si';
import {
  Globe,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  AtSign,
  Activity,
  Clock,
  Sparkles,
  SearchCheck
} from 'lucide-react';

interface PlatformMeta {
  name: string;
  icon: React.ReactNode;
  badgeStyle: {
    backgroundColor: string;
    borderColor: string;
    color: string;
  };
  avatarStyle: {
    background: string;
    color: string;
    boxShadow?: string;
  };
}

const getPlatformMeta = (platform: string, isLight: boolean = false): PlatformMeta => {
  const p = platform.toLowerCase();

  if (p.includes('instagram')) {
    return {
      name: 'Instagram',
      icon: <SiInstagram size={13} className="shrink-0" />,
      badgeStyle: {
        backgroundColor: isLight ? 'rgba(225, 48, 108, 0.16)' : 'rgba(225, 48, 108, 0.12)',
        borderColor: isLight ? 'rgba(225, 48, 108, 0.45)' : 'rgba(225, 48, 108, 0.35)',
        color: isLight ? '#9D174D' : '#E1306C'
      },
      avatarStyle: {
        background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(225, 48, 108, 0.35)'
      }
    };
  }

  if (p.includes('tiktok')) {
    return {
      name: 'TikTok',
      icon: <SiTiktok size={12} className="shrink-0" />,
      badgeStyle: {
        backgroundColor: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(0, 242, 254, 0.12)',
        borderColor: isLight ? 'rgba(15, 23, 42, 0.3)' : 'rgba(0, 242, 254, 0.35)',
        color: isLight ? '#0F172A' : '#00D7E6'
      },
      avatarStyle: {
        background: '#010101',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(0, 242, 254, 0.25)'
      }
    };
  }

  if (p.includes('facebook')) {
    return {
      name: 'Facebook',
      icon: <SiFacebook size={13} className="shrink-0" />,
      badgeStyle: {
        backgroundColor: isLight ? 'rgba(24, 119, 242, 0.16)' : 'rgba(24, 119, 242, 0.12)',
        borderColor: isLight ? 'rgba(24, 119, 242, 0.45)' : 'rgba(24, 119, 242, 0.35)',
        color: isLight ? '#1E40AF' : '#1877F2'
      },
      avatarStyle: {
        background: '#1877F2',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(24, 119, 242, 0.35)'
      }
    };
  }

  if (p.includes('twitter') || p.includes('x')) {
    return {
      name: 'X (Twitter)',
      icon: <SiX size={12} className="shrink-0" />,
      badgeStyle: {
        backgroundColor: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(100, 116, 139, 0.15)',
        borderColor: isLight ? 'rgba(15, 23, 42, 0.3)' : 'rgba(100, 116, 139, 0.35)',
        color: isLight ? '#0F172A' : 'var(--text-primary)'
      },
      avatarStyle: {
        background: '#0F172A',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)'
      }
    };
  }

  if (p.includes('youtube')) {
    return {
      name: 'YouTube',
      icon: <SiYoutube size={13} className="shrink-0" />,
      badgeStyle: {
        backgroundColor: isLight ? 'rgba(255, 0, 0, 0.14)' : 'rgba(255, 0, 0, 0.12)',
        borderColor: isLight ? 'rgba(255, 0, 0, 0.45)' : 'rgba(255, 0, 0, 0.35)',
        color: isLight ? '#991B1B' : '#FF0000'
      },
      avatarStyle: {
        background: '#FF0000',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(255, 0, 0, 0.35)'
      }
    };
  }

  if (p.includes('telegram')) {
    return {
      name: 'Telegram',
      icon: <SiTelegram size={13} className="shrink-0" />,
      badgeStyle: {
        backgroundColor: isLight ? 'rgba(38, 165, 228, 0.16)' : 'rgba(38, 165, 228, 0.12)',
        borderColor: isLight ? 'rgba(38, 165, 228, 0.45)' : 'rgba(38, 165, 228, 0.35)',
        color: isLight ? '#0369A1' : '#26A5E4'
      },
      avatarStyle: {
        background: '#26A5E4',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(38, 165, 228, 0.35)'
      }
    };
  }

  return {
    name: platform.toUpperCase(),
    icon: <Globe size={13} className="shrink-0" />,
    badgeStyle: {
      backgroundColor: 'var(--card-sub-bg)',
      borderColor: 'var(--border-color)',
      color: 'var(--text-secondary)'
    },
    avatarStyle: {
      background: 'var(--primary-accent)',
      color: '#FFFFFF',
      boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)'
    }
  };
};

export const SocialMonitoringPage: React.FC = () => {
  const { findings, scans, setSelectedFinding, theme } = useAegis();
  const [platformFilter, setPlatformFilter] = useState('all');

  const isLight = theme === 'light';
  const socialFindings = findings.filter(f => f.type === 'social');
  const filtered = socialFindings.filter(f => platformFilter === 'all' || f.platform.toLowerCase() === platformFilter);

  // Determine scan completion process details
  const activeScan = scans.find(s => s.status === 'running');
  const scanProgress = activeScan ? activeScan.progress : 100;
  const isScanFinished = !activeScan || scanProgress >= 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Social Media Monitoring
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Continuous reconnaissance targeting fake executive profiles, rogue VIP support accounts, and brand impersonation.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="border rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none cursor-pointer transition-colors shadow-sm"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Networks ({socialFindings.length})</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">X / Twitter</option>
          </select>
        </div>
      </div>

      {/* Clear Scan Completion Process Banner */}
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.45,
          type: 'spring',
          stiffness: 260,
          damping: 22
        }}
        className="p-4 rounded-2xl border transition-all shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--card-sub-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
            style={{
              backgroundColor: isScanFinished
                ? (isLight ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.14)')
                : (isLight ? 'rgba(194, 65, 12, 0.18)' : 'rgba(56, 189, 248, 0.14)'),
              borderColor: isScanFinished
                ? (isLight ? '#059669' : 'rgba(16, 185, 129, 0.35)')
                : (isLight ? '#EA580C' : 'rgba(56, 189, 248, 0.35)'),
              color: isScanFinished
                ? (isLight ? '#047857' : '#10B981')
                : (isLight ? '#C2410C' : 'var(--primary-accent)')
            }}
          >
            {isScanFinished ? (
              <CheckCircle2 size={22} className="animate-pulse" />
            ) : (
              <Activity size={22} className="animate-spin" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Reconnaissance Scan Pipeline
              </span>
              <span
                className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 shadow-sm"
                style={{
                  backgroundColor: isScanFinished
                    ? (isLight ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.12)')
                    : (isLight ? 'rgba(194, 65, 12, 0.18)' : 'rgba(56, 189, 248, 0.12)'),
                  borderColor: isScanFinished
                    ? (isLight ? '#059669' : 'rgba(16, 185, 129, 0.35)')
                    : (isLight ? '#EA580C' : 'rgba(56, 189, 248, 0.35)'),
                  color: isScanFinished
                    ? (isLight ? '#047857' : '#10B981')
                    : (isLight ? '#9A3412' : 'var(--primary-accent)')
                }}
              >
                <CheckCircle2 size={11} />
                {isScanFinished ? '100% Process Complete' : `${scanProgress}% Scanning...`}
              </span>
            </div>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isScanFinished
                ? 'All social vectors indexed • Deep profile heuristic analysis & visual comparison finalized.'
                : 'Active scan thread processing social endpoints, hashtag clusters, and avatar hashing.'}
            </p>
          </div>
        </div>

        {/* Scan Progress Bar & Telemetry Stats */}
        <div className="w-full md:w-64 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-stone-800 dark:text-slate-300">Scan Completion</span>
            <span className="font-extrabold text-[11px] px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-800 text-stone-900 dark:text-emerald-200 shadow-sm">
              {scanProgress}% Verified
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${scanProgress}%`,
                background: isScanFinished
                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                  : 'linear-gradient(90deg, #EA580C, #F97316)'
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-stone-700 dark:text-slate-400 pt-0.5">
            <span>{socialFindings.length} Threat Vectors Analyzed</span>
            <span>Zero Unresolved Delays</span>
          </div>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item, index) => {
          const meta = getPlatformMeta(item.platform, isLight);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 65, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.48,
                delay: index * 0.07,
                type: 'spring',
                stiffness: 260,
                damping: 20
              }}
              onClick={() => setSelectedFinding(item)}
              className="p-5 rounded-2xl border transition-all duration-200 shadow-xl flex flex-col justify-between cursor-pointer group hover:scale-[1.01] hover:border-[var(--primary-accent)]"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div>
                {/* Platform Badge & Severity */}
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-extrabold tracking-tight shadow-sm"
                    style={{
                      backgroundColor: meta.badgeStyle.backgroundColor,
                      borderColor: meta.badgeStyle.borderColor,
                      color: meta.badgeStyle.color
                    }}
                  >
                    {meta.icon}
                    <span>{meta.name}</span>
                  </div>

                  <SeverityBadge severity={item.risk} />
                </div>

                {/* Avatar with authentic Social Platform Brand Icon & Highlighted Handle */}
                <div className="flex items-start gap-3 my-2">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-transform group-hover:scale-105"
                    style={meta.avatarStyle}
                    title={meta.name}
                  >
                    {meta.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Highlighted Username / Email Pill in Orange and Brownish styling */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold tracking-tight max-w-full truncate shadow-sm transition-all bg-[#FDEBD0] border-[#E0A97E] text-[#451A03] dark:bg-amber-950/60 dark:border-orange-700/60 dark:text-orange-200"
                      title={item.title}
                    >
                      <AtSign size={12} className="shrink-0 text-orange-700 dark:text-orange-400" />
                      <span className="truncate">{item.title.replace(/^@/, '')}</span>
                    </div>

                    <div className="text-xs mt-1.5 flex items-center gap-1.5 text-stone-700 dark:text-slate-300">
                      <span className="font-semibold">Target:</span>
                      <strong className="font-bold text-stone-950 dark:text-white truncate">
                        {item.associatedBrand}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Metrics Box with High Contrast and Clear Scan Completion Process */}
                <div
                  className="mt-4 p-3.5 rounded-xl border space-y-2.5 text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700 dark:text-slate-300">Similarity Score:</span>
                    <span
                      className={`font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-md border shadow-sm ${
                        isLight
                          ? item.similarity >= 90
                            ? 'bg-rose-100 text-rose-950 border-rose-300'
                            : item.similarity >= 75
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : 'bg-stone-100 text-stone-900 border-stone-300'
                          : item.similarity >= 90
                          ? 'bg-slate-900 text-red-300 border-red-900/60'
                          : item.similarity >= 75
                          ? 'bg-slate-900 text-amber-300 border-amber-900/60'
                          : 'bg-slate-900 text-slate-200 border-slate-700'
                      }`}
                    >
                      {item.similarity}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700 dark:text-slate-300">Triage Status:</span>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700 dark:text-slate-300">First Observed:</span>
                    <span className="font-mono font-bold text-xs text-stone-950 dark:text-slate-200">
                      {item.detectedTime}
                    </span>
                  </div>

                  {/* Clear Scan Process Completion Indicator per finding */}
                  <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="font-semibold text-stone-700 dark:text-slate-300">Scan Pipeline:</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                        isLight
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-400'
                          : 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/40'
                      }`}
                    >
                      <CheckCircle2 size={11} className={`shrink-0 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`} />
                      100% Analyzed
                    </span>
                  </div>
                </div>

                {/* Evidence Note snippet in clear readable format */}
                {item.notes && item.notes[0] && (
                  <div
                    className="mt-3.5 p-2.5 rounded-xl border text-xs leading-relaxed italic font-medium"
                    style={{
                      backgroundColor: isLight ? 'rgba(255, 255, 255, 0.55)' : 'var(--card-sub-bg)',
                      borderColor: 'var(--border-color)',
                      color: isLight ? '#23120B' : 'var(--text-secondary)'
                    }}
                  >
                    &ldquo;{item.notes[0]}&rdquo;
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div
                className="pt-4 mt-4 border-t flex items-center justify-between text-xs"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span
                  className="group-hover:underline font-bold flex items-center gap-1"
                  style={{ color: isLight ? '#C2410C' : 'var(--primary-accent)' }}
                >
                  Inspect Evidence <ExternalLink size={12} />
                </span>
                <span className="font-mono text-[11px] font-semibold text-stone-700 dark:text-slate-400">
                  ID: {item.id}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMonitoringPage;
