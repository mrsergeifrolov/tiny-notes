import { useEffect, useCallback } from 'react';
import { getToday, addDaysToDate, subtractDaysFromDate } from '../utils/date';

interface UseKeyboardOptions {
  onNewTask: () => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}

export function useKeyboard({ onNewTask, selectedDate, setSelectedDate }: UseKeyboardOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const key = event.key.toLowerCase();

    // Support both English 'n' and Russian 'т' for new task
    if (key === 'n' || key === 'т') {
      event.preventDefault();
      onNewTask();
      return;
    }

    switch (key) {

      case 'arrowleft':
        event.preventDefault();
        if (selectedDate) {
          setSelectedDate(subtractDaysFromDate(selectedDate, 1));
        } else {
          setSelectedDate(getToday());
        }
        break;

      case 'arrowright':
        event.preventDefault();
        if (selectedDate) {
          setSelectedDate(addDaysToDate(selectedDate, 1));
        } else {
          setSelectedDate(getToday());
        }
        break;

      case 'escape':
        event.preventDefault();
        setSelectedDate(null);
        break;
    }
  }, [onNewTask, selectedDate, setSelectedDate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
