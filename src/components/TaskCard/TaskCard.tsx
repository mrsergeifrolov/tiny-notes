import { useState, useCallback, useMemo, useRef } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { timeToMinutes, minutesToTime, getDurationMinutes, snapTimeToInterval } from '../../utils/date';
import type { Task } from '../../types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  isDragOverlay?: boolean;
  isTimedTask?: boolean;
  hourHeight?: number;
  startHour?: number;
  onEdit: () => void;
  onToggleComplete: () => void;
  onMoveToTomorrow: () => void;
  onMoveByDays?: (days: number) => void;
  onDelete?: () => void;
  onUpdateTime?: (time: string, endTime: string) => void;
}

const colorClasses: Record<string, string> = {
  orange: styles.colorOrange,
  terracotta: styles.colorTerracotta,
  'gray-blue': styles.colorGrayBlue,
  green: styles.colorGreen,
  lavender: styles.colorLavender,
};

const MIN_DURATION_MINUTES = 30;
const SNAP_INTERVAL = 30;

export function TaskCard({
  task,
  isDragOverlay,
  isTimedTask,
  hourHeight = 60,
  startHour = 6,
  onEdit,
  onToggleComplete,
  onMoveToTomorrow,
  onMoveByDays,
  onDelete,
  onUpdateTime,
}: TaskCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ y: number; originalEndTime: string } | null>(null);

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
    disabled: isResizing,
  });

  // Calculate position and height for timed tasks
  const timedStyle = useMemo(() => {
    if (!isTimedTask || !task.time) return {};

    const startMinutes = timeToMinutes(task.time);
    const startHourMinutes = startHour * 60;
    const topPosition = ((startMinutes - startHourMinutes) / 60) * hourHeight;

    // Calculate height based on duration (minimum 30 min display)
    const endTime = task.endTime || minutesToTime(startMinutes + MIN_DURATION_MINUTES);
    const duration = getDurationMinutes(task.time, endTime);
    const displayDuration = Math.max(duration, MIN_DURATION_MINUTES);
    const height = (displayDuration / 60) * hourHeight;

    return {
      position: 'absolute' as const,
      top: topPosition,
      left: 0,
      right: 0,
      height,
      zIndex: 2,
    };
  }, [isTimedTask, task.time, task.endTime, hourHeight, startHour]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...timedStyle,
  };

  const colorClass = task.color ? colorClasses[task.color] : styles.colorDefault;

  // Format time display
  const timeDisplay = useMemo(() => {
    if (!task.time) return null;
    if (task.endTime) {
      return `${task.time}–${task.endTime}`;
    }
    return task.time;
  }, [task.time, task.endTime]);

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

  // Resize handlers
  const handleResizeStart = useCallback((e: PointerEvent, edge: 'top' | 'bottom') => {
    if (!isTimedTask || !task.time || !onUpdateTime) return;

    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);
    resizeStartRef.current = {
      y: e.clientY,
      originalEndTime: task.endTime || minutesToTime(timeToMinutes(task.time) + MIN_DURATION_MINUTES),
    };

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      if (!resizeStartRef.current || !task.time) return;

      const deltaY = moveEvent.clientY - resizeStartRef.current.y;
      const deltaMinutes = (deltaY / hourHeight) * 60;

      if (edge === 'bottom') {
        const originalEndMinutes = timeToMinutes(resizeStartRef.current.originalEndTime);
        let newEndMinutes = originalEndMinutes + deltaMinutes;

        // Ensure minimum duration
        const startMinutes = timeToMinutes(task.time);
        newEndMinutes = Math.max(newEndMinutes, startMinutes + MIN_DURATION_MINUTES);

        // Cap at 24:00 (1440 minutes)
        newEndMinutes = Math.min(newEndMinutes, 24 * 60);

        // Snap to interval
        const snappedTime = snapTimeToInterval(minutesToTime(newEndMinutes), SNAP_INTERVAL);
        onUpdateTime(task.time, snappedTime);
      }
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [isTimedTask, task.time, task.endTime, hourHeight, onUpdateTime]);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(isResizing ? {} : attributes)}
        {...(isResizing ? {} : listeners)}
        className={`
          ${styles.taskCard}
          ${colorClass}
          ${isDragging ? styles.isDragging : ''}
          ${isDragOverlay ? styles.isDragOverlay : ''}
          ${task.completed ? styles.isCompleted : ''}
          ${isTimedTask ? styles.isTimedTask : ''}
          ${isResizing ? styles.isResizing : ''}
        `}
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
            {timeDisplay && <div className={styles.time}>{timeDisplay}</div>}
            <div className={styles.title}>{task.title}</div>
          </div>
        </div>

        <button
          className={styles.moveButton}
          onClick={handleMoveClick}
          title="Переместить на завтра"
        >
          →
        </button>

        {/* Resize handles for timed tasks */}
        {isTimedTask && onUpdateTime && (
          <>
            <div
              className={styles.resizeHandleTop}
              onPointerDown={(e) => handleResizeStart(e, 'top')}
            />
            <div
              className={styles.resizeHandleBottom}
              onPointerDown={(e) => handleResizeStart(e, 'bottom')}
            />
          </>
        )}
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
