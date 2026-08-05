import React from 'react';
import { Target, Trophy, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
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

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-800 p-6 shadow-md relative overflow-hidden">
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-amber-300">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Objetivo de Horas Mensual
            </span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            {currentMonthHours} / {targetGoal} hrs
          </h3>
        </div>

        {percentage >= 100 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5" /> ¡Meta Alcanzada!
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-5 space-y-2 relative z-10">
        <div className="flex justify-between text-xs text-zinc-300 font-medium">
          <span>Progreso de cumplimiento</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-700/60 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-700/50 flex items-center justify-between text-xs text-zinc-400 relative z-10">
        <p>Configura tu meta mensual en los ajustes.</p>
        <button
          onClick={() => navigate('/configuracion')}
          className="inline-flex items-center gap-1 text-zinc-200 hover:text-white font-medium transition-colors"
        >
          <span>Editar meta</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};
