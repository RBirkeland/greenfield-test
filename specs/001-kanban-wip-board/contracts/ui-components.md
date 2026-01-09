# API Contracts: UI Components (Web Components)

**Type**: Web Components (Custom HTML Elements)
**Location**: `src/components/`
**Encapsulation**: Shadow DOM for style isolation

## Component 1: `<kanban-board>`

Root component managing the entire board layout and state orchestration.

**HTML**:
```html
<kanban-board></kanban-board>
```

**Properties**:
```javascript
element.data = {
  todos: TODO[],
  wipLimit: number,
  categories: { [name: string]: Category }
}
```

**Methods**:
```javascript
element.refresh(): void              // Re-render from internal state
element.dispatch(event): void        // Dispatch custom events
```

**Events (Emitted)**:
- `todo-added`: `{ detail: { todo: TODO } }`
- `todo-moved`: `{ detail: { todo: TODO, fromStatus, toStatus } }`
- `todo-deleted`: `{ detail: { todoId: string } }`
- `todo-reordered`: `{ detail: { todo: TODO, column: status } }`
- `wip-limit-reached`: `{ detail: { message: string } }`

**Events (Listens)**:
- `todo-updated` from child components (bubbles up)

**Test Contract**:
```javascript
test("<kanban-board> should render three columns", () => {
  const board = document.createElement("kanban-board");
  board.data = mockBoardState;
  document.body.appendChild(board);

  const columns = board.querySelectorAll("todo-column");
  assert.equal(columns.length, 3);
});

test("<kanban-board> should emit todo-added when TODO created", (done) => {
  const board = document.createElement("kanban-board");
  board.addEventListener("todo-added", (e) => {
    assert.equal(e.detail.todo.title, "New TODO");
    done();
  });
  board.data = mockBoardState;
  document.body.appendChild(board);

  // User adds TODO (simulated via input component)
  const input = board.querySelector("input-section");
  input.addTodo("New TODO");
});
```

---

## Component 2: `<todo-column>`

Displays a single kanban column (Backlog, In Progress, or Done).

**HTML**:
```html
<todo-column status="backlog" title="Backlog">
  <!-- todo-card children inserted here -->
</todo-column>
```

**Properties**:
```javascript
element.status = "backlog" | "in_progress" | "done"  // Which column
element.title = string                               // Display name
element.todos = TODO[]                               // Items in column
element.wipLimit = number                            // For visual feedback
element.isOver = boolean                             // Drag-over state
```

**Methods**:
```javascript
element.addTodo(todo: TODO): void            // Append card to column
element.removeTodo(todoId: string): void     // Remove card from column
element.highlight(state: boolean): void      // Visual WIP limit indicator
```

**Events (Emitted)**:
- `drop`: `{ detail: { todoId, fromStatus, toStatus } }`
- `dragover`: `{ detail: { canAccept: boolean } }`
- `dragleave`: `{ detail: { } }`

**Styling (CSS Custom Properties)**:
```css
:host {
  --column-width: 30%;           /* Backlog larger, In Progress smaller */
  --column-gap: 1rem;
  --column-bg: #f5f5f5;
  --column-border: #ddd;
  --wip-limit-color: #ff6b6b;   /* Red when at limit */
}
```

**Test Contract**:
```javascript
test("<todo-column> should display WIP limit indicator when full", () => {
  const column = document.createElement("todo-column");
  column.status = "in_progress";
  column.todos = [
    { id: "1", title: "Task 1", status: "in_progress", position: 0 },
    { id: "2", title: "Task 2", status: "in_progress", position: 1 },
    { id: "3", title: "Task 3", status: "in_progress", position: 2 }
  ];
  column.wipLimit = 3;
  column.title = "In Progress (3/3)";
  document.body.appendChild(column);

  const header = column.shadowRoot.querySelector("h2");
  assert.include(header.textContent, "3/3");
});

test("<todo-column> should accept drop and emit event", () => {
  const column = document.createElement("todo-column");
  column.status = "in_progress";

  column.addEventListener("drop", (e) => {
    assert.equal(e.detail.fromStatus, "backlog");
    assert.equal(e.detail.toStatus, "in_progress");
  });

  const dragEvent = new DragEvent("drop", {
    dataTransfer: { getData: () => JSON.stringify({ todoId: "123", fromStatus: "backlog" }) }
  });
  column.dispatchEvent(dragEvent);
});
```

---

## Component 3: `<todo-card>`

Individual TODO item card with drag support.

**HTML**:
```html
<todo-card draggable="true">
  <span class="title">Fix login bug</span>
  <span class="category">bug</span>
</todo-card>
```

**Properties**:
```javascript
element.todo = TODO                          // Data object
element.isDragging = boolean                 // Visual feedback
element.isHighlighted = boolean              // Hover state
```

**Methods**:
```javascript
element.setTodo(todo: TODO): void            // Update displayed TODO
element.highlight(): void                   // Show focus
element.unhighlight(): void                 // Remove focus
```

