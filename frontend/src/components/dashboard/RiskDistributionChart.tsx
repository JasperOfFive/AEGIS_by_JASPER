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
  const { theme, findings } = useAegis();

  // Filter findings based on selected timeframe
  const days = parseInt(timeframe, 10);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filteredFindings = findings.filter(f => (f.detectedTimestamp || 0) >= cutoff);
  // If no findings are within cutoff (e.g. mock data timestamps), fallback to all system findings
  const activeFindings = filteredFindings.length > 0 ? filteredFindings : findings;

  const criticalCount = activeFindings.filter(f => f.risk === 'critical').length;
  const highCount = activeFindings.filter(f => f.risk === 'high').length;
  const mediumCount = activeFindings.filter(f => f.risk === 'medium').length;
  const lowCount = activeFindings.filter(f => f.risk === 'low').length;
  const total = activeFindings.length;

  const getPercent = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  const data = [
    {
      name: 'Critical',
      count: criticalCount,
      percent: getPercent(criticalCount),
      color: '#F43F5E',
      key: 'critical' as Severity
    },
    {
      name: 'High',
      count: highCount,
      percent: getPercent(highCount),
      color: '#F97316',
      key: 'high' as Severity
    },
    {
      name: 'Medium',
      count: mediumCount,
      percent: getPercent(mediumCount),
      color: '#FBBF24',
      key: 'medium' as Severity
    },
    {
      name: 'Low',
      count: lowCount,
      percent: getPercent(lowCount),
      color: theme === 'dark' ? '#94A3B8' : '#78716C',
      key: 'low' as Severity
    },
  ];

  // If total is 0, provide placeholder segment so Recharts donut renders clean empty state
  const chartData = total > 0
    ? data.filter(d => d.count > 0)
    : [{ name: 'No Findings', count: 1, percent: 0, color: theme === 'dark' ? '#2A2C2A' : '#E7E5E4', key: 'low' as Severity }];

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
        <div>
          <h3 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Risk Distribution
          </h3>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {total} total active {total === 1 ? 'threat' : 'threats'} tracked
          </span>
        </div>
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
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={68}
                paddingAngle={total > 0 && chartData.length > 1 ? 3 : 0}
                dataKey="count"
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onSelectSeverity && total > 0 && onSelectSeverity(entry.key)}
                  />
                ))}
              </Pie>
              {total > 0 && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#181A18' : '#FFFFFF',
                    borderColor: 'var(--border-color)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any, name: any) => [`${value} findings`, name]}
                />
              )}
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-extrabold font-mono leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {total}
            </span>
            <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {total === 1 ? 'Finding' : 'Findings'}
            </span>
          </div>
        </div>

        {/* Legend List with dynamic data & progress bars */}
        <div className="flex flex-col gap-2 text-xs pr-1">
          {data.map((item) => (
            <div
              key={item.name}
              onClick={() => onSelectSeverity && onSelectSeverity(item.key)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                </div>
                <div className="flex items-center gap-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-semibold">{item.count}</span>
                  <span className="text-[10px] opacity-70">({item.percent}%)</span>
                </div>
              </div>
              <div className="w-full h-1 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
