import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { Plus, ExternalLink, SlidersHorizontal, Minus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Brand } from '../types';

interface BrandPalette {
  accent: string;
  bgBadge: string;
  borderBadge: string;
  cardBorderHover: string;
  logoBg: string;
  logoText: string;
  domainColor: string;
}

const getBrandTheme = (brand: Brand, index: number, isLight: boolean): BrandPalette => {
  const palettes: BrandPalette[] = [
    // 0: Blue (Acme)
    {
      accent: isLight ? '#0284C7' : '#38BDF8',
      bgBadge: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.15)',
      borderBadge: isLight ? 'rgba(2, 132, 199, 0.35)' : 'rgba(56, 189, 248, 0.35)',
      cardBorderHover: isLight ? '#0284C7' : '#38BDF8',
      logoBg: isLight ? 'rgba(2, 132, 199, 0.14)' : 'rgba(56, 189, 248, 0.18)',
      logoText: isLight ? '#0369A1' : '#38BDF8',
      domainColor: isLight ? '#0284C7' : '#38BDF8'
    },
    // 1: Violet / Purple (Globex)
    {
      accent: isLight ? '#7C3AED' : '#C084FC',
      bgBadge: isLight ? 'rgba(124, 58, 237, 0.12)' : 'rgba(192, 132, 252, 0.15)',
      borderBadge: isLight ? 'rgba(124, 58, 237, 0.35)' : 'rgba(192, 132, 252, 0.35)',
      cardBorderHover: isLight ? '#7C3AED' : '#C084FC',
      logoBg: isLight ? 'rgba(124, 58, 237, 0.14)' : 'rgba(192, 132, 252, 0.18)',
      logoText: isLight ? '#6D28D9' : '#C084FC',
      domainColor: isLight ? '#7C3AED' : '#C084FC'
    },
    // 2: Emerald Green (Soylent)
    {
      accent: isLight ? '#059669' : '#34D399',
      bgBadge: isLight ? 'rgba(5, 150, 105, 0.12)' : 'rgba(52, 211, 153, 0.15)',
      borderBadge: isLight ? 'rgba(5, 150, 105, 0.35)' : 'rgba(52, 211, 153, 0.35)',
      cardBorderHover: isLight ? '#059669' : '#34D399',
      logoBg: isLight ? 'rgba(5, 150, 105, 0.14)' : 'rgba(52, 211, 153, 0.18)',
      logoText: isLight ? '#047857' : '#34D399',
      domainColor: isLight ? '#059669' : '#34D399'
    },
    // 3: Rose / Crimson (Umbrella)
    {
      accent: isLight ? '#E11D48' : '#FB7185',
      bgBadge: isLight ? 'rgba(225, 29, 72, 0.12)' : 'rgba(251, 113, 133, 0.15)',
      borderBadge: isLight ? 'rgba(225, 29, 72, 0.35)' : 'rgba(251, 113, 133, 0.35)',
      cardBorderHover: isLight ? '#E11D48' : '#FB7185',
      logoBg: isLight ? 'rgba(225, 29, 72, 0.14)' : 'rgba(251, 113, 133, 0.18)',
      logoText: isLight ? '#BE123C' : '#FB7185',
      domainColor: isLight ? '#E11D48' : '#FB7185'
    },
    // 4: Amber / Warm Gold (Newly registered brand or 5th)
    {
      accent: isLight ? '#D97706' : '#FBBF24',
      bgBadge: isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(251, 191, 36, 0.15)',
      borderBadge: isLight ? 'rgba(217, 119, 6, 0.35)' : 'rgba(251, 191, 36, 0.35)',
      cardBorderHover: isLight ? '#D97706' : '#FBBF24',
      logoBg: isLight ? 'rgba(217, 119, 6, 0.14)' : 'rgba(251, 191, 36, 0.18)',
      logoText: isLight ? '#B45309' : '#FBBF24',
      domainColor: isLight ? '#D97706' : '#FBBF24'
    },
    // 5: Teal / Cyan (6th)
    {
      accent: isLight ? '#0D9488' : '#2DD4BF',
      bgBadge: isLight ? 'rgba(13, 148, 136, 0.12)' : 'rgba(45, 212, 191, 0.15)',
      borderBadge: isLight ? 'rgba(13, 148, 136, 0.35)' : 'rgba(45, 212, 191, 0.35)',
      cardBorderHover: isLight ? '#0D9488' : '#2DD4BF',
      logoBg: isLight ? 'rgba(13, 148, 136, 0.14)' : 'rgba(45, 212, 191, 0.18)',
      logoText: isLight ? '#0F766E' : '#2DD4BF',
      domainColor: isLight ? '#0D9488' : '#2DD4BF'
    }
  ];

  if (brand.id === 'brand-acme') return palettes[0];
  if (brand.id === 'brand-globex') return palettes[1];
  if (brand.id === 'brand-soylent') return palettes[2];
  if (brand.id === 'brand-umbrella') return palettes[3];

  return palettes[index % palettes.length];
};

