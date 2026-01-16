import Dexie, { type EntityTable } from 'dexie';
import type { Task } from '../types';

const db = new Dexie('TinyNotesDB') as Dexie & {
  tasks: EntityTable<Task, 'id'>;
};

db.version(1).stores({
  tasks: 'id, area, date, order, completed, createdAt'
});

// Migration to v2: add default endTime for tasks with time
db.version(2).stores({
  tasks: 'id, area, date, order, completed, createdAt'
}).upgrade(tx => {
  return tx.table('tasks').toCollection().modify(task => {
    if (task.time && !task.endTime) {
      // Add 30 minutes default duration
      const [h, m] = task.time.split(':').map(Number);
      const endMinutes = h * 60 + m + 30;
      const endH = Math.floor(endMinutes / 60) % 24;
      const endM = endMinutes % 60;
      task.endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    }
  });
});

export { db };
