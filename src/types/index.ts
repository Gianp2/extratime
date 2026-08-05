export type HourType = 'normal' | '50%' | '100%' | 'nocturna' | 'feriado';

export interface ExtraHourRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  entryTime?: string; // HH:mm
  exitTime?: string; // HH:mm
  hourType: HourType;
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface UserSettings {
  userId: string;
  rateNormal: number;
  rate50: number; // Multiplier or rate per hour
  rate100: number;
  rateNocturna: number;
  rateFeriado: number;
  normalWorkdayHours: number;
  monthlyGoalHours: number;
  firstWorkday: 'monday' | 'sunday';
  currency: string; // e.g., "$", "€", "S/", etc.
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  timeFormat: '12h' | '24h';
  updatedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface PeriodSummary {
  currentHours: number;
  previousHours: number;
  changePercentage: number;
  isIncrease: boolean;
}

export interface FortnightData {
  month: string;
  q1Hours: number;
  q2Hours: number;
  totalMonth: number;
  diff: number;
}

export interface WeeklyData {
  weekLabel: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalHours: number;
  dailyAverage: number;
  daysWorkedCount: number;
}

export interface MonthlyStats {
  monthKey: string; // YYYY-MM
  monthName: string;
  totalHours: number;
  dailyAverage: number;
  daysWorked: number;
  daysTotal: number;
  maxDay: { date: string; hours: number } | null;
  minDay: { date: string; hours: number } | null;
  q1Hours: number;
  q2Hours: number;
}
