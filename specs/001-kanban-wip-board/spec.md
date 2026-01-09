# Feature Specification: Kanban TODO Board with WIP Limits

**Feature Branch**: `001-kanban-wip-board`
**Created**: 2026-01-09
**Status**: Draft
**Input**: User description: "I want a simple TODO app allowing the user to structure their TODOs in a kanban board. It should be focusing on keeping the WIP restrictired to allow the user to focus on a few things at a time. The visual aspects should also visualise this concept, making it clear the the input part can be large but prioritised and the ongoing topics are small and focused. The done topics should be sorted into categories to be a knowledge base on what has be done but easily found back to specific TODOs based on topics later."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Create and Prioritize TODOs (Priority: P1)

A user opens the application and needs to quickly capture multiple TODO items without being overwhelmed by the interface. The app provides a dedicated input area where they can add many items in a queue format. This queue becomes the prioritized backlog—large and visible—to show all the work that needs to be done but isn't being actively worked on yet.

**Why this priority**: This is the foundation of the system. Users need a frictionless way to capture ideas and work. Without this, the entire kanban board is empty and unusable.

**Independent Test**: Can be fully tested by opening the app, adding 10 TODO items to the input area, and verifying they all appear in a prioritized queue with no WIP restrictions. The app is fully functional with just this feature—users have a capture mechanism.

**Acceptance Scenarios**:

1. **Given** the app is open with an empty TODO list, **When** user enters text in the input area and presses "Add", **Then** the new TODO appears at the top of the input/backlog section
2. **Given** multiple TODOs in the backlog, **When** user reorders them via drag-and-drop, **Then** the new priority order persists
3. **Given** a TODO in the backlog, **When** user clicks "Move to In Progress", **Then** the TODO moves to the In Progress column if WIP limit allows
4. **Given** the app has TODOs, **When** user refreshes the page, **Then** all TODOs remain in their previous state and order

---

### User Story 2 - Enforce WIP Limits (Priority: P1)

A user is actively working on a few tasks and the system prevents them from taking on too many at once. A clear visual indicator shows the In Progress column is "small and focused"—limited to a maximum number of items (e.g., 3 tasks). When the limit is reached, the user cannot add more items to In Progress, creating natural friction that encourages focus.

**Why this priority**: WIP limits are the core behavior difference from a traditional TODO list. This is fundamental to the feature's value proposition—enforcing focus.

**Independent Test**: Can be fully tested by filling the In Progress column to the limit, attempting to add one more item, and verifying it's blocked with a clear visual/message feedback. This demonstrates the app enforces focus.

**Acceptance Scenarios**:

1. **Given** the In Progress column has fewer than 3 items, **When** user moves a TODO to In Progress, **Then** it appears successfully
2. **Given** the In Progress column has 3 items (at WIP limit), **When** user tries to move another TODO to In Progress, **Then** the action is blocked with a clear message ("WIP limit reached")
3. **Given** the WIP limit is in effect, **When** user completes a task (moves to Done), **Then** they can now move one more item from backlog to In Progress
4. **Given** the In Progress column is full, **When** user hovers over the column, **Then** a visual indicator (e.g., red highlight, warning icon) shows the limit is reached

---

### User Story 3 - Visual Differentiation by Column Size (Priority: P1)

The user sees a visual layout where the Backlog/Input column is large and contains many items, the In Progress column is visibly small to reflect its limited WIP (e.g., max 3 items), and the Done column is organized for reference. The UI immediately communicates the intended workflow through relative column sizes and visual hierarchy.

**Why this priority**: The visual aspect is not cosmetic—it's a core part of the product's teaching/enforcement of focus. Without proper visual differentiation, users won't understand the WIP philosophy.

**Independent Test**: Can be fully tested by viewing the kanban board and confirming the Backlog column is noticeably larger, In Progress is small, and Done is well-organized. A non-technical observer should understand the workflow from the visual layout alone.

**Acceptance Scenarios**:

1. **Given** the app is open with a populated kanban board, **When** user views the screen, **Then** the Backlog column visibly occupies more horizontal space than In Progress
2. **Given** multiple completed TODOs in the Done column, **When** user views the Done section, **Then** items are grouped by category/topic for easy discovery
3. **Given** an empty In Progress column, **When** user views the board, **Then** visual styling clearly indicates it's a "focused work area" (e.g., emphasized border, distinct background)
4. **Given** the Backlog has many items and In Progress is full, **When** user views the board, **Then** the visual hierarchy emphasizes In Progress as the "active area"

