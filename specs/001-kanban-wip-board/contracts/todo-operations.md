# API Contracts: TODO Operations

**Service**: `TodoManager` (Business Logic Service)
**Location**: `src/services/todo-manager.js`
**Type**: Internal service (called by UI components; not HTTP API)

## Contract 1: Add TODO

**Function**: `addTodo(title: string, description?: string): TODO`

**Input**:
```javascript
{
  title: string,          // Required, 1-255 chars, non-empty after trim
  description?: string    // Optional, max 5000 chars
}
```

**Output**:
```javascript
{
  id: "uuid-string",
  title: "trimmed title",
  description: "description or null",
  status: "backlog",
  category: null,
  position: 0,            // Always added to top of backlog
  createdAt: "2026-01-09T10:00:00Z",
  completedAt: null,
  tags: []
}
```

**Error Cases**:
- `EmptyTitleError`: If title is empty or whitespace-only
- `TitleTooLongError`: If title exceeds 255 chars

**Test Contract**:
```javascript
test("addTodo should create TODO with correct defaults", () => {
  const result = todoManager.addTodo("Fix bug in auth");
  assert.equal(result.status, "backlog");
  assert.equal(result.position, 0);
  assert.isNull(result.category);
  assert.isNull(result.completedAt);
});

test("addTodo should reject empty title", () => {
  expect(() => todoManager.addTodo("")).toThrow(EmptyTitleError);
  expect(() => todoManager.addTodo("   ")).toThrow(EmptyTitleError);
});
```

---

## Contract 2: Move TODO Between Columns

**Function**: `moveTodo(todoId: string, newStatus: "backlog" | "in_progress" | "done"): TODO`

**Input**:
```javascript
{
  todoId: string,         // UUID of TODO to move
  newStatus: string       // Target column
}
```

**Output**:
```javascript
{
  ...existingTODO,
  status: newStatus,
  position: 0,            // Moved to top of new column
  completedAt: newStatus === "done" ? <timestamp> : null
}
```

**Error Cases**:
- `TodoNotFoundError`: If todoId doesn't exist
- `WIPLimitExceededError`: If moving to "in_progress" and WIP limit already reached
- `InvalidStatusError`: If newStatus is not a valid status

**Side Effects**:
- When moving to "done": Automatically detect and assign category
- Reorder: Recompute positions in original and target columns

**Test Contract**:
```javascript
test("moveTodo should block move to in_progress if WIP limit reached", () => {
  // Setup: 3 TODOs already in "in_progress" (at limit of 3)
  expect(() => todoManager.moveTodo(newTodoId, "in_progress"))
    .toThrow(WIPLimitExceededError);
});

test("moveTodo to done should set completedAt and detect category", () => {
  const result = todoManager.moveTodo(todoId, "done");
  assert.isNotNull(result.completedAt);
  assert.isNotNull(result.category);
});
```

---

## Contract 3: Delete TODO

**Function**: `deleteTodo(todoId: string): void`

**Input**:
```javascript
{
  todoId: string          // UUID of TODO to delete
}
```

**Output**:
```javascript
// No return value; side effect is deletion from board state
```

**Error Cases**:
- `TodoNotFoundError`: If todoId doesn't exist

**Side Effects**:
- Removes TODO from board permanently
- Recomputes positions in affected column

**Test Contract**:
```javascript
test("deleteTodo should remove TODO from board", () => {
  const initialCount = todoManager.getBoard().todos.length;
  todoManager.deleteTodo(todoId);
  const afterCount = todoManager.getBoard().todos.length;
  assert.equal(afterCount, initialCount - 1);
});

test("deleteTodo should throw if TODO not found", () => {
  expect(() => todoManager.deleteTodo("invalid-id"))
    .toThrow(TodoNotFoundError);
});
```

---

## Contract 4: Reorder TODOs Within Column

**Function**: `reorderTodo(todoId: string, newPosition: number): TODO`

