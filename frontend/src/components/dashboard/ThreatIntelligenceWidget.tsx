import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAegis } from '../../context/AegisContext';

export const ThreatIntelligenceWidget: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme } = useAegis();

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--card-glow)'
      }}
      className="p-5 rounded-2xl border flex flex-col justify-between h-full relative overflow-hidden transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 z-10">
        <div>
          <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Threat Intelligence
          </h3>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Entity graph mapping</span>
        </div>
        <button
          onClick={() => navigate('/app/threat-intelligence')}
          className="text-xs hover:underline flex items-center gap-1 font-medium"
          style={{ color: 'var(--primary-accent)' }}
        >
          View Graph <ArrowRight size={13} />
        </button>
      </div>

      {/* Visual Relationship Graph matching Screenshot 1 */}
      <div className="relative w-full h-56 flex items-center justify-center my-auto">
        <svg className="w-full h-full" viewBox="0 0 340 200">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme === 'dark' ? '#38BDF8' : '#FF8D5C'} stopOpacity="0.8" />
              <stop offset="100%" stopColor={theme === 'dark' ? '#38BDF8' : '#FF8D5C'} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Connection Lines from Center (170, 100) */}
          <line
            x1="170" y1="100"
            x2="280" y2="40"
            stroke="#F43F5E"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.7"
          />
          <line
            x1="170" y1="100"
            x2="60" y2="100"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.7"
          />
          <line
            x1="170" y1="100"
            x2="280" y2="120"
            stroke="#F97316"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.7"
          />
          <line
            x1="170" y1="100"
            x2="170" y2="170"
            stroke="var(--primary-accent)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.7"
          />

          {/* Center Brand Node: Acme Corporation */}
          <g
            className="cursor-pointer group"
            onClick={() => setActiveNode('center')}
          >
            <circle
              cx="170" cy="100" r="28"
              fill={theme === 'dark' ? '#18140E' : '#FDFBF7'}
              stroke="var(--primary-accent)"
              strokeWidth="2"
              className="group-hover:stroke-width-3 transition-all"
            />
            <circle
              cx="170" cy="100" r="32"
              fill="none"
              stroke="var(--primary-accent)"
              strokeWidth="1"
              opacity="0.3"
            />
            <text x="170" y="96" textAnchor="middle" fill={theme === 'dark' ? '#F4F0E9' : '#1C1917'} fontSize="10" fontWeight="bold">Acme</text>
            <text x="170" y="108" textAnchor="middle" fill={theme === 'dark' ? '#A7AAA6' : '#6B6862'} fontSize="7.5">Corporation</text>
          </g>

          {/* Node 1: Suspicious Profiles (280, 40) */}
          <g
            className="cursor-pointer group"
            onClick={() => setActiveNode('profiles')}
          >
            <circle cx="280" cy="40" r="16" fill={theme === 'dark' ? '#1C1416' : '#FFF1F2'} stroke="#F43F5E" strokeWidth="1.5" />
            <text x="280" y="44" textAnchor="middle" fill="#F43F5E" fontSize="12">👤</text>
            <text x="280" y="65" textAnchor="middle" fill={theme === 'dark' ? '#F4F0E9' : '#1C1917'} fontSize="7.5" fontWeight="600">Suspicious Profiles</text>
            <text x="280" y="74" textAnchor="middle" fill={theme === 'dark' ? '#A7AAA6' : '#6B6862'} fontSize="6.5">(12 linked)</text>
          </g>

          {/* Node 2: Domains (60, 100) */}
          <g
            className="cursor-pointer group"
            onClick={() => setActiveNode('domains')}
          >
            <circle cx="60" cy="100" r="16" fill={theme === 'dark' ? '#111B15' : '#F0FDF4'} stroke="#10B981" strokeWidth="1.5" />
            <text x="60" y="104" textAnchor="middle" fill="#10B981" fontSize="12">🌐</text>
            <text x="60" y="125" textAnchor="middle" fill={theme === 'dark' ? '#F4F0E9' : '#1C1917'} fontSize="7.5" fontWeight="600">Domains</text>
            <text x="60" y="134" textAnchor="middle" fill={theme === 'dark' ? '#A7AAA6' : '#6B6862'} fontSize="6.5">(8 linked)</text>
          </g>

          {/* Node 3: Mobile Apps (280, 120) */}
          <g
            className="cursor-pointer group"
            onClick={() => setActiveNode('mobile')}
          >
            <circle cx="280" cy="120" r="16" fill={theme === 'dark' ? '#1E1610' : '#FFF7ED'} stroke="#F97316" strokeWidth="1.5" />
            <text x="280" y="124" textAnchor="middle" fill="#F97316" fontSize="12">📱</text>
            <text x="280" y="145" textAnchor="middle" fill={theme === 'dark' ? '#F4F0E9' : '#1C1917'} fontSize="7.5" fontWeight="600">Mobile Apps</text>
            <text x="280" y="154" textAnchor="middle" fill={theme === 'dark' ? '#A7AAA6' : '#6B6862'} fontSize="6.5">(5 linked)</text>
          </g>

          {/* Node 4: Related Findings (170, 170) */}
          <g
            className="cursor-pointer group"
            onClick={() => setActiveNode('findings')}
          >
            <circle cx="170" cy="170" r="14" fill={theme === 'dark' ? '#181613' : '#FFFDF5'} stroke="var(--primary-accent)" strokeWidth="1.5" />
            <text x="170" y="174" textAnchor="middle" fill="var(--primary-accent)" fontSize="11">📄</text>
            <text x="170" y="192" textAnchor="middle" fill={theme === 'dark' ? '#F4F0E9' : '#1C1917'} fontSize="7.5" fontWeight="600">Related Findings</text>
            <text x="170" y="199" textAnchor="middle" fill={theme === 'dark' ? '#A7AAA6' : '#6B6862'} fontSize="6.5">(24 linked)</text>
          </g>
        </svg>

        {/* Selected Node Tooltip Overlay */}
        {activeNode && (
          <div
            className="absolute bottom-1 rounded-lg px-2.5 py-1 text-[11px] shadow-lg animate-fade-in flex items-center gap-2 border"
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <span>Entity focus: <strong style={{ color: 'var(--primary-accent)' }} className="capitalize">{activeNode}</strong></span>
            <button
              onClick={() => setActiveNode(null)}
              className="hover:opacity-100 opacity-60 text-xs ml-1"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
