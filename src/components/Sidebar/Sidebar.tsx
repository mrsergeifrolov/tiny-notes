import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from '../TaskCard/TaskCard';
import type { Task, TaskArea } from '../../types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  area: TaskArea;
  title: string;
  tasks: Task[];
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onMoveToTomorrow: (id: string) => void;
}

export function Sidebar({
  area,
  title,
  tasks,
  onCreateTask,
  onEditTask,
  onToggleComplete,
  onMoveToTomorrow,
}: SidebarProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: area,
  });

  const emptyMessage = area === 'inbox' ? 'Нет задач' : 'Нет задач';

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.taskList}>
        <div
          ref={setNodeRef}
          className={`${styles.dropZone} ${isOver ? styles.isOver : ''}`}
        >
          <SortableContext
            items={tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length > 0 ? (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onToggleComplete={() => onToggleComplete(task.id)}
                  onMoveToTomorrow={() => onMoveToTomorrow(task.id)}
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                {emptyMessage}
              </div>
            )}
          </SortableContext>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.addButton}
          onClick={onCreateTask}
          title="Добавить задачу"
        >
          +
        </button>
      </div>
    </div>
  );
}
