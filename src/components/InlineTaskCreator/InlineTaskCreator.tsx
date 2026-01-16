import { useState, useCallback, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './InlineTaskCreator.module.css';

interface InlineTaskCreatorProps {
  onSubmit: (title: string, description?: string) => void;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
}

export function InlineTaskCreator({
  onSubmit,
  titlePlaceholder = 'Название задачи...',
  descriptionPlaceholder = 'Описание (необязательно)',
}: InlineTaskCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      onSubmit(trimmedTitle, description.trim() || undefined);
      setTitle('');
      setDescription('');
      // Refocus title input after submit
      titleInputRef.current?.focus();
    }
  }, [title, description, onSubmit]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleTitleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className={styles.inlineCreator} onKeyDown={handleKeyDown}>
      <div className={styles.inputsWrapper}>
        <input
          ref={titleInputRef}
          type="text"
          className={styles.titleInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder={titlePlaceholder}
        />
        <textarea
          className={styles.descriptionInput}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={descriptionPlaceholder}
          rows={2}
        />
      </div>
      <button
        type="button"
        className={`${styles.submitButton} ${title.trim() ? styles.active : ''}`}
        onClick={handleSubmit}
        disabled={!title.trim()}
        title="Создать задачу (Enter или Cmd+Enter)"
      >
        +
      </button>
    </div>
  );
}