**Events (Emitted)**:
- `dragstart`: `{ detail: { todo: TODO } }`
- `dragend`: `{ detail: { } }`
- `delete-todo`: `{ detail: { todoId: string } }`

**Styling**:
```css
:host {
  --card-bg: white;
  --card-border: #ddd;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
  --category-color: #007bff;  /* Varies by category */
  --dragging-opacity: 0.5;
}
```

**Test Contract**:
```javascript
test("<todo-card> should display TODO content", () => {
  const card = document.createElement("todo-card");
  card.todo = {
    id: "uuid-1",
    title: "Fix bug",
    description: "Login endpoint broken",
    category: "bug",
    status: "backlog"
  };
  document.body.appendChild(card);

  const title = card.shadowRoot.querySelector(".title");
  assert.equal(title.textContent, "Fix bug");
});

test("<todo-card> should be draggable", () => {
  const card = document.createElement("todo-card");
  card.draggable = true;
  assert.isTrue(card.isDraggable);
});

test("<todo-card> should emit delete-todo on delete button click", (done) => {
  const card = document.createElement("todo-card");
  card.todo = mockTodo;
  card.addEventListener("delete-todo", (e) => {
    assert.equal(e.detail.todoId, mockTodo.id);
    done();
  });

  const deleteBtn = card.shadowRoot.querySelector(".delete-btn");
  deleteBtn.click();
});
```

---

## Component 4: `<input-section>`

Input area for creating new TODOs in the backlog.

**HTML**:
```html
<input-section>
  <input type="text" placeholder="Add a new TODO..." />
  <button>Add</button>
</input-section>
```

**Methods**:
```javascript
element.addTodo(title: string, description?: string): void
element.clearInput(): void
```

**Events (Emitted)**:
- `todo-create`: `{ detail: { title: string, description?: string } }`

**Test Contract**:
```javascript
test("<input-section> should emit todo-create on button click", (done) => {
  const input = document.createElement("input-section");
  input.addEventListener("todo-create", (e) => {
    assert.equal(e.detail.title, "Test TODO");
    done();
  });
  document.body.appendChild(input);

  const textInput = input.shadowRoot.querySelector("input");
  textInput.value = "Test TODO";
  const btn = input.shadowRoot.querySelector("button");
  btn.click();
});

test("<input-section> should clear input after submission", () => {
  const input = document.createElement("input-section");
  document.body.appendChild(input);

  const textInput = input.shadowRoot.querySelector("input");
  textInput.value = "Test TODO";
  const btn = input.shadowRoot.querySelector("button");
  btn.click();

  assert.equal(textInput.value, "");
});
```

---

## Component 5: `<search-filter>`

Search/filter interface for the Done column.

**HTML**:
```html
<search-filter>
  <input type="search" placeholder="Search completed TODOs..." />
</search-filter>
```

**Properties**:
```javascript
element.query = string                       // Current search query
element.results = TODO[]                     // Matching TODOs
```

**Methods**:
```javascript
element.search(query: string): TODO[]        // Perform search
element.clearSearch(): void                  // Reset to show all
```

**Events (Emitted)**:
- `search-query`: `{ detail: { query: string, results: TODO[] } }`

**Test Contract**:
```javascript
test("<search-filter> should emit search-query with matching TODOs", (done) => {
  const search = document.createElement("search-filter");
  search.addEventListener("search-query", (e) => {
    assert.all(e.detail.results, t => t.category === "bug");
    done();
  });
  document.body.appendChild(search);

  const input = search.shadowRoot.querySelector("input");
  input.value = "bug";
  input.dispatchEvent(new Event("input"));
});
```

---

## Integration Test: Component Communication

**Scenario**: User adds TODO → appears in backlog → drags to In Progress → confirms WIP limit

```javascript
test("Full workflow: add→drag→WIP enforcement", async () => {
  const board = document.createElement("kanban-board");
  board.data = mockBoardState;
  document.body.appendChild(board);

  // 1. Add TODO
  const input = board.querySelector("input-section");
  input.addTodo("New task");
  await waitForEvent(board, "todo-added");

  // Verify it appears in backlog
  const backlogColumn = board.querySelector('[status="backlog"]');
  const cards = backlogColumn.querySelectorAll("todo-card");
  assert.equal(cards.length, initialCount + 1);

  // 2. Simulate drag to In Progress
  const newCard = cards[0];
  const ipColumn = board.querySelector('[status="in_progress"]');

  // (Setup: already 3 TODOs in In Progress)
  const dropEvent = new DragEvent("drop", {
    dataTransfer: { getData: () => JSON.stringify({ fromStatus: "backlog" }) }
  });

  // 3. Verify WIP limit enforcement
  board.addEventListener("wip-limit-reached", (e) => {
    assert.include(e.detail.message, "WIP limit reached");
  });

  ipColumn.dispatchEvent(dropEvent);
  await waitForEvent(board, "wip-limit-reached");
});
```

---

**Status**: ✅ UI Component Contracts Defined - Ready for Implementation
