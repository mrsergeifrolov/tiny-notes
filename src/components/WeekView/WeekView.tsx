import { useState, useCallback, useEffect } from 'react';
import { addDays, startOfWeek, differenceInWeeks, parseISO } from 'date-fns';
import { DayColumn } from '../DayColumn/DayColumn';
import { CalendarPicker } from '../CalendarPicker/CalendarPicker';
import { SyncIndicator, type SyncStatus } from '../SyncIndicator/SyncIndicator';
import { getToday, getWeekDates, formatDateNumeric, formatWeekRange } from '../../utils/date';
import type { Task, TaskArea } from '../../types';
import styles from './WeekView.module.css';

interface WeekViewProps {
  getTasksByDate: (date: string) => Task[];
  onOpenCreateDialog: (area: TaskArea, date?: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onMoveToTomorrow: (id: string) => void;
  onMoveByDays: (id: string, days: number) => void;
  onFinishDay: (date: string) => void;
  onDeleteTask: (id: string) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  weekLoading: boolean;
  onLoadWeek: (weekOffset: number) => Promise<void>;
  syncStatus: SyncStatus;
}

export function WeekView({
  getTasksByDate,
  onOpenCreateDialog,
  onEditTask,
  onToggleComplete,
  onMoveToTomorrow,
  onMoveByDays,
  onFinishDay,
  onDeleteTask,
  selectedDate,
  setSelectedDate,
  weekLoading,
  onLoadWeek,
  syncStatus,
}: WeekViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const today = getToday();

  // Get dates for current week view (Mon-Sun)
  const baseDate = addDays(new Date(), weekOffset * 7);
  const dates = getWeekDates(baseDate);

  // Load week data when offset changes
  useEffect(() => {
    onLoadWeek(weekOffset);
  }, [weekOffset, onLoadWeek]);

  const goToToday = useCallback(() => {
    setWeekOffset(0);
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1);
  }, []);

  const handleCalendarDateSelect = useCallback((dateStr: string) => {
    const selected = parseISO(dateStr);
    const todayDate = new Date();
    const weekStart = startOfWeek(todayDate, { weekStartsOn: 1 });
    const selectedWeekStart = startOfWeek(selected, { weekStartsOn: 1 });
    const weekDiff = differenceInWeeks(selectedWeekStart, weekStart);

    setWeekOffset(weekDiff);
    setShowCalendar(false);
  }, []);

  return (
    <div className={styles.weekView}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.calendarButton}
            onClick={() => setShowCalendar(true)}
            title="Выбрать дату"
          >
            📅
          </button>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.navigationRow}>
            <button
              className={styles.navButton}
              onClick={() => navigateWeek('prev')}
              title="Предыдущая неделя"
            >
              ←
            </button>
            <button className={styles.todayButton} onClick={goToToday}>
              Сегодня ({formatDateNumeric(new Date())})
            </button>
            <button
              className={styles.navButton}
              onClick={() => navigateWeek('next')}
              title="Следующая неделя"
            >
              →
            </button>
          </div>
          <div className={styles.weekRange}>
            {formatWeekRange(dates)}
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.addButton}
            onClick={() => onOpenCreateDialog('inbox')}
            title="Создать задачу (N)"
          >
            +
          </button>
          <SyncIndicator status={syncStatus} />
        </div>
      </div>

      {showCalendar && (
        <CalendarPicker
          selectedDate={today}
          onDateSelect={handleCalendarDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      )}

      <div className={`${styles.daysContainer} ${weekLoading ? styles.fading : ''}`}>
        {dates.map(date => (
          <DayColumn
            key={date}
            date={date}
            tasks={getTasksByDate(date)}
            isToday={date === today}
            isSelected={date === selectedDate}
            onEditTask={onEditTask}
            onToggleComplete={onToggleComplete}
            onMoveToTomorrow={onMoveToTomorrow}
            onMoveByDays={onMoveByDays}
            onFinishDay={() => onFinishDay(date)}
            onDeleteTask={onDeleteTask}
            onClick={() => setSelectedDate(date)}
          />
        ))}
      </div>
    </div>
  );
}
