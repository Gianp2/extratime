import React from 'react';
import { Target, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';
import { getMonthHoursSummary } from '../../utils/calculations';
import { useNavigate } from 'react-router-dom';

export const GoalProgressCard: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);
  const settings = useExtraHoursStore((s) => s.settings);
  const navigate = useNavigate();

  const monthSummary = getMonthHoursSummary(records);
  const currentMonthHours = monthSummary.currentHours;
  const targetGoal = settings.monthlyGoalHours || 20;

  const percentage = Math.min(100, Math.round((currentMonthHours / targetGoal) * 100));
  const remainingHours = Math.max(0, targetGoal - currentMonthHours);

  return (
    <Card className="bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-white border border-indigo-100 dark:border-zinc-800/80 p-6 shadow-xs relative overflow-hidden transition-all">
      {/* Background ambient glow effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between relative z-10 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-amber-500/15 text-indigo-700 dark:text-amber-400 font-bold shrink-0">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Objetivo de Horas Mensual
            </span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {currentMonthHours} <span className="text-base font-semibold text-zinc-500 dark:text-zinc-400">/ {targetGoal} hrs</span>
            </h3>
          </div>
        </div>

        {percentage >= 100 ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-xs font-bold shrink-0">
            <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>¡Meta Cumplida!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Faltan {remainingHours}h</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-5 space-y-2 relative z-10">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-zinc-600 dark:text-zinc-400">Progreso mensual</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">{percentage}%</span>
        </div>

        <div className="w-full h-3.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300/50 dark:border-zinc-700/50 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              percentage >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500 dark:from-blue-500 dark:via-indigo-500 dark:to-violet-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 relative z-10">
        <p className="hidden sm:block">Configura tu objetivo mensual según tu contrato o meta personal.</p>
        <p className="sm:hidden">Ajusta tu meta mensual</p>
        <button
          type="button"
          onClick={() => navigate('/configuracion')}
          className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors ml-auto sm:ml-0"
        >
          <span>Ajustar meta</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};
