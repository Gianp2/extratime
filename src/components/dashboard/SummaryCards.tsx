import React from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, Layers, CalendarDays, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { ExtraHourRecord } from '../../types';
import {
  getTodayHoursSummary,
  getWeekHoursSummary,
  getFortnightHoursSummary,
  getMonthHoursSummary,
  getYearHoursSummary,
  calculateSalaryBreakdown,
  filterRecordsByInterval,
} from '../../utils/calculations';
import { getTodayString, getWeekInterval, getFortnightInterval, getMonthInterval, getYearInterval } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';
import { Card } from '../ui/Card';

interface SummaryCardsProps {
  records: ExtraHourRecord[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ records }) => {
  const settings = useExtraHoursStore((s) => s.settings);
  const openRateModal = useExtraHoursStore((s) => s.openRateModal);
  const currencySymbol = settings.currency || '$';

  const todaySum = getTodayHoursSummary(records);
  const weekSum = getWeekHoursSummary(records);
  const fortnightSum = getFortnightHoursSummary(records);
  const monthSum = getMonthHoursSummary(records);

  // Interval records for earnings calculations
  const todayStr = getTodayString();
  const todayRecs = records.filter((r) => r.date === todayStr);

  const weekInterval = getWeekInterval();
  const weekRecs = filterRecordsByInterval(records, weekInterval);

  const fortnightInterval = getFortnightInterval();
  const currentQInterval = fortnightInterval.isCurrentQ1 ? fortnightInterval.q1 : fortnightInterval.q2;
  const fortnightRecs = filterRecordsByInterval(records, currentQInterval);

  const monthInterval = getMonthInterval();
  const monthRecs = filterRecordsByInterval(records, monthInterval);

  // Earnings calculations
  const todayEarn = calculateSalaryBreakdown(todayRecs, settings).totalEarnings;
  const weekEarn = calculateSalaryBreakdown(weekRecs, settings).totalEarnings;
  const fortnightEarn = calculateSalaryBreakdown(fortnightRecs, settings).totalEarnings;
  const monthEarn = calculateSalaryBreakdown(monthRecs, settings).totalEarnings;

  const cardsData = [
    {
      title: 'Hoy',
      hours: todaySum.currentHours,
      earnings: todayEarn,
      changePct: todaySum.changePercentage,
      isIncrease: todaySum.isIncrease,
      icon: Clock,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-400',
    },
    {
      title: 'Semana',
      hours: weekSum.currentHours,
      earnings: weekEarn,
      changePct: weekSum.changePercentage,
      isIncrease: weekSum.isIncrease,
      icon: Calendar,
      color: 'from-teal-500/10 to-emerald-500/10 text-emerald-400',
    },
    {
      title: 'Quincena',
      hours: fortnightSum.currentHours,
      earnings: fortnightEarn,
      changePct: fortnightSum.changePercentage,
      isIncrease: fortnightSum.isIncrease,
      icon: Layers,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-400',
    },
    {
      title: 'Este Mes',
      hours: monthSum.currentHours,
      earnings: monthEarn,
      changePct: monthSum.changePercentage,
      isIncrease: monthSum.isIncrease,
      icon: CalendarDays,
      color: 'from-indigo-500/10 to-purple-500/10 text-indigo-400',
    },
    {
      title: 'Estimado Cobro',
      isCobroCard: true,
      earnings: monthEarn,
      hours: monthSum.currentHours,
      icon: Wallet,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cardsData.map((c, index) => {
        const Icon = c.icon;
        if (c.isCobroCard) {
          return (
            <motion.div
              key="cobro-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card
                hoverEffect
                className="relative overflow-hidden group bg-gradient-to-br from-indigo-50 via-white to-white dark:from-indigo-950/60 dark:via-zinc-900 dark:to-zinc-900 border-indigo-200 dark:border-indigo-500/30 cursor-pointer"
                onClick={openRateModal}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1 block">
                      Estimado Cobro Mes
                    </span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-emerald-400 tracking-tight">
                        {formatCurrency(c.earnings || 0, currencySymbol)}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">
                    {settings.rateNormal > 0 ? `${currencySymbol}${settings.rateNormal}/h base` : 'Sin precio cargado'}
                  </span>
                  <span className="text-indigo-400 hover:underline font-semibold text-[10px]">
                    {settings.rateNormal > 0 ? 'Editar' : 'Cargar precio'}
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card hoverEffect className="relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1 block">
                    {c.title}
                  </span>
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                      {c.hours}h
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                      {formatCurrency(c.earnings || 0, currencySymbol)}
                    </span>
                  </div>
                </div>

                <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${c.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Progress/Trend bar */}
              <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-zinc-500">
                {c.isIncrease ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +{c.changePct}% vs ant.
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" /> -{c.changePct}% vs ant.
                  </span>
                )}
                <span className="text-zinc-500 truncate">
                  {settings.rateNormal > 0 ? `${currencySymbol}${settings.rateNormal}/h` : 'Configurar'}
                </span>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
