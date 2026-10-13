import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { Plus, ExternalLink, ChevronRight } from 'lucide-react';

export const BrandProfilesPage: React.FC = () => {
  const { brands, addBrand, setIsScanWizardOpen } = useAegis();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDomain, setNewBrandDomain] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');

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
          className="px-4 py-2 rounded-xl text-white font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity self-start sm:self-auto shadow-md"
          style={{ backgroundColor: 'var(--primary-accent)' }}
        >
          <Plus size={16} />
          Register New Brand
        </button>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {brands.map((b) => (
          <div
            key={b.id}
            className="p-6 rounded-2xl border transition-all shadow-xl flex flex-col justify-between group"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div>
              {/* Brand Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: 'var(--primary-accent-muted)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--primary-accent)'
                    }}
                  >
                    {b.logo}
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{b.name}</h3>
                    <a
                      href={`https://${b.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs flex items-center gap-1 font-mono mt-0.5 hover:underline"
                      style={{ color: 'var(--primary-accent)' }}
                    >
                      {b.domain} <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                <span
                  className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: b.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: b.status === 'active' ? '#10B981' : '#F59E0B',
                    borderColor: b.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                  }}
                >
                  {b.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs mt-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {b.description}
              </p>

              {/* Metrics */}
              <div
                className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-xl border text-xs"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div>
                  <span className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Assets</span>
                  <div className="font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{b.monitoredAssets}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Risk Index</span>
                  <div className={`font-bold mt-0.5 ${b.riskScore > 70 ? 'text-rose-500' : 'text-amber-500'}`}>
                    {b.riskScore}/100
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Findings</span>
                  <div className="font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{b.activeFindingsCount}</div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div
              className="flex items-center justify-between pt-5 mt-5 border-t"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Last probe: {b.lastScanTime}</span>
              <button
                onClick={() => setIsScanWizardOpen(true)}
                className="text-xs hover:underline font-semibold flex items-center gap-1"
                style={{ color: 'var(--primary-accent)' }}
              >
                Launch Probing <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
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
                  className="px-4 py-2 rounded-xl text-xs hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white font-semibold text-xs"
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
