import { useState, useCallback, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { format, parseISO } from 'date-fns';
import type { Task, TaskColor, TaskArea } from '../../types';
import { getToday, addDaysToDate, formatDateWithMonthYear } from '../../utils/date';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import { CalendarPicker } from '../CalendarPicker/CalendarPicker';
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
  const today = getToday();
  const tomorrow = addDaysToDate(today, 1);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [date, setDate] = useState(task.date ?? '');
  const [color, setColor] = useState<TaskColor | undefined>(task.color);
  const [completed, setCompleted] = useState(task.completed);

  const setQuickDate = useCallback((quickDate: string) => {
    setDate(quickDate);
  }, []);

  const [targetArea, setTargetArea] = useState<TaskArea | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSetArea = useCallback((area: TaskArea) => {
    setDate('');
    setTargetArea(area);
  }, []);

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

    // Determine area: targetArea (if set explicitly), or based on date
    let newArea: TaskArea;
    if (targetArea) {
      newArea = targetArea;
    } else if (date) {
      newArea = 'week';
    } else {
      newArea = task.area === 'week' ? 'inbox' : task.area;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || undefined,
      area: newArea,
      color,
      completed,
    });
  }, [title, description, date, color, completed, task.area, targetArea, onSave]);

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
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Необязательное описание"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Дата</label>
            <div className={styles.dateInputWrapper}>
              <input
                type="text"
                className={styles.dateInput}
                value={date ? format(parseISO(date), 'dd.MM.yyyy') : ''}
                placeholder="дд.мм.гггг"
                readOnly
                onClick={() => setShowCalendar(true)}
              />
              <button
                type="button"
                className={styles.calendarButton}
                onClick={() => setShowCalendar(true)}
              >
                📅
              </button>
            </div>
            {showCalendar && (
              <CalendarPicker
                selectedDate={date || undefined}
                onDateSelect={(d) => {
                  setDate(d);
                  setShowCalendar(false);
                  setTargetArea(null);
                }}
                onClose={() => setShowCalendar(false)}
              />
            )}
            <div className={styles.quickDates}>
              <button
                type="button"
                className={`${styles.quickDateButton} ${date === today && !targetArea ? styles.active : ''}`}
                onClick={() => { setQuickDate(today); setTargetArea(null); }}
              >
                Сегодня
                <span className={styles.quickDateSub}>{formatDateWithMonthYear(today)}</span>
              </button>
              <button
                type="button"
                className={`${styles.quickDateButton} ${date === tomorrow && !targetArea ? styles.active : ''}`}
                onClick={() => { setQuickDate(tomorrow); setTargetArea(null); }}
              >
                Завтра
                <span className={styles.quickDateSub}>{formatDateWithMonthYear(tomorrow)}</span>
              </button>
              <button
                type="button"
                className={`${styles.quickDateButton} ${styles.areaButton} ${targetArea === 'inbox' ? styles.active : ''}`}
                onClick={() => handleSetArea('inbox')}
              >
                Всякое
                <span className={styles.quickDateSub}>без даты</span>
              </button>
              <button
                type="button"
                className={`${styles.quickDateButton} ${styles.areaButton} ${targetArea === 'someday' ? styles.active : ''}`}
                onClick={() => handleSetArea('someday')}
              >
                Когда-нибудь
                <span className={styles.quickDateSub}>без даты</span>
              </button>
            </div>
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
