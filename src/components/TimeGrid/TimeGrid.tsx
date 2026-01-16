import styles from './TimeGrid.module.css';

interface TimeGridProps {
  startHour?: number;
  endHour?: number;
  hourHeight?: number;
}

export const HOUR_HEIGHT = 60; // pixels per hour
export const START_HOUR = 6;
export const END_HOUR = 24; // 00:00

export function TimeGrid({
  startHour = START_HOUR,
  endHour = END_HOUR,
  hourHeight = HOUR_HEIGHT,
}: TimeGridProps) {
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i
  );

  return (
    <div className={styles.timeGrid}>
      {hours.map(hour => (
        <div
          key={hour}
          className={styles.hourRow}
          style={{ height: hourHeight }}
        >
          <div className={styles.hourLabel}>
            {hour === 24 ? '00' : hour}
          </div>
          <div className={styles.hourLine} />
        </div>
      ))}
    </div>
  );
}
