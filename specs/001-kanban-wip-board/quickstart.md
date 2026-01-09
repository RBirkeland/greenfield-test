# Quickstart Guide: Kanban TODO Board Development

**Date**: 2026-01-09
**Tech Stack**: Vanilla JavaScript + Web Components, Vitest, Playwright, LocalStorage

## Initial Setup (5 minutes)

### 1. Project Initialization

```bash
# Create project structure
mkdir -p src/{components,services,utils,styles} tests/{unit,integration,e2e} public .config

# Initialize npm
npm init -y

# Install development dependencies
npm install --save-dev \
  vitest \
  @vitest/ui \
  playwright \
  prettier \
  eslint
```

### 2. Create `package.json` Scripts

```json
{
  "scripts": {
    "dev": "http-server src/ -p 8080",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:e2e",
    "format": "prettier --write src/ tests/",
    "format:check": "prettier --check src/ tests/",
    "lint": "eslint src/ tests/"
  }
}
```

### 3. Create Entry Point

**`src/index.html`**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kanban TODO Board</title>
  <link rel="stylesheet" href="styles/main.css">
  <link rel="stylesheet" href="styles/theme.css">
  <link rel="stylesheet" href="styles/animations.css">
</head>
<body>
  <kanban-board></kanban-board>
  <script type="module" src="index.js"></script>
</body>
</html>
```

**`src/index.js`**:
```javascript
import KanbanBoard from "./components/kanban-board.js";
import TodoManager from "./services/todo-manager.js";
import Storage from "./services/storage.js";

// Register Web Components
customElements.define("kanban-board", KanbanBoard);

// Initialize app
const board = document.querySelector("kanban-board");
const storage = new Storage();
const todoManager = new TodoManager(storage);

// Load board state from storage and render
const boardState = storage.load();
board.data = boardState;

// Setup event listeners
board.addEventListener("todo-added", (e) => {
  todoManager.addTodo(e.detail.title, e.detail.description);
  board.data = storage.load();
});

board.addEventListener("todo-moved", (e) => {
  todoManager.moveTodo(e.detail.todo.id, e.detail.toStatus);
  board.data = storage.load();
});

board.addEventListener("todo-deleted", (e) => {
  todoManager.deleteTodo(e.detail.todoId);
  board.data = storage.load();
});
```

---

## First Test (10 minutes)

### Test-First Development Workflow

**Step 1**: Write a failing test for the core business logic

**`tests/unit/test-todo-manager.js`**:
```javascript
import { describe, it, beforeEach, expect } from "vitest";
import TodoManager from "../../src/services/todo-manager.js";
import Storage from "../../src/services/storage.js";

describe("TodoManager", () => {
  let todoManager;
  let storage;

  beforeEach(() => {
    // Mock storage for unit tests
    storage = {
      board: {
        version: "1.0.0",
        todos: [],
        wipLimit: 3,
        categories: {},
        lastModified: new Date().toISOString()
      },
      load: function() { return this.board; },
      save: function(board) { this.board = board; }
    };
    todoManager = new TodoManager(storage);
  });

  it("should create a TODO with default properties", () => {
    const todo = todoManager.addTodo("Fix login bug", "Users can't reset password");

    expect(todo.id).toBeDefined();
    expect(todo.title).toBe("Fix login bug");
    expect(todo.status).toBe("backlog");
    expect(todo.category).toBeNull();
    expect(todo.position).toBe(0);
    expect(todo.completedAt).toBeNull();
  });

  it("should reject empty TODO title", () => {
    expect(() => todoManager.addTodo("")).toThrow();
    expect(() => todoManager.addTodo("   ")).toThrow();
  });

  it("should block move to in_progress if WIP limit reached", () => {
    // Setup: Add 3 TODOs to in_progress
    for (let i = 0; i < 3; i++) {
      const todo = todoManager.addTodo(`Task ${i}`);
      todoManager.moveTodo(todo.id, "in_progress");
    }

    // Add a new TODO to backlog
    const newTodo = todoManager.addTodo("New task");

    // Try to move it to in_progress (should fail)
    expect(() => todoManager.moveTodo(newTodo.id, "in_progress"))
      .toThrow("WIP limit reached");
  });

  it("should detect category when moving to done", () => {
    const todo = todoManager.addTodo("Fix bug in auth system");
    todoManager.moveTodo(todo.id, "done");

    const board = storage.load();
    const completedTodo = board.todos.find(t => t.id === todo.id);
    expect(completedTodo.category).toBe("bug");
  });
});
```

### Step 2: Run test (should fail)

```bash
npm test
# FAIL: Test fails with "TodoManager is not defined"
```

### Step 3: Implement to make test pass

**`src/services/todo-manager.js`**:
```javascript
import { v4 as uuid } from "uuid"; // Or implement simple UUID generator
import CategoryDetector from "./category-detector.js";

class TodoManager {
  constructor(storage) {
    this.storage = storage;
    this.categoryDetector = new CategoryDetector();
  }

  addTodo(title, description = null) {
    if (!title || title.trim() === "") {
      throw new Error("Title cannot be empty");
    }

    const todo = {
      id: uuid(),
      title: title.trim(),
      description: description?.trim() || null,
      status: "backlog",
      category: null,
      position: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      tags: []
    };

    const board = this.storage.load();
    board.todos.unshift(todo); // Add to top
    this.storage.save(board);
    return todo;
  }

