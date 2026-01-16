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
  time?: string;        // "HH:mm" start time
  endTime?: string;     // "HH:mm" end time (auto-calculated if not set)
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
- Navigation arrows switch weeks; date button (dd.mm.yyyy) returns to current week
- No horizontal scrolling — 7 columns fill available space

### Day Column Split Zones
Each day column is divided into two zones:
- **Timed Zone (70%)**: Shows tasks with time slots from 6:00–24:00
  - TimeGrid component renders hour labels and gridlines
  - Timed tasks positioned absolutely based on start time
  - Task height calculated from duration (min 30 min display)
  - Resize handles on timed tasks for adjusting duration
- **Untimed Zone (30%)**: Shows tasks without specific times
  - Sortable list for reordering
  - "Без времени" header

### Time Utilities (src/utils/date.ts)
- `timeToMinutes(time)` / `minutesToTime(minutes)` — conversion
- `getDurationMinutes(start, end)` — calculate duration
- `snapTimeToInterval(time, interval)` — snap to 30-min intervals
- `addMinutesToTime(time, minutes)` — time arithmetic

### Persistence
- All data stored in IndexedDB via Dexie.js
- Database name: `TinyNotesDB`
- Single `tasks` table with indexes on `area`, `date`, `order`
- Database v2 migration adds `endTime` field (auto-calculates 30-min duration for existing timed tasks)

## Styling

Dark theme inspired by Anthropic/Claude:
- Background: #1a1a1a
- Cards: colored by priority (orange, terracotta, gray-blue, green, lavender)
- Today highlight: #D97706 (orange)

## Localization

UI is in Russian:
- "Входящие" (Inbox), "Когда-нибудь" (Someday)
- Day names: "пн", "вт", "ср", "чт", "пт", "сб", "вс"
- Date format: "16 января 2026"
- Context menu: "На завтра", "+2 дня", "+1 неделя", "Удалить"
