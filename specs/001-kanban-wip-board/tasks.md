---

description: "Task list for Kanban TODO Board with WIP Limits feature"
---

# Tasks: Kanban TODO Board with WIP Limits

**Input**: Design documents from `/specs/001-kanban-wip-board/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Test-First Development is MANDATORY per TODO App Constitution Principle I. All test tasks are REQUIRED (not optional) and MUST be written before implementation.

**Organization**: Tasks are grouped by user story (US1-US4) to enable independent implementation, testing, and deployment of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and structure creation

- [ ] T001 Create project directory structure per plan.md (src/, tests/, .config/, public/, docs/)
- [ ] T002 [P] Initialize npm project with package.json and install core dev dependencies (vitest, @vitest/ui, playwright, prettier, eslint)
- [ ] T003 [P] Create npm scripts for test, test:watch, test:e2e, dev, format, lint in package.json
- [ ] T004 [P] Configure Vitest in .config/vitest.config.js with jsdom environment
- [ ] T005 [P] Configure Playwright in .config/playwright.config.js for Chrome, Firefox, Safari
- [ ] T006 Create prettier configuration (.prettierrc) with default formatting rules
- [ ] T007 Create ESLint configuration (.eslintrc.js) with ES2020+ environment
- [ ] T008 Create HTML entry point in public/index.html with meta tags, CSS links, script module tag

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core business logic and storage layer - MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Utility Foundations

- [ ] T009 [P] Implement UUID generator in src/utils/uuid.js (or use npm uuid package)
- [ ] T010 [P] Implement DOM helpers in src/utils/dom.js (query, create, addEventListener, remove helpers)
- [ ] T011 [P] Implement input validators in src/utils/validators.js (non-empty string, max length, trim)

### Storage Layer (Blocking for all stories)

- [ ] T012 Unit test: Storage.load() returns default board state on first launch (tests/unit/test-storage.js)
- [ ] T013 Unit test: Storage.save() persists board state to LocalStorage (tests/unit/test-storage.js)
- [ ] T014 Unit test: Storage handles corrupted JSON gracefully with error (tests/unit/test-storage.js)
- [ ] T015 Implement Storage service in src/services/storage.js:
  - load(): Returns board state from LocalStorage or default empty state
  - save(boardState): Persists to LocalStorage with key "kanban-board-v1"
  - Version tracking for future migrations

### Business Logic Layer (Blocking for all stories)

- [ ] T016 [P] Unit test: TodoManager.addTodo() creates TODO with correct defaults (tests/unit/test-todo-manager.js)
- [ ] T017 [P] Unit test: TodoManager.addTodo() rejects empty/whitespace-only titles (tests/unit/test-todo-manager.js)
- [ ] T018 [P] Unit test: TodoManager.getBoard() returns current state (tests/unit/test-todo-manager.js)
- [ ] T019 Unit test: TodoManager.moveTodo() changes TODO status correctly (tests/unit/test-todo-manager.js)
- [ ] T020 Implement TodoManager service in src/services/todo-manager.js:
  - addTodo(title, description): Create TODO with UUID, timestamp, position=0
  - getBoard(): Return current board state
  - moveTodo(todoId, newStatus): Move TODO and recompute positions (WIP limit check in separate service)
  - deleteTodo(todoId): Remove TODO and recompute positions
  - reorderTodo(todoId, newPosition): Reorder TODO within column
  - searchDone(query): Filter completed TODOs by category/keyword
  - setWIPLimit(newLimit): Update board WIP limit with validation
  - Auto-save to Storage after every mutation

### WIP Enforcement Layer (Blocking for US2)

- [ ] T021 [P] Unit test: WIPEnforcer.canMoveToInProgress() returns true if count < limit (tests/unit/test-wip-enforcer.js)
- [ ] T022 [P] Unit test: WIPEnforcer.canMoveToInProgress() returns false if count >= limit (tests/unit/test-wip-enforcer.js)
- [ ] T023 Unit test: WIPEnforcer.getWIPStatus() returns count and limit (tests/unit/test-wip-enforcer.js)
- [ ] T024 Implement WIPEnforcer service in src/services/wip-enforcer.js:
  - canMoveToInProgress(board): Check if in_progress count < wipLimit
  - getWIPStatus(board): Return {count, limit, available: bool}
  - validateWIPLimit(newLimit, currentCount): Ensure limit > 0 and >= current count

### Category Detection Layer (Blocking for US4)

- [ ] T025 [P] Unit test: CategoryDetector.detect("Fix bug in auth") returns "bug" (tests/unit/test-category-detector.js)
- [ ] T026 [P] Unit test: CategoryDetector.detect() case-insensitive matching (tests/unit/test-category-detector.js)
- [ ] T027 Unit test: CategoryDetector.detect() returns "Other" for unmatched titles (tests/unit/test-category-detector.js)
- [ ] T028 Implement CategoryDetector service in src/services/category-detector.js:
  - Keyword patterns: "bug", "fix", "feature", "docs", "refactor", "design", "test", "performance"
  - detect(title): Return matched category or "Other"
  - Case-insensitive matching
  - Extensible pattern list

### App Configuration

- [ ] T029 Create src/config.js with constants:
  - WIP_LIMIT_DEFAULT = 3
  - STORAGE_KEY = "kanban-board-v1"
  - STORAGE_VERSION = "1.0.0"
  - MAX_TITLE_LENGTH = 255
  - MAX_DESCRIPTION_LENGTH = 5000

### Application Initialization

- [ ] T030 Integration test: Full app startup loads state from storage and initializes (tests/integration/test-persistence.js)
- [ ] T031 Implement src/index.js:
  - Load Storage service
  - Load TodoManager service
  - Load board state on startup
  - Setup event listeners for user story components
  - Initialize kanban-board Web Component with data

**Checkpoint**: Foundation complete - all tests passing, app can load/save state

---

## Phase 3: User Story 1 - Create and Prioritize TODOs (Priority: P1) 🎯 MVP

**Goal**: Allow users to add TODOs to an unlimited backlog and reorder by priority. Foundation for the entire kanban board.

**Independent Test**: User can add 10 TODOs, reorder them, and they persist after page refresh. Backlog has no WIP restrictions.

### Tests for User Story 1

- [ ] T032 [P] [US1] Integration test: Add TODO appears at top of backlog (tests/integration/test-board-operations.js)
- [ ] T033 [P] [US1] Integration test: Multiple TODOs maintain order in backlog (tests/integration/test-board-operations.js)
- [ ] T034 [P] [US1] Integration test: Reorder TODOs via position update and verify persistence (tests/integration/test-board-operations.js)
- [ ] T035 [US1] E2E test: User adds 5 TODOs and sees them in backlog without WIP limit (tests/e2e/test-user-workflow.js)
- [ ] T036 [US1] E2E test: User reorders TODOs via drag-and-drop and refreshes browser (tests/e2e/test-user-workflow.js)

### Web Components for User Story 1

- [ ] T037 [P] [US1] Unit test: KanbanBoard component renders three columns (tests/unit/test-kanban-board.js)
- [ ] T038 [P] [US1] Unit test: TodoColumn component displays all TODOs (tests/unit/test-kanban-board.js)
- [ ] T039 [US1] Implement KanbanBoard Web Component in src/components/kanban-board.js:
  - Root component managing board state and event orchestration
  - Register custom events: todo-added, todo-moved, todo-deleted, todo-reordered
  - Listen for drag-drop, column drop events
  - Update view when data changes
  - No shadow DOM (app-level styling)

- [ ] T040 [P] [US1] Implement TodoColumn Web Component in src/components/todo-column.js:
  - Display column title and item count
  - Render todo-card children for each TODO in column
  - Accept drag-drop targets
  - Emit drop event with source/target info
  - Shadow DOM for style encapsulation
  - CSS variables for column width (Backlog 60%, InProgress 25%, Done 15% initially)

- [ ] T041 [P] [US1] Implement TodoCard Web Component in src/components/todo-card.js:
  - Draggable card with todo title + optional description preview
  - Show category badge (if set)
  - Delete button with confirmation
  - Emit dragstart/dragend events
  - Shadow DOM for style encapsulation

- [ ] T042 [P] [US1] Implement InputSection Web Component in src/components/input-section.js:
  - Text input field for new TODO title
  - Optional description textarea (collapsed by default)
  - Add button
  - Emit todo-create event with title, description
  - Clear input after submission
  - Validation: reject empty titles
  - Shadow DOM for style encapsulation

### Styling for User Story 1

- [ ] T043 [P] [US1] Create src/styles/main.css:
  - CSS Grid layout: 3 columns (Backlog larger, InProgress smaller, Done medium)
  - Flexible column widths via CSS variables
  - Card styling: rounded corners, shadow, padding
  - Input area styling: prominent, easy to focus
  - Responsive grid breakpoints (desktop only for MVP)

- [ ] T044 [P] [US1] Create src/styles/theme.css:
  - Color scheme: Light background, dark text, accent colors
  - Typography: Sans-serif, readable sizes (16px base)
  - Category badge colors: bug=red, feature=green, docs=blue, etc.
  - Column headers: bold, larger font

- [ ] T045 [P] [US1] Create src/styles/animations.css:
  - Drag-and-drop visual feedback (opacity, shadow)
  - Smooth transitions for card moves (0.2s)
  - Button hover effects

### Integration for User Story 1

- [ ] T046 [US1] Wire InputSection to KanbanBoard:
  - Listen for todo-create event from InputSection
  - Call todoManager.addTodo()
  - Update kanban-board data and re-render

- [ ] T047 [US1] Wire drag-reorder in TodoColumn:
  - Implement HTML5 drag-and-drop for cards within same column
  - Call todoManager.reorderTodo() on drop
  - Update positions and re-render

- [ ] T048 [US1] Wire TodoCard delete:
  - Listen for delete-todo event from TodoCard
  - Show confirmation dialog
  - Call todoManager.deleteTodo()
  - Re-render

- [ ] T049 [US1] Integration test: Full backlog workflow (create→reorder→delete) (tests/integration/test-board-operations.js)

**Checkpoint**: User Story 1 complete - backlog fully functional, all tests passing, app can be used for capture + prioritization only

---

## Phase 4: User Story 2 - Enforce WIP Limits (Priority: P1)

**Goal**: Limit "In Progress" column to 3 items max. Prevent users from taking on too many tasks at once.

**Independent Test**: Fill In Progress to 3 items, attempt 4th → blocked with "WIP limit reached" message. Complete 1 item → can now add 1 more.

### Tests for User Story 2

- [ ] T050 [P] [US2] Unit test: Cannot move to in_progress if WIP limit reached (tests/unit/test-wip-enforcement.js)
- [ ] T051 [P] [US2] Unit test: Can move to in_progress if count < limit (tests/unit/test-wip-enforcement.js)
- [ ] T052 [US2] Integration test: WIP limit block prevents moves (tests/integration/test-wip-enforcement.js)
- [ ] T053 [US2] Integration test: Completing task allows next move (tests/integration/test-wip-enforcement.js)
- [ ] T054 [US2] E2E test: Full WIP enforcement workflow (tests/e2e/test-user-workflow.js)

### Business Logic for User Story 2

- [ ] T055 [US2] Update TodoManager.moveTodo() to:
  - Call WIPEnforcer.canMoveToInProgress() before allowing move
  - Throw WIPLimitExceededError if blocked
  - Message: "WIP limit reached—complete a task to add more"

### UI for User Story 2

- [ ] T056 [US2] Update TodoColumn component for "in_progress":
  - Display WIP count in header: "In Progress (1/3)"
  - Add visual indicator when at limit (red border, warning icon, color change)
  - Show hover tooltip: "WIP limit reached. Complete a task to add more."
  - CSS variables: --wip-limit-color, --wip-full-color

- [ ] T057 [US2] Update drag-drop logic in KanbanBoard:
  - Prevent drag-over to in_progress column when at WIP limit
  - Show visual feedback (opacity 0.5, striped pattern) over full column
  - Show error message on attempted drop: "WIP limit reached"

- [ ] T058 [US2] Add error dialog component (or use browser alert) for WIP limit errors:
  - Clear message: "WIP limit reached—complete a task to add more"
  - Auto-dismiss after 3 seconds or on click

### Integration for User Story 2

- [ ] T059 [US2] Wire WIP limit check on move-to-in_progress:
  - Listen for drag-drop to in_progress column
  - Call WIPEnforcer.getWIPStatus()
  - Show error if at limit, or move if available

- [ ] T060 [US2] Update TodoColumn header to show WIP count dynamically

**Checkpoint**: User Story 2 complete - WIP enforcement working, users can focus on few tasks at a time

---

## Phase 5: User Story 3 - Visual Differentiation by Column Size (Priority: P1)

**Goal**: Use CSS to visually emphasize Backlog as large, In Progress as small/focused, Done as organized. Teach users about WIP philosophy through visual layout.

**Independent Test**: View empty board → Backlog column noticeably wider (60%), In Progress narrower (25%), Done medium (15%). Visual styling clearly indicates In Progress is the active area.

### Tests for User Story 3

- [ ] T061 [P] [US3] Unit test: CSS Grid columns have correct width ratios (tests/unit/test-layout.js)
- [ ] T062 [US3] E2E test: Visual layout conveys WIP philosophy (tests/e2e/test-visual-layout.js)

### Styling for User Story 3

- [ ] T063 [US3] Update src/styles/main.css with CSS Grid column widths:
  - Backlog: 60% of viewport
  - In Progress: 25% of viewport
  - Done: 15% of viewport
  - Use CSS variables for flexibility (--column-backlog-width, --column-ip-width, --column-done-width)

- [ ] T064 [P] [US3] Update src/styles/theme.css:
  - Backlog column background: light gray (#f5f5f5)
  - In Progress background: slightly brighter white (#fafafa) with emphasized border (#003da5, 3px solid)
  - In Progress box-shadow: 0 0 8px rgba(0, 61, 165, 0.2)
  - Done background: light blue (#f0f7ff)
  - Headers: Backlog normal weight, In Progress bold (600), Done normal

- [ ] T065 [P] [US3] Update src/styles/animations.css:
  - In Progress column: subtle glow animation when has items
  - Focus visual effect on hover: slight zoom (1.02x)

### UI Updates for User Story 3

- [ ] T066 [US3] Update TodoColumn component:
  - In Progress column header: Bold, larger font, blue accent color
  - Show icon next to In Progress header (target/focus icon) to reinforce active area
  - Show Backlog header: "Backlog (N items)" - emphasizes capacity
  - Show Done header with category count: "Done (3 categories)"

- [ ] T067 [US3] Update src/components/kanban-board.js layout:
  - Ensure 3-column CSS Grid is applied
  - Add visual separators between columns (vertical lines)
  - Responsive adjustments (hide Done on mobile - P2)

**Checkpoint**: User Story 3 complete - Visual hierarchy teaches WIP philosophy at a glance

---

## Phase 6: User Story 4 - Complete and Categorize TODOs (Priority: P2)

**Goal**: Auto-categorize completed TODOs by topic. Group Done section by category. Add search to find completed work. Done becomes a knowledge base.

**Independent Test**: Complete 5 TODOs with different topics (bugs, features, docs). Done section shows them grouped by category. User can search "bug" and find all completed bugs.

### Tests for User Story 4

- [ ] T068 [P] [US4] Unit test: Category detection assigns correct categories (tests/unit/test-category-detector.js)
- [ ] T069 [P] [US4] Unit test: Search filters Done TODOs by category (tests/unit/test-todo-manager.js)
- [ ] T070 [US4] Integration test: Moving to Done auto-detects category (tests/integration/test-board-operations.js)
- [ ] T071 [US4] Integration test: Done section groups by category (tests/integration/test-board-operations.js)
- [ ] T072 [US4] E2E test: Full workflow: add→move→complete→categorize→search (tests/e2e/test-user-workflow.js)

### Business Logic for User Story 4

- [ ] T073 [US4] Update TodoManager.moveTodo() to detect category on move to "done":
  - Call CategoryDetector.detect(todo.title)
  - Set todo.category on completion
  - Update board.categories count

- [ ] T074 [P] [US4] Implement search logic in TodoManager.searchDone():
  - Filter done TODOs by category name (case-insensitive)
  - Or filter by keyword in title/description
  - Return array of matching TODOs

### Web Components for User Story 4

- [ ] T075 [US4] Implement SearchFilter Web Component in src/components/search-filter.js:
  - Text input for search query
  - Real-time search as user types
  - Emit search-query event with results
  - Show result count: "Found 3 completed TODOs"
  - Shadow DOM for style encapsulation

### UI Updates for User Story 4

- [ ] T076 [P] [US4] Update TodoColumn component for "done" column:
  - Show category headings: "Bugs (2)", "Features (1)", "Docs (2)" - grouped display
  - Collapse/expand categories to manage visual clutter
  - Show total count: "Done (5 total)"

- [ ] T077 [US4] Add SearchFilter component above Done column:
  - Integrated into kanban-board layout
  - Shows on Done column only (or in Done column header)

- [ ] T078 [US4] Update TodoCard component for Done column:
  - Show category badge more prominently
  - Show completion date: "Completed 2 hours ago"
  - Optional: Show full description on hover/click

### Integration for User Story 4

- [ ] T079 [US4] Wire auto-categorization on move to Done:
  - TodoManager detects and sets category
  - Board re-renders with category grouping

- [ ] T080 [US4] Wire search in Done column:
  - Listen for search-query event from SearchFilter
  - Call todoManager.searchDone(query)
  - Filter displayed cards or highlight matches

- [ ] T081 [US4] Update KanbanBoard to organize Done by category:
  - Group todos before rendering (compute in TodoManager or KanbanBoard)
  - Render category headings
  - Collapse/expand functionality (optional state management)

**Checkpoint**: User Story 4 complete - Done section becomes searchable knowledge base. All P1 + P2 stories functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, documentation, performance, edge cases

- [ ] T082 [P] Documentation: Update docs/architecture.md with final architecture decisions
- [ ] T083 [P] Documentation: Update docs/dev-guide.md with setup instructions and development workflow
- [ ] T084 [P] Error handling: Validate all error messages are user-friendly and actionable
- [ ] T085 [P] Edge cases: Test empty board, very long titles, 1000+ TODOs, rapid interactions
- [ ] T086 [P] Performance: Profile app with 100/500/1000 TODOs, optimize if needed (e.g., virtualization)
- [ ] T087 [P] Accessibility: Verify ARIA labels, keyboard navigation (Tab, Enter, Delete keys)
- [ ] T088 [P] Browser compatibility: Test on Chrome, Firefox, Safari, Edge (modern versions)
- [ ] T089 [P] Additional unit tests: Edge cases, error paths, boundary conditions
- [ ] T090 Run quickstart.md validation: Follow setup guide and verify all steps work
- [ ] T091 Security: Verify no sensitive data in localStorage, no XSS vulnerabilities, input sanitization
- [ ] T092 Code cleanup: Remove console.log, unused variables, format with prettier, lint with eslint
- [ ] T093 Performance optimization: Bundle size check (~500KB target), lazy load if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - **BLOCKS all user stories**
- **User Stories (Phases 3-6)**: All depend on Foundational completion
  - US1, US2, US3 are P1 and can run in parallel (if staffed)
  - US4 is P2 and can start after any P1 or independently after Foundational
- **Polish (Phase N)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories (independent)
- **User Story 2 (P1)**: No dependency on US1 (independent) but works best after US1
- **User Story 3 (P1)**: No dependency on US1/US2 (independent visual layout)
- **User Story 4 (P2)**: No dependency on US1/US2/US3 (independent but enhances Done column)

### Within Each User Story

- Tests MUST be written FIRST and verified to FAIL before implementation
- Models before services
- Services before components
- Components before integration
- Story complete and independently testable before moving to next

### Parallel Opportunities

**Phase 1 Setup** (after T008):
- T009, T010, T011: Utilities (independent files)
- T002, T003, T004, T005, T006, T007: Config/setup (independent)

**Phase 2 Foundational** (after T008):
- T009-T011: All utilities in parallel
- T012-T015: Storage tests + implementation (sequential: tests then impl)
- T016-T020: TodoManager tests + implementation (sequential)
- T021-T024: WIPEnforcer tests + implementation (sequential, independent from storage/manager)
- T025-T028: CategoryDetector tests + implementation (sequential, independent)

**Phase 3 User Story 1** (after Foundational complete):
- T037-T038: Tests for components (parallel)
- T039-T042: Component implementations (can run parallel - different files)
- T043-T045: Styling (all parallel - independent CSS files)
- T046-T049: Integration (sequential - builds on components)

**Phase 4 User Story 2** (after Foundational complete, can run parallel with US1/US3):
- T050-T051: Tests (parallel)
- T055: TodoManager update (sequential - depends on US1 TodoManager implementation)
- T056-T057: UI updates (parallel)
- T059-T060: Integration (sequential)

**Phase 5 User Story 3** (after Foundational complete, can run parallel with US1/US2):
- T061: Tests (single file but quick)
- T063-T065: Styling (all parallel)
- T066-T067: UI component updates (sequential - builds on US1 components)

**Phase 6 User Story 4** (after Foundational complete, can run parallel with US1/US2/US3):
- T068-T069: Tests (parallel)
- T073-T074: Business logic (can be parallel if separate methods)
- T075-T078: Components & UI (can be parallel)
- T079-T081: Integration (sequential)

---

## Parallel Example: Complete Foundational Phase (Multi-Developer)

```
Developer A:
- T009 (UUID generator)
- T010 (DOM helpers)
- T012-T015 (Storage service + tests)

