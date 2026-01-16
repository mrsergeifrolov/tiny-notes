import { useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TaskCard } from '../TaskCard/TaskCard';
import { QuickInput } from '../QuickInput/QuickInput';
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

  const parsedDate = parseISO(date);
  const dayName = format(parsedDate, 'EEE', { locale: ru });
  const dateNumber = format(parsedDate, 'd');

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
        <span className={styles.dayName}>{dayName}</span>
        <span className={styles.dateNumber}>{dateNumber}</span>
      </div>

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

      <div className={styles.footer}>
        {showQuickInput ? (
          <QuickInput
            onSubmit={handleQuickCreate}
            onCancel={() => setShowQuickInput(false)}
          />
        ) : (
          <>
            <button
              className={styles.addButton}
              onClick={() => setShowQuickInput(true)}
            >
              + Add task
            </button>
            {showFinishButton && (
              <button
                className={styles.finishButton}
                onClick={onFinishDay}
                title="Move incomplete tasks to tomorrow"
              >
                Finish day
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
