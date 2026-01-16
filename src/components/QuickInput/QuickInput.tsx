import { useState, useCallback, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './QuickInput.module.css';

interface QuickInputProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export function QuickInput({ onSubmit, onCancel, placeholder = 'Task title...' }: QuickInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setValue('');
    } else {
      onCancel();
    }
  }, [value, onSubmit, onCancel]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }, [handleSubmit, onCancel]);

  const handleBlur = useCallback(() => {
    // Delay to allow click events to fire
    setTimeout(() => {
      if (!value.trim()) {
        onCancel();
      }
    }, 150);
  }, [value, onCancel]);

  return (
    <div className={styles.quickInput}>
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
    </div>
  );
}