Developer B:
- T011 (Input validators)
- T016-T020 (TodoManager service + tests)

Developer C:
- T021-T024 (WIPEnforcer + tests)
- T025-T028 (CategoryDetector + tests)

Developer D:
- T002-T007 (npm setup, configs)
- T008 (HTML entry point)
- T029-T031 (App init)

Result: Foundational complete in parallel
```

---

## Parallel Example: User Stories 1-3 (Multi-Developer After Foundational)

```
Developer A: User Story 1
- T032-T036 (US1 tests)
- T037-T042 (US1 components)
- T043-T045 (US1 styling)
- T046-T049 (US1 integration)

Developer B: User Story 2
- T050-T054 (US2 tests)
- T055 (TodoManager WIP check)
- T056-T060 (US2 UI & integration)

Developer C: User Story 3
- T061 (US3 tests)
- T063-T065 (US3 styling)
- T066-T067 (US3 UI updates)

Result: All 3 P1 stories complete in parallel, all working independently
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T031) ← **CRITICAL GATE**
3. Complete Phase 3: User Story 1 (T032-T049)
4. **STOP and VALIDATE**:
   - [ ] User can add 10 TODOs
   - [ ] User can reorder TODOs
   - [ ] Data persists after refresh
   - [ ] All tests passing (npm test + npm run test:e2e)
