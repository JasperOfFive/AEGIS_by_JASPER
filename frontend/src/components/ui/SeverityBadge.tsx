import React from 'react';
import { Severity } from '../../types';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '', showDot = false }) => {
  const styles: Record<Severity, { bg: string; text: string; border: string; dot: string; label: string }> = {
    critical: {
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-500',
      label: 'Critical'
    },
    high: {
      bg: 'bg-orange-500/10 dark:bg-orange-950/40',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/30',
      dot: 'bg-orange-500',
      label: 'High'
    },
    medium: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
      label: 'Medium'
    },
    low: {
      bg: 'bg-slate-500/10 dark:bg-slate-800/40',
      text: 'text-slate-600 dark:text-slate-300',
      border: 'border-slate-500/30',
      dot: 'bg-slate-400',
      label: 'Low'
    }
  };

  const current = styles[severity] || styles.low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />}
      {current.label}
    </span>
  );
};
