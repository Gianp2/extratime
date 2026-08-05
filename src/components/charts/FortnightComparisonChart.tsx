import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useThemeStore } from '../../store/useThemeStore';

interface FortnightChartData {
  month: string;
  q1: number;
  q2: number;
}

interface FortnightComparisonChartProps {
  data: FortnightChartData[];
}

export const FortnightComparisonChart: React.FC<FortnightComparisonChartProps> = ({ data }) => {
  const effectiveTheme = useThemeStore((s) => s.effectiveTheme);
  const isDark = effectiveTheme === 'dark';

  const textColor = isDark ? '#a1a1aa' : '#71717a';
  const gridColor = isDark ? '#27272a' : '#f4f4f5';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e4e4e7',
              borderRadius: '12px',
              color: isDark ? '#f4f4f5' : '#18181b',
            }}
            formatter={(val: any) => [`${val} hrs`]}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="q1" name="1ª Quincena (1-15)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="q2" name="2ª Quincena (16-Fin)" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