5. Deploy to production (copy `src/` to HTTP server)

**MVP Functionality**: Capture + Prioritize unlimited TODOs. Sufficient for early user feedback.

### Incremental Delivery (Add Features)

1. ✅ Complete Setup + Foundational + US1 → MVP deployed
2. Add User Story 2 (WIP Limits) → Test independently → Deploy
   - Now: Enforce focus on 3 active tasks
3. Add User Story 3 (Visual Hierarchy) → Test independently → Deploy
   - Now: Visual teach-in for WIP philosophy
4. Add User Story 4 (Categorization + Search) → Test independently → Deploy
   - Now: Done section becomes knowledge base

### Parallel Team Strategy (Fastest Delivery)

With 3-4 developers:

1. Developer A: Setup + Foundational (T001-T031)
2. Once Foundational done:
   - Developer A: User Story 1 (T032-T049)
   - Developer B: User Story 2 (T050-T060)
   - Developer C: User Story 3 (T061-T067)
   - (Developer D optional: User Story 4 if available)
3. All stories complete in parallel, deliver as one release

With 1-2 developers (sequential):

1. Complete Foundational (blocker)
2. User Story 1 → Deploy MVP
3. User Story 2 → Deploy P1 complete
4. User Story 3 → Deploy P1 complete
5. User Story 4 → Deploy P2

