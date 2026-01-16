import styles from './SyncIndicator.module.css';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface SyncIndicatorProps {
  status: SyncStatus;
}

export function SyncIndicator({ status }: SyncIndicatorProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className={`${styles.indicator} ${styles[status]}`}>
      {status === 'syncing' && (
        <>
          <span className={styles.spinner} />
          <span className={styles.text}>Сохраняется...</span>
        </>
      )}
      {status === 'synced' && (
        <>
          <span className={styles.checkmark}>✓</span>
          <span className={styles.text}>Синхронизировано</span>
        </>
      )}
      {status === 'error' && (
        <>
          <span className={styles.errorIcon}>!</span>
          <span className={styles.text}>Ошибка</span>
        </>
      )}
    </div>
  );
}
