# Components

All components use CSS Modules (`.module.css` files).

## Component Overview

| Component | Purpose |
|-----------|---------|
| **Layout** | Main DndContext wrapper, orchestrates all areas |
| **WeekView** | Week navigation and day columns container |
| **DayColumn** | Single day with scrollable task list |
| **Sidebar** | Inbox and Someday areas |
| **TaskCard** | Draggable task card with checkbox |
| **TaskDialog** | Modal for editing task details |
| **TaskCreateDialog** | Modal for creating new tasks |
| **RichTextEditor** | Tiptap WYSIWYG editor for description |
| **CalendarPicker** | Date picker modal using react-day-picker |
| **QuickInput** | Inline text input for fast task creation |
| **ContextMenu** | Right-click menu for task actions |
| **DeleteZone** | Drop zone that appears during drag |

## Patterns

### TaskCard
- `useSortable` from dnd-kit for drag behavior
- Double-click opens TaskDialog
- Right-click opens ContextMenu
- Arrow button (→) moves task to tomorrow

### DayColumn
- `useDroppable` on entire column div for large drop target
- Single scrollable task list with SortableContext for reordering
- Footer area is fully clickable to add new tasks
- "Завершить" (✓) button in header for today with incomplete tasks

### Layout
- Sensors configured with `distance: 8` activation constraint
- Handles all drag events (start, over, end)
- Manages editingTask state for TaskDialog

### RichTextEditor
- Wraps Tiptap editor with StarterKit + Placeholder + Link + Underline extensions
- Toolbar: Bold, Italic, Underline, Strike | Code, Blockquote, Link | bullet list, numbered list
- Returns HTML string; handles empty content normalization
- Link insertion via prompt dialog

### CalendarPicker
- Modal with react-day-picker for date selection
- Russian locale, styled for dark theme with blur backdrop
- Larger cells (44px), dot indicator under today's date
- Used in WeekView header (left corner) for quick week navigation

### TaskDialog / TaskCreateDialog
- Width: 720px for comfortable editing
- Quick buttons: "Сегодня", "Завтра", "Всякое", "Когда-нибудь"
- Area buttons clear date and set target area (inbox/someday)
- Custom pastel terracotta checkbox styling (TaskDialog only)
