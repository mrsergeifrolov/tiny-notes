import { useState, useCallback, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import type { Task, TaskColor } from '../../types';
import styles from './TaskDialog.module.css';

interface TaskDialogProps {
  task: Task;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

const colors: Array<TaskColor | undefined> = [
  undefined,
  'orange',
  'terracotta',
  'gray-blue',
  'green',
  'lavender',
];

const colorClasses: Record<string, string> = {
  default: styles.colorDefault,
  orange: styles.colorOrange,
  terracotta: styles.colorTerracotta,
  'gray-blue': styles.colorGrayBlue,
  green: styles.colorGreen,
  lavender: styles.colorLavender,
};

export function TaskDialog({ task, onClose, onSave, onDelete }: TaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [date, setDate] = useState(task.date ?? '');
  const [time, setTime] = useState(task.time ?? '');
  const [color, setColor] = useState<TaskColor | undefined>(task.color);
  const [completed, setCompleted] = useState(task.completed);

  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || undefined,
      time: time || undefined,
      color,
      completed,
    });
  }, [title, description, date, time, color, completed, onSave]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.dialog} onKeyDown={handleKeyDown}>
        <div className={styles.header}>
          <span className={styles.title}>Edit Task</span>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input
                type="date"
                className={styles.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Time</label>
              <input
                type="time"
                className={styles.input}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Color</label>
            <div className={styles.colorPicker}>
              {colors.map((c) => (
                <button
                  key={c ?? 'default'}
                  className={`${styles.colorOption} ${colorClasses[c ?? 'default']} ${color === c ? styles.selected : ''}`}
                  onClick={() => setColor(c)}
                  title={c ?? 'Default'}
                />
              ))}
            </div>
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            <span className={styles.checkboxLabel}>Mark as completed</span>
          </label>
        </div>

        <div className={styles.footer}>
          <button className={styles.deleteButton} onClick={onDelete}>
            Delete task
          </button>
          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
