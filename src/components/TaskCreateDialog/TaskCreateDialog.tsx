import { useState, useCallback, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { format, parseISO } from 'date-fns';
import type { TaskArea, TaskColor } from '../../types';
import { getToday, addDaysToDate, formatDateWithMonthYear } from '../../utils/date';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import { CalendarPicker } from '../CalendarPicker/CalendarPicker';
import styles from './TaskCreateDialog.module.css';

interface TaskCreateDialogProps {
  defaultArea: TaskArea;
  defaultDate?: string;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description?: string;
    date?: string;
    color?: TaskColor;
    area: TaskArea;
  }) => void;
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

export function TaskCreateDialog({
  defaultArea,
  defaultDate,
  onClose,
  onCreate,
}: TaskCreateDialogProps) {
  const today = getToday();
  const tomorrow = addDaysToDate(today, 1);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate ?? (defaultArea === 'week' ? today : ''));
  const [color, setColor] = useState<TaskColor | undefined>(undefined);
  const [targetArea, setTargetArea] = useState<TaskArea | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleCreate = useCallback(() => {
    if (!title.trim()) return;

    // Determine area: targetArea (if set explicitly), or based on date, or defaultArea
    let area: TaskArea;
    if (targetArea) {
      area = targetArea;
    } else if (date) {
      area = 'week';
    } else {
      area = defaultArea;
    }

    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || undefined,
      color,
      area,
    });
  }, [title, description, date, color, defaultArea, targetArea, onCreate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCreate();
    }
  }, [handleCreate]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const setQuickDate = useCallback((quickDate: string) => {
    setDate(quickDate);
  }, []);

  const handleSetArea = useCallback((area: TaskArea) => {
    setDate('');
    setTargetArea(area);
  }, []);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.dialog} onKeyDown={handleKeyDown}>
        <div className={styles.header}>
          <span className={styles.title}>Новая задача</span>
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
        </div>

        <div className={styles.footer}>
          <div />
          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Отмена
            </button>
            <button className={styles.createButton} onClick={handleCreate}>
              Создать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