  moveTodo(todoId, newStatus) {
    const board = this.storage.load();
    const todo = board.todos.find(t => t.id === todoId);

    if (!todo) throw new Error("TODO not found");
    if (!["backlog", "in_progress", "done"].includes(newStatus)) {
      throw new Error("Invalid status");
    }

    // Check WIP limit
    if (newStatus === "in_progress") {
      const inProgressCount = board.todos.filter(t => t.status === "in_progress").length;
      if (inProgressCount >= board.wipLimit) {
        throw new Error("WIP limit reached");
      }
    }

    // Move to new column
    todo.status = newStatus;
    todo.position = 0; // Move to top of new column

    // If moving to done, detect category and set completedAt
    if (newStatus === "done") {
      todo.completedAt = new Date().toISOString();
      todo.category = this.categoryDetector.detect(todo.title);
    }

    this.storage.save(board);
    return todo;
  }

  getBoard() {
    return this.storage.load();
  }
}

export default TodoManager;
```

### Step 4: Run test (should pass)

```bash
npm test
# PASS: All tests pass
```

---

## Running the App Locally

### Start Development Server

```bash
# Terminal 1: Run tests in watch mode
npm run test:watch

# Terminal 2: Serve the app
npm run dev
```

### Navigate to App

```
http://localhost:8080
```

### Verify Functionality

1. **Add TODO**: Type in input field, click "Add"
2. **Drag to In Progress**: Drag TODO card to In Progress column (max 3)
3. **Block on WIP**: Try dragging 4th TODO to In Progress → see "WIP limit reached" message
4. **Complete TODO**: Drag TODO to Done → verify it's categorized by topic
5. **Refresh Browser**: Verify all TODOs persist (stored in LocalStorage)

---

## Next Steps: Run E2E Tests

### Create E2E Test

**`tests/e2e/test-user-workflow.js`**:
```javascript
import { test, expect } from "@playwright/test";

test("User can add and move TODOs with WIP enforcement", async ({ page }) => {
  await page.goto("http://localhost:8080");

  // Add 3 TODOs
  for (let i = 1; i <= 3; i++) {
    await page.fill("input[type='text']", `Task ${i}`);
    await page.click("button:has-text('Add')");
  }

  // Verify backlog has 3 TODOs
  let backlogCards = await page.locator("todo-column[status='backlog'] todo-card");
  await expect(backlogCards).toHaveCount(3);

  // Drag first TODO to In Progress
  const card1 = backlogCards.first();
  const inProgressColumn = page.locator("todo-column[status='in_progress']");
  await card1.dragTo(inProgressColumn);

  // Verify it moved
  let ipCards = await page.locator("todo-column[status='in_progress'] todo-card");
  await expect(ipCards).toHaveCount(1);

  // Fill In Progress to WIP limit (3)
  await card1.dragTo(inProgressColumn.next()); // Drag back to backlog
  // ... (continue adding more) ...

  // Try to exceed WIP limit → should be blocked
  // ... (verify error message appears) ...
});
```

### Run E2E Test

```bash
npm run test:e2e
```

---

## Project Structure Quick Reference

```
src/
├── index.html                           # Entry point
├── index.js                             # App initialization
├── config.js                            # Constants (WIP_LIMIT, etc.)
│
├── components/
│   ├── kanban-board.js                  # Root Web Component
│   ├── todo-column.js                   # Column container
│   ├── todo-card.js                     # Individual TODO card
│   ├── input-section.js                 # TODO input area
│   └── search-filter.js                 # Done section search
│
├── services/
│   ├── storage.js                       # LocalStorage wrapper
│   ├── todo-manager.js                  # Business logic
│   ├── wip-enforcer.js                  # WIP limit validation
│   └── category-detector.js             # Auto-categorize completed TODOs
│
├── utils/
│   ├── dom.js                           # DOM helpers
│   ├── uuid.js                          # ID generation (or use npm uuid)
│   └── validators.js                    # Input validation
│
├── styles/
│   ├── main.css                         # Layout + grid
│   ├── theme.css                        # Colors + typography
│   └── animations.css                   # Transitions + drag effects

tests/
├── unit/
│   ├── test-storage.js
│   ├── test-todo-manager.js
│   ├── test-wip-enforcer.js
│   └── test-category-detector.js
│
├── integration/
│   ├── test-board-operations.js
│   ├── test-persistence.js
│   └── test-wip-enforcement.js
│
└── e2e/
    ├── test-user-workflow.js
    └── test-visual-layout.js
```

---

## Development Checklist

- [ ] Setup project structure and npm scripts
- [ ] Create HTML entry point and styling skeleton
- [ ] Write first unit test for TodoManager
- [ ] Implement TodoManager to pass tests
- [ ] Create Storage service for LocalStorage
- [ ] Build Web Components (kanban-board, todo-column, todo-card, input-section)
- [ ] Test component communication and events
- [ ] Implement drag-and-drop between columns
- [ ] Add WIP limit enforcement visual feedback
- [ ] Implement category detection for Done TODOs
- [ ] Add search/filter for Done column
- [ ] Write integration tests
- [ ] Write E2E tests with Playwright
- [ ] Verify data persists across page refresh
- [ ] Test all edge cases (empty input, WIP limit, long text, etc.)
- [ ] Performance testing (50, 100, 500, 1000 TODOs)

---

**Status**: ✅ Quickstart Complete - Ready to Begin Implementation

**Next Command**: `/speckit.tasks` to generate detailed implementation task list
