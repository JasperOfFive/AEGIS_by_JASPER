import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAegis } from '../context/AegisContext';
import { User, Building, Bell, Key, Moon, Sun, Check, LogOut } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, currentUser, logout } = useAegis();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'notifications' | 'api'>('profile');
  const [savedNotice, setSavedNotice] = useState(false);

  const [analystName, setAnalystName] = useState(currentUser?.name || 'Alex Carter');
  const [analystEmail, setAnalystEmail] = useState(currentUser?.email || 'alex.carter@aegis-intel.io');
  const [orgName, setOrgName] = useState('Acme Global SecOps');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Platform Settings
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Configure security analyst preferences, alert thresholds, and organization profiles.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b pb-2 text-xs font-medium" style={{ borderColor: 'var(--border-color)' }}>
        {[
          { id: 'profile', label: 'Analyst Profile', icon: User },
          { id: 'organization', label: 'Organization & Team', icon: Building },
          { id: 'notifications', label: 'Alerting Rules', icon: Bell },
          { id: 'api', label: 'Integrations & API', icon: Key },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all border"
              style={{
                backgroundColor: active ? 'var(--card-sub-bg)' : 'transparent',
                borderColor: active ? 'var(--primary-accent)' : 'transparent',
                color: active ? 'var(--primary-accent)' : 'var(--text-secondary)'
              }}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <form
        onSubmit={handleSave}
        className="p-6 rounded-2xl border shadow-xl space-y-5"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full font-bold text-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: 'var(--primary-accent-muted)',
                    borderColor: 'var(--primary-accent)',
                    color: 'var(--primary-accent)'
                  }}
                >
                  {analystName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AC'}
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{analystName}</h3>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Lead SecOps Analyst • Threat Recon Division</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  value={analystName}
                  onChange={(e) => setAnalystName(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Work Email</label>
                <input
                  type="email"
                  value={analystEmail}
                  onChange={(e) => setAnalystEmail(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Theme Mode</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-4 py-2 rounded-xl border text-xs flex items-center gap-2 hover:opacity-90 transition-colors"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--primary-accent)'
                  }}
                >
                  {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                  Current: {theme === 'dark' ? 'Dark Intelligence Mode' : 'Warm Terracotta Light Mode'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'organization' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Organization Title</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div
              className="p-3 rounded-xl border text-xs space-y-1"
              style={{
                backgroundColor: 'var(--card-sub-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              <span className="font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>Active Team Seats (4 / 10)</span>
              <p>• Alex Carter (Principal SecOps Analyst)</p>
              <p>• Elena Rostova (Lead Interaction Architect)</p>
              <p>• Marcus Vance (Head of Legal Countermeasures)</p>
              <p>• Sarah Lin (Senior Adversary Profiler)</p>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>Immediate Dispatch Hooks</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                />
                <span>Send instantaneous email alerts when Critical IOCs are confirmed</span>
              </label>
              <label className="flex items-center gap-3 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={slackAlerts}
                  onChange={(e) => setSlackAlerts(e.target.checked)}
                />
                <span>Forward webhook payload to #secops-critical-brand-alerts</span>
              </label>
              <label className="flex items-center gap-3 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={criticalOnly}
                  onChange={(e) => setCriticalOnly(e.target.checked)}
                />
                <span>Suppress Medium & Low threat notifications during off-hours</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>AEGIS Ingestion API Token</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  readOnly
                  value="aegis_live_sec_9941a80d44b209e9f1a7"
                  className="w-full border rounded-xl px-3 py-2 text-xs font-mono"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--primary-accent)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => alert('API token copied to clipboard.')}
                  className="px-3 py-2 rounded-xl border text-xs"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Supports standard STIX/TAXII threat feeds, Splunk ES, Microsoft Sentinel, and custom SIEM webhooks.
            </p>
          </div>
        )}

        {/* Save button and status */}
        <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-white font-semibold text-xs transition-colors shadow"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            Save Changes
          </button>

          {savedNotice && (
            <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium animate-fade-in">
              <Check size={14} /> Preferences updated locally.
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
