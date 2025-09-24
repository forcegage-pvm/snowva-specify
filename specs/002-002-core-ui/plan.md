# Implementation Plan: 002-core-ui UI Delivery

**Branch**: `002-002-core-ui` | **Date**: 2025-09-24 | **Spec**: [`spec.md`](spec.md)
**Input**: Feature specification from `/specs/002-002-core-ui/spec.md`

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

Deliver a complete Snowva self-service operations UI that exposes the existing core business capabilities (customer + branch management, product pricing catalogues, quote-to-invoice processing, statements, and payment allocation) through a cohesive, responsive web experience. The UI must honour the Snowva marketing brand kit, reuse Tailwind-based application shell, forms, and table patterns, and meet performance targets (≤2 s list loads, 30 min inactivity timeout) while ensuring all staff have identical full-access workflows across desktop, tablet, and mobile breakpoints.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 14 (React 18)  
**Primary Dependencies**: Tailwind CSS 3.4+, Snowva design tokens, Next.js App Router, React Query (data), Headless UI (components), Firebase SDK (future auth hook-ins)  
**Storage**: Existing Snowva backend services (no new persistence in this feature)  
**Testing**: Jest + React Testing Library, Cypress E2E, Playwright visual regression (if available)  
**Target Platform**: Web (desktop ≥1280 px, tablet ≥768 px, mobile ≥375 px)  
**Project Type**: Web application (frontend + backend structure maintained)  
**Performance Goals**: Initial data views ≤2 s, navigation interactions ≤500 ms, Lighthouse ≥90 (Perf/Accessibility)  
**Constraints**: 30 min inactivity timeout with warning, WCAG 2.1 AA compliance, component-first Tailwind styling, shared full-access role model  
**Scale/Scope**: 150+ retail organisations with branch hierarchies, 10+ core products, multi-document workflows spanning quotes, invoices, statements, and payments

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Component-First Check**: PASS – Every view decomposed into Tailwind component primitives (shell, lists, forms, timelines) with reusable variants and Storybook coverage.
**Test-First Check**: PASS – Plan includes Jest component/unit specs, integration flows for quote→invoice→payment, Cypress E2E for cross-device breakpoints.
**Data Integrity Check**: PASS – UI mirrors backend validations (VAT, totals, audit trails) with client validations and relies on core services for authoritative checks.
**Design System Check**: PASS – Snowva brand kit tokens + Tailwind UI Blocks (forms, tables, sidebar shell) applied consistently across breakpoints.
**Performance Check**: PASS – List virtualization, incremental data fetch, and Lighthouse monitoring enforced to stay within ≤2 s listings and <3 s page loads.

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

**Structure Decision**: Option 2 (Web application: `frontend/` + `backend/` maintained)

## Phase 0: Outline & Research

1. **Targeted research items**:

   - Tailwind UI Blocks adoption strategy (forms, tables, sidebar shell) for Snowva-specific branding.
   - Data-intensive table performance (virtualization, pagination) to maintain ≤2 s load at 150+ rows.
   - Cross-device responsive behaviours for shared full-access workflows (desktop/tablet/mobile parity).
   - Audit trail & timeline visualisation patterns aligning with component-first constitution.
   - Session timeout UX (30 min) warning flows and retention of unsaved edits.

2. **Research execution plan**:

   ```
   Task: "Review Tailwind UI blocks for application shell/forms/tables to match Snowva branding"
   Task: "Evaluate table virtualization vs pagination for 150+ customer listings"
   Task: "Document best practices for responsive admin dashboards across desktop/tablet/mobile"
   Task: "Survey timeline/audit trail UI components compatible with Tailwind"
   Task: "Establish UX pattern for 30-minute inactivity warning + auto logout"
   ```

3. **Synthesis**: Capture each decision inside `research.md` with Decision / Rationale / Alternatives to confirm constitutional alignment and set inputs for Phase 1 design.

**Output**: `research.md` summarising research decisions and linking references.

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **UI Data Model Definition** → `data-model.md`:

   - Map core views: DashboardTile, CustomerDirectory, BranchDetailPanel, ProductCatalogEntry, QuoteComposer, InvoiceWorkspace, PaymentAllocation, StatementOverview, DocumentTimeline.
   - Describe field groups (summary tiles, filters, table columns, timeline events) and state transitions (draft → finalized invoice, payment allocation states).
   - Capture validation rules (required VAT, order numbers, pricing rule overlays) and performance notes (pagination strategy, virtualization trigger).

2. **Interaction Contracts** → `/contracts/ui/`:

   - Define UI workflow contracts (e.g., `customer-directory.json`, `quote-composer.json`) describing required data payloads exchanged with backend services.
   - Document event contracts (e.g., `invoiceFinalized`, `paymentAllocated`) ensuring audit trail hooks.
   - Outline wireflow-level pseudo-APIs (GraphQL/REST) referencing existing backend endpoints to guide integration tests.

3. **Contract Test Blueprints**:

   - For each contract, draft Jest testing scaffold referencing mocked service adapters and verifying shape alignment.
   - Ensure negative cases (missing VAT, stale price list) produce expected UI error states.

4. **Integration Scenario Extraction** → `quickstart.md`:

   - Translate user stories into step-by-step validation flows (e.g., create quote → convert invoice → allocate payment → generate statement).
   - Include responsive validation steps (desktop vs tablet vs mobile) and inactivity timeout handling.

5. **Agent Context Update**:
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` after documenting new dependencies/decisions to keep assistant context synchronized.

**Output**: `data-model.md`, `/contracts/ui/*.json` (and corresponding Jest scaffolds), `quickstart.md`, updated Copilot context file.

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Derive tasks from Phase 1 artefacts:
  - Each UI contract → contract test + implementation tasks [P]
  - Each data model entity → component scaffolding + Storybook entry tasks [P]
  - Quickstart scenarios → Cypress E2E + manual validation tasks
  - Cross-cutting concerns (brand theming, responsive breakpoints, session timeout banner) → dedicated tasks with dependencies

**Ordering Strategy**:

- Enforce TDD: Jest unit tests + Storybook snapshots before component implementation; Cypress specs before wiring flows
- Build foundation first: layout shell → navigation → shared primitives → feature workspaces (customers, products, documents)
- Performance/resilience tasks (virtualization, auto-logout warning) follow baseline functionality but precede final polish
- Mark [P] where features operate on independent components (e.g., Product catalog vs Payment allocation)

**Estimated Output**: 28-32 ordered tasks with parallelization notes.

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

No constitutional deviations anticipated; table remains empty.

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
