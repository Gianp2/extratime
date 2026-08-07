import { ExtraHourRecord, UserSettings, PeriodSummary } from '../types';
import {
  getTodayString,
  getWeekInterval,
  getPreviousWeekInterval,
  getFortnightInterval,
  getPreviousFortnightInterval,
  getMonthInterval,
  getPreviousMonthInterval,
  getYearInterval,
  getPreviousYearInterval,
  isDateInInterval,
} from './dateUtils';

export function calculateTotalHours(records: ExtraHourRecord[]): number {
  return records.reduce((acc, r) => acc + (r.hours || 0), 0);
}

export function filterRecordsByInterval(records: ExtraHourRecord[], interval: { start: Date; end: Date }): ExtraHourRecord[] {
  return records.filter((r) => isDateInInterval(r.date, interval));
}

export function getTodayHoursSummary(records: ExtraHourRecord[]): PeriodSummary {
  const todayStr = getTodayString();
  const currentHours = records.filter((r) => r.date === todayStr).reduce((acc, r) => acc + r.hours, 0);
  
  // Yesterday for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const previousHours = records.filter((r) => r.date === yesterdayStr).reduce((acc, r) => acc + r.hours, 0);

  const diff = currentHours - previousHours;
  const changePercentage = previousHours === 0 ? (currentHours > 0 ? 100 : 0) : Math.round((diff / previousHours) * 100);

  return {
    currentHours,
    previousHours,
    changePercentage: Math.abs(changePercentage),
    isIncrease: diff >= 0,
  };
}

export function getWeekHoursSummary(records: ExtraHourRecord[]): PeriodSummary {
  const currentInterval = getWeekInterval();
  const previousInterval = getPreviousWeekInterval();

  const currentHours = calculateTotalHours(filterRecordsByInterval(records, currentInterval));
  const previousHours = calculateTotalHours(filterRecordsByInterval(records, previousInterval));

  const diff = currentHours - previousHours;
  const changePercentage = previousHours === 0 ? (currentHours > 0 ? 100 : 0) : Math.round((diff / previousHours) * 100);

  return {
    currentHours,
    previousHours,
    changePercentage: Math.abs(changePercentage),
    isIncrease: diff >= 0,
  };
}

export function getFortnightHoursSummary(records: ExtraHourRecord[]): PeriodSummary {
  const { q1, q2, isCurrentQ1 } = getFortnightInterval();
  const currentInterval = isCurrentQ1 ? q1 : q2;
  const previousInterval = getPreviousFortnightInterval();

  const currentHours = calculateTotalHours(filterRecordsByInterval(records, currentInterval));
  const previousHours = calculateTotalHours(filterRecordsByInterval(records, previousInterval));

  const diff = currentHours - previousHours;
  const changePercentage = previousHours === 0 ? (currentHours > 0 ? 100 : 0) : Math.round((diff / previousHours) * 100);

  return {
    currentHours,
    previousHours,
    changePercentage: Math.abs(changePercentage),
    isIncrease: diff >= 0,
  };
}

export function getMonthHoursSummary(records: ExtraHourRecord[]): PeriodSummary {
  const currentInterval = getMonthInterval();
  const previousInterval = getPreviousMonthInterval();

  const currentHours = calculateTotalHours(filterRecordsByInterval(records, currentInterval));
  const previousHours = calculateTotalHours(filterRecordsByInterval(records, previousInterval));

  const diff = currentHours - previousHours;
  const changePercentage = previousHours === 0 ? (currentHours > 0 ? 100 : 0) : Math.round((diff / previousHours) * 100);

  return {
    currentHours,
    previousHours,
    changePercentage: Math.abs(changePercentage),
    isIncrease: diff >= 0,
  };
}

export function getYearHoursSummary(records: ExtraHourRecord[]): PeriodSummary {
  const currentInterval = getYearInterval();
  const previousInterval = getPreviousYearInterval();

  const currentHours = calculateTotalHours(filterRecordsByInterval(records, currentInterval));
  const previousHours = calculateTotalHours(filterRecordsByInterval(records, previousInterval));

  const diff = currentHours - previousHours;
  const changePercentage = previousHours === 0 ? (currentHours > 0 ? 100 : 0) : Math.round((diff / previousHours) * 100);

  return {
    currentHours,
    previousHours,
    changePercentage: Math.abs(changePercentage),
    isIncrease: diff >= 0,
  };
}

