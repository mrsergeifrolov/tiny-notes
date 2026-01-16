import { useState, useCallback } from 'react';
import { DndContext, pointerWithin, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { Sidebar } from '../Sidebar/Sidebar';
import { WeekView } from '../WeekView/WeekView';
import { DeleteZone } from '../DeleteZone/DeleteZone';
import { TaskDialog } from '../TaskDialog/TaskDialog';
import { TaskCard } from '../TaskCard/TaskCard';
import { useTasks } from '../../hooks/useTasks';
import { useKeyboard } from '../../hooks/useKeyboard';
import type { Task, TaskArea } from '../../types';
import styles from './Layout.module.css';

export function Layout() {
  // Configure sensors with activation constraint to allow clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag only starts after moving 8px
      },
    })
  );

  const {
    getTasksByArea,
    getTasksByDate,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    moveTask,
    moveToTomorrow,
    moveByDays,
    reorderTasks,
    finishDay,
  } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleCreateTask = useCallback(async (area: TaskArea, date?: string, title?: string) => {
    const task = await createTask(title || 'New task', area, { date });
    // Only open dialog if no title was provided (from + button)
    if (!title) {
      setEditingTask(task);
    }
  }, [createTask]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setEditingTask(null);
  }, []);

  const handleSaveTask = useCallback(async (updates: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, updates);
    }
    setEditingTask(null);
  }, [editingTask, updateTask]);

  const handleDeleteTask = useCallback(async () => {
    if (editingTask) {
      await deleteTask(editingTask.id);
      setEditingTask(null);
    }
  }, [editingTask, deleteTask]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    setActiveTask(task);
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Could be used for visual feedback
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setIsDragging(false);

    if (!over) return;

    const task = active.data.current?.task as Task;
    const overId = over.id as string;

    // Handle drop on delete zone
    if (overId === 'delete-zone') {
      await deleteTask(task.id);
      return;
    }

    // Handle drop on sidebar (inbox or someday)
    if (overId === 'inbox' || overId === 'someday') {
      await moveTask(task.id, overId as TaskArea);
      return;
    }

    // Handle drop on day column
    if (overId.startsWith('day-')) {
      const targetDate = overId.replace('day-', '');
      await moveTask(task.id, 'week', targetDate);
      return;
    }

    // Handle drop on another task (reordering)
    if (over.data.current?.task) {
      const overTask = over.data.current.task as Task;
      if (overTask.area === task.area && overTask.date === task.date) {
        // Same container - reorder
        const tasks = overTask.area === 'week'
          ? getTasksByDate(overTask.date!)
          : getTasksByArea(overTask.area);

        const oldIndex = tasks.findIndex(t => t.id === task.id);
        const newIndex = tasks.findIndex(t => t.id === overTask.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = [...tasks];
          const [removed] = newOrder.splice(oldIndex, 1);
          newOrder.splice(newIndex, 0, removed);
          await reorderTasks(
            newOrder.map(t => t.id),
            overTask.area,
            overTask.date
          );
        }
      } else {
        // Different container - move
        await moveTask(task.id, overTask.area, overTask.date);
      }
    }
  }, [deleteTask, moveTask, getTasksByDate, getTasksByArea, reorderTasks]);

  useKeyboard({
    onNewTask: () => handleCreateTask('inbox'),
    selectedDate,
    setSelectedDate,
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <Sidebar
            area="inbox"
            title="Inbox"
            tasks={getTasksByArea('inbox')}
            onCreateTask={() => handleCreateTask('inbox')}
            onEditTask={handleEditTask}
            onToggleComplete={toggleComplete}
            onMoveToTomorrow={moveToTomorrow}
          />
        </div>

        <div className={styles.weekView}>
          <WeekView
            getTasksByDate={getTasksByDate}
            onCreateTask={(date, title) => handleCreateTask('week', date, title)}
            onEditTask={handleEditTask}
            onToggleComplete={toggleComplete}
            onMoveToTomorrow={moveToTomorrow}
            onMoveByDays={moveByDays}
            onFinishDay={finishDay}
            onDeleteTask={deleteTask}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>

        <div className={`${styles.sidebar} ${styles.sidebarRight}`}>
          <Sidebar
            area="someday"
            title="Someday"
            tasks={getTasksByArea('someday')}
            onCreateTask={() => handleCreateTask('someday')}
            onEditTask={handleEditTask}
            onToggleComplete={toggleComplete}
            onMoveToTomorrow={moveToTomorrow}
          />
        </div>

        <DeleteZone isVisible={isDragging} />

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              isDragOverlay
              onEdit={() => {}}
              onToggleComplete={() => {}}
              onMoveToTomorrow={() => {}}
            />
          )}
        </DragOverlay>
      </div>

      {editingTask && (
        <TaskDialog
          task={editingTask}
          onClose={handleCloseDialog}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </DndContext>
  );
}
