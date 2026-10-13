import React from 'react';
import { FindingStatus } from '../../types';

interface StatusBadgeProps {
  status: FindingStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styles: Record<FindingStatus, { bg: string; text: string; border: string; label: string }> = {
    new: {
      bg: 'bg-blue-500/10 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
      label: 'New'
    },
    under_review: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-300',
      border: 'border-amber-500/20',
      label: 'Under Review'
    },
    resolved: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      label: 'Resolved'
    },
    escalated: {
      bg: 'bg-rose-500/10 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20',
      label: 'Escalated'
    }
  };

  const current = styles[status] || styles.new;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {current.label}
    </span>
  );
};
