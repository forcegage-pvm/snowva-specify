# Implementation Plan: Documents Workspace Export History

**Branch**: `003-sprint-3-1-documents` | **Date**: 2025-09-26 | **Spec**: [/specs/003-sprint-3-1-documents/spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-sprint-3-1-documents/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Deliver the `/documents` workspace so every authenticated console user can review, search, filter, preview, share, and resend document exports from the last 365 days. The UI presents a performant virtualized table, preview modal with 30-day public share links, resend workflows for failed exports, and guidance for archive retrieval beyond the retention window.

## Technical Context

**Language/Version**: TypeScript 5.1+ (strict mode)  
**Primary Dependencies**: Next.js 15 App Router, React 18, Tailwind CSS 3.4, TanStack Query, TanStack Virtual, Zod  
**Storage**: Deterministic mock fixtures (transitioning to Snowva API/Firebase service layer)  
**Testing**: Jest + React Testing Library, Cypress, axe accessibility checks  
**Target Platform**: Web – Snowva Next.js console (desktop-first responsive)  
**Project Type**: web (frontend + backend folders already structured)  
**Performance Goals**: <2000 ms initial load, <300 ms filter response, <500 ms navigation, Lighthouse ≥90  
**Constraints**: 365-day retention cap, 30-day public share link expiry, virtualization threshold ≥100 rows, WCAG 2.1 AA compliance  
**Scale/Scope**: Up to 50 exports/day (≈18k/year) per tenant; all authenticated roles require identical workspace capabilities

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Component-First Check**: Table, filter bar, preview modal, and share link banner will be delivered as isolated Tailwind-based components with Storybook docs. → **PASS**
**Test-First Check**: Plan includes Jest unit tests for data adapters, Cypress spec for end-to-end flows, and axe checks baked into Storybook. → **PASS**
**Data Integrity Check**: Audit logging for preview/download/share/resend and immutable history entries ensure traceability; resend actions validate status transitions. → **PASS**
**Design System Check**: Reuses statements workspace tokens, status chips, and responsive layout primitives; new components adhere to Tailwind token palette. → **PASS**
**Performance Check**: Virtualization + pagination, caching via TanStack Query, and share link TTL enforcement keep load <3 s with accessibility budgets baked in. → **PASS**

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (existing web application split) – leverages `frontend/` Next.js app with API routes under `src/app/api` and shared services; no new backend project required.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - Virtualized table strategy for ~18k rows/year
   - Share link token security for 30-day public access
   - Audit/logging integration with existing monitoring utilities
   - Archive retrieval UX for >365-day exports

2. **Generate and dispatch research agents** (documented in `research.md`):

   - "Research TanStack Virtual vs. manual windowing for documents workspace"
   - "Best practices for signed public document share links with 30-day expiry"
   - "Extend AuditTrailService for document export events"
   - "Define archive retrieval hand-off for retention policy"

3. **Consolidate findings** in `research.md` (completed) capturing decisions, rationale, alternatives.

**Output**: `research.md` populated with actionable guidance (✅ Complete)

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:

   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts (scaffolded in `packages/web/tests/contract/documents.test.ts` with `test.todo` placeholders to be completed during /tasks):

   - One test block per endpoint covering schema expectations
   - TODOs will be converted into failing assertions once schema validators are written

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (completed):
   - Ran `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
   - Added TanStack Virtual and share-link considerations to context while preserving history.

**Output**: `data-model.md`, `/contracts/ui/documents-workspace.json`, `quickstart.md`, agent context file updated (✅ Complete)

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation | Why Needed | Simpler Alternative Rejected Because |
| _None_ | — | — |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
