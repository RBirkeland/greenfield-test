# Implementation Plan: Kanban TODO Board with WIP Limits

**Branch**: `001-kanban-wip-board` | **Date**: 2026-01-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-kanban-wip-board/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a modern, minimal web application that implements a kanban-style TODO board emphasizing WIP limits and focus. The app will use vanilla JavaScript with web components for a simple, framework-light architecture. Browser local storage provides persistence. MCPs/plugins support development tooling. The design prioritizes simplicity (per TODO App Constitution Principle II) and test-first development (Principle I).

## Technical Context

**Language/Version**: JavaScript (ES2020+) with HTML5/CSS3
**Primary Dependencies**: Minimal - No frameworks; Web Components API (native); Vanilla JS with helper utilities only
**Storage**: Browser LocalStorage (no backend required for P1); JSON serialization
**Testing**: Vitest (lightweight, fast unit/integration tests); Playwright (E2E testing)
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Single-page web application (SPA)
**Performance Goals**: Initial load <2 seconds; Drag-drop interactions <16ms (60fps); Search/filter <100ms
**Constraints**: Offline-capable (client-side storage only); ~500KB initial bundle size (uncompressed)
**Scale/Scope**: Single user, 1000+ TODOs manageable; MVP scope for desktop/tablet (mobile responsiveness P2)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **I. Test-First Development (NON-NEGOTIABLE)**

- PASS: All features will have tests written before implementation using red-green-refactor cycle
- Test structure: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- Testing tools: Vitest for unit/integration; Playwright for E2E user workflows

✅ **II. Simplicity & YAGNI**

- PASS: Vanilla JS (no framework bloat); Web Components instead of custom abstractions
- Only add libraries when they solve concrete problems (e.g., drag-drop library if needed, not frameworks)
- Minimal dependencies: ~5-10 packages, all with clear purpose

✅ **III. Focused Functionality Over Architecture**

- PASS: Single SPA with focused domain (TODO kanban board only)
- No microservices, no unnecessary patterns, direct DOM manipulation where simple suffices
- Pragmatic use of Web Components for code organization

✅ **IV. Clear Error Handling & Observability**

- PASS: Explicit user-facing error messages (e.g., "WIP limit reached—complete a task to add more")
- Browser console logging for debugging; clear error boundaries for data operations

✅ **V. Code Review & Compliance**

- PASS: All code changes will be reviewed for constitution compliance before merge
- Reviewers will verify test-first discipline and complexity justification

**Gate Status**: ✅ PASS - All principles aligned with proposed architecture

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── index.html              # Single entry point
├── index.js                # App initialization and routing
├── styles/
│   ├── main.css            # Global styles + CSS Grid layout
│   ├── theme.css           # Color scheme, typography
│   └── animations.css      # Drag-drop, transitions
├── components/
│   ├── kanban-board.js     # Main board container (Web Component)
│   ├── todo-column.js      # Backlog/In Progress/Done columns
│   ├── todo-card.js        # Individual TODO card
│   ├── input-section.js    # New TODO input area
│   └── search-filter.js    # Done section search
├── services/
│   ├── storage.js          # LocalStorage persistence layer
│   ├── todo-manager.js     # Business logic (add/move/delete/search)
│   ├── wip-enforcer.js     # WIP limit validation
│   └── category-detector.js # Auto-categorize completed TODOs
├── utils/
│   ├── dom.js              # DOM helpers (query, create, events)
│   ├── uuid.js             # ID generation
│   └── validators.js       # Input validation
└── config.js               # App constants (WIP_LIMIT=3, etc.)

tests/
├── unit/
│   ├── test-storage.js
│   ├── test-todo-manager.js
│   ├── test-wip-enforcer.js
│   └── test-category-detector.js
├── integration/
│   ├── test-board-operations.js
│   ├── test-persistence.js
│   └── test-wip-enforcement.js
└── e2e/
    ├── test-user-workflow.js
    └── test-visual-layout.js

public/
├── index.html              # HTML served as-is
└── favicon.ico

.config/
├── vitest.config.js        # Test runner config
└── playwright.config.js    # E2E test config

docs/
├── architecture.md         # Tech decisions
└── dev-guide.md           # Setup and dev workflow
```

**Structure Decision**: Single-page SPA with components organized by UI concerns and services organized by business logic. All vanilla JS with Web Components for encapsulation. No build tool required initially (modern ES modules loaded directly); can add Vite later if bundling needed.

## Development Tooling & MCP/Plugin Support

### MCP Servers (Model Context Protocol)

MCPs extend Claude Code with specialized capabilities for development support:

- **Code Review MCP**: Automated compliance checks against TODO App Constitution before commits
- **Test Execution MCP**: Run Vitest/Playwright tests within Claude Code for immediate feedback
- **Documentation Generator MCP**: Auto-generate API docs from code comments and test scenarios
- **Performance Analysis MCP**: Monitor bundle size, runtime performance, accessibility

### Plugins & Build Tools

**Phase 1 (MVP)**: No build tool required

- Serve files via `npx http-server` or Python `http.server`
- ES modules loaded directly in browser
- Zero configuration needed

**Phase 2 (if needed)**: Optional tooling

- Vite: Fast dev server and bundle optimization (only if bundle size becomes concern)
- ESLint: Code linting per constitution principles
- Prettier: Consistent formatting

### Development Workflow

1. **Write tests first** (Vitest): `npm test -- --watch`
2. **Run app locally**: `npx http-server src/`
3. **E2E tests** (Playwright): `npm run test:e2e`
4. **Review with MCP**: Claude Code checks against constitution before commit
5. **Commit**: Only if all tests pass + MCP review passes

This minimal approach keeps cognitive load low and deployment simple (just copy `src/` to any HTTP server).
