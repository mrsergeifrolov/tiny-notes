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

// New formatting functions

/** Format date as "16 января 2026" */
export function formatDateWithMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy', { locale: ru });
}

/** Format date as "16.01.2026" */
export function formatDateNumeric(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd.MM.yyyy');
}

/** Get 2-letter day abbreviation: пн, вт, ср, чт, пт, сб, вс */
export function getDayAbbreviation(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const dayIndex = d.getDay(); // 0 = Sunday
  const abbreviations = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  return abbreviations[dayIndex];
}

/** Add minutes to time string, returns "HH:mm" */
export function addMinutesToTime(time: string, minutes: number): string {
  const parsed = parseTime(time);
  const totalMinutes = parsed.hours * 60 + parsed.minutes + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

/** Calculate duration in minutes between two times */
export function getDurationMinutes(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const startMinutes = start.hours * 60 + start.minutes;
  let endMinutes = end.hours * 60 + end.minutes;
  // Handle crossing midnight
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  return endMinutes - startMinutes;
}

/** Snap time to nearest interval (in minutes) */
export function snapTimeToInterval(time: string, intervalMinutes: number): string {
  const parsed = parseTime(time);
  const totalMinutes = parsed.hours * 60 + parsed.minutes;
  const snapped = Math.round(totalMinutes / intervalMinutes) * intervalMinutes;
  const newHours = Math.floor(snapped / 60) % 24;
  const newMinutes = snapped % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

/** Convert time string to minutes from midnight */
export function timeToMinutes(time: string): number {
  const parsed = parseTime(time);
  return parsed.hours * 60 + parsed.minutes;
}

/** Convert minutes from midnight to time string */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