---

### User Story 4 - Complete and Categorize TODOs (Priority: P2)

A user completes a task and moves it to Done. Rather than being a flat list, Done items are automatically organized by topic/category (inferred from the task description or set explicitly by the user). The Done section becomes a searchable knowledge base where users can easily find completed work by topic, browse what's been accomplished, and rediscover solutions to similar problems.

**Why this priority**: This transforms Done from a graveyard into a useful reference. It's valuable but not blocking—P1 features work without it. However, it's a key differentiator for long-term use.

**Independent Test**: Can be fully tested by completing 5 TODOs with different topics (e.g., "Fix bug in auth", "Update docs", "Fix bug in auth again"), moving them to Done, and verifying they're grouped by topic with easy browsing and search.

**Acceptance Scenarios**:

1. **Given** a user moves a TODO to Done, **When** the TODO appears in the Done section, **Then** it's automatically categorized by topic/tag
2. **Given** multiple completed TODOs with the same topic, **When** user views Done, **Then** items are grouped under that topic heading
3. **Given** a Done section with many completed TODOs, **When** user uses the search/filter feature, **Then** they can find related completed work by keyword
4. **Given** a completed TODO, **When** user clicks on it, **Then** they can see the full details and reference it for similar future work

### Edge Cases

- What happens when a user tries to add an empty TODO item?
- How does the app handle very long TODO descriptions in the visual layout?
- What happens if a user deletes a TODO from Backlog vs. In Progress vs. Done?
- How are TODOs persisted if the browser is closed or refreshed mid-session?
- What happens if a user has no TODOs in any column (completely empty board)?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow users to add TODO items to a Backlog/Input column with a text input field
- **FR-002**: System MUST support drag-and-drop reordering of TODO items within the Backlog column
- **FR-003**: System MUST enforce a configurable WIP limit on the In Progress column (default: 3 items)
- **FR-004**: System MUST prevent users from moving a TODO to In Progress if the WIP limit is reached, with a clear error message
- **FR-005**: System MUST allow users to move TODOs between Backlog → In Progress → Done via drag-and-drop or button actions
- **FR-006**: System MUST display the current WIP count and limit in the In Progress column header
- **FR-007**: System MUST automatically categorize completed TODOs by topic/tag in the Done column
- **FR-008**: System MUST support searching and filtering completed TODOs by category/topic in the Done section
- **FR-009**: System MUST persist all TODO data, their positions, and states when the page is refreshed
- **FR-010**: System MUST allow deletion of TODO items from any column with confirmation
- **FR-011**: System MUST use visual design to emphasize the Backlog as large/prioritized and In Progress as small/focused
- **FR-012**: System MUST display the Done section as an organized, browsable knowledge base grouped by category

### Key Entities

- **TODO**: Represents a single work item with properties: ID, title, description, category/topic, status (Backlog/In Progress/Done), position/priority, created date, completed date
- **Category/Topic**: A grouping label for organizing completed TODOs in the Done section (inferred from content or user-assigned)
- **Board State**: The current arrangement of all TODOs across columns, including WIP counts and user preferences

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can add and manage 50+ TODOs without performance degradation
- **SC-002**: Users can complete the primary workflow (add → prioritize → move to In Progress → complete → find in Done) in under 5 minutes on first use
- **SC-003**: Visual layout clearly communicates WIP limits to 90% of new users without explanation (measured by observing user behavior)
- **SC-004**: Users can find a completed TODO by topic/category within 10 seconds of starting a search
- **SC-005**: Data persists across browser refresh/session restart with 100% accuracy
- **SC-006**: The In Progress column limits are respected in 100% of use cases (no overflow allowed)
- **SC-007**: Users report improved focus/reduced overwhelm compared to a flat TODO list (qualitative feedback)

## Assumptions

- Users are working individually (single-user application, no multi-user collaboration for P1)
- WIP limit default is 3 items; users can customize this value later
- Browser local storage is acceptable for data persistence; no backend/cloud sync required for MVP
- Categories for Done items can be auto-detected from TODO titles or explicitly tagged by users
- The application is a web-based interface accessible in modern browsers
