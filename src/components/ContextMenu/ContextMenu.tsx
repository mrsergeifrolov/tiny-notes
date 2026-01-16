import { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onMoveToTomorrow: () => void;
  onMoveByDays?: (days: number) => void;
  onDelete?: () => void;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onMoveToTomorrow,
  onMoveByDays,
  onDelete,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedPosition = {
    left: Math.min(x, window.innerWidth - 180),
    top: Math.min(y, window.innerHeight - 200),
  };

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div
        ref={menuRef}
        className={styles.menu}
        style={adjustedPosition}
      >
        <button
          className={styles.item}
          onClick={() => handleAction(onMoveToTomorrow)}
        >
          <span className={styles.icon}>→</span>
          Tomorrow
        </button>

        {onMoveByDays && (
          <>
            <button
              className={styles.item}
              onClick={() => handleAction(() => onMoveByDays(2))}
            >
              <span className={styles.icon}>→</span>
              +2 days
            </button>

            <button
              className={styles.item}
              onClick={() => handleAction(() => onMoveByDays(7))}
            >
              <span className={styles.icon}>→</span>
              +1 week
            </button>
          </>
        )}

        {onDelete && (
          <>
            <div className={styles.separator} />
            <button
              className={`${styles.item} ${styles.itemDanger}`}
              onClick={() => handleAction(onDelete)}
            >
              <span className={styles.icon}>×</span>
              Delete
            </button>
          </>
        )}
      </div>
    </>
  );
}
