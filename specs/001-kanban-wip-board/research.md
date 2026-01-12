# Research & Technical Decisions: Kanban TODO Board

**Phase**: 0 - Outline & Research
**Date**: 2026-01-09
**Focus**: Validate tech stack choices, identify best practices, resolve implementation unknowns

## Technology Choices

### 1. Framework Decision: Vanilla JavaScript + Web Components

**Decision**: Use vanilla ES2020+ JavaScript with native Web Components API. No framework (React, Vue, Angular).

**Rationale**:

- Aligns with TODO App Constitution Principle II (Simplicity & YAGNI) and Principle III (Focused Functionality)
- Web Components are native browser standard (no transpilation needed)
- Minimal dependencies = smaller bundle, fewer vulnerabilities, easier maintenance
- Learning curve for new devs is lower than framework-specific patterns

**Alternatives Considered**:

- React: Would add ~40KB minified; overkill for single TODO feature; more complex build process
- Vue: Similar overhead; not needed for this single-page app
- Framework-agnostic approach (plain DOM): Possible but harder to maintain; Web Components provide better encapsulation

**Implementation Approach**:

- Each UI component (Board, Column, Card, Input) is a Web Component extending `HTMLElement`
- Shadow DOM for style encapsulation (no CSS conflicts)
- Custom events for inter-component communication (no prop drilling issues)
- Service layer handles business logic (testable, framework-independent)

### 2. Storage Decision: Browser LocalStorage

**Decision**: Use browser `localStorage` API for all data persistence. No backend/server.

**Rationale**:

- Feature spec assumes single-user (no multi-user sync needed)
- LocalStorage sufficient for 1000+ TODOs (typical quota is 5-10MB)
- Zero infrastructure costs; instant deployment (static files only)
- Works offline; no network latency
- JSON serialization is straightforward

**Alternatives Considered**:

- IndexedDB: More powerful but overkill for this use case; adds complexity
- Backend API: Unnecessary for P1; can add later if multi-device sync needed
- Service Worker cache: For offline, but LocalStorage is simpler for structured data

**Implementation Approach**:

- `Storage` service wraps `localStorage` API
- Automatic JSON serialization/deserialization
- Version key for schema migrations later (`kanban-v1`, `kanban-v2`, etc.)
- Emergency backup/restore functionality

### 3. Testing Strategy: Vitest + Playwright

**Decision**: Vitest for unit/integration tests; Playwright for end-to-end tests.

**Rationale**:

- Vitest: Zero config, fast, ES module support, works with Vanilla JS
- Playwright: Cross-browser E2E testing (Chrome, Firefox, Safari); captures drag-drop interactions
- Both are lightweight; no heavy test infrastructure needed
- Aligns with Constitution Principle I (Test-First Development)

**Alternatives Considered**:

- Jest: Heavier, more oriented toward React/Node; overkill here
- Cypress: Good for E2E but slower startup; Playwright is faster
- Pure manual testing: Violates Constitution; tests are mandatory

**Test Structure**:

- **Unit Tests** (`tests/unit/`): Pure function tests (storage, business logic)
- **Integration Tests** (`tests/integration/`): Component behavior, LocalStorage interactions
- **E2E Tests** (`tests/e2e/`): User workflows (add→move→complete→search)
- Each test file mirrors `src/` structure for easy navigation

### 4. Drag-and-Drop Implementation

**Decision**: Use native HTML5 Drag and Drop API initially; consider library if interaction complexity increases.

**Rationale**:

- HTML5 Drag and Drop is built-in (no dependencies)
- Sufficient for basic reordering within columns
- Web Component can encapsulate drag listeners

**Alternatives Considered**:

- `SortableJS`: Adds 15KB; overkill if basic drag-drop works
- `dnd-kit` (React-focused): Not applicable to Vanilla JS
- Custom mouse events: More work, error-prone

**Fallback**: If UX testing shows drag-drop UX is suboptimal (e.g., poor touch support, accessibility issues), add SortableJS in Phase 2.

### 5. Category Auto-Detection

**Decision**: Simple keyword/phrase matching on TODO titles. User can manually override category/tag.

**Rationale**:

- No ML needed; pattern matching is fast and deterministic
- Common phrases: "bug", "fix", "feature", "docs", "refactor", "design", etc.
- User can add custom categories via tags (P2 feature)
- Reduces scope while meeting spec requirement ("automatically categorized")

**Alternatives Considered**:

- ML/NLP libraries: Overkill, adds dependency, harder to debug
- Manual categorization only: Doesn't meet spec
- Regex-based patterns: Works for MVP; scalable to ML later

**Implementation**:

- `CategoryDetector` service maintains phrase→category mappings
- Configurable, extensible patterns
- Tests validate common scenarios ("Fix bug in login" → "bug")

## Development Environment Setup

### Local Development Workflow

```bash
# 1. Install dependencies (minimal set)
npm install --save-dev vitest @vitest/ui playwright prettier eslint

# 2. Start test watcher
npm test -- --watch

# 3. Start local server (separate terminal)
npx http-server src/

# 4. Open browser to http://localhost:8080

# 5. Edit code → tests auto-run → refresh browser to see changes
```

### Scripts (`package.json`)

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "dev": "http-server src/",
    "format": "prettier --write src/",
    "lint": "eslint src/"
  }
}
```

### No Build Tool for MVP

- Browsers natively support ES modules via `<script type="module">`
- Serve files as-is; no transpilation needed for ES2020+
- Bundle size is naturally small (all files in `src/` are served)
- Adding Vite later is straightforward if optimization needed

## Constitution Alignment Verification

✅ **Test-First Development**: Vitest + Playwright enable TDD workflow
✅ **Simplicity & YAGNI**: Vanilla JS, minimal dependencies, no over-engineering
✅ **Focused Functionality**: Single SPA, focused domain, clear separation of concerns
✅ **Error Handling & Observability**: Browser console logging, explicit user-facing errors
✅ **Code Review**: All code reviewed for constitution compliance before merge

## Known Implementation Details (from research)

1. Web Components shadow DOM manages CSS isolation
2. `CustomEvent` API enables inter-component communication (avoid prop drilling)
3. LocalStorage quota checking before persist operations
4. Vitest uses `jsdom` environment for DOM testing
5. Playwright tests run in real browser contexts (more reliable than mocked)
6. Category detection uses regex patterns; performance is O(n) where n=phrase count (~20)

## Open Questions (None - All Resolved)

All technical decisions are made with clear rationale. No critical unknowns remain.

---

**Status**: ✅ Phase 0 Complete - Ready for Phase 1 (Design & Contracts)
