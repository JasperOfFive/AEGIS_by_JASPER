import React from 'react';
import { Severity } from '../../types';
import { useAegis } from '../../context/AegisContext';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '', showDot = true }) => {
  const { theme } = useAegis();
  const isLight = theme === 'light';

  const styles: Record<Severity, { bg: string; text: string; border: string; dot: string; label: string }> = {
    critical: {
      bg: isLight ? 'bg-red-700 shadow-md' : 'bg-rose-500/20',
      text: isLight ? 'text-white font-extrabold' : 'text-rose-300 font-bold',
      border: isLight ? 'border-red-800' : 'border-rose-500/50',
      dot: isLight ? 'bg-white' : 'bg-rose-400',
      label: 'Critical'
    },
    high: {
      bg: isLight ? 'bg-rose-600 shadow-md' : 'bg-rose-500/20',
      text: isLight ? 'text-white font-extrabold' : 'text-rose-300 font-bold',
      border: isLight ? 'border-rose-700' : 'border-rose-500/50',
      dot: isLight ? 'bg-white' : 'bg-rose-400',
      label: 'High'
    },
    medium: {
      bg: isLight ? 'bg-amber-600 shadow-md' : 'bg-amber-500/20',
      text: isLight ? 'text-white font-extrabold' : 'text-amber-300 font-bold',
      border: isLight ? 'border-amber-700' : 'border-amber-500/50',
      dot: isLight ? 'bg-white' : 'bg-amber-400',
      label: 'Medium'
    },
    low: {
      bg: isLight ? 'bg-emerald-600 shadow-md' : 'bg-emerald-500/20',
      text: isLight ? 'text-white font-extrabold' : 'text-emerald-300 font-bold',
      border: isLight ? 'border-emerald-700' : 'border-emerald-500/50',
      dot: isLight ? 'bg-white' : 'bg-emerald-400',
      label: 'Low'
    }
  };

  const current = styles[severity] || styles.low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono tracking-wider uppercase border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse shrink-0`} />}
      {current.label}
    </span>
  );
};
