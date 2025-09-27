# Implementation Plan: Sprint 004.1 – Technical Debt Resolution

**Branch**: `005-sprint-004-1` | **Date**: September 27, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-sprint-004-1/spec.md`

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

Address technical debt identified during Sprint 004 to ensure stable foundation for future development. Focus on resolving API endpoint issues (timeline 404 errors), Next.js 15 async parameter compatibility, comprehensive error handling, and developer experience improvements through optimized build processes and comprehensive testing coverage.

## Technical Context

**Language/Version**: TypeScript 5.1+, Node.js 18+  
**Primary Dependencies**: Next.js 15 App Router, React 18, Zod validation, TanStack Query  
**Storage**: Mock data transitioning to Firebase/API service layer  
**Testing**: Jest + React Testing Library + Cypress, minimum 90% coverage for quote service layer  
**Target Platform**: Web application (Next.js server + React client)
**Project Type**: web - determines source structure  
**Performance Goals**: Timeline API <500ms response time, page loads <3s, navigation <500ms  
**Constraints**: Next.js 15 async parameter compatibility, fail-fast error handling, build fails on Fast Refresh issues  
**Scale/Scope**: Existing quote composer integration, 12 functional requirements, developer experience focus

**User Context**: using all current constitutions, architecture docs and roadmaps - Component-first development with Tailwind CSS, Test-first TDD approach, business data integrity for financial calculations, design system consistency, performance/accessibility requirements

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Component-First Check**: ✅ PASS - Focus on API endpoints and error handling components, minimal UI changes  
**Test-First Check**: ✅ PASS - TDD approach with 90% coverage requirement, comprehensive unit tests for quote service layer  
**Data Integrity Check**: ✅ PASS - Zod schema validation for API requests/responses, fail-fast error handling  
**Design System Check**: ✅ PASS - Consistent error states and loading components following Tailwind patterns  
**Performance Check**: ✅ PASS - Timeline API <500ms, build process optimization, Fast Refresh improvements

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

**Structure Decision**: Option 2 (Web application) - Next.js full-stack with frontend and backend API routes

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

### Task Generation Strategy

**Atomic Task Principle**: Each task represents a single, testable unit of work that can be completed in 15-30 minutes. Tasks are designed to be:
- **Independently executable** - No blocking dependencies within the task
- **Immediately testable** - Clear acceptance criteria with verification steps
- **Precisely scoped** - Single file or related file group modifications
- **Constitutionally compliant** - Adheres to test-first TDD and component-first development

### Task Categorization Framework

**Core Implementation Tasks (FR-001 to FR-005)**:
- Timeline API endpoint creation and integration
- Next.js 15 async parameter compatibility updates
- Error handling standardization across all quote APIs
- Zod schema validation implementation
- Developer experience improvements (Fast Refresh optimization)

**Quality Assurance Tasks (NFR-001 to NFR-004)**:
- Performance optimization for <500ms response times
- Test coverage implementation to achieve 90% threshold
- Build quality gate enforcement
- Integration testing for quote composer workflow

**Infrastructure Tasks**:
- Mock service layer enhancements
- API contract validation setup
- Development environment configuration
- Documentation updates

### Task Sequencing Logic

**Sequential Dependencies**:
1. **Foundation Layer**: API endpoints and parameter handling (enables testing)
2. **Validation Layer**: Error handling and schema validation (ensures data integrity)
3. **Quality Layer**: Test coverage and performance optimization (meets constitutional requirements)
4. **Integration Layer**: End-to-end workflow validation (confirms business value)

**Parallel Execution Opportunities**:
- Timeline API development can proceed independently of parameter fixes
- Test creation can happen alongside implementation (TDD approach)
- Documentation updates can be parallelized with code changes

### Implementation Strategy from Phase 1 Artifacts

**From OpenAPI Contracts** (timeline-api.yaml, quote-api-enhanced.yaml):
- Each contract → contract test task [P]
- Each endpoint → implementation task
- Each error response → error handling test task

**From Data Model** (data-model.md):
- Each entity → TypeScript interface creation task [P]
- Each validation rule → Zod schema implementation task
- Each relationship → service layer integration task

**From Quickstart Guide** (quickstart.md):
- Each validation step → automated test task
- Each implementation phase → task grouping strategy
- Each success criterion → acceptance test task

### Constitutional Compliance Integration

**Test-First Implementation**: Every functional task includes corresponding test creation
**Component-First Development**: UI-related tasks prioritize component isolation
**Design System Consistency**: All UI changes must align with Tailwind CSS utilities
**Business Data Integrity**: Financial calculation tasks include comprehensive validation

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md following TDD principles

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

- [x] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
