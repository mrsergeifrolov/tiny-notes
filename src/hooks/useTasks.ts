import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, rowToTask, taskToRow, type TaskRow } from '../lib/supabase';
import type { Task, TaskArea, TaskColor } from '../types';
import { getToday, addDaysToDate } from '../utils/date';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setTasks((data as TaskRow[]).map(rowToTask));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTasksByArea = useCallback((area: TaskArea): Task[] => {
    return tasks
      .filter(t => t.area === area)
      .sort((a, b) => a.order - b.order);
  }, [tasks]);

  const getTasksByDate = useCallback((date: string): Task[] => {
    const dayTasks = tasks.filter(t => t.area === 'week' && t.date === date);

    // Sort: incomplete by order, then completed by order
    const incompleteTasks = dayTasks
      .filter(t => !t.completed)
      .sort((a, b) => a.order - b.order);

    const completedTasks = dayTasks
      .filter(t => t.completed)
      .sort((a, b) => a.order - b.order);

    return [...incompleteTasks, ...completedTasks];
  }, [tasks]);

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

    // Calculate max order for the target area/date
    const existingTasks = area === 'week' && options?.date
      ? tasks.filter(t => t.area === area && t.date === options.date)
      : tasks.filter(t => t.area === area);
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

    // Optimistic update
    setTasks(prev => [...prev, task]);

    try {
      const { error } = await supabase
        .from('tasks')
        .insert(taskToRow(task));

      if (error) throw error;
    } catch (err) {
      // Rollback on error
      setTasks(prev => prev.filter(t => t.id !== task.id));
      console.error('Error creating task:', err);
      throw err;
    }

    return task;
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> => {
    const updatedAt = new Date().toISOString();
    const fullUpdates = { ...updates, updatedAt };

    // Find current task for rollback
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) return;

    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...fullUpdates } : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update(taskToRow(fullUpdates))
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      // Rollback on error
      setTasks(prev => prev.map(t =>
        t.id === id ? currentTask : t
      ));
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    // Find current task for rollback
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) return;

    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      // Rollback on error
      setTasks(prev => [...prev, currentTask]);
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [tasks]);

  const toggleComplete = async (id: string): Promise<void> => {
    const task = tasks.find(t => t.id === id);
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
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newDate = targetArea === 'week' ? (targetDate ?? getToday()) : undefined;

    // Calculate order
    let newOrder: number;
    if (targetOrder !== undefined) {
      newOrder = targetOrder;
    } else {
      const existingTasks = targetArea === 'week' && targetDate
        ? tasks.filter(t => t.area === targetArea && t.date === targetDate)
        : tasks.filter(t => t.area === targetArea);
      const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.order), 0);
      newOrder = maxOrder + 1;
    }

    const now = new Date().toISOString();
    const updates = {
      area: targetArea,
      date: newDate,
      order: newOrder,
      updatedAt: now,
    };

    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update(taskToRow(updates))
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      // Rollback on error
      setTasks(prev => prev.map(t =>
        t.id === id ? task : t
      ));
      console.error('Error moving task:', err);
      throw err;
    }
  }, [tasks]);

  const moveToTomorrow = async (id: string): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const currentDate = task.date ?? getToday();
    const tomorrow = addDaysToDate(currentDate, 1);

    await moveTask(id, 'week', tomorrow);
  };

  const moveByDays = async (id: string, days: number): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const currentDate = task.date ?? getToday();
    const newDate = addDaysToDate(currentDate, days);

    await moveTask(id, 'week', newDate);
  };

  const reorderTasks = useCallback(async (taskIds: string[], area: TaskArea, date?: string): Promise<void> => {
    const now = new Date().toISOString();
    const newDate = area === 'week' ? date : undefined;

    // Store original state for rollback
    const originalTasks = [...tasks];

    // Optimistic update
    setTasks(prev => prev.map(t => {
      const newIndex = taskIds.indexOf(t.id);
      if (newIndex !== -1) {
        return { ...t, order: newIndex, area, date: newDate, updatedAt: now };
      }
      return t;
    }));

    try {
      // Update each task individually
      for (let i = 0; i < taskIds.length; i++) {
        const { error } = await supabase
          .from('tasks')
          .update({
            order: i,
            area,
            date: newDate ?? null,
            updated_at: now,
          })
          .eq('id', taskIds[i]);

        if (error) throw error;
      }
    } catch (err) {
      // Rollback on error
      setTasks(originalTasks);
      console.error('Error reordering tasks:', err);
      throw err;
    }
  }, [tasks]);

  const finishDay = async (date: string): Promise<void> => {
    const tomorrow = addDaysToDate(date, 1);
    const dayTasks = tasks.filter(t => t.area === 'week' && t.date === date);
    const incompleteTasks = dayTasks.filter(t => !t.completed);

    if (incompleteTasks.length === 0) return;

    const now = new Date().toISOString();

    // Store original state for rollback
    const originalTasks = [...tasks];

    // Optimistic update
    setTasks(prev => prev.map(t => {
      if (t.area === 'week' && t.date === date && !t.completed) {
        return { ...t, date: tomorrow, updatedAt: now };
      }
      return t;
    }));

    try {
      // Update each task individually
      for (const task of incompleteTasks) {
        const { error } = await supabase
          .from('tasks')
          .update({
            date: tomorrow,
            updated_at: now,
          })
          .eq('id', task.id);

        if (error) throw error;
      }
    } catch (err) {
      // Rollback on error
      setTasks(originalTasks);
      console.error('Error finishing day:', err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
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
    refetch: fetchTasks,
  };
}
