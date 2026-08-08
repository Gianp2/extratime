import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { ExtraHourRecord } from '../../types';
import { getDayColorConfig } from '../../utils/calculations';
import { getMonthNamesSpanish } from '../../utils/dateUtils';
import { Button } from '../ui/Button';

interface MonthCalendarProps {
  records: ExtraHourRecord[];
  onSelectDate: (dateStr: string, recordToEdit?: ExtraHourRecord) => void;
  onAddClick?: (dateStr?: string) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ records, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = getMonthNamesSpanish();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build grid of days
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Day of week offset (0 = Mon, 6 = Sun)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group records by YYYY-MM-DD
  const recordsByDate = records.reduce((acc: Record<string, ExtraHourRecord[]>, r) => {
    acc[r.date] = acc[r.date] ? [...acc[r.date], r] : [r];
    return acc;
  }, {});

  const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
      {/* Calendar Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Haz clic en cualquier día para registrar o ver horas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoy
          </Button>
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden p-0.5 bg-zinc-50 dark:bg-zinc-950">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <span className="font-semibold text-zinc-500">Nivel de horas:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <span>Sin horas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <span>1-2h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span>3-4h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-400" />
          <span>5-6h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>&gt;6h</span>
        </div>
      </div>

      {/* Days Grid Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-zinc-500 dark:text-zinc-400 mb-2">
        {dayHeaders.map((dh) => (
          <div key={dh} className="py-2">
            {dh}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty cells for starting offset */}
        {Array.from({ length: startDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-20 sm:h-28 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/30 opacity-40 border border-transparent" />
        ))}

        {daysArray.map((d) => {
          const formattedDay = String(d).padStart(2, '0');
          const formattedMonth = String(month + 1).padStart(2, '0');
          const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

          const dayRecords = recordsByDate[dateStr] || [];
          const totalHours = dayRecords.reduce((acc, r) => acc + (r.hours || 0), 0);

          const colorCfg = getDayColorConfig(totalHours);
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <motion.div
              key={dateStr}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectDate(dateStr, dayRecords[0])}
              className={`h-20 sm:h-28 p-1 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                colorCfg.bgClass
              } ${colorCfg.borderClass} ${isToday ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 shadow-md' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs sm:text-sm ${isToday ? 'font-bold underline' : 'font-medium'}`}>
                  {d}
                </span>
                {totalHours > 0 && (
                  <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-bold ${colorCfg.badgeBg}`}>
                    {totalHours}h
                  </span>
                )}
              </div>

              {dayRecords.length > 0 ? (
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayRecords.slice(0, 2).map((rec) => (
                    <div
                      key={rec.id}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 truncate"
                    >
                      <span className="font-semibold">{rec.hourType}</span>
                      {rec.notes && <span className="opacity-75"> - {rec.notes}</span>}
                    </div>
                  ))}
                  {dayRecords.length > 2 && (
                    <span className="text-[9px] font-semibold opacity-75">+ {dayRecords.length - 2} más</span>
                  )}
                </div>
              ) : (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-full">
                  <Plus className="w-4 h-4 text-zinc-400" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
