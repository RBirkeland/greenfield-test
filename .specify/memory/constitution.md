<!--
SYNC IMPACT REPORT
==================
Version: 0.1.0 (Initial - MINOR bump for new principle-driven guidance)
Modified Principles: N/A (new constitution)
Added Sections: Core Principles (5 principles), Development Workflow, Security Requirements
Removed Sections: N/A
Templates requiring updates: ✅ plan-template.md (align with principles), spec-template.md (governance checks), tasks-template.md (principle-driven categorization), commands/* (reference principles)
Follow-up TODOs: None
-->

# TODO App Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory: tests MUST be written before implementation, user approval obtained, tests executed and verified to fail, then implementation proceeds using red-green-refactor cycle. Every feature change includes corresponding test coverage. Integration tests MUST verify contract changes, inter-service communication, and shared schemas.

**Rationale**: Tests define the contract and enable confidence in refactoring. Writing tests first ensures requirements clarity and reduces defects.

### II. Simplicity & YAGNI (You Aren't Gonna Need It)

Start simple. Avoid premature abstraction, unnecessary complexity, and over-engineering for hypothetical future requirements. Use straightforward implementations that solve the immediate problem. Add complexity only when justified by concrete requirements.

**Rationale**: Simpler code is easier to maintain, test, and debug. Premature optimization and abstraction are sources of unnecessary technical debt.

### III. Focused Functionality Over Architecture Perfection

Prioritize delivering working features over architectural purity. Use libraries pragmatically where they add clear value, but don't abstract for abstraction's sake. The goal is functional, testable code that meets user needs.

**Rationale**: Delivering value to users takes precedence over achieving perfect code structure. Refactor when patterns emerge from real requirements.

### IV. Clear Error Handling & Observability

Errors MUST be explicit and actionable. Log relevant information for debugging. Avoid silent failures. Provide clear feedback to users about what went wrong and why.

**Rationale**: Debuggability is essential for maintainability. Unclear errors waste development and support time.

### V. Code Review & Compliance Verification

All code changes require review to verify alignment with the constitution's principles. Reviewers MUST check that test-first discipline is followed, complexity is justified, and observability is adequate.

**Rationale**: Constitution principles are enforced through peer review, ensuring consistent quality and shared understanding.

## Development Workflow

- Feature branches MUST be prefixed with issue/ticket identifiers (e.g., `#123-feature-name`)
- All PRs MUST include a test plan demonstrating independent test verification
- Commits SHOULD be atomic and descriptive
- Code review approval is required before merge; reviewers verify constitution compliance

## Security Requirements

- Never log sensitive data (passwords, API keys, PII)
- Validate and sanitize all user inputs at system boundaries
- Use environment variables for secrets; never commit credentials
- Implement proper authentication/authorization checks where applicable
- Review OWASP Top 10 vulnerabilities for applicable contexts

## Governance

This constitution supersedes all other development practices and guidelines. Amendments require:

1. Written justification with rationale
2. Impact analysis on existing principles
3. Approval from project stakeholders
4. Version bump following semantic versioning (MAJOR for removals/redefinitions, MINOR for additions, PATCH for clarifications)
5. Migration plan for significant changes

All pull requests and reviews MUST verify alignment with these principles. The constitution is the source of truth for project governance.

**Version**: 0.1.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-01-09
