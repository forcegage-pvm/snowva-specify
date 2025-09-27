# Implementation Plan: Quotes Index Workspace

**Branch**: `004-sprint-4-quotes` | **Date**: 2025-09-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-sprint-4-quotes/spec.md`

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

Implement a quotes listing page with advanced filtering, status management, and seamless integration with the existing quote composer. The workspace will handle <1,000 quotes with sub-1-second load times, featuring QuotesTable with virtualization, QuoteFiltersBar for advanced filtering, and robust error handling for quote composer unavailability. Built following component-first architecture with comprehensive testing and accessibility compliance.

## Technical Context

**Language/Version**: TypeScript 5.1+ with Next.js 15 App Router, React 18  
**Primary Dependencies**: TanStack Query v5, TanStack Virtual v3, Tailwind CSS 3.4, Headless UI, Zod validation  
**Storage**: Mock data transitioning to Firebase/API service layer  
**Testing**: Jest + React Testing Library + Cypress E2E + Storybook + axe-core accessibility  
**Target Platform**: Web browsers (Chrome 90+, Firefox 88+, Safari 14+), responsive design
**Project Type**: web - frontend with API routes (Next.js full-stack)  
**Performance Goals**: <1 second initial page load, <500ms filter responses, 60fps interactions  
**Constraints**: <1,000 quotes total, WCAG 2.1 AA compliance, last-save-wins conflict resolution  
**Scale/Scope**: Sales/finance/operations teams, dashboard integration, quote composer integration

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Component-First Check**: ✅ PASS - QuotesTable, QuoteFiltersBar, QuoteStatusBadge, QuoteActionsMenu designed as reusable components with Tailwind utility classes  
**Test-First Check**: ✅ PASS - TDD mandatory: Storybook stories → Jest unit tests → integration tests → Cypress E2E, 90%+ coverage required  
**Data Integrity Check**: ✅ PASS - Quote totals use precise decimal arithmetic, state mutations immutable, audit trail for status changes  
**Design System Check**: ✅ PASS - Extends existing Tailwind design system from documents workspace, consistent status badges and responsive patterns  
**Performance Check**: ✅ PASS - <1s load requirement specified, TanStack Virtual for performance, accessibility compliance planned

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

**Structure Decision**: Option 2 (Web application) - Next.js 15 full-stack with frontend components and API routes

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

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

3. **Generate contract tests** from contracts:

   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

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

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) - ✅ 2025-09-26
- [x] Phase 1: Design complete (/plan command) - ✅ 2025-09-26
- [x] Phase 2: Task planning complete (/plan command - describe approach only) - ✅ 2025-09-26
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS - ✅ 2025-09-26
- [x] Post-Design Constitution Check: PASS - ✅ 2025-09-26
- [x] All NEEDS CLARIFICATION resolved - ✅ 2025-09-26 (via clarify command)
- [x] Complexity deviations documented - ✅ No violations found

**Phase 1 Deliverables Completed**:
- ✅ research.md - Technical research and architectural decisions
- ✅ data-model.md - Complete data model with TypeScript interfaces
- ✅ contracts/quotes-api.yaml - OpenAPI 3.0.3 API specification 
- ✅ quickstart.md - Developer setup and testing guide
- ✅ .github/copilot-instructions.md - Updated agent context

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
