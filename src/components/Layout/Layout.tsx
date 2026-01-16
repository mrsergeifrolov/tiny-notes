import { useState, useCallback } from 'react';
import { DndContext, pointerWithin, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Sidebar } from '../Sidebar/Sidebar';
import { WeekView } from '../WeekView/WeekView';
import { DeleteZone } from '../DeleteZone/DeleteZone';
import { TaskDialog } from '../TaskDialog/TaskDialog';
import { TaskCreateDialog } from '../TaskCreateDialog/TaskCreateDialog';
import { TaskCard } from '../TaskCard/TaskCard';
import { useTasks } from '../../hooks/useTasks';
import { useKeyboard } from '../../hooks/useKeyboard';
import type { Task, TaskArea, TaskColor } from '../../types';
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
  const [creatingTask, setCreatingTask] = useState<{ area: TaskArea; date?: string } | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleOpenCreateDialog = useCallback((area: TaskArea, date?: string) => {
    setCreatingTask({ area, date });
  }, []);

  const handleQuickCreateTask = useCallback(async (area: TaskArea, date?: string, title?: string, description?: string) => {
    if (title) {
      await createTask(title, area, { date, description });
    }
  }, [createTask]);

  const handleCreateTask = useCallback(async (data: {
    title: string;
    description?: string;
    date?: string;
    color?: TaskColor;
    area: TaskArea;
  }) => {
    await createTask(data.title, data.area, {
      date: data.date,
      description: data.description,
      color: data.color,
    });
    setCreatingTask(null);
  }, [createTask]);

  const handleCloseCreateDialog = useCallback(() => {
    setCreatingTask(null);
  }, []);

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

  const handleDragOver = useCallback(() => {
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
    onNewTask: () => handleOpenCreateDialog('inbox'),
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
            title="Всякое"
            tasks={getTasksByArea('inbox')}
            onQuickCreateTask={(title, description) => handleQuickCreateTask('inbox', undefined, title, description)}
            onEditTask={handleEditTask}
            onToggleComplete={toggleComplete}
            onMoveToTomorrow={moveToTomorrow}
          />
        </div>

        <div className={styles.weekView}>
          <WeekView
            getTasksByDate={getTasksByDate}
            onQuickCreateTask={(date, title, description) => handleQuickCreateTask('week', date, title, description)}
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
            title="Когда-нибудь"
            tasks={getTasksByArea('someday')}
            onQuickCreateTask={(title, description) => handleQuickCreateTask('someday', undefined, title, description)}
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

      {creatingTask && (
        <TaskCreateDialog
          defaultArea={creatingTask.area}
          defaultDate={creatingTask.date}
          onClose={handleCloseCreateDialog}
          onCreate={handleCreateTask}
        />
      )}
    </DndContext>
  );
}
