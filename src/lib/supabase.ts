import { createClient } from '@supabase/supabase-js';
import type { Task } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database row type (matches Supabase schema)
export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  area: string;
  date: string | null;
  order: number;
  completed: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
}

// Convert database row to app Task type
export function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    area: row.area as Task['area'],
    date: row.date ?? undefined,
    order: row.order,
    completed: row.completed,
    color: row.color as Task['color'] ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert app Task to database row format
export function taskToRow(task: Partial<Task>): Partial<TaskRow> {
  const row: Partial<TaskRow> = {};

  if (task.id !== undefined) row.id = task.id;
  if (task.title !== undefined) row.title = task.title;
  if (task.description !== undefined) row.description = task.description ?? null;
  if (task.area !== undefined) row.area = task.area;
  if (task.date !== undefined) row.date = task.date ?? null;
  if (task.order !== undefined) row.order = task.order;
  if (task.completed !== undefined) row.completed = task.completed;
  if (task.color !== undefined) row.color = task.color ?? null;
  if (task.createdAt !== undefined) row.created_at = task.createdAt;
  if (task.updatedAt !== undefined) row.updated_at = task.updatedAt;

  return row;
}
