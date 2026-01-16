# Tiny Notes

Minimalist task management app with three areas: Inbox, Week view, and Someday.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool and dev server
- **Dexie.js** — IndexedDB wrapper for local storage
- **dnd-kit** — drag-and-drop (@dnd-kit/core, @dnd-kit/sortable)
- **date-fns** — date utilities with Russian locale
- **CSS Modules** — component styling

## Project Structure

```
src/
├── components/     # React components with CSS Modules
├── db/             # Dexie.js database schema
├── hooks/          # Custom React hooks (useTasks, useKeyboard)
├── styles/         # Global styles and theme
├── types/          # TypeScript interfaces
└── utils/          # Date utilities
```

## Key Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build to dist/
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Data Model

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  area: 'inbox' | 'week' | 'someday';
  date?: string;        // "YYYY-MM-DD" for week tasks
  time?: string;        // "HH:mm"
  order: number;
  completed: boolean;
  color?: 'orange' | 'terracotta' | 'gray-blue' | 'green' | 'lavender';
  createdAt: string;
  updatedAt: string;
}
```

## Architecture Notes

### Drag-and-Drop
- Uses `useSensors` with `PointerSensor` and `activationConstraint: { distance: 8 }` to differentiate clicks from drags
- Drop zones: day columns, inbox, someday, delete zone
- `isDragging` hides original card; `isDragOverlay` styles the drag preview

### Week View
- Shows Mon-Sun of current week
- Navigation arrows switch weeks; "Сегодня" button returns to current week
- No horizontal scrolling — 7 columns fill available space

### Persistence
- All data stored in IndexedDB via Dexie.js
- Database name: `TinyNotesDB`
- Single `tasks` table with indexes on `area`, `date`, `order`

## Styling

Dark theme inspired by Anthropic/Claude:
- Background: #1a1a1a
- Cards: colored by priority (orange, terracotta, gray-blue, green, lavender)
- Today highlight: #D97706 (orange)
