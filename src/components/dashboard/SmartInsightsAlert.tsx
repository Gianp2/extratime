import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, X, DollarSign, Target } from 'lucide-react';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';
import { getMonthHoursSummary, calculateSalaryBreakdown, filterRecordsByInterval } from '../../utils/calculations';
import { getMonthInterval } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const SmartInsightsAlert: React.FC = () => {
  const navigate = useNavigate();
  const records = useExtraHoursStore((s) => s.records);
  const settings = useExtraHoursStore((s) => s.settings);
  const openRateModal = useExtraHoursStore((s) => s.openRateModal);
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);
  
  const [dismissed, setDismissedState] = useState(() => {
    return sessionStorage.getItem('dismissed_monthly_summary') === 'true';
  });

  const setDismissed = (val: boolean) => {
    if (val) {
      sessionStorage.setItem('dismissed_monthly_summary', 'true');
    } else {
      sessionStorage.removeItem('dismissed_monthly_summary');
    }
    setDismissedState(val);
  };

  if (dismissed) return null;

  const monthSum = getMonthHoursSummary(records);
  const monthGoal = settings.monthlyGoalHours || 30;
  const goalPct = Math.round((monthSum.currentHours / monthGoal) * 100);

  const monthInterval = getMonthInterval();
  const monthRecords = filterRecordsByInterval(records, monthInterval);
  const monthEarn = calculateSalaryBreakdown(monthRecords, settings).totalEarnings;
  const currencySymbol = settings.currency || '$';

  // Determine what type of alert to present:
  // 1. Missing rate alert
  if (settings.rateNormal <= 0) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-xs relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
              Tarifa por Hora sin Configurar
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              Configura el valor de tu hora normal para que ExtraTime calcule automáticamente cuánto cobrarás por tus horas extras.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={openRateModal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            Configurar Tarifa
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-amber-700/60 dark:text-amber-400/60 hover:text-amber-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Goal achieved or near goal alert
  if (goalPct >= 100) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              🎉 ¡Objetivo Mensual Cumplido! ({goalPct}%)
            </h4>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              Alcanzaste {monthSum.currentHours} hrs acumuladas este mes con un total estimado de{' '}
              <span className="font-bold">{formatCurrency(monthEarn, currencySymbol)}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => navigate('/estadisticas')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
          >
            Ver Análisis <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-emerald-700/60 dark:text-emerald-400/60 hover:text-emerald-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Regular motivation alert
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-800/60 text-zinc-900 dark:text-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5 sm:mt-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Resumen de Avance Mensual
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
              {goalPct}% de la meta
            </span>
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Llevas <span className="font-bold text-zinc-900 dark:text-white">{monthSum.currentHours} hrs</span> de {monthGoal} hrs estimadas.
            {monthEarn > 0 && (
              <> Llevas generado un cobro aprox. de <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(monthEarn, currencySymbol)}</span>.</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={() => openDayModal(new Date().toISOString().split('T')[0])}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
        >
          Anotar Horas
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
