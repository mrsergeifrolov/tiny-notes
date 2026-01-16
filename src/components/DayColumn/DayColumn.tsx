import { useState, useCallback, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from '../TaskCard/TaskCard';
import { TimeGrid, HOUR_HEIGHT, START_HOUR, END_HOUR } from '../TimeGrid/TimeGrid';
import { QuickInput } from '../QuickInput/QuickInput';
import { getDayAbbreviation, formatDateWithMonthYear } from '../../utils/date';
import type { Task } from '../../types';
import styles from './DayColumn.module.css';

interface DayColumnProps {
  date: string;
  tasks: Task[];
  isToday: boolean;
  isSelected: boolean;
  onCreateTask: (title?: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onMoveToTomorrow: (id: string) => void;
  onMoveByDays: (id: string, days: number) => void;
  onFinishDay: () => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskTime?: (id: string, time: string, endTime: string) => void;
  onClick: () => void;
}

export function DayColumn({
  date,
  tasks,
  isToday,
  isSelected,
  onCreateTask,
  onEditTask,
  onToggleComplete,
  onMoveToTomorrow,
  onMoveByDays,
  onFinishDay,
  onDeleteTask,
  onUpdateTaskTime,
  onClick,
}: DayColumnProps) {
  const [showQuickInput, setShowQuickInput] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date}`,
  });

  const dayAbbrev = getDayAbbreviation(date);
  const fullDate = formatDateWithMonthYear(date);

  const handleQuickCreate = useCallback((title: string) => {
    onCreateTask(title);
    setShowQuickInput(false);
  }, [onCreateTask]);

  // Split tasks into timed and untimed
  const { timedTasks, untimedTasks } = useMemo(() => {
    const timed: Task[] = [];
    const untimed: Task[] = [];

    for (const task of tasks) {
      if (task.time) {
        timed.push(task);
      } else {
        untimed.push(task);
      }
    }

    return { timedTasks: timed, untimedTasks: untimed };
  }, [tasks]);

  const incompleteTasks = tasks.filter(t => !t.completed);
  const showFinishButton = isToday && incompleteTasks.length > 0;

  // Calculate time grid height
  const totalHours = END_HOUR - START_HOUR;
  const timeGridHeight = totalHours * HOUR_HEIGHT;

  return (
    <div
      ref={setNodeRef}
      className={`${styles.dayColumn} ${isToday ? styles.isToday : ''} ${isSelected ? styles.isSelected : ''} ${isOver ? styles.isOver : ''}`}
      data-date={date}
    >
      <div className={styles.header} onClick={onClick}>
        <div className={styles.headerTop}>
          <span className={styles.dayName}>{dayAbbrev}</span>
          {showFinishButton && (
            <button
              className={styles.finishButton}
              onClick={(e) => {
                e.stopPropagation();
                onFinishDay();
              }}
              title="Перенести незавершённые на завтра"
            >
              ✓
            </button>
          )}
        </div>
        <span className={styles.fullDate}>{fullDate}</span>
      </div>

      <div className={styles.content}>
        {/* Timed tasks zone - 70% */}
        <div className={styles.timedZone}>
          <div
            className={styles.timeGridContainer}
            style={{ height: timeGridHeight }}
          >
            <TimeGrid />
            <div className={styles.timedTasks}>
              {timedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isTimedTask
                  hourHeight={HOUR_HEIGHT}
                  startHour={START_HOUR}
                  onEdit={() => onEditTask(task)}
                  onToggleComplete={() => onToggleComplete(task.id)}
                  onMoveToTomorrow={() => onMoveToTomorrow(task.id)}
                  onMoveByDays={(days) => onMoveByDays(task.id, days)}
                  onDelete={() => onDeleteTask(task.id)}
                  onUpdateTime={onUpdateTaskTime ? (time, endTime) => onUpdateTaskTime(task.id, time, endTime) : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Untimed tasks zone - 30% */}
        <div className={styles.untimedZone}>
          <div className={styles.untimedHeader}>Без времени</div>
          <div className={styles.untimedTasks}>
            <SortableContext
              items={untimedTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {untimedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onToggleComplete={() => onToggleComplete(task.id)}
                  onMoveToTomorrow={() => onMoveToTomorrow(task.id)}
                  onMoveByDays={(days) => onMoveByDays(task.id, days)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      </div>

      <div
        className={`${styles.footer} ${!showQuickInput ? styles.footerClickable : ''}`}
        onClick={!showQuickInput ? () => setShowQuickInput(true) : undefined}
        title={!showQuickInput ? "Добавить задачу" : undefined}
      >
        {showQuickInput ? (
          <QuickInput
            onSubmit={handleQuickCreate}
            onCancel={() => setShowQuickInput(false)}
          />
        ) : (
          <div className={styles.footerContent}>
            <span className={styles.addIcon}>+</span>
          </div>
        )}
      </div>
    </div>
  );
}
