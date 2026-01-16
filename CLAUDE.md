# Tiny Notes

Minimalist task management app with three areas: Inbox, Week view, and Someday.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool and dev server
- **Supabase** — PostgreSQL cloud database (@supabase/supabase-js)
- **dnd-kit** — drag-and-drop (@dnd-kit/core, @dnd-kit/sortable)
- **date-fns** — date utilities with Russian locale
- **Tiptap** — WYSIWYG editor (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-underline)
- **react-day-picker** — calendar date picker
- **CSS Modules** — component styling

## Project Structure

```
src/
├── components/     # React components with CSS Modules
├── hooks/          # Custom React hooks (useTasks, useKeyboard)
├── lib/            # Supabase client configuration
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
- **Optimistic updates** in `useTasks.ts` for instant UI response (no flickering)

### Week View
- Shows Mon-Sun of current week
- Header displays: "← Сегодня (dd.mm.yyyy) →" + week range below
- Navigation arrows centered around "Сегодня" button; arrows switch weeks
- Calendar picker (📅) in left corner for quick navigation to any date
- Columns have min-width 140px with horizontal scroll if needed

### Day Column
- Scrollable list of tasks with drag-and-drop reordering
- Uses SortableContext for task reordering within a day
- Tasks sorted by order, with completed tasks at the bottom
- **InlineTaskCreator** at bottom: title + description fields with + button

### Task Dialogs
- **TaskCreateDialog** — for creating new tasks (hotkey: `n` or `т` for Russian layout)
- **TaskDialog** — for editing existing tasks (double-click card)
- Dialog width: 720px (wider for comfortable editing)
- Quick buttons: "Сегодня" / "Завтра" / "Всякое" / "Когда-нибудь"
- **RichTextEditor** — Tiptap WYSIWYG (bold, italic, underline, strike, code, blockquote, links, lists)
- Setting a date moves task to week area; "Всякое"/"Когда-нибудь" moves to inbox/someday

### Task Cards
- Display title and description (HTML from RichTextEditor)
- Checkbox, move-to-tomorrow button (→), context menu on right-click
- Context menu available in all areas (inbox, week, someday) with delete option

### Persistence
- All data stored in Supabase (PostgreSQL cloud database)
- Project: `tiny-notes` (eu-north-1 region)
- Single `tasks` table with indexes on `area`, `date`
- Row Level Security enabled with open policy (single-user app)
- Optimistic updates with rollback on error

### Environment Variables
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Copy `.env.example` to `.env` and fill in your Supabase credentials.

## Styling

Dark theme inspired by Anthropic/Claude:
- Background: #1a1a1a
- Cards: colored by priority (orange, terracotta, gray-blue, green, lavender)
- Today highlight: #D97706 (orange)

## Localization

UI is in Russian:
- "Всякое" (Inbox), "Когда-нибудь" (Someday)
- Day names: "пн", "вт", "ср", "чт", "пт", "сб", "вс"
- Date format: "16 января 2026"
- Context menu: "На завтра", "+2 дня", "+1 неделя", "Удалить"
- Quick buttons: "Сегодня", "Завтра", "Всякое", "Когда-нибудь"
