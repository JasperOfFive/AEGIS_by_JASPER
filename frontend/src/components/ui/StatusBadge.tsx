import React from 'react';
import { FindingStatus } from '../../types';
import { useAegis } from '../../context/AegisContext';

interface StatusBadgeProps {
  status: FindingStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { theme } = useAegis();
  const isLight = theme === 'light';

  const styles: Record<FindingStatus, { bg: string; text: string; border: string; dot: string; label: string }> = {
    new: {
      bg: isLight ? 'bg-blue-600 shadow-md' : 'bg-blue-500/20',
      text: isLight ? 'text-white font-extrabold' : 'text-blue-300 font-bold',
      border: isLight ? 'border-blue-700' : 'border-blue-500/50',
      dot: isLight ? 'bg-white' : 'bg-blue-400',
      label: 'New'
    },
    under_review: {
      bg: isLight ? 'bg-amber-600 shadow-md' : 'bg-amber-500/20',
      text: isLight ? 'text-white font-extrabold' : 'text-amber-300 font-bold',
      border: isLight ? 'border-amber-700' : 'border-amber-500/50',
      dot: isLight ? 'bg-white' : 'bg-amber-400',
      label: 'Under Review'
    },
    resolved: {
      bg: isLight ? 'bg-emerald-600 shadow-md' : 'bg-emerald-500/20',
      text: isLight ? 'text-white font-extrabold' : 'text-emerald-300 font-bold',
      border: isLight ? 'border-emerald-700' : 'border-emerald-500/50',
      dot: isLight ? 'bg-white' : 'bg-emerald-400',
      label: 'Resolved'
    },
    escalated: {
      bg: isLight ? 'bg-rose-600 shadow-md' : 'bg-rose-500/20',
      text: isLight ? 'text-white font-extrabold' : 'text-rose-300 font-bold',
      border: isLight ? 'border-rose-700' : 'border-rose-500/50',
      dot: isLight ? 'bg-white' : 'bg-rose-400',
      label: 'Escalated'
    },
    false_positive: {
      bg: isLight ? 'bg-slate-500/20' : 'bg-slate-500/20',
      text: isLight ? 'text-slate-700 font-bold' : 'text-slate-300 font-bold',
      border: isLight ? 'border-slate-400' : 'border-slate-500/40',
      dot: isLight ? 'bg-slate-500' : 'bg-slate-400',
      label: 'False Positive'
    },
    ignored: {
      bg: isLight ? 'bg-zinc-500/20' : 'bg-zinc-500/20',
      text: isLight ? 'text-zinc-700 font-bold' : 'text-zinc-300 font-bold',
      border: isLight ? 'border-zinc-400' : 'border-zinc-500/40',
      dot: isLight ? 'bg-zinc-500' : 'bg-zinc-400',
      label: 'Ignored'
    }
  };

  const current = styles[status] || styles.new;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono tracking-wider uppercase border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse shrink-0`} />
      {current.label}
    </span>
  );
};
