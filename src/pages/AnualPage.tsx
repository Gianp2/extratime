import React, { useState } from 'react';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { getMonthNamesSpanish } from '../utils/dateUtils';
import { HoursByMonthChart } from '../components/charts/HoursByMonthChart';
import { Sparkles, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const AnualPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = getMonthNamesSpanish();

  // Annual statistics per month
  const monthsData = React.useMemo(() => {
    return months.map((mName, idx) => {
      const monthStr = String(idx + 1).padStart(2, '0');
      const prefix = `${selectedYear}-${monthStr}`;

      const mRecords = records.filter((r) => r.date.startsWith(prefix));
      const totalHours = mRecords.reduce((acc, r) => acc + (r.hours || 0), 0);

      const daysWorked = new Set(mRecords.map((r) => r.date)).size;
      const avgPerWorkedDay = daysWorked > 0 ? Math.round((totalHours / daysWorked) * 10) / 10 : 0;

      // Previous month total hours for comparison
      let prevMonthPrefix = '';
      if (idx === 0) {
        prevMonthPrefix = `${selectedYear - 1}-12`;
      } else {
        prevMonthPrefix = `${selectedYear}-${String(idx).padStart(2, '0')}`;
      }
      const prevTotalHours = records
        .filter((r) => r.date.startsWith(prevMonthPrefix))
        .reduce((acc, r) => acc + (r.hours || 0), 0);

      const diff = totalHours - prevTotalHours;
      const changePct = prevTotalHours === 0 ? (totalHours > 0 ? 100 : 0) : Math.round((diff / prevTotalHours) * 100);

      return {
        monthName: mName,
        monthShort: mName.substring(0, 3),
        totalHours,
        avgPerWorkedDay,
        daysWorked,
        diff,
        changePct: Math.abs(changePct),
        isIncrease: diff >= 0,
      };
    });
  }, [records, selectedYear, months]);

  const totalYearHours = monthsData.reduce((acc, m) => acc + m.totalHours, 0);
  const totalYearDaysWorked = monthsData.reduce((acc, m) => acc + m.daysWorked, 0);
  const yearlyAvgPerMonth = Math.round((totalYearHours / 12) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Top Banner & Year Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Resumen Anual {selectedYear}
            </h3>
            <p className="text-xs text-zinc-500">
              Desglose acumulado de los 12 meses del año
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={() => setSelectedYear(selectedYear - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-base font-extrabold px-3">{selectedYear}</span>
          <Button variant="outline" size="sm" onClick={() => setSelectedYear(selectedYear + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Yearly Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white dark:from-zinc-900 dark:to-zinc-950 border-none shadow-md">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Total Horas del Año
          </span>
          <p className="text-3xl font-extrabold text-white mt-2">{totalYearHours} hrs</p>
          <p className="text-xs text-zinc-400 mt-1">Acumulado en 12 meses</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Promedio por Mes</span>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {yearlyAvgPerMonth} hrs/mes
          </p>
          <p className="text-xs text-zinc-500 mt-1">Promedio mensual global</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Días Registrados</span>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {totalYearDaysWorked} días
          </p>
          <p className="text-xs text-zinc-500 mt-1">Días trabajados con horas extras</p>
        </Card>
      </div>

      {/* Annual Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Barras Anual</CardTitle>
          <CardDescription>Comparación directa entre los 12 meses de {selectedYear}</CardDescription>
        </CardHeader>
        <HoursByMonthChart data={monthsData.map((m) => ({ monthName: m.monthShort, totalHours: m.totalHours }))} />
      </Card>

      {/* Grid of 12 Months Cards */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Desglose Mensual Detallado</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthsData.map((m) => (
            <Card key={m.monthName} hoverEffect className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{m.monthName}</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                  {m.totalHours} hrs
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Días trabajados:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{m.daysWorked} días</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Promed. x día:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{m.avgPerWorkedDay} hrs</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] flex items-center justify-between">
                <span className="text-zinc-400">vs Mes anterior:</span>
                {m.isIncrease ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +{m.changePct}%
                  </span>
                ) : (
                  <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" /> -{m.changePct}%
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
