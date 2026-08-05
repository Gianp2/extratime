import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { ExtraHourRecord } from '../../types';
import { formatDateSpanish } from '../../utils/dateUtils';
import { getHourTypeBadgeProps, formatCurrency } from '../../utils/formatters';
import { calculateSalaryBreakdown } from '../../utils/calculations';
import { Clock, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';
import { Button } from '../ui/Button';

interface RecentActivityProps {
  records: ExtraHourRecord[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ records }) => {
  const navigate = useNavigate();
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);
  const settings = useExtraHoursStore((s) => s.settings);

  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  const recentList = sortedRecords.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Actividad Reciente</span>
        </CardTitle>
        <button
          onClick={() => navigate('/historial')}
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Ver todo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </CardHeader>

      {recentList.length === 0 ? (
        <div className="text-center py-8 text-xs text-zinc-400 space-y-3">
          <p>No hay registros de horas extras aún.</p>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => openDayModal(new Date().toISOString().split('T')[0])}
          >
            Registrar Horas Extras
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentList.map((r) => {
            const badgeProps = getHourTypeBadgeProps(r.hourType);
            const earn = calculateSalaryBreakdown([r], settings).totalEarnings;
            const currency = settings.currency || '$';

            return (
              <div
                key={r.id}
                onClick={() => openDayModal(r.date, r)}
                className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {r.hours} hrs
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badgeProps.bgClass} ${badgeProps.textClass}`}>
                      {badgeProps.label}
                    </span>
                    {r.entryTime && r.exitTime && (
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {r.entryTime} - {r.exitTime}
                      </span>
                    )}
                    {earn > 0 && (
                      <span className="text-xs font-semibold text-emerald-400 ml-auto mr-1">
                        +{formatCurrency(earn, currency)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                    {formatDateSpanish(r.date, "dd 'de' MMMM, yyyy")}
                    {r.notes ? ` • ${r.notes}` : ''}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

