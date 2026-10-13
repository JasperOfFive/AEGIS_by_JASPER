import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { Severity } from '../../types';
import { useAegis } from '../../context/AegisContext';

interface RiskDistributionChartProps {
  onSelectSeverity?: (sev: Severity) => void;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ onSelectSeverity }) => {
  const [timeframe, setTimeframe] = useState<'30' | '7' | '90'>('30');
  const { theme } = useAegis();

  const data = [
    { name: 'Critical', count: 14, percent: 6, color: '#F43F5E', key: 'critical' },
    { name: 'High', count: 37, percent: 15, color: '#F97316', key: 'high' },
    { name: 'Medium', count: 89, percent: 36, color: '#FBBF24', key: 'medium' },
    { name: 'Low', count: 108, percent: 43, color: theme === 'dark' ? '#94A3B8' : '#78716C', key: 'low' },
  ];

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--card-glow)'
      }}
      className="p-5 rounded-2xl border flex flex-col justify-between h-full transition-colors duration-200"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Risk Distribution
        </h3>
        <div className="relative inline-block text-xs">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            style={{
              backgroundColor: 'var(--card-sub-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
            className="border rounded-lg px-2.5 py-1 text-xs appearance-none pr-6 cursor-pointer focus:outline-none"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-2.5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Chart & Legend Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center my-auto py-2">
        {/* Donut Chart with Center Label */}
        <div className="relative w-full h-44 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={68}
                paddingAngle={3}
                dataKey="count"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onSelectSeverity && onSelectSeverity(entry.key as Severity)}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#181A18' : '#FFFFFF',
                  borderColor: 'var(--border-color)',
                  borderRadius: '10px',
                  fontSize: '11px',
                  color: 'var(--text-primary)'
                }}
                formatter={(value: any, name: any) => [`${value} findings`, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-extrabold font-mono leading-none" style={{ color: 'var(--text-primary)' }}>
              {total}
            </span>
            <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Findings
            </span>
          </div>
        </div>

        {/* Legend List matching Screenshot */}
        <div className="flex flex-col gap-2.5 text-xs pr-2">
          {data.map((item) => (
            <div
              key={item.name}
              onClick={() => onSelectSeverity && onSelectSeverity(item.key as Severity)}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
              </div>
              <div className="flex items-center gap-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
                <span>{item.count}</span>
                <span className="text-[10px] opacity-70">({item.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
