# Implementation Plan: Core Business Management System

**Branch**: `001-core-features` | **Date**: 2025-09-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-features/spec.md`

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

Comprehensive web-based business management system for Snowva™ Trading Pty Ltd to manage sales lifecycle for 150+ retail customers and individual consumers. System handles complex multi-branch customer relationships, dual pricing structures (retail vs consumer), quote-to-invoice workflow, payment processing with FIFO allocation, and consolidated statement generation. Technical approach: Next.js frontend with Tailwind CSS, Firebase backend (deferred), mock data implementation initially.

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+  
**Primary Dependencies**: Next.js 14, Tailwind CSS 3.4, React 18, Firebase SDK (for future implementation)  
**Storage**: Mock data initially (JSON/localStorage), Firebase Firestore (deferred until instructed)  
**Testing**: Jest, React Testing Library, Cypress for E2E  
**Target Platform**: Web application (responsive for desktop/tablet/mobile)
**Project Type**: web - frontend + backend structure  
**Performance Goals**: <3s page load, <500ms navigation, offline-capable quotes/invoices  
**Constraints**: South African business requirements (VAT 15%, Rand currency), multi-branch complexity, audit trail compliance  
**Scale/Scope**: 150+ customers, 40+ branches per customer, 11 products, ~1000 invoices/month, 5+ concurrent users

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Component-First Check**: ✅ PASS - All UI features planned as reusable components with Tailwind CSS patterns. Component contracts defined in contracts/ with clear props interfaces and Storybook documentation planned.

**Test-First Check**: ✅ PASS - TDD approach defined with Jest + React Testing Library + Cypress. Mock data strategy uses real business scenarios from extracted PDFs. Integration tests planned for complete workflows (quote-to-invoice-to-payment).

**Data Integrity Check**: ✅ PASS - Financial calculations validated at multiple layers with Zod schemas. Precise decimal arithmetic planned for monetary values. Audit trails defined for invoice finalization and payment allocation with immutable state tracking.

**Design System Check**: ✅ PASS - Consistent Tailwind CSS design tokens planned with custom properties for theming. Responsive design with mobile-first approach using standard breakpoints. Component variants follow naming conventions (size: sm/md/lg, variant: primary/secondary/outline).

**Performance Check**: ✅ PASS - <3s load time and <500ms navigation requirements defined. Next.js optimization features planned (Image optimization, dynamic imports, static generation). Accessibility compliance planned for WCAG 2.1 AA with Lighthouse scores ≥90.

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
│   ├── middleware/
│   ├── validation/
│   ├── data/mock/
│   └── app/api/        # Next.js App Router API routes
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── app/            # Next.js App Router pages
│   ├── services/
│   └── stories/        # Storybook documentation
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - Frontend (Next.js) + Backend (API routes) structure detected from Technical Context

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
Based on the generated design artifacts, the /tasks command will create a comprehensive task list following TDD principles:

1. **Foundation Tasks** (Priority 1):

   - Set up Next.js 14 project structure with TypeScript and Tailwind CSS
   - Configure development environment (ESLint, Prettier, Jest, Cypress)
   - Implement mock data system based on extracted PDF data
   - Create base TypeScript types from data-model.md
   - Set up API route structure following REST conventions

2. **Core Component Tasks** (Priority 2):

   - Build foundational UI components (FormInput, FormSelect, CurrencyInput, etc.)
   - Implement business components (CustomerSelector, ProductSelector, LineItemEditor)
   - Create layout components (DashboardLayout, PageHeader, DataTable)
   - Develop modal and overlay components (ConfirmationModal, SlideOver)

3. **Feature Implementation Tasks** (Priority 3):

   - Customer management: List, create, edit, branch management
   - Product catalog: Display products, manage pricing, customer overrides
   - Quote management: Create, edit, convert to invoice, PDF generation
   - Invoice management: Create, edit, finalize, payment tracking
   - Payment processing: Record payments, FIFO allocation, balance updates
   - Statement generation: Create statements, PDF export, customer balance

4. **Integration Tasks** (Priority 4):
   - API endpoint implementation for all business operations
   - Form validation using Zod schemas
   - PDF generation for quotes, invoices, and statements
   - Responsive design optimization
   - Accessibility compliance testing

**Ordering Strategy**:

- **Test-First Development**: Each component/feature gets tests written before implementation
- **Dependency-Driven**: Base components before business components before pages
- **Parallel Execution Markers**: Independent tasks marked with [P] for concurrent development
- **Validation Gates**: Integration tests to validate end-to-end workflows

**Task Categorization**:

- **[SETUP]**: Environment and tooling configuration
- **[COMPONENT]**: Individual React component development
- **[API]**: Backend API endpoint development
- **[FEATURE]**: Complete business feature implementation
- **[TEST]**: Testing and validation tasks
- **[DOCS]**: Documentation and quickstart validation

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md with clear acceptance criteria, dependencies, and estimated completion times.

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
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

**Artifacts Generated**:

- [x] research.md - Technology stack decisions and architecture patterns
- [x] data-model.md - Complete entity definitions and relationships
- [x] contracts/api-specification.md - REST API contracts for all endpoints
- [x] contracts/component-specification.md - React component contracts and interfaces
- [x] quickstart.md - Development setup and core workflow validation
- [x] .github/copilot-instructions.md - Updated agent context file

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
