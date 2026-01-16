import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { startOfWeek, addDays, parseISO } from 'date-fns';
import { supabase, rowToTask, taskToRow, type TaskRow } from '../lib/supabase';
import type { Task, TaskArea, TaskColor } from '../types';
import { getToday, addDaysToDate, formatDate } from '../utils/date';
import type { SyncStatus } from '../components/SyncIndicator/SyncIndicator';

// Helper to get week key from a date string
function getWeekKey(date: string): string {
  const d = parseISO(date);
  const weekStart = startOfWeek(d, { weekStartsOn: 1 });
  return formatDate(weekStart);
}

// Helper to get week date range
function getWeekDateRange(weekKey: string): { start: string; end: string } {
  const startDate = parseISO(weekKey);
  const endDate = addDays(startDate, 6);
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

export function useTasks() {
  // Core state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekLoading, setWeekLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Track which weeks have been loaded
  const loadedWeeks = useRef<Set<string>>(new Set());

  // Pending operations counter for sync status
  const pendingOps = useRef(0);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Update sync status based on pending operations
  const updateSyncStatus = useCallback((delta: number) => {
    pendingOps.current += delta;

    if (pendingOps.current > 0) {
      setSyncStatus('syncing');
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    } else {
      setSyncStatus('synced');
      // Auto-hide after 3 seconds
      syncTimeoutRef.current = setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  }, []);

  const setSyncError = useCallback(() => {
    pendingOps.current = 0;
    setSyncStatus('error');
    // Auto-hide error after 5 seconds
    syncTimeoutRef.current = setTimeout(() => {
      setSyncStatus('idle');
    }, 5000);
  }, []);

  // Fetch tasks for inbox and someday (always loaded)
  const fetchBaseTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('area', ['inbox', 'someday'])
      .order('order', { ascending: true });

    if (error) throw error;
    return (data as TaskRow[]).map(rowToTask);
  };

  // Fetch tasks for a specific week
  const fetchWeekTasks = async (weekKey: string) => {
    const { start, end } = getWeekDateRange(weekKey);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('area', 'week')
      .gte('date', start)
      .lte('date', end)
      .order('order', { ascending: true });

    if (error) throw error;
    return (data as TaskRow[]).map(rowToTask);
  };

  // Initial load: inbox, someday, and current week
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        const today = getToday();
        const currentWeekKey = getWeekKey(today);

        const [baseTasks, weekTasks] = await Promise.all([
          fetchBaseTasks(),
          fetchWeekTasks(currentWeekKey),
        ]);

        setTasks([...baseTasks, ...weekTasks]);
        loadedWeeks.current.add(currentWeekKey);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  // Load tasks for a specific week (called when user navigates to a new week)
  const loadWeek = useCallback(async (weekOffset: number): Promise<void> => {
    const baseDate = addDays(new Date(), weekOffset * 7);
    const weekKey = getWeekKey(formatDate(baseDate));

    // Skip if already loaded
    if (loadedWeeks.current.has(weekKey)) {
      return;
    }

    try {
      setWeekLoading(true);
      const weekTasks = await fetchWeekTasks(weekKey);

      setTasks(prev => {
        // Filter out any tasks that might already exist (shouldn't happen, but safety)
        const existingIds = new Set(prev.map(t => t.id));
        const newTasks = weekTasks.filter(t => !existingIds.has(t.id));
        return [...prev, ...newTasks];
      });

      loadedWeeks.current.add(weekKey);
    } catch (err) {
      console.error('Error loading week:', err);
      setError(err instanceof Error ? err.message : 'Failed to load week');
    } finally {
      setWeekLoading(false);
    }
  }, []);

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

  const createTask = useCallback(async (
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
    updateSyncStatus(1);

    try {
      const { error } = await supabase
        .from('tasks')
        .insert(taskToRow(task));

      if (error) throw error;
      updateSyncStatus(-1);
    } catch (err) {
      // Rollback on error
      setTasks(prev => prev.filter(t => t.id !== task.id));
      setSyncError();
      console.error('Error creating task:', err);
      throw err;
    }

    return task;
  }, [tasks, updateSyncStatus, setSyncError]);

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> => {
    const updatedAt = new Date().toISOString();
    const fullUpdates = { ...updates, updatedAt };

    // Find current task for rollback
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) return;

    // Check if task is being moved to a different week that's not loaded
    const newDate = updates.date;
    const oldDate = currentTask.date;
    const isMovingToUnloadedWeek = newDate && newDate !== oldDate &&
      !loadedWeeks.current.has(getWeekKey(newDate));

    // Optimistic update
    setTasks(prev => {
      // If moving to an unloaded week, remove from UI
      if (isMovingToUnloadedWeek) {
        return prev.filter(t => t.id !== id);
      }
      return prev.map(t =>
        t.id === id ? { ...t, ...fullUpdates } : t
      );
    });

    updateSyncStatus(1);

    try {
      const { error } = await supabase
        .from('tasks')
        .update(taskToRow(fullUpdates))
        .eq('id', id);

      if (error) throw error;
      updateSyncStatus(-1);
    } catch (err) {
      // Rollback on error
      setTasks(prev => {
        if (isMovingToUnloadedWeek) {
          return [...prev, currentTask];
        }
        return prev.map(t =>
          t.id === id ? currentTask : t
        );
      });
      setSyncError();
      console.error('Error updating task:', err);
      throw err;
    }
  }, [tasks, updateSyncStatus, setSyncError]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    // Find current task for rollback
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) return;

    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id));
    updateSyncStatus(1);

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      updateSyncStatus(-1);
    } catch (err) {
      // Rollback on error
      setTasks(prev => [...prev, currentTask]);
      setSyncError();
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [tasks, updateSyncStatus, setSyncError]);

  const toggleComplete = useCallback(async (id: string): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  }, [tasks, updateTask]);

  const moveTask = useCallback(async (
    id: string,
    targetArea: TaskArea,
    targetDate?: string,
    targetOrder?: number
  ): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newDate = targetArea === 'week' ? (targetDate ?? getToday()) : undefined;

    // Check if moving to an unloaded week
    const isMovingToUnloadedWeek = newDate && newDate !== task.date &&
      !loadedWeeks.current.has(getWeekKey(newDate));

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
    setTasks(prev => {
      // If moving to an unloaded week, remove from UI
      if (isMovingToUnloadedWeek) {
        return prev.filter(t => t.id !== id);
      }
      return prev.map(t =>
        t.id === id ? { ...t, ...updates } : t
      );
    });

    updateSyncStatus(1);

    try {
      const { error } = await supabase
        .from('tasks')
        .update(taskToRow(updates))
        .eq('id', id);

      if (error) throw error;
      updateSyncStatus(-1);
    } catch (err) {
      // Rollback on error
      setTasks(prev => {
        if (isMovingToUnloadedWeek) {
          return [...prev, task];
        }
        return prev.map(t =>
          t.id === id ? task : t
        );
      });
      setSyncError();
      console.error('Error moving task:', err);
      throw err;
    }
  }, [tasks, updateSyncStatus, setSyncError]);

  const moveToTomorrow = useCallback(async (id: string): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const currentDate = task.date ?? getToday();
    const tomorrow = addDaysToDate(currentDate, 1);

    await moveTask(id, 'week', tomorrow);
  }, [tasks, moveTask]);

  const moveByDays = useCallback(async (id: string, days: number): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const currentDate = task.date ?? getToday();
    const newDate = addDaysToDate(currentDate, days);

    await moveTask(id, 'week', newDate);
  }, [tasks, moveTask]);

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

    updateSyncStatus(1);

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
      updateSyncStatus(-1);
    } catch (err) {
      // Rollback on error
      setTasks(originalTasks);
      setSyncError();
      console.error('Error reordering tasks:', err);
      throw err;
    }
  }, [tasks, updateSyncStatus, setSyncError]);

  const finishDay = useCallback(async (date: string): Promise<void> => {
    const tomorrow = addDaysToDate(date, 1);
    const dayTasks = tasks.filter(t => t.area === 'week' && t.date === date);
    const incompleteTasks = dayTasks.filter(t => !t.completed);

    if (incompleteTasks.length === 0) return;

    const now = new Date().toISOString();

    // Check if tomorrow is in a loaded week
    const isTomorrowLoaded = loadedWeeks.current.has(getWeekKey(tomorrow));

    // Store original state for rollback
    const originalTasks = [...tasks];
    const movedTaskIds = new Set(incompleteTasks.map(t => t.id));

    // Optimistic update
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.area === 'week' && t.date === date && !t.completed) {
          return { ...t, date: tomorrow, updatedAt: now };
        }
        return t;
      });

      // If tomorrow is not loaded, remove the moved tasks
      if (!isTomorrowLoaded) {
        return updated.filter(t => !movedTaskIds.has(t.id) || t.date !== tomorrow);
      }

      return updated;
    });

    updateSyncStatus(1);

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
      updateSyncStatus(-1);
    } catch (err) {
      // Rollback on error
      setTasks(originalTasks);
      setSyncError();
      console.error('Error finishing day:', err);
      throw err;
    }
  }, [tasks, updateSyncStatus, setSyncError]);

  return {
    tasks,
    loading,
    weekLoading,
    error,
    syncStatus,
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
    loadWeek,
  };
}
