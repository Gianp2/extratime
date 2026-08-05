import React from 'react';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { getWeekHoursSummary } from '../utils/calculations';
import { getWeekInterval, getPreviousWeekInterval, formatDateSpanish } from '../utils/dateUtils';
import { WeeklyTrendChart } from '../components/charts/WeeklyTrendChart';
import { CalendarRange, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export const SemanasPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);

  const weekSum = getWeekHoursSummary(records);
  const currentInterval = getWeekInterval();
  const prevInterval = getPreviousWeekInterval();

  // Records in current week
  const currentWeekRecords = records.filter((r) => {
    const d = new Date(r.date + 'T00:00:00');
    return d >= currentInterval.start && d <= currentInterval.end;
  });

  // Daily breakdown for current week (Mon to Sun)
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dailyBreakdown = dayNames.map((name, idx) => {
    // 0 = Mon in 1-indexed ISO week
    const dayDate = new Date(currentInterval.start);
    dayDate.setDate(dayDate.getDate() + idx);
    const dateStr = dayDate.toISOString().split('T')[0];

    const dayRecs = currentWeekRecords.filter((r) => r.date === dateStr);
    const hours = dayRecs.reduce((acc, r) => acc + (r.hours || 0), 0);

    return {
      name,
      dateStr,
      formattedDate: format(dayDate, 'd MMM', { locale: es }),
      hours,
      recordsCount: dayRecs.length,
    };
  });

  const daysWorkedCount = dailyBreakdown.filter((d) => d.hours > 0).length;
  const dailyAvgCurrentWeek = daysWorkedCount > 0 ? Math.round((weekSum.currentHours / daysWorkedCount) * 10) / 10 : 0;

  // Recent 8 weeks trend chart data
  const weeklyTrendData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const wDate = subWeeks(now, i);
      const wStart = startOfWeek(wDate, { weekStartsOn: 1 });
      const wEnd = endOfWeek(wDate, { weekStartsOn: 1 });

      const wHours = records
        .filter((r) => {
          const rd = new Date(r.date + 'T00:00:00');
          return rd >= wStart && rd <= wEnd;
        })
        .reduce((sum, r) => sum + (r.hours || 0), 0);

      data.push({
        weekLabel: `Sem ${format(wStart, 'dd/MM')}`,
        totalHours: wHours,
      });
    }
    return data;
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Resumen Semanal de Horas
            </h3>
            <p className="text-xs text-zinc-500">
              Semana del {formatDateSpanish(currentInterval.start.toISOString().split('T')[0], "d 'de' MMMM")} al{' '}
              {formatDateSpanish(currentInterval.end.toISOString().split('T')[0], "d 'de' MMMM")}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            Total Horas Esta Semana
          </span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {weekSum.currentHours} hrs
          </p>
          <p className="text-xs text-zinc-500 mt-1">Acumulado en 7 días</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            Promedio Diario Trabajado
          </span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            {dailyAvgCurrentWeek} hrs/día
          </p>
          <p className="text-xs text-zinc-500 mt-1">En {daysWorkedCount} días con registros</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            Semana Anterior
          </span>
          <p className="text-2xl font-extrabold text-zinc-700 dark:text-zinc-300 mt-2">
            {weekSum.previousHours} hrs
          </p>
          <p className="text-xs text-zinc-500 mt-1">Período comparativo previo</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            Variación Semanal
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {weekSum.changePercentage}%
            </span>
            {weekSum.isIncrease ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-4 h-4" /> Incremento
              </span>
            ) : (
              <span className="text-xs font-semibold text-rose-500 flex items-center gap-0.5">
                <TrendingDown className="w-4 h-4" /> Disminución
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Comparado con semana pasada</p>
        </Card>
      </div>

      {/* Daily breakdown grid for current week */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Día (Semana Actual)</CardTitle>
          <CardDescription>Detalle diario de horas extras registradas esta semana</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {dailyBreakdown.map((d) => (
            <div
              key={d.name}
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                d.hours > 0
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                  : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{d.name}</span>
                <p className="text-[10px] text-zinc-400">{d.formattedDate}</p>
              </div>

              <div className="mt-4">
                <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  {d.hours} <span className="text-xs font-medium text-zinc-500">hrs</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Semanal (Últimas 8 semanas)</CardTitle>
          <CardDescription>Tendencia histórica de horas extras semanales</CardDescription>
        </CardHeader>
        <WeeklyTrendChart data={weeklyTrendData} />
      </Card>
    </div>
  );
};
