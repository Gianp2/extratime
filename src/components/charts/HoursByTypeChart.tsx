import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useThemeStore } from '../../store/useThemeStore';
import { HourType } from '../../types';

interface TypeChartData {
  name: HourType | string;
  value: number;
}

interface HoursByTypeChartProps {
  data: TypeChartData[];
}

const COLORS: Record<string, string> = {
  normal: '#3b82f6',
  '50%': '#0d9488',
  '100%': '#6366f1',
  nocturna: '#a855f7',
  feriado: '#f43f5e',
};

export const HoursByTypeChart: React.FC<HoursByTypeChartProps> = ({ data }) => {
  const effectiveTheme = useThemeStore((s) => s.effectiveTheme);
  const isDark = effectiveTheme === 'dark';

  const filteredData = data.filter((d) => d.value > 0);
  const totalValue = filteredData.reduce((acc, curr) => acc + curr.value, 0);

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-zinc-400">
        Sin datos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {filteredData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#71717a'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#18181b' : '#ffffff',
                borderColor: isDark ? '#27272a' : '#e4e4e7',
                borderRadius: '12px',
                color: isDark ? '#f4f4f5' : '#18181b',
              }}
              formatter={(val: any) => [`${val} hrs`, 'Horas']}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: isDark ? '#a1a1aa' : '#71717a' }}
              formatter={(value) => <span className="text-zinc-700 dark:text-zinc-300 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown list */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
        {filteredData.map((d) => {
          const pct = totalValue > 0 ? Math.round((d.value / totalValue) * 100) : 0;
          const color = COLORS[d.name] || '#71717a';
          return (
            <div key={d.name} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="font-medium text-zinc-300 truncate capitalize">{d.name}</span>
              </div>
              <span className="font-bold text-zinc-200 shrink-0 ml-1">
                {d.value}h <span className="text-[10px] text-zinc-500 font-normal">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
