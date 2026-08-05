import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useThemeStore } from '../../store/useThemeStore';

interface MonthChartData {
  monthName: string;
  totalHours: number;
}

interface HoursByMonthChartProps {
  data: MonthChartData[];
}

export const HoursByMonthChart: React.FC<HoursByMonthChartProps> = ({ data }) => {
  const effectiveTheme = useThemeStore((s) => s.effectiveTheme);
  const isDark = effectiveTheme === 'dark';

  const textColor = isDark ? '#a1a1aa' : '#71717a';
  const gridColor = isDark ? '#27272a' : '#f4f4f5';
  const barColor = isDark ? '#6366f1' : '#4f46e5';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="monthName" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              borderColor: isDark ? '#27272a' : '#e4e4e7',
              borderRadius: '12px',
              color: isDark ? '#f4f4f5' : '#18181b',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(val: any) => [`${val} hrs`, 'Horas Extras']}
          />
          <Bar dataKey="totalHours" fill={barColor} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
