# greenfield-test Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-09

## Active Technologies

- JavaScript (ES2020+) with HTML5/CSS3 + Minimal - No frameworks; Web Components API (native); Vanilla JS with helper utilities only (001-kanban-wip-board)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (ES2020+) with HTML5/CSS3: Follow standard conventions

## Recent Changes

- 001-kanban-wip-board: Added JavaScript (ES2020+) with HTML5/CSS3 + Minimal - No frameworks; Web Components API (native); Vanilla JS with helper utilities only

<!-- MANUAL ADDITIONS START -->

## Feature Development Workflow

Every feature follows this workflow:

1. **Specify**: Use speckit tools to create feature specification
   - Run `/speckit.specify` to create `specs/[feature-name]/spec.md`
   - Run `/speckit.clarify` to resolve ambiguities
   - Run `/speckit.plan` to create implementation plan.md
   - Run `/speckit.tasks` to generate tasks.md (single source of truth)

2. **Track**: Sync tasks to vibe_kanban
   - Create kanban tasks from tasks.md using vibe_kanban MCP
   - Use vibe_kanban as the source of truth for work in progress
   - Update task status as work progresses

3. **Develop**: Create feature branch
   - `git checkout -b [feature-name]` (e.g., `001-kanban-wip-board`)
   - Work on feature branch exclusively
   - Implement based on tasks.md

4. **Validate**: Run tests and linting
   - `npm test` (unit + integration tests must pass)
   - `npm run lint` (ESLint + Prettier must pass)
   - `npm run test:e2e` (user story E2E tests must pass)
   - All validations required before PR

5. **Merge**: Create PR to main
   - Create pull request to main branch
   - Delete feature branch after merge

---

## Installed Plugins & Tools

### Plugins
- **commit-commands**: Git workflow automation (use `/commit` skill for atomic commits)
- **context7**: Library documentation lookup (use before implementing third-party integrations)
- **frontend-design**: Web component and UI design creation (use for polished component styling/layout)
- **typescript-lsp**: TypeScript language server (use for validating complex business logic)
- **playwright**: Browser automation for E2E testing (required for user story validation)

### MCPs
- **vibe_kanban**: Project task and kanban board management
  - Create and track tasks from tasks.md
  - Single source of truth for work in progress
  - Functions: list_projects, list_tasks, create_task, update_task, delete_task, get_task

---

## Development Workflow Guidance

### Feature Specification (speckit tools)
Use the speckit toolkit to plan features before implementation:
- `/speckit.specify` - Create feature specification with requirements
- `/speckit.clarify` - Identify and resolve ambiguities in spec
- `/speckit.plan` - Design implementation approach and architecture
- `/speckit.tasks` - Generate tasks.md with all work items (must run before vibe_kanban sync)

### Task Management (vibe_kanban)
- Create kanban tasks from tasks.md using vibe_kanban MCP
- Use vibe_kanban as single source of truth for work tracking
- Update task status as implementation progresses
- Each user story should be independently trackable

### Git Workflow (Feature Branches)
- Create branch per feature: `git checkout -b [feature-name]`
- Work on feature branch exclusively
- Use `/commit` skill for atomic, well-described commits
- Example: `git checkout -b 001-kanban-wip-board`

### Validation Requirements
Before creating a PR, all validations must pass:
- **Unit & Integration Tests**: `npm test`
- **Code Quality**: `npm run lint` (ESLint + Prettier formatting)
- **E2E Tests**: `npm run test:e2e` (verify user stories work independently)

### TypeScript LSP (As-Needed Validation)
Use when working on complex or critical code:
- Business logic validation (TodoManager, WIPEnforcer, CategoryDetector)
- Refactoring critical services
- Optional for simple UI components

### Playwright (Required for User Stories)
Each user story (US1-US4) must have E2E tests:
- Tests verify story acceptance criteria from tasks.md
- Tests validate independent user workflows
- Example: US1 tests user can add/reorder/persist TODOs
- Run via: `npm run test:e2e`

### context7 Plugin (External Library Research)
Before implementing third-party integrations:
- Look up Vitest, Playwright documentation
- Research Web Components best practices
- Document external library decisions in task notes

### frontend-design Plugin (UI Component Creation)
Use when building web components:
- Create components with polished output
- Apply consistent theme and styling guidance
- Ensure responsive layouts and visual hierarchy

---

## Performance Targets

Performance expectations for the kanban application:

- **Bundle Size**: ~500KB target for production
- **Responsiveness**: Interactive UI on add/move operations (<100ms perceived latency)
- **Rendering Performance**: 60fps scrolling when 100+ TODOs present
- **Storage**: LocalStorage persistence, no server dependency
- **Device Support**: Desktop browsers (Chrome, Firefox, Safari) - P2: mobile optimization

<!-- MANUAL ADDITIONS END -->
