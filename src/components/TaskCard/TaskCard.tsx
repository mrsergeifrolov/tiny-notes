import { useState, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import type { Task } from '../../types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  isDragOverlay?: boolean;
  onEdit: () => void;
  onToggleComplete: () => void;
  onMoveToTomorrow: () => void;
  onMoveByDays?: (days: number) => void;
  onDelete?: () => void;
}

const colorClasses: Record<string, string> = {
  orange: styles.colorOrange,
  terracotta: styles.colorTerracotta,
  'gray-blue': styles.colorGrayBlue,
  green: styles.colorGreen,
  lavender: styles.colorLavender,
};

export function TaskCard({
  task,
  isDragOverlay,
  onEdit,
  onToggleComplete,
  onMoveToTomorrow,
  onMoveByDays,
  onDelete,
}: TaskCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colorClass = task.color ? colorClasses[task.color] : styles.colorDefault;

  const handleDoubleClick = useCallback(() => {
    onEdit();
  }, [onEdit]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleCheckboxClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    onToggleComplete();
  }, [onToggleComplete]);

  const handleMoveClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    onMoveToTomorrow();
  }, [onMoveToTomorrow]);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`${styles.taskCard} ${colorClass} ${isDragging ? styles.isDragging : ''} ${isDragOverlay ? styles.isDragOverlay : ''} ${task.completed ? styles.isCompleted : ''}`}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className={styles.content}>
          <div
            className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
            onClick={handleCheckboxClick}
          >
            {task.completed && <span className={styles.checkmark}>✓</span>}
          </div>
          <div className={styles.textContent}>
            {task.time && <div className={styles.time}>{task.time}</div>}
            <div className={styles.title}>{task.title}</div>
          </div>
        </div>

        <button
          className={styles.moveButton}
          onClick={handleMoveClick}
          title="Move to tomorrow"
        >
          →
        </button>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onMoveToTomorrow={onMoveToTomorrow}
          onMoveByDays={onMoveByDays}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
