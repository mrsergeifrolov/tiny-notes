import { useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { ru } from 'date-fns/locale';
import { parseISO } from 'date-fns';
import { formatDate } from '../../utils/date';
import 'react-day-picker/style.css';
import styles from './CalendarPicker.module.css';

interface CalendarPickerProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

export function CalendarPicker({ selectedDate, onDateSelect, onClose }: CalendarPickerProps) {
  const selected = selectedDate ? parseISO(selectedDate) : undefined;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSelect = useCallback((date: Date | undefined) => {
    if (date) {
      onDateSelect(formatDate(date));
    }
  }, [onDateSelect]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          locale={ru}
          showOutsideDays
          className={styles.calendar}
        />
      </div>
    </div>
  );
}
