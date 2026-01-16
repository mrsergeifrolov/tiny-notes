import { useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from '../TaskCard/TaskCard';
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

  const incompleteTasks = tasks.filter(t => !t.completed);
  const showFinishButton = isToday && incompleteTasks.length > 0;

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
        <div className={styles.taskList}>
          <SortableContext
            items={tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map(task => (
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
