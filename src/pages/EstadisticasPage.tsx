import React from 'react';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { HoursByMonthChart } from '../components/charts/HoursByMonthChart';
import { FortnightComparisonChart } from '../components/charts/FortnightComparisonChart';
import { getMonthNamesSpanish, formatDateSpanish } from '../utils/dateUtils';
import { BarChart3, Trophy, Flame, Calendar, Clock, Award, Activity } from 'lucide-react';

export const EstadisticasPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);

  const totalHours = records.reduce((acc, r) => acc + (r.hours || 0), 0);
  const totalRecordsCount = records.length;

  // Days calculations
  const uniqueWorkedDates = new Set(records.map((r) => r.date));
  const totalDaysWorked = uniqueWorkedDates.size;
  const avgPerWorkedDay = totalDaysWorked > 0 ? Math.round((totalHours / totalDaysWorked) * 10) / 10 : 0;

  // Current year dates count (up to today)
  const currentYear = new Date().getFullYear();
  const daysInYearSoFar = Math.ceil(
    (new Date().getTime() - new Date(currentYear, 0, 1).getTime()) / (1000 * 3600 * 24)
  );
  const daysWithoutHours = Math.max(0, daysInYearSoFar - totalDaysWorked);

  // Peak Day
  const hoursByDayMap = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.date] = (acc[r.date] || 0) + (r.hours || 0);
    return acc;
  }, {});

  let peakDay: { date: string; hours: number } | null = null;
  let maxDayHours = -1;
  Object.entries(hoursByDayMap).forEach(([d, h]) => {
    if (h > maxDayHours) {
      maxDayHours = h;
      peakDay = { date: d, hours: h };
    }
  });

  // Peak Month
  const months = getMonthNamesSpanish();
  const monthTotalsMap: Record<string, number> = {};
  records.forEach((r) => {
    const mKey = r.date.slice(0, 7); // YYYY-MM
    monthTotalsMap[mKey] = (monthTotalsMap[mKey] || 0) + r.hours;
  });

  let peakMonth: { mKey: string; hours: number } | null = null;
  let maxMonthHours = -1;
  Object.entries(monthTotalsMap).forEach(([mKey, h]) => {
    if (h > maxMonthHours) {
      maxMonthHours = h;
      peakMonth = { mKey, hours: h };
    }
  });

  // Averages
  const avgMonthly = Math.round((totalHours / 12) * 10) / 10;
  const avgWeekly = Math.round((totalHours / 52) * 10) / 10;

  // Chart datasets
  const monthlyChartData = months.map((mName, idx) => {
    const monthStr = String(idx + 1).padStart(2, '0');
    const prefix = `${currentYear}-${monthStr}`;
    const h = records
      .filter((r) => r.date.startsWith(prefix))
      .reduce((a, b) => a + (b.hours || 0), 0);
    return { monthName: mName.substring(0, 3), totalHours: h };
  });

  const fortnightChartData = months.map((mName, idx) => {
    const mStr = String(idx + 1).padStart(2, '0');
    const prefix = `${currentYear}-${mStr}`;
    const q1 = records
      .filter((r) => r.date.startsWith(prefix) && parseInt(r.date.split('-')[2], 10) <= 15)
      .reduce((a, b) => a + b.hours, 0);
    const q2 = records
      .filter((r) => r.date.startsWith(prefix) && parseInt(r.date.split('-')[2], 10) > 15)
      .reduce((a, b) => a + b.hours, 0);
    return { month: mName.substring(0, 3), q1, q2 };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Estadísticas Avanzadas & Analíticas
            </h3>
            <p className="text-xs text-zinc-500">
              Análisis profundo de rendimiento, récords y promedios de horas extras
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Total General Registrado
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {totalHours} <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">hrs</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">En {totalRecordsCount} registros individuales</p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Promedio x Día
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {avgPerWorkedDay} <span className="text-lg font-bold text-violet-600 dark:text-violet-400">hrs/día</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Basado en {totalDaysWorked} días activos</p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Promedio Mensual
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {avgMonthly} <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">hrs/mes</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Promedio semanal: {avgWeekly} hrs</p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Días sin Horas
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {daysWithoutHours} <span className="text-lg font-bold text-zinc-500 dark:text-zinc-400">días</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Días laborales estándar o de descanso</p>
          </div>
        </Card>
      </div>

      {/* Récords / Peaks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
                Día Réplica Máximo
              </span>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {peakDay ? `${peakDay.hours} hrs` : 'N/A'}
              </p>
              {peakDay && (
                <p className="text-xs text-zinc-500">
                  {formatDateSpanish(peakDay.date, "d 'de' MMMM, yyyy")}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500 text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase">
                Mes Réplica Máximo
              </span>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {peakMonth ? `${peakMonth.hours} hrs` : 'N/A'}
              </p>
              {peakMonth && (
                <p className="text-xs text-zinc-500">Período {peakMonth.mKey}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500 text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">
                Total Días Registrados
              </span>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {totalDaysWorked} días
              </p>
              <p className="text-xs text-zinc-500">Con al menos 0.5h extra</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución por Mes ({currentYear})</CardTitle>
          <CardDescription>Horas acumuladas mes a mes</CardDescription>
        </CardHeader>
        <HoursByMonthChart data={monthlyChartData} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparativa Quincenal Acumulada</CardTitle>
          <CardDescription>1ª Quincena (1-15) vs 2ª Quincena (16-Fin) en {currentYear}</CardDescription>
        </CardHeader>
        <FortnightComparisonChart data={fortnightChartData} />
      </Card>
    </div>
  );
};