**Input**:
```javascript
{
  todoId: string,         // UUID of TODO to move
  newPosition: number     // New position within column (0-based)
}
```

**Output**:
```javascript
{
  ...existingTODO,
  position: newPosition
}
```

**Error Cases**:
- `TodoNotFoundError`: If todoId doesn't exist
- `InvalidPositionError`: If newPosition is out of bounds

**Test Contract**:
```javascript
test("reorderTodo should update position correctly", () => {
  // Setup: 5 TODOs in backlog at positions 0-4
  const result = todoManager.reorderTodo(todoId, 2);
  assert.equal(result.position, 2);

  // Verify other TODOs shifted correctly
  const backlog = todoManager.getBoard().todos.filter(t => t.status === "backlog");
  const positions = backlog.map(t => t.position).sort((a, b) => a - b);
  assert.deepEqual(positions, [0, 1, 2, 3, 4]);
});
```

---

## Contract 5: Get Board State

**Function**: `getBoard(): BoardState`

**Input**: None

**Output**:
```javascript
{
  version: "1.0.0",
  todos: [{ ...TODO }, ...],
  wipLimit: 3,
  categories: { ...categories },
  lastModified: "2026-01-09T10:00:00Z"
}
```

**Error Cases**: None

**Test Contract**:
```javascript
test("getBoard should return current state", () => {
  const board = todoManager.getBoard();
  assert.isArray(board.todos);
  assert.equal(board.wipLimit, 3);
  assert.isObject(board.categories);
});
```

---

## Contract 6: Search Done TODOs by Category

**Function**: `searchDone(query: string): TODO[]`

**Input**:
```javascript
{
  query: string           // Category name or keyword (case-insensitive)
}
```

**Output**:
```javascript
[
  { ...TODO (status: "done"), ...},
  ...
]
```

**Behavior**:
- Case-insensitive matching on category name or TODO title
- Returns only TODOs with status = "done"
- Empty query returns all done TODOs

**Test Contract**:
```javascript
test("searchDone should find TODOs by category", () => {
  const bugTodos = todoManager.searchDone("bug");
  assert.all(bugTodos, t => t.category === "bug");
});

test("searchDone should be case-insensitive", () => {
  const result1 = todoManager.searchDone("BUG");
  const result2 = todoManager.searchDone("bug");
  assert.deepEqual(result1, result2);
});
```

---

## Contract 7: Set WIP Limit

**Function**: `setWIPLimit(newLimit: number): void`

**Input**:
```javascript
{
  newLimit: number        // New WIP limit (must be > 0)
}
```

**Output**: None (side effect: updates board state)

**Error Cases**:
- `InvalidWIPLimitError`: If newLimit ≤ 0
- `WIPLimitTooLowError`: If newLimit < current in-progress count

**Test Contract**:
```javascript
test("setWIPLimit should validate positive number", () => {
  expect(() => todoManager.setWIPLimit(0))
    .toThrow(InvalidWIPLimitError);
  expect(() => todoManager.setWIPLimit(-1))
    .toThrow(InvalidWIPLimitError);
});

test("setWIPLimit should prevent lowering limit below current count", () => {
  // Setup: 3 TODOs in "in_progress"
  expect(() => todoManager.setWIPLimit(2))
    .toThrow(WIPLimitTooLowError);
});
```

---

## Summary of Contracts

| Operation | Input | Output | Key Validation |
|---|---|---|---|
| addTodo | title, description? | TODO | Non-empty title, max lengths |
| moveTodo | todoId, newStatus | TODO | WIP limit enforcement, valid status |
| deleteTodo | todoId | void | TODO exists |
| reorderTodo | todoId, newPosition | TODO | Position in bounds |
| getBoard | (none) | BoardState | (none) |
| searchDone | query | TODO[] | Case-insensitive match |
| setWIPLimit | newLimit | void | Limit > 0, >= current count |

---

**Status**: ✅ API Contracts Defined - Ready for Implementation Tests
