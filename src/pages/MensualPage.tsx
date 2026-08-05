import React, { useState } from 'react';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { HoursByMonthChart } from '../components/charts/HoursByMonthChart';
import { getMonthNamesSpanish, formatDateSpanish } from '../utils/dateUtils';
import { CalendarDays, Trophy, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const MensualPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const months = getMonthNamesSpanish();
  const currentMonthName = months[month];
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Month records
  const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));
  const totalMonthHours = monthRecords.reduce((acc, r) => acc + (r.hours || 0), 0);

  // Group by date for max & min day
  const hoursByDateMap = monthRecords.reduce<Record<string, number>>((acc, r) => {
    acc[r.date] = (acc[r.date] || 0) + (r.hours || 0);
    return acc;
  }, {});

  const datesWithHours = Object.keys(hoursByDateMap);
  let maxDay = null;
  let minDay = null;

  if (datesWithHours.length > 0) {
    let maxH = -1;
    let minH = Infinity;
    datesWithHours.forEach((d) => {
      const h = hoursByDateMap[d];
      if (h > maxH) {
        maxH = h;
        maxDay = { date: d, hours: h };
      }
      if (h < minH) {
        minH = h;
        minDay = { date: d, hours: h };
      }
    });
  }

  const daysWorked = datesWithHours.length;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyAvgMonth = daysWorked > 0 ? Math.round((totalMonthHours / daysWorked) * 10) / 10 : 0;

  // Fortnight Q1 & Q2 for this month
  const q1Hours = monthRecords
    .filter((r) => parseInt(r.date.split('-')[2], 10) <= 15)
    .reduce((a, b) => a + b.hours, 0);

  const q2Hours = monthRecords
    .filter((r) => parseInt(r.date.split('-')[2], 10) > 15)
    .reduce((a, b) => a + b.hours, 0);

  // 12 months chart for reference
  const yearlyMonthsData = months.map((mName, idx) => {
    const mStr = String(idx + 1).padStart(2, '0');
    const p = `${year}-${mStr}`;
    const h = records
      .filter((r) => r.date.startsWith(p))
      .reduce((a, b) => a + (b.hours || 0), 0);
    return { monthName: mName.substring(0, 3), totalHours: h };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Vista Mensual: {currentMonthName} {year}
            </h3>
            <p className="text-xs text-zinc-500">Análisis y calendario detallado de tu mes laboral</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold px-2">{currentMonthName}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Total Mensual</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
            {totalMonthHours} hrs
          </p>
          <p className="text-xs text-zinc-500 mt-1">En {daysInMonth} días del mes</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Promedio Diario</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            {dailyAvgMonth} hrs
          </p>
          <p className="text-xs text-zinc-500 mt-1">Por día trabajado ({daysWorked} días)</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">1ª vs 2ª Quincena</span>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            Q1: <span className="text-blue-600">{q1Hours}h</span> | Q2: <span className="text-emerald-600">{q2Hours}h</span>
          </p>
          <p className="text-xs text-zinc-500 mt-1">Desglose quincenal</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Día con Más Horas</span>
          {maxDay ? (
            <div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {(maxDay as any).hours} hrs
              </p>
              <p className="text-[11px] text-zinc-500">
                {formatDateSpanish((maxDay as any).date, 'd MMM')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 mt-2">Sin registros</p>
          )}
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Día con Menos Horas</span>
          {minDay ? (
            <div>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
                {(minDay as any).hours} hrs
              </p>
              <p className="text-[11px] text-zinc-500">
                {formatDateSpanish((minDay as any).date, 'd MMM')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 mt-2">Sin registros</p>
          )}
        </Card>
      </div>

      {/* Big Calendar */}
      <MonthCalendar
        records={records}
        onSelectDate={(dStr, rToEdit) => openDayModal(dStr, rToEdit)}
      />

      {/* Yearly comparison chart */}
      <Card>
        <CardHeader>
          <CardTitle>Horas Extras por Mes ({year})</CardTitle>
          <CardDescription>Visión general comparativa del año completo</CardDescription>
        </CardHeader>
        <HoursByMonthChart data={yearlyMonthsData} />
      </Card>
    </div>
  );
};
