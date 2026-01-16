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
      color,
      completed,
    });
  }, [title, description, date, color, completed, onSave]);

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
          <span className={styles.title}>Редактировать задачу</span>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>Название</label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название задачи"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Описание</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Необязательное описание"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Дата</label>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Цвет</label>
            <div className={styles.colorPicker}>
              {colors.map((c) => (
                <button
                  key={c ?? 'default'}
                  className={`${styles.colorOption} ${colorClasses[c ?? 'default']} ${color === c ? styles.selected : ''}`}
                  onClick={() => setColor(c)}
                  title={c ?? 'По умолчанию'}
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
            <span className={styles.checkboxLabel}>Отметить как завершённое</span>
          </label>
        </div>

        <div className={styles.footer}>
          <button className={styles.deleteButton} onClick={onDelete}>
            Удалить
          </button>
          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Отмена
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
