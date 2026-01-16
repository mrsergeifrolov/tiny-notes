import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { Task, TaskArea, TaskColor } from '../types';
import { getToday, addDaysToDate } from '../utils/date';

export function useTasks() {
  const dbTasks = useLiveQuery(() => db.tasks.toArray()) ?? [];
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [hasOptimisticUpdate, setHasOptimisticUpdate] = useState(false);

  // Sync with database when it updates (and no pending optimistic updates)
  useEffect(() => {
    if (!hasOptimisticUpdate) {
      setOptimisticTasks(dbTasks);
    }
  }, [dbTasks, hasOptimisticUpdate]);

  // Clear optimistic flag when DB catches up
  useEffect(() => {
    if (hasOptimisticUpdate && dbTasks.length > 0) {
      // Check if DB has caught up with our optimistic changes
      const timer = setTimeout(() => {
        setHasOptimisticUpdate(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dbTasks, hasOptimisticUpdate]);

  const tasks = optimisticTasks;

  const getTasksByArea = (area: TaskArea): Task[] => {
    return tasks
      .filter(t => t.area === area)
      .sort((a, b) => a.order - b.order);
  };

  const getTasksByDate = (date: string): Task[] => {
    const dayTasks = tasks.filter(t => t.area === 'week' && t.date === date);

    // Sort: incomplete by order, then completed by order
    const incompleteTasks = dayTasks
      .filter(t => !t.completed)
      .sort((a, b) => a.order - b.order);

    const completedTasks = dayTasks
      .filter(t => t.completed)
      .sort((a, b) => a.order - b.order);

    return [...incompleteTasks, ...completedTasks];
  };

  const createTask = async (
    title: string,
    area: TaskArea,
    options?: {
      date?: string;
      description?: string;
      color?: TaskColor;
    }
  ): Promise<Task> => {
    const now = new Date().toISOString();
    const existingTasks = area === 'week' && options?.date
      ? await db.tasks.where({ area, date: options.date }).toArray()
      : await db.tasks.where({ area }).toArray();

    const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.order), 0);

    const task: Task = {
      id: uuidv4(),
      title,
      area,
      date: area === 'week' ? (options?.date ?? getToday()) : undefined,
      description: options?.description,
      color: options?.color,
      order: maxOrder + 1,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.tasks.add(task);
    return task;
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> => {
    await db.tasks.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    // Optimistic update - remove from UI immediately
    setOptimisticTasks(prev => prev.filter(t => t.id !== id));
    setHasOptimisticUpdate(true);

    // Then persist to DB
    await db.tasks.delete(id);
  }, []);

  const toggleComplete = async (id: string): Promise<void> => {
    const task = await db.tasks.get(id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  const moveTask = useCallback(async (
    id: string,
    targetArea: TaskArea,
    targetDate?: string,
    targetOrder?: number
  ): Promise<void> => {
    const task = optimisticTasks.find(t => t.id === id);
    if (!task) return;

    const newDate = targetArea === 'week' ? (targetDate ?? getToday()) : undefined;

    // Calculate order
    let newOrder: number;
    if (targetOrder !== undefined) {
      newOrder = targetOrder;
    } else {
      const existingTasks = targetArea === 'week' && targetDate
        ? optimisticTasks.filter(t => t.area === targetArea && t.date === targetDate)
        : optimisticTasks.filter(t => t.area === targetArea);
      const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.order), 0);
      newOrder = maxOrder + 1;
    }

    // Optimistic update - update UI immediately
    const now = new Date().toISOString();
    setOptimisticTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, area: targetArea, date: newDate, order: newOrder, updatedAt: now }
        : t
    ));
    setHasOptimisticUpdate(true);

    // Then persist to DB
    await db.tasks.update(id, {
      area: targetArea,
      date: newDate,
      order: newOrder,
      updatedAt: now,
    });
  }, [optimisticTasks]);

  const moveToTomorrow = async (id: string): Promise<void> => {
    const task = await db.tasks.get(id);
    if (!task) return;

    const currentDate = task.date ?? getToday();
    const tomorrow = addDaysToDate(currentDate, 1);

    await moveTask(id, 'week', tomorrow);
  };

  const moveByDays = async (id: string, days: number): Promise<void> => {
    const task = await db.tasks.get(id);
    if (!task) return;

    const currentDate = task.date ?? getToday();
    const newDate = addDaysToDate(currentDate, days);

    await moveTask(id, 'week', newDate);
  };

  const reorderTasks = useCallback(async (taskIds: string[], area: TaskArea, date?: string): Promise<void> => {
    const now = new Date().toISOString();
    const newDate = area === 'week' ? date : undefined;

    // Optimistic update - update UI immediately
    setOptimisticTasks(prev => prev.map(t => {
      const newIndex = taskIds.indexOf(t.id);
      if (newIndex !== -1) {
        return { ...t, order: newIndex, area, date: newDate, updatedAt: now };
      }
      return t;
    }));
    setHasOptimisticUpdate(true);

    // Then persist to DB
    await db.transaction('rw', db.tasks, async () => {
      for (let i = 0; i < taskIds.length; i++) {
        await db.tasks.update(taskIds[i], {
          order: i,
          area,
          date: newDate,
          updatedAt: now,
        });
      }
    });
  }, []);

  const finishDay = async (date: string): Promise<void> => {
    const tomorrow = addDaysToDate(date, 1);
    const dayTasks = await db.tasks.where({ area: 'week', date }).toArray();
    const incompleteTasks = dayTasks.filter(t => !t.completed);

    await db.transaction('rw', db.tasks, async () => {
      for (const task of incompleteTasks) {
        await db.tasks.update(task.id, {
          date: tomorrow,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  };

  return {
    tasks,
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
  };
}
