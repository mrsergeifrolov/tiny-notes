export type TaskArea = 'inbox' | 'week' | 'someday';

export type TaskColor = 'orange' | 'terracotta' | 'gray-blue' | 'green' | 'lavender';

export interface Task {
  id: string;
  title: string;
  description?: string;
  area: TaskArea;
  date?: string;        // "2026-01-16" format
  time?: string;        // "09:00" format - start time
  endTime?: string;     // "09:30" format - end time
  order: number;
  completed: boolean;
  color?: TaskColor;
  createdAt: string;
  updatedAt: string;
}

export interface DayData {
  date: string;
  tasks: Task[];
}
