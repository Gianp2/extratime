import React from 'react';
import { ThinkingOrb } from 'thinking-orbs';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { GoalProgressCard } from '../components/dashboard/GoalProgressCard';
import { NotificationBanner } from '../components/dashboard/NotificationBanner';
import { SmartInsightsAlert } from '../components/dashboard/SmartInsightsAlert';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { HoursByMonthChart } from '../components/charts/HoursByMonthChart';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { getMonthNamesSpanish, getFortnightInterval, formatDateSpanish } from '../utils/dateUtils';
import { Plus, Clock, AlertCircle, Sparkles } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);
  const isLoading = useExtraHoursStore((s) => s.isLoading);
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);
  const openRateModal = useExtraHoursStore((s) => s.openRateModal);
  const settings = useExtraHoursStore((s) => s.settings);

  const todayStr = new Date().toISOString().split('T')[0];

  // Current Fortnight label
  const fortnightInfo = React.useMemo(() => {
    const fn = getFortnightInterval();
    const period = fn.isCurrentQ1 ? fn.q1 : fn.q2;
    const startStr = formatDateSpanish(period.start.toISOString().split('T')[0], "d 'de' MMM");
    const endStr = formatDateSpanish(period.end.toISOString().split('T')[0], "d 'de' MMM");
    const label = fn.isCurrentQ1 ? '1ª Quincena' : '2ª Quincena';
    return `${label} (${startStr} - ${endStr})`;
  }, []);

  // Calculate monthly data for chart
  const monthlyChartData = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = getMonthNamesSpanish();
    return months.map((mName, idx) => {
      const monthStr = String(idx + 1).padStart(2, '0');
      const prefix = `${currentYear}-${monthStr}`;
      const totalHours = records
        .filter((r) => r.date.startsWith(prefix))
        .reduce((sum, r) => sum + (r.hours || 0), 0);
      return {
        monthName: mName.substring(0, 3),
        totalHours,
      };
    });
  }, [records]);

  // Insights for Monthly Chart
  const totalYearHours = React.useMemo(() => {
    return monthlyChartData.reduce((acc, curr) => acc + curr.totalHours, 0);
  }, [monthlyChartData]);

  const peakMonth = React.useMemo(() => {
    let max = -1;
    let best: { monthName: string; totalHours: number } | null = null;
    monthlyChartData.forEach((m) => {
      if (m.totalHours > max && m.totalHours > 0) {
        max = m.totalHours;
        best = m;
      }
    });
    return best;
  }, [monthlyChartData]);

  const activeMonthsCount = React.useMemo(() => {
    return monthlyChartData.filter((m) => m.totalHours > 0).length;
  }, [monthlyChartData]);

  const avgActiveMonth = React.useMemo(() => {
    if (activeMonthsCount === 0) return 0;
    return Math.round((totalYearHours / activeMonthsCount) * 10) / 10;
  }, [totalYearHours, activeMonthsCount]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <ThinkingOrb state="connecting" size={64} />
        <div className="space-y-1">
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Cargando Panel de Horas Extras...</p>
          <p className="text-xs text-zinc-500">Sincronizando tus datos y registros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile & Browser Notification Banner */}
      <NotificationBanner />

      {/* Top Banner / Quick Actions Header */}
      <div className="flex flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800/80 shadow-sm">
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              Panel de Horas Extras
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-400 flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Periodo: <strong className="text-zinc-200">{fortnightInfo}</strong></span>
          </p>
        </div>

        <div className="hidden sm:inline-flex shrink-0">
          <Button
            size="sm"
            onClick={() => openDayModal(todayStr)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="shadow-md text-xs px-2.5 sm:px-3 py-1.5"
          >
            <span>Cargar Horas</span>
          </Button>
        </div>
      </div>

      {/* Smart Insights & Rate Alerts */}
      <SmartInsightsAlert />

      {/* Resumen Cards */}
      <SummaryCards records={records} />

      {/* Goal Progress + Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Trend Chart */}
          <Card className="flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tendencia Mensual</CardTitle>
                  <CardDescription>
                    Horas extras registradas por mes en el año {new Date().getFullYear()}
                  </CardDescription>
                </div>
                {totalYearHours > 0 && (
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Total Anual</span>
                    <span className="text-sm font-extrabold text-indigo-400">{totalYearHours} hrs</span>
                  </div>
                )}
              </CardHeader>
              <HoursByMonthChart data={monthlyChartData} />
            </div>

            {/* Quick Stats Bar */}
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 px-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-400">Total Anual:</span>
                <span className="font-bold text-indigo-400">{totalYearHours} hrs</span>
              </div>
              {peakMonth ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-400">Mes Pico:</span>
                  <span className="font-bold text-emerald-400">{peakMonth.monthName} ({peakMonth.totalHours}h)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-400">Estado:</span>
                  <span className="text-zinc-500">Sin registros este año</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-400">Promedio Activo:</span>
                <span className="font-bold text-zinc-200">{avgActiveMonth} h/mes</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity directly under Chart to balance layout */}
          <RecentActivity records={records} />
        </div>

        <div className="space-y-6">
          {/* Goal Card */}
          <GoalProgressCard />
        </div>
      </div>
    </div>
  );
};