export interface CalendarDayColor {
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeBg: string;
  categoryLabel: string;
}

export function getDayColorConfig(hours: number): CalendarDayColor {
  if (hours <= 0) {
    return {
      bgClass: 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-400',
      textClass: 'text-zinc-700 dark:text-zinc-400',
      borderClass: 'border-zinc-200 dark:border-zinc-800',
      badgeBg: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400',
      categoryLabel: 'Sin horas',
    };
  } else if (hours <= 2) {
    return {
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
      textClass: 'text-emerald-700 dark:text-emerald-300 font-semibold',
      borderClass: 'border-emerald-300 dark:border-emerald-800',
      badgeBg: 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
      categoryLabel: '1-2 hrs (Verde)',
    };
  } else if (hours <= 4) {
    return {
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
      textClass: 'text-amber-700 dark:text-amber-300 font-semibold',
      borderClass: 'border-amber-300 dark:border-amber-800',
      badgeBg: 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
      categoryLabel: '3-4 hrs (Amarillo)',
    };
  } else if (hours <= 6) {
    return {
      bgClass: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300',
      textClass: 'text-orange-700 dark:text-orange-300 font-semibold',
      borderClass: 'border-orange-300 dark:border-orange-800',
      badgeBg: 'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      categoryLabel: '5-6 hrs (Naranja)',
    };
  } else {
    return {
      bgClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
      textClass: 'text-rose-700 dark:text-rose-300 font-semibold',
      borderClass: 'border-rose-300 dark:border-rose-800',
      badgeBg: 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200',
      categoryLabel: '>6 hrs (Rojo)',
    };
  }
}

export interface SalaryBreakdown {
  hoursNormal: number;
  hours50: number;
  hours100: number;
  hoursNocturna: number;
  hoursFeriado: number;

  valNormal: number;
  val50: number;
  val100: number;
  valNocturna: number;
  valFeriado: number;

  totalNormal: number;
  total50: number;
  total100: number;
  totalNocturna: number;
  totalFeriado: number;

  totalEarnings: number;
}

export function calculateSalaryBreakdown(records: ExtraHourRecord[], settings: Partial<UserSettings>): SalaryBreakdown {
  const rateNormal = settings.rateNormal || 0;
  const rate50 = settings.rate50 || rateNormal * 1.5;
  const rate100 = settings.rate100 || rateNormal * 2.0;
  const rateNocturna = settings.rateNocturna || rateNormal * 1.35;
  const rateFeriado = settings.rateFeriado || rateNormal * 2.5;

  let hoursNormal = 0;
  let hours50 = 0;
  let hours100 = 0;
  let hoursNocturna = 0;
  let hoursFeriado = 0;

  records.forEach((r) => {
    const h = r.hours || 0;
    switch (r.hourType) {
      case 'normal':
        hoursNormal += h;
        break;
      case '50%':
        hours50 += h;
        break;
      case '100%':
        hours100 += h;
        break;
      case 'nocturna':
        hoursNocturna += h;
        break;
      case 'feriado':
        hoursFeriado += h;
        break;
    }
  });

  const totalNormal = hoursNormal * rateNormal;
  const total50 = hours50 * rate50;
  const total100 = hours100 * rate100;
  const totalNocturna = hoursNocturna * rateNocturna;
  const totalFeriado = hoursFeriado * rateFeriado;

  const totalEarnings = totalNormal + total50 + total100 + totalNocturna + totalFeriado;

  return {
    hoursNormal,
    hours50,
    hours100,
    hoursNocturna,
    hoursFeriado,

    valNormal: rateNormal,
    val50: rate50,
    val100: rate100,
    valNocturna: rateNocturna,
    valFeriado: rateFeriado,

    totalNormal,
    total50,
    total100,
    totalNocturna,
    totalFeriado,

    totalEarnings,
  };
}
