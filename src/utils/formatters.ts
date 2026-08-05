import { HourType } from '../types';

export function formatCurrency(amount: number, symbol: string = '$'): string {
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${symbol} ${formatted}`;
}

export function formatNumber(num: number, decimals: number = 1): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function getHourTypeBadgeProps(type: HourType): { label: string; bgClass: string; textClass: string } {
  switch (type) {
    case 'normal':
      return {
        label: 'Normal',
        bgClass: 'bg-blue-100 dark:bg-blue-950/60',
        textClass: 'text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      };
    case '50%':
      return {
        label: '50%',
        bgClass: 'bg-teal-100 dark:bg-teal-950/60',
        textClass: 'text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900',
      };
    case '100%':
      return {
        label: '100%',
        bgClass: 'bg-indigo-100 dark:bg-indigo-950/60',
        textClass: 'text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
      };
    case 'nocturna':
      return {
        label: 'Nocturna',
        bgClass: 'bg-purple-100 dark:bg-purple-950/60',
        textClass: 'text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      };
    case 'feriado':
      return {
        label: 'Feriado',
        bgClass: 'bg-rose-100 dark:bg-rose-950/60',
        textClass: 'text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      };
    default:
      return {
        label: type,
        bgClass: 'bg-zinc-100 dark:bg-zinc-800',
        textClass: 'text-zinc-700 dark:text-zinc-300',
      };
  }
}
