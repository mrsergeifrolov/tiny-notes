import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={`${styles.skeleton} ${className ?? ''}`} />;
}

export function TaskCardSkeleton() {
  return (
    <div className={styles.taskCard}>
      <div className={styles.checkbox} />
      <div className={styles.content}>
        <Skeleton className={styles.title} />
        <Skeleton className={styles.description} />
      </div>
    </div>
  );
}

export function DayColumnSkeleton() {
  return (
    <div className={styles.dayColumn}>
      <div className={styles.dayHeader}>
        <Skeleton className={styles.dayName} />
        <Skeleton className={styles.dayDate} />
      </div>
      <div className={styles.taskList}>
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className={styles.sidebar}>
      <Skeleton className={styles.sidebarTitle} />
      <div className={styles.taskList}>
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  );
}

export function LayoutSkeleton() {
  return (
    <div className={styles.layout}>
      <div className={styles.sidebarContainer}>
        <SidebarSkeleton />
      </div>
      <div className={styles.weekContainer}>
        <div className={styles.weekHeader}>
          <Skeleton className={styles.headerButton} />
          <div className={styles.headerCenter}>
            <Skeleton className={styles.todayButton} />
            <Skeleton className={styles.weekRange} />
          </div>
          <div className={styles.headerRight} />
        </div>
        <div className={styles.daysContainer}>
          {Array.from({ length: 7 }).map((_, i) => (
            <DayColumnSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className={styles.sidebarContainer}>
        <SidebarSkeleton />
      </div>
    </div>
  );
}
