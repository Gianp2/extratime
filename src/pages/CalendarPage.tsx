import React from 'react';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { MonthCalendar } from '../components/calendar/MonthCalendar';

export const CalendarPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);

  const handleSelectDate = (dateStr: string, recordToEdit?: any) => {
    openDayModal(dateStr, recordToEdit);
  };

  return (
    <div className="space-y-6">
      <MonthCalendar records={records} onSelectDate={handleSelectDate} />
    </div>
  );
};