---

## Task Summary

| Phase | Task Count | Purpose |
|---|---|---|
| Phase 1: Setup | 8 | Project initialization |
| Phase 2: Foundational | 23 | Storage, business logic, services (BLOCKING) |
| Phase 3: User Story 1 | 18 | Capture + Prioritize TODOs (MVP) |
| Phase 4: User Story 2 | 11 | WIP Limit Enforcement |
| Phase 5: User Story 3 | 7 | Visual Differentiation |
| Phase 6: User Story 4 | 14 | Categorization + Search (P2) |
| Phase N: Polish | 12 | Documentation, optimization, edge cases |
| **TOTAL** | **93** | Full feature implementation |

### By User Story

- **User Story 1 (MVP)**: 18 tasks - Can be deployed independently
- **User Story 2 (WIP)**: 11 tasks - Can be deployed independently
- **User Story 3 (Visual)**: 7 tasks - Can be deployed independently
- **User Story 4 (Search)**: 14 tasks - Can be deployed independently

### By Developer Capacity

- **Solo (sequential)**: 93 tasks over ~4-5 weeks (assuming 2-3 tasks per day)
- **2 developers**: ~3 weeks (Phase 1-2 sequential, Phases 3-6 possible parallelization)
- **3-4 developers**: ~2-3 weeks (full parallelization after Foundational)

---

## Notes

- [P] tasks = different files, no dependencies - CAN run in parallel
- [Story] label = US1/US2/US3/US4 maps to specific user story
- Each user story MUST be independently completable and testable
- **TEST-FIRST MANDATORY**: Every task includes "test first" checkpoint per Constitution Principle I
- Verify tests FAIL before implementing (red-green-refactor cycle)
- Commit after each logical group or per story
- Stop at any **Checkpoint** to validate story independently
- All paths are relative to repository root
- Use `npm test -- --watch` during development for instant feedback
- Use `npm run test:e2e` to verify user workflows before deployment

---

**Status**: ✅ Task List Complete - Ready for Implementation

**Recommended Next Step**: Start Phase 1 Setup (T001-T008), then Phase 2 Foundational (T009-T031) before beginning user story work
