# Components

All components use CSS Modules (`.module.css` files).

## Component Overview

| Component | Purpose |
|-----------|---------|
| **Layout** | Main DndContext wrapper, orchestrates all areas |
| **WeekView** | Week navigation and day columns container |
| **DayColumn** | Single day with timed/untimed zones and tasks |
| **TimeGrid** | Hour labels and gridlines for timed zone (6:00–24:00) |
| **Sidebar** | Inbox and Someday areas |
| **TaskCard** | Draggable task card with checkbox, resize handles for timed tasks |
| **TaskDialog** | Modal for editing task details including time/endTime |
| **QuickInput** | Inline text input for fast task creation |
| **ContextMenu** | Right-click menu for task actions |
| **DeleteZone** | Drop zone that appears during drag |

## Patterns

### TaskCard
- `useSortable` from dnd-kit for drag behavior
- Double-click opens TaskDialog
- Right-click opens ContextMenu
- Arrow button (→) moves task to tomorrow
- `isTimedTask` prop enables absolute positioning based on time
- Resize handles (top/bottom) for adjusting timed task duration
- Height calculated from duration (HOUR_HEIGHT = 60px per hour)
- Minimum display duration: 30 minutes

### DayColumn
- `useDroppable` on entire column div for large drop target
- Split into two zones: timedZone (70%) and untimedZone (30%)
- TimeGrid renders hour labels (6–23) with horizontal lines
- Timed tasks positioned absolutely via `timedTasks` container
- Untimed tasks use SortableContext for reordering
- Footer area is fully clickable to add new tasks
- "Завершить" (✓) button in header for today with incomplete tasks

### Layout
- Sensors configured with `distance: 8` activation constraint
- Handles all drag events (start, over, end)
- Manages editingTask state for TaskDialog
