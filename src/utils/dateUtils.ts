import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
  isWithinInterval,
  getDaysInMonth,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDateSpanish(dateStr: string, formatPattern: string = "d 'de' MMMM, yyyy"): string {
  try {
    const date = parseISO(dateStr);
    return format(date, formatPattern, { locale: es });
  } catch {
    return dateStr;
  }
}

export function getDayNameSpanish(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'EEEE', { locale: es });
  } catch {
    return '';
  }
}

export interface DateRange {
  start: Date;
  end: Date;
}

export function getTodayInterval(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { start, end };
}

export function getWeekInterval(date: Date = new Date(), weekStartsOnMonday = true): DateRange {
  return {
    start: startOfWeek(date, { weekStartsOn: weekStartsOnMonday ? 1 : 0 }),
    end: endOfWeek(date, { weekStartsOn: weekStartsOnMonday ? 1 : 0 }),
  };
}

export function getPreviousWeekInterval(date: Date = new Date(), weekStartsOnMonday = true): DateRange {
  const prevWeekDate = subWeeks(date, 1);
  return getWeekInterval(prevWeekDate, weekStartsOnMonday);
}

export function getFortnightInterval(date: Date = new Date()): { q1: DateRange; q2: DateRange; isCurrentQ1: boolean } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const q1Start = new Date(year, month, 1, 0, 0, 0);
  const q1End = new Date(year, month, 15, 23, 59, 59);

  const totalDays = getDaysInMonth(date);
  const q2Start = new Date(year, month, 16, 0, 0, 0);
  const q2End = new Date(year, month, totalDays, 23, 59, 59);

  return {
    q1: { start: q1Start, end: q1End },
    q2: { start: q2Start, end: q2End },
    isCurrentQ1: day <= 15,
  };
}

export function getPreviousFortnightInterval(date: Date = new Date()): DateRange {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (day <= 15) {
    // Previous fortnight is Q2 of previous month
    const prevMonthDate = subMonths(date, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();
    const totalDays = getDaysInMonth(prevMonthDate);
    return {
      start: new Date(prevYear, prevMonth, 16, 0, 0, 0),
      end: new Date(prevYear, prevMonth, totalDays, 23, 59, 59),
    };
  } else {
    // Previous fortnight is Q1 of current month
    return {
      start: new Date(year, month, 1, 0, 0, 0),
      end: new Date(year, month, 15, 23, 59, 59),
    };
  }
}

export function getMonthInterval(date: Date = new Date()): DateRange {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getPreviousMonthInterval(date: Date = new Date()): DateRange {
  const prevMonth = subMonths(date, 1);
  return getMonthInterval(prevMonth);
}

export function getYearInterval(date: Date = new Date()): DateRange {
  return {
    start: startOfYear(date),
    end: endOfYear(date),
  };
}

export function getPreviousYearInterval(date: Date = new Date()): DateRange {
  const prevYear = subYears(date, 1);
  return getYearInterval(prevYear);
}

export function isDateInInterval(dateStr: string, interval: DateRange): boolean {
  try {
    const d = parseISO(dateStr);
    return isWithinInterval(d, interval);
  } catch {
    return false;
  }
}

export function getAllDaysInMonth(year: number, monthZeroIndexed: number): Date[] {
  const start = new Date(year, monthZeroIndexed, 1);
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
}

export function getMonthNamesSpanish(): string[] {
  return [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
}
