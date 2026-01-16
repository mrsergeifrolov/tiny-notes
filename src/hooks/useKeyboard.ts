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

    switch (event.key.toLowerCase()) {
      case 'n':
        event.preventDefault();
        onNewTask();
        break;

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