const renderStatusBadge = (status: string, isLight: boolean) => {
  const s = status.toLowerCase();

  if (s === 'active') {
    return (
      <span
        className={`text-[11px] font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full border inline-flex items-center gap-1.5 shadow-sm transition-all ${
          isLight
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/30'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/10'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-white dark:bg-emerald-400 animate-pulse shrink-0" />
        ACTIVE
      </span>
    );
  }

  if (s === 'investigating') {
    return (
      <span
        className={`text-[11px] font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full border inline-flex items-center gap-1.5 shadow-sm transition-all ${
          isLight
            ? 'bg-amber-600 text-white border-amber-700 shadow-amber-600/30'
            : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-white dark:bg-amber-400 animate-pulse shrink-0" />
        INVESTIGATING
      </span>
    );
  }

  // Failed / Paused
  return (
    <span
      className={`text-[11px] font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full border inline-flex items-center gap-1.5 shadow-sm transition-all ${
        isLight
          ? 'bg-rose-600 text-white border-rose-700 shadow-rose-600/30'
          : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/10'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-white dark:bg-rose-400 shrink-0" />
      {s === 'failed' ? 'FAILED' : 'PAUSED'}
    </span>
  );
};

export const BrandProfilesPage: React.FC = () => {
  const { brands, addBrand, deleteBrand, updateBrand, theme } = useAegis();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDomain, setNewBrandDomain] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');
  const [brandTabs, setBrandTabs] = useState<Record<string, 'overview' | 'manage'>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isLight = theme === 'light';

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim() || !newBrandDomain.trim()) return;

    addBrand({
      name: newBrandName.trim(),
      domain: newBrandDomain.trim().replace(/^https?:\/\//, ''),
      description: newBrandDesc.trim() || 'Monitored brand asset.',
      socialHandles: [
        { platform: 'Twitter / X', handle: `@${newBrandName.toLowerCase().replace(/\s+/g, '')}` }
      ],
      protectedKeywords: [newBrandName.toLowerCase()]
    });

    setNewBrandName('');
    setNewBrandDomain('');
    setNewBrandDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Brand Profiles
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Registered organizations and protected trademark assets under active surveillance.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity self-start sm:self-auto shadow-md cursor-pointer"
          style={{ backgroundColor: 'var(--primary-accent)' }}
        >
          <Plus size={16} />
          Register New Brand
        </button>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {brands.map((b, index) => {
          const brandTheme = getBrandTheme(b, index, isLight);

          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 70, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                type: 'spring',
                stiffness: 260,
                damping: 20
              }}
              className="p-6 rounded-2xl border transition-all duration-200 shadow-xl flex flex-col justify-between group hover:shadow-2xl"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              {/* Brand Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform shrink-0 shadow-sm"
                    style={{
                      backgroundColor: brandTheme.logoBg,
                      borderColor: brandTheme.borderBadge,
                      color: brandTheme.logoText
                    }}
                  >
                    {b.logo}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {b.name}
                    </h3>
                    <a
                      href={`https://${b.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs flex items-center gap-1 font-mono mt-0.5 hover:underline font-medium"
                      style={{ color: brandTheme.domainColor }}
                    >
                      {b.domain} <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {renderStatusBadge(b.status, isLight)}
              </div>

              {/* Tab Navigation */}
              <div
                className="flex items-center gap-1.5 p-1 mt-4 rounded-xl border text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setBrandTabs(prev => ({ ...prev, [b.id]: 'overview' }))}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-all text-xs font-bold text-center ${
                    (brandTabs[b.id] || 'overview') === 'overview' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: (brandTabs[b.id] || 'overview') === 'overview' ? 'var(--card-bg)' : 'transparent',
                    color: (brandTabs[b.id] || 'overview') === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: (brandTabs[b.id] || 'overview') === 'overview' ? '1px solid var(--border-color)' : '1px solid transparent'
                  }}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setBrandTabs(prev => ({ ...prev, [b.id]: 'manage' }))}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-all text-xs font-bold flex items-center justify-center gap-1.5 ${
                    (brandTabs[b.id] || 'overview') === 'manage' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: (brandTabs[b.id] || 'overview') === 'manage' ? 'var(--card-bg)' : 'transparent',
                    color: (brandTabs[b.id] || 'overview') === 'manage' ? brandTheme.accent : 'var(--text-secondary)',
                    border: (brandTabs[b.id] || 'overview') === 'manage' ? '1px solid var(--border-color)' : '1px solid transparent'
                  }}
                >
                  <SlidersHorizontal size={12} />
                  Manage Profile
                </button>
              </div>

              {/* Tab Content: Overview vs Manage Profile */}
              {(brandTabs[b.id] || 'overview') === 'overview' ? (
                /* Metrics: Assets, Risk Index, Findings */
                <div
                  className="grid grid-cols-3 gap-3 mt-4 p-4 rounded-xl border text-center transition-all shadow-inner"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Assets
                    </span>
                    <div className="font-extrabold text-base mt-1" style={{ color: 'var(--text-primary)' }}>
                      {b.monitoredAssets}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center border-x" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Risk Index
                    </span>
                    <div
                      className="font-extrabold text-base mt-1"
                      style={{
                        color: b.riskScore > 70 ? '#EF4444' : b.riskScore > 40 ? '#F59E0B' : '#10B981'
                      }}
                    >
                      {b.riskScore}/100
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Findings
                    </span>
                    <div className="font-extrabold text-base mt-1" style={{ color: 'var(--text-primary)' }}>
                      {b.activeFindingsCount}
                    </div>
                  </div>
                </div>
              ) : (
                /* Manage Profile Controls */
                <div
                  className="mt-4 p-3.5 rounded-xl border space-y-3 transition-all shadow-inner"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  {/* Manage Assets */}
                  <div
                    className="flex items-center justify-between p-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        Assets
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Monitored assets
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateBrand(b.id, {
                            monitoredAssets: Math.max(0, b.monitoredAssets - 1)
                          })
                        }
                        className="w-7 h-7 rounded-md border flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: 'var(--card-sub-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                        title="Decrease assets"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={b.monitoredAssets}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10);
                          updateBrand(b.id, { monitoredAssets: isNaN(val) ? 0 : Math.max(0, val) });
                        }}
                        className="w-14 text-center font-bold text-xs font-mono py-1 rounded-md border"
                        style={{
                          backgroundColor: 'var(--card-sub-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateBrand(b.id, {
                            monitoredAssets: b.monitoredAssets + 1
                          })
                        }
                        className="w-7 h-7 rounded-md border flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: 'var(--card-sub-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                        title="Increase assets"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Manage Findings */}
                  <div
                    className="flex items-center justify-between p-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        Findings
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Active findings
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateBrand(b.id, {
                            activeFindingsCount: Math.max(0, b.activeFindingsCount - 1)
                          })
                        }
                        className="w-7 h-7 rounded-md border flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: 'var(--card-sub-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                        title="Decrease findings"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={b.activeFindingsCount}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10);
                          updateBrand(b.id, { activeFindingsCount: isNaN(val) ? 0 : Math.max(0, val) });
                        }}
                        className="w-14 text-center font-bold text-xs font-mono py-1 rounded-md border"
                        style={{
                          backgroundColor: 'var(--card-sub-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateBrand(b.id, {
                            activeFindingsCount: b.activeFindingsCount + 1
                          })
                        }
                        className="w-7 h-7 rounded-md border flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: 'var(--card-sub-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                        title="Increase findings"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Delete Brand Profile Action */}
                  <div className="pt-0.5">
                    {confirmDeleteId === b.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            deleteBrand(b.id);
                            setConfirmDeleteId(null);
                          }}
                          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(b.id)}
                        className="w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 text-red-500 hover:text-white hover:bg-red-600 border border-red-500/30 transition-all"
                        style={{
                          backgroundColor: isLight ? 'rgba(239, 68, 68, 0.06)' : 'rgba(239, 68, 68, 0.12)'
                        }}
                      >
                        <Trash2 size={13} />
                        Delete Brand Profile
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add Brand Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className="border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Register New Brand Entity</h3>
            <form onSubmit={handleCreateBrand} className="space-y-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wayne Enterprises"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Primary Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. wayne-enterprises.com"
                  value={newBrandDomain}
                  onChange={(e) => setNewBrandDomain(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Corporate Mission / Scope</label>
                <textarea
                  placeholder="Primary products, financial infrastructure, or consumer sectors..."
                  value={newBrandDesc}
                  onChange={(e) => setNewBrandDesc(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none h-20"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs hover:opacity-80 cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white font-semibold text-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  Add Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandProfilesPage;
