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
