import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegis } from '../../context/AegisContext';
import { X, Play, CheckCircle2, AlertTriangle, Shield, Globe, Users, Smartphone, Database } from 'lucide-react';
import { RadialGlowButton } from '../ui/radial-glow-button';

export const ScanWizardModal: React.FC = () => {
  const navigate = useNavigate();
  const { isScanWizardOpen, setIsScanWizardOpen, brands, runNewScan } = useAegis();
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || '');
  const [scanType, setScanType] = useState('comprehensive');
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['domains', 'social', 'mobile', 'darkweb']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isScanWizardOpen) return null;

  const toggleTarget = (target: string) => {
    setSelectedTargets(prev =>
      prev.includes(target) ? prev.filter(t => t !== target) : [...prev, target]
    );
  };

  const handleStartScan = async () => {
    setIsSubmitting(true);
    await runNewScan(selectedBrandId, selectedTargets, scanType);
    setIsSubmitting(false);
    setIsScanWizardOpen(false);
    navigate('/app/scan-history');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="rounded-2xl border w-full max-w-lg p-6 shadow-2xl relative flex flex-col gap-5 aegis-card animate-scale-in"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Shield size={18} style={{ color: 'var(--primary-accent)' }} />
              Run Targeted Brand Scan
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Launch real-time intelligence probing across public surfaces.
            </p>
          </div>
          <button
            onClick={() => setIsScanWizardOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Brand Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider font-mono" style={{ color: 'var(--text-muted)' }}>
            Target Organization / Brand
          </label>
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-colors border"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.domain})
              </option>
            ))}
          </select>
        </div>

        {/* Scan Scope Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider font-mono" style={{ color: 'var(--text-muted)' }}>
            Surfaces to Probe
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'domains', label: 'Lookalike Domains', icon: Globe, desc: 'Typosquats & Punycode' },
              { id: 'social', label: 'Social Channels', icon: Users, desc: 'Fake profiles & handles' },
              { id: 'mobile', label: 'App Repositories', icon: Smartphone, desc: 'APK mirrors & trojans' },
              { id: 'darkweb', label: 'Threat Intel & Leaks', icon: Database, desc: 'Credential dumps' },
            ].map(t => {
              const Icon = t.icon;
              const active = selectedTargets.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => toggleTarget(t.id)}
                  className="p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between"
                  style={{
                    backgroundColor: active ? 'var(--card-sub-bg)' : 'var(--card-bg)',
                    borderColor: active ? 'var(--primary-accent)' : 'var(--border-color)',
                    boxShadow: active ? '0 0 12px var(--primary-accent-muted)' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon size={16} style={{ color: active ? 'var(--primary-accent)' : 'var(--text-muted)' }} />
                    <div
                      className="w-3.5 h-3.5 rounded-full border flex items-center justify-center"
                      style={{
                        borderColor: active ? 'var(--primary-accent)' : 'var(--border-color)',
                        backgroundColor: active ? 'var(--primary-accent)' : 'transparent'
                      }}
                    >
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {t.label}
                    </span>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scan Profile */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider font-mono" style={{ color: 'var(--text-muted)' }}>
            Scan Depth & Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'quick', label: 'Quick Pulse', time: '~30 sec' },
              { id: 'comprehensive', label: 'Deep Recon', time: '~2 min' },
              { id: 'continuous', label: 'Persistent Watch', time: 'Active' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setScanType(p.id)}
                className="py-2 px-2.5 rounded-xl border text-center transition-all"
                style={{
                  backgroundColor: scanType === p.id ? 'var(--primary-accent-muted)' : 'var(--card-sub-bg)',
                  borderColor: scanType === p.id ? 'var(--primary-accent)' : 'var(--border-color)',
                  color: scanType === p.id ? 'var(--primary-accent)' : 'var(--text-secondary)'
                }}
              >
                <div className="text-xs font-semibold">{p.label}</div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{p.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notice */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          <span>Demo mode active. Simulated telemetry will populate dashboard findings.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsScanWizardOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <RadialGlowButton
            onClick={handleStartScan}
            disabled={isSubmitting || selectedTargets.length === 0}
            className="!min-w-[130px] !min-h-[38px] !text-xs !py-2 !px-4"
          >
            {isSubmitting ? 'Initializing...' : 'Execute Scan →'}
          </RadialGlowButton>
        </div>
      </div>
    </div>
  );
};
