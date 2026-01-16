import { useState, useCallback } from 'react';
import { addDays } from 'date-fns';
import { DayColumn } from '../DayColumn/DayColumn';
import { getToday, getWeekDates, formatDateNumeric } from '../../utils/date';
import type { Task } from '../../types';
import styles from './WeekView.module.css';

interface WeekViewProps {
  getTasksByDate: (date: string) => Task[];
  onQuickCreateTask: (date: string, title?: string, description?: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onMoveToTomorrow: (id: string) => void;
  onMoveByDays: (id: string, days: number) => void;
  onFinishDay: (date: string) => void;
  onDeleteTask: (id: string) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}

export function WeekView({
  getTasksByDate,
  onQuickCreateTask,
  onEditTask,
  onToggleComplete,
  onMoveToTomorrow,
  onMoveByDays,
  onFinishDay,
  onDeleteTask,
  selectedDate,
  setSelectedDate,
}: WeekViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = getToday();

  // Get dates for current week view (Mon-Sun)
  const baseDate = addDays(new Date(), weekOffset * 7);
  const dates = getWeekDates(baseDate);

  const goToToday = useCallback(() => {
    setWeekOffset(0);
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1);
  }, []);

  return (
    <div className={styles.weekView}>
      <div className={styles.header}>
        <button
          className={styles.navButton}
          onClick={() => navigateWeek('prev')}
          title="Предыдущая неделя"
        >
          ←
        </button>
        <button
          className={styles.todayButton}
          onClick={goToToday}
        >
          {formatDateNumeric(new Date())}
        </button>
        <button
          className={styles.navButton}
          onClick={() => navigateWeek('next')}
          title="Следующая неделя"
        >
          →
        </button>
      </div>

      <div className={styles.daysContainer}>
        {dates.map(date => (
          <DayColumn
            key={date}
            date={date}
            tasks={getTasksByDate(date)}
            isToday={date === today}
            isSelected={date === selectedDate}
            onQuickCreateTask={(title, description) => onQuickCreateTask(date, title, description)}
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
