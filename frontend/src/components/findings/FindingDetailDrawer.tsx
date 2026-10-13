import React, { useState } from 'react';
import { useAegis } from '../../context/AegisContext';
import {
  X,
  ShieldAlert,
  ExternalLink,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Server,
  Layers,
  Send,
  Flag,
  Sparkles,
  Cpu
} from 'lucide-react';
import { SeverityBadge } from '../ui/SeverityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { FindingStatus } from '../../types';

export const FindingDetailDrawer: React.FC = () => {
  const { selectedFinding, setSelectedFinding, updateFindingStatus, explainFinding } = useAegis();
  const [newNote, setNewNote] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!selectedFinding) return null;

  const handleStatusChange = (status: FindingStatus) => {
    updateFindingStatus(selectedFinding.id, status);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteText = newNote.trim();
    setNewNote('');
    await updateFindingStatus(selectedFinding.id, selectedFinding.status, noteText);
  };

  const handleExplain = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      await explainFinding(selectedFinding.id, true);
    } catch (err: any) {
      setAiError(err.message || 'Unable to generate AI explanation.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="flex-1"
        onClick={() => setSelectedFinding(null)}
      />
      <div
        className="w-full max-w-xl h-full border-l p-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-slide-left aegis-card"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={selectedFinding.risk} showDot />
                <StatusBadge status={selectedFinding.status} />
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {selectedFinding.id}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight break-all" style={{ color: 'var(--text-primary)' }}>
                {selectedFinding.title}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Target Brand: <span className="font-medium" style={{ color: 'var(--primary-accent)' }}>{selectedFinding.associatedBrand}</span>
              </p>
            </div>
            <button
              onClick={() => setSelectedFinding(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#A7AAA6] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--card-sub-bg)', borderColor: 'var(--border-color)' }}>
              <span className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Similarity Score</span>
              <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--primary-accent)' }}>{selectedFinding.similarity}%</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--card-sub-bg)', borderColor: 'var(--border-color)' }}>
              <span className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Platform</span>
              <p className="text-sm font-semibold capitalize mt-1" style={{ color: 'var(--text-primary)' }}>{selectedFinding.platform}</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--card-sub-bg)', borderColor: 'var(--border-color)' }}>
              <span className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Detected</span>
              <p className="text-xs font-semibold mt-1.5" style={{ color: 'var(--text-secondary)' }}>{selectedFinding.detectedTime}</p>
            </div>
          </div>

          {/* Technical Telemetry */}
          <div className="p-4 rounded-xl border space-y-2.5" style={{ backgroundColor: 'var(--card-sub-bg)', borderColor: 'var(--border-color)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-2" style={{ color: 'var(--primary-accent)' }}>
              <Server size={14} /> Technical Forensics
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#6B706B] block">Resolved IP</span>
                <span className="font-mono text-[#F4F0E9]">{selectedFinding.ipAddress || '198.51.100.42'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B706B] block">DNS Host</span>
                <span className="font-mono text-[#F4F0E9] truncate block">{selectedFinding.dnsHost || 'ns1.threat-edge.net'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B706B] block">Registrar</span>
                <span className="text-[#A7AAA6]">{selectedFinding.registrar || 'NameCheap Inc.'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B706B] block">Autonomous System (ASN)</span>
                <span className="font-mono text-[#A7AAA6]">{selectedFinding.asn || 'AS13335'}</span>
              </div>
            </div>

            {selectedFinding.targetUrl && (
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] text-[#6B706B] block">Target URI</span>
                <a
                  href={selectedFinding.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs hover:underline flex items-center gap-1 font-mono break-all"
                  style={{ color: 'var(--primary-accent)' }}
                >
                  {selectedFinding.targetUrl}
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Signal Breakdown & Detection Signals */}
          {selectedFinding.raw?.signal_breakdown && selectedFinding.raw.signal_breakdown.length > 0 && (
            <div className="p-4 rounded-xl border space-y-2.5" style={{ backgroundColor: 'var(--card-sub-bg)', borderColor: 'var(--border-color)' }}>
              <div className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center justify-between" style={{ color: 'var(--primary-accent)' }}>
                <span className="flex items-center gap-1.5"><Layers size={14} /> Detection Signal Breakdown</span>
                <span className="text-[10px] text-[#A7AAA6]">{selectedFinding.raw.signal_breakdown.length} signals</span>
              </div>
              <div className="space-y-1.5">
                {selectedFinding.raw.signal_breakdown.map((sig, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/5 dark:bg-white/[0.02] border border-white/5">
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{sig.signal_name}</span>
                      <p className="text-[11px] text-[#A7AAA6]">{sig.explanation}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="font-mono font-bold text-xs" style={{ color: sig.score_contribution > 10 ? '#F43F5E' : 'var(--primary-accent)' }}>
                        +{sig.score_contribution.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apinex DeepSeek AI Explanation */}
          <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: 'var(--card-sub-bg)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-2" style={{ color: 'var(--primary-accent)' }}>
                <Sparkles size={14} /> AI Evidence Analysis (Apinex DeepSeek)
              </div>
              {selectedFinding.raw?.ai_explanation && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {selectedFinding.raw.ai_explanation_model || 'deepseek-v4.1-flash'}
                </span>
              )}
            </div>

            {selectedFinding.raw?.ai_explanation ? (
              <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="p-2.5 rounded-lg bg-black/10 dark:bg-white/[0.03] border border-white/5 font-sans leading-relaxed">
                  {selectedFinding.raw.ai_explanation.summary}
                </div>
                {selectedFinding.raw.ai_explanation.key_factors && selectedFinding.raw.ai_explanation.key_factors.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7AAA6] block mb-1">Key Threat Factors:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#A7AAA6]">
                      {selectedFinding.raw.ai_explanation.key_factors.map((kf: string, i: number) => (
                        <li key={i}>{kf}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedFinding.raw.ai_explanation.recommended_actions && selectedFinding.raw.ai_explanation.recommended_actions.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7AAA6] block mb-1">Recommended Response:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#A7AAA6]">
                      {selectedFinding.raw.ai_explanation.recommended_actions.map((act: string, i: number) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Request evidence-based threat reasoning from Apinex DeepSeek AI to corroborate detection factors.
                </p>
                {aiError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    {aiError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleExplain}
                  disabled={isGeneratingAi}
                  className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all self-start"
                  style={{
                    backgroundColor: 'var(--primary-accent-muted)',
                    borderColor: 'var(--primary-accent)',
                    color: 'var(--primary-accent)',
                    opacity: isGeneratingAi ? 0.6 : 1
                  }}
                >
                  <Sparkles size={13} className={isGeneratingAi ? 'animate-spin' : ''} />
                  {isGeneratingAi ? 'Analyzing Evidence...' : 'Generate AI Explanation'}
                </button>
              </div>
            )}
          </div>

          {/* Analyst Notes & Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F4F0E9] uppercase tracking-wider font-mono">
                Investigation Notes ({selectedFinding.notes?.length || 0})
              </span>
              <span className="text-[10px] text-[#A7AAA6]">
                Assigned: <span className="text-[#F4F0E9] font-medium">{selectedFinding.assignedAnalyst || 'Alex Carter'}</span>
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedFinding.notes && selectedFinding.notes.length > 0 ? (
                selectedFinding.notes.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#A7AAA6]">
                    {note}
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#6B706B] italic">No analyst notes recorded yet.</div>
              )}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Append telemetry log or analyst observation..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1 border transition-colors"
                style={{
                  backgroundColor: 'var(--primary-accent-muted)',
                  borderColor: 'var(--primary-accent)',
                  color: 'var(--primary-accent)'
                }}
              >
                <Send size={12} /> Post
              </button>
            </form>
          </div>

          {/* Workflow Status Controls */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-[#A7AAA6] uppercase tracking-wider font-mono">
              Update Investigation Status
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['new', 'under_review', 'resolved', 'escalated'] as FindingStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className="py-1.5 px-2 rounded-xl border text-center text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedFinding.status === st ? 'var(--primary-accent-muted)' : 'var(--card-sub-bg)',
                    borderColor: selectedFinding.status === st ? 'var(--primary-accent)' : 'var(--border-color)',
                    color: selectedFinding.status === st ? 'var(--primary-accent)' : 'var(--text-secondary)'
                  }}
                >
                  {st === 'under_review' ? 'Review' : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              alert(`Takedown notice dispatch simulated for ${selectedFinding.title}`);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Flag size={14} /> Request Takedown
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Finding evidence link copied to clipboard.');
            }}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#F4F0E9] border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Share2 size={14} /> Share IOC
          </button>
        </div>
      </div>
    </div>
  );
};
