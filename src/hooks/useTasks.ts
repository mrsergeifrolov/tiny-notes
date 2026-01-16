import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { Task, TaskArea, TaskColor } from '../types';
import { getToday, addDaysToDate } from '../utils/date';

export function useTasks() {
  const tasks = useLiveQuery(() => db.tasks.toArray()) ?? [];

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

  const deleteTask = async (id: string): Promise<void> => {
    await db.tasks.delete(id);
  };

  const toggleComplete = async (id: string): Promise<void> => {
    const task = await db.tasks.get(id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  const moveTask = async (
    id: string,
    targetArea: TaskArea,
    targetDate?: string,
    targetOrder?: number
  ): Promise<void> => {
    const task = await db.tasks.get(id);
    if (!task) return;

    const updates: Partial<Task> = {
      area: targetArea,
      date: targetArea === 'week' ? (targetDate ?? getToday()) : undefined,
    };

    if (targetOrder !== undefined) {
      updates.order = targetOrder;
    } else {
      const existingTasks = targetArea === 'week' && targetDate
        ? await db.tasks.where({ area: targetArea, date: targetDate }).toArray()
        : await db.tasks.where({ area: targetArea }).toArray();
      const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.order), 0);
      updates.order = maxOrder + 1;
    }

    await updateTask(id, updates);
  };

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

  const reorderTasks = async (taskIds: string[], area: TaskArea, date?: string): Promise<void> => {
    await db.transaction('rw', db.tasks, async () => {
      for (let i = 0; i < taskIds.length; i++) {
        await db.tasks.update(taskIds[i], {
          order: i,
          area,
          date: area === 'week' ? date : undefined,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  };

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
