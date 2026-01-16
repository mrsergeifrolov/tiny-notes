import { useDroppable } from '@dnd-kit/core';
import styles from './DeleteZone.module.css';

interface DeleteZoneProps {
  isVisible: boolean;
}

export function DeleteZone({ isVisible }: DeleteZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'delete-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.deleteZone} ${isVisible ? styles.visible : ''} ${isOver ? styles.isOver : ''}`}
    >
      <span className={styles.icon}>🗑</span>
    </div>
  );
}
