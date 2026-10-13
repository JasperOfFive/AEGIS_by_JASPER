import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useAegis } from '../../context/AegisContext';

interface KpiCardProps {
  title: string;
  value: string | number;
  changeText: string;
  isPositive?: boolean;
  icon: LucideIcon;
  sparklineData: number[];
  accentColor?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  changeText,
  isPositive = true,
  icon: Icon,
  sparklineData,
  accentColor,
  onClick
}) => {
  const { theme } = useAegis();
  const finalAccent = accentColor || (theme === 'dark' ? '#38BDF8' : '#FF8D5C');
  const maxVal = Math.max(...sparklineData, 1);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--card-glow)'
      }}
      className="p-5 rounded-2xl border hover:scale-[1.015] hover:-translate-y-0.5 transition-all duration-250 ease-out cursor-pointer relative overflow-hidden group flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-wider font-mono"
          style={{ color: 'var(--text-secondary)' }}
        >
          {title}
        </span>
        <div
          className="w-8 h-8 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-250 ease-out"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--primary-accent)'
          }}
        >
          <Icon size={16} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div
            className="text-3xl font-extrabold tracking-tight font-mono"
            style={{ color: 'var(--text-primary)' }}
          >
            {value}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span
              className={`font-medium ${
                isPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {changeText}
            </span>
          </div>
        </div>

        {/* Mini Sparkline Bar Chart */}
        <div className="flex items-end gap-1 h-9 pb-1">
          {sparklineData.map((val, idx) => {
            const heightPercent = Math.max(15, (val / maxVal) * 100);
            return (
              <div
                key={idx}
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: finalAccent,
                  opacity: 0.35 + (idx / sparklineData.length) * 0.65
                }}
                className="w-1.5 rounded-full transition-all duration-300 ease-out group-hover:opacity-100"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
