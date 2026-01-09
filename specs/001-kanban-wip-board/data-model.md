# Data Model: Kanban TODO Board

**Phase**: 1 - Design & Contracts
**Date**: 2026-01-09

## Core Entities

### TODO

Represents a single work item in the kanban board.

```javascript
{
  id: string,                    // UUID, unique identifier
  title: string,                 // Required, 1-255 chars, non-empty
  description: string,           // Optional, user notes (plain text)
  status: "backlog" | "in_progress" | "done",  // Current column
  category: string | null,       // Inferred topic/tag (e.g., "bug", "feature", "docs")
  position: number,              // Order within column (0-based, sequential)
  createdAt: ISO8601 timestamp,  // When TODO was created
  completedAt: ISO8601 timestamp | null,  // When moved to Done (null while in progress)
  tags: string[],                // User-assigned tags (P2 feature)
}
```

**Validation Rules**:
- `id`: Must be UUID v4 format
- `title`: Minimum 1 character; maximum 255 characters; no leading/trailing whitespace
- `status`: Must be one of three valid statuses
- `position`: Non-negative integer; automatically computed based on column order
- `description`: Maximum 5000 characters (reasonable limit for complex notes)
- `category`: Auto-detected from title during completion; user-assignable

**State Transitions**:
```
backlog → in_progress → done
  ↑           ↓
  └───────────┘ (can move back to backlog if needed)

Notes:
- Backlog → In Progress: Blocked if WIP limit reached (see WIP Enforcer)
- In Progress → Done: Triggers category detection
- Done → In Progress: Allowed (resurrect a completed task)
```

### Board State

Represents the application's persistent state (all TODOs + configuration).

```javascript
{
  version: string,               // Schema version (e.g., "1.0.0")
  todos: TODO[],                 // Array of all TODOs
  wipLimit: number,              // WIP limit per column (default: 3)
  categories: {
    [categoryName]: {
      label: string,             // Display name
      count: number,             // TODO count in this category
      createdAt: ISO8601 timestamp
    }
  },
  lastModified: ISO8601 timestamp,  // For conflict detection (future multi-device sync)
}
```

**Example Full State**:
```javascript
{
  version: "1.0.0",
  wipLimit: 3,
  todos: [
    {
      id: "uuid-001",
      title: "Fix login bug",
      description: "Users can't reset password",
      status: "in_progress",
      category: "bug",
      position: 0,
      createdAt: "2026-01-09T10:00:00Z",
      completedAt: null,
      tags: ["urgent"]
    },
    {
      id: "uuid-002",
      title: "Update README",
      description: null,
      status: "done",
      category: "docs",
      position: 0,
      createdAt: "2026-01-09T09:00:00Z",
      completedAt: "2026-01-09T11:30:00Z",
      tags: []
    }
  ],
  categories: {
    "bug": {
      label: "Bugs",
      count: 2,
      createdAt: "2026-01-08T15:00:00Z"
    },
    "docs": {
      label: "Documentation",
      count: 1,
      createdAt: "2026-01-08T15:00:00Z"
    }
  },
  lastModified: "2026-01-09T11:30:00Z"
}
```

## Relationships & Constraints

| Relationship | Details |
|---|---|
| Board → TODOs | One-to-many: Board contains multiple TODOs |
| TODO → Category | Many-to-one: Multiple TODOs share one category |
| Status → Position | TODOs ordered within each status column independently |
| WIP Limit → In Progress | Hard constraint: In Progress column ≤ wipLimit TODOs |

## Storage Format

### LocalStorage Key

```javascript
localStorage.key = "kanban-board-v1"
localStorage.value = JSON.stringify(BoardState)
```

**Persistence Guarantees**:
- Automatic save after every state mutation (add, move, complete, delete)
- Version key enables schema migrations (e.g., `kanban-v1` → `kanban-v2`)
- Recovery: If corrupted, user can reset to empty board

### Serialization

```javascript
// Save (automatic on every change)
localStorage.setItem("kanban-board-v1", JSON.stringify(boardState));

// Load (on app startup)
const boardState = JSON.parse(localStorage.getItem("kanban-board-v1") || '{}');
```

## Computed Properties (Not Stored)

These are derived from TODO array; not persisted to reduce redundancy:

- **Column Item Counts**: Number of TODOs in each status
- **WIP Status**: "Available" (count < limit), "Full" (count = limit)
- **Category Counts**: Computed from TODOs with matching category

```javascript
// Examples (computed on-demand in services)
const backlogCount = todos.filter(t => t.status === "backlog").length;
const inProgressCount = todos.filter(t => t.status === "in_progress").length;
const wipAvailable = inProgressCount < wipLimit;
const bugTodos = todos.filter(t => t.category === "bug");
```

## Migration Path (Future)

If schema changes in Phase 2 (e.g., add collaboration, tags, due dates):

```javascript
// Version 1.0.0 (current)
{ version: "1.0.0", todos: [...], wipLimit: 3, categories: {...} }

// Version 2.0.0 (hypothetical - add collaborators field)
{
  version: "2.0.0",
  todos: [
    { ...existingFields, collaborators: [] }  // New field
  ],
  wipLimit: 3,
  categories: {...}
}

// Migration function
function migrateV1toV2(stateV1) {
  return {
    version: "2.0.0",
    todos: stateV1.todos.map(t => ({ ...t, collaborators: [] })),
    wipLimit: stateV1.wipLimit,
    categories: stateV1.categories
  };
}
```

## Edge Cases & Handling

| Edge Case | Handling |
|---|---|
| Empty board on startup | Initialize with empty `todos` array and default `wipLimit: 3` |
| Corrupted LocalStorage | Catch JSON parse error; reset to empty state with user notification |
| Very long TODO title | Truncate display to 50 chars in UI; store full text; show full on hover |
| Category detection fails | Assign to "Other" category; user can manually update |
| Duplicate TODO titles | Allowed (no uniqueness constraint on title, only ID) |
| Delete from Done | Permanently removes TODO (recoverable only via browser DevTools if needed) |
| Move multiple TODOs rapidly | Debounce persistence; queue operations in-memory before saving |

---

**Status**: ✅ Data Model Complete - Ready for API Contracts
