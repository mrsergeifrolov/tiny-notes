import { format, addDays, subDays, startOfWeek, isToday, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const DATE_FORMAT = 'yyyy-MM-dd';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, DATE_FORMAT);
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMM', { locale: ru });
}

export function formatDayName(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE', { locale: ru });
}

export function formatFullDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy', { locale: ru });
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getTomorrow(): string {
  return formatDate(addDays(new Date(), 1));
}

export function addDaysToDate(date: string, days: number): string {
  return formatDate(addDays(parseISO(date), days));
}

export function subtractDaysFromDate(date: string, days: number): string {
  return formatDate(subDays(parseISO(date), days));
}

export function getWeekDates(centerDate: Date = new Date()): string[] {
  const start = startOfWeek(centerDate, { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }, (_, i) => formatDate(addDays(start, i)));
}

export function getDateRange(startDate: Date, count: number): string[] {
  return Array.from({ length: count }, (_, i) => formatDate(addDays(startDate, i)));
}

export function isTodayDate(date: string): boolean {
  return isToday(parseISO(date));
}

export function isSameDate(date1: string, date2: string): boolean {
  return isSameDay(parseISO(date1), parseISO(date2));
}

export function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

export function compareTime(a: string, b: string): number {
  const timeA = parseTime(a);
  const timeB = parseTime(b);
  if (timeA.hours !== timeB.hours) {
    return timeA.hours - timeB.hours;
  }
  return timeA.minutes - timeB.minutes;
}
