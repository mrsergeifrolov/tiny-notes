import Dexie, { type EntityTable } from 'dexie';
import type { Task } from '../types';

const db = new Dexie('TinyNotesDB') as Dexie & {
  tasks: EntityTable<Task, 'id'>;
};

db.version(1).stores({
  tasks: 'id, area, date, order, completed, createdAt'
});

export { db };
