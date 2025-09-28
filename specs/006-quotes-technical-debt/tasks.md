# Tasks: Quotes Technical Debt Resolution & Missing Features Implementation# Tasks: Quotes Technical Debt Resolution & Missing Features Implementation



**Branch**: `006-quotes-technical-debt` | **Generated**: September 28, 2025  **Input**: Design documents from `/specs/007-quotes-technical-debt/`

**Sources**: `/specs/006-quotes-technical-debt/spec.md`, `plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/



## Constitutional Enforcement (MANDATORY)## Execution Flow (main)

```

**CRITICAL**: ALL tasks below are protected by Constitutional Amendments 1-3:1. Load plan.md from feature directory

- **Pre-Task Gate**: `node .specify/tools/pre-task-check.js [taskId]` - MUST pass before starting   ✅ COMPLETED: Tech stack extracted (TypeScript 5.1+, Next.js 15, React 18, TanStack Query)

- **Evidence Directory**: Create `evidence/[taskId]/` with required artifacts2. Load optional design documents:

- **MCP Browser Testing**: **REQUIRED** for ALL UI functionality - no exceptions   ✅ data-model.md: Entities extracted (Quote, QuoteOperation, BulkOperation, ExportRequest)

- **Post-Task Gate**: `node .specify/tools/post-task-validation.js [taskId]` - 3-gate validation   ✅ contracts/: API and component contracts loaded

- **Constitutional Audit**: `node .specify/tools/constitutional-audit.js` - regular compliance checks   ✅ research.md: Architecture decisions and current state analysis loaded

3. Generate tasks by category:

**ANTI-HALLUCINATION PROTOCOL**: NO task completion marking [x] without validation evidence   ✅ Setup: project dependencies, constitutional tools setup

   ✅ Tests: contract tests for API endpoints, component integration tests

## Phase 1: Setup & Infrastructure   ✅ Core: quote models, services, components restoration

   ✅ Integration: API integration, bulk operations, export system

- [ ] T001 Set up quote schema validation with Zod in packages/web/src/validation/quote-schema.ts   ✅ Polish: performance optimization, accessibility, constitutional compliance

  - Evidence: `evidence/T001/` with schema definition screenshots, validation test results4. Apply task rules:

  - MCP: N/A (schema definition)   ✅ Different files = marked [P] for parallel execution

  - Validation: `node .specify/tools/pre-task-check.js T001`   ✅ Same file = sequential (no [P] marking)

  - Completion: `node .specify/tools/post-task-validation.js T001`   ✅ Tests before implementation (TDD approach)

5. Number tasks sequentially (T001, T002...)

- [ ] T002 Create quote service layer in packages/web/src/services/quoteService.ts   ✅ 33 tasks generated covering all functional requirements

  - Evidence: `evidence/T002/` with service implementation, API integration patterns6. Generate dependency graph

  - MCP: N/A (service layer)   ✅ Dependencies mapped for proper execution order

  - Validation: `node .specify/tools/pre-task-check.js T002`7. Create parallel execution examples

  - Completion: `node .specify/tools/post-task-validation.js T002`   ✅ Parallel task groups identified and documented

8. Validate task completeness:

- [ ] T003 Create audit service for quote operations in packages/web/src/services/auditService.ts   ✅ All API contracts have corresponding tests

  - Evidence: `evidence/T003/` with audit logging implementation, test results   ✅ All entities have model/interface definitions

  - MCP: N/A (service layer)   ✅ All components have implementation and test tasks

  - Validation: `node .specify/tools/pre-task-check.js T003`9. Return: SUCCESS (tasks ready for execution)

  - Completion: `node .specify/tools/post-task-validation.js T003````



## Phase 2: Test-First Development (TDD) ⚠️ MUST COMPLETE BEFORE PHASE 3## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**- Include exact file paths in descriptions



- [ ] T004 [P] Contract test GET /api/quotes in packages/web/tests/contract/quotes-get.test.ts## Path Conventions

  - Evidence: `evidence/T004/` with failing test results, contract test coverage- **Web app structure**: `src/components/`, `src/services/`, `src/types/`, `tests/`

  - MCP: Browser test quote list API endpoint with network tab validation- Paths based on Next.js 15 App Router with TypeScript

  - Validation: `node .specify/tools/pre-task-check.js T004`

  - Completion: `node .specify/tools/post-task-validation.js T004`## Phase 3.1: Setup & Constitutional Framework

- [ ] T001 Initialize constitutional development environment and validation tools

- [ ] T005 [P] Contract test POST /api/quotes in packages/web/tests/contract/quotes-post.test.ts- [ ] T002 [P] Configure TypeScript strict mode and Zod validation schemas

  - Evidence: `evidence/T005/` with failing test results, contract validation- [ ] T003 [P] Set up TanStack Query v5 configuration with proper error boundaries

  - MCP: Browser test quote creation API with request/response validation- [ ] T004 [P] Configure Jest and React Testing Library for constitutional testing requirements

  - Validation: `node .specify/tools/pre-task-check.js T005`

  - Completion: `node .specify/tools/post-task-validation.js T005`## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T006 [P] Contract test PUT /api/quotes/{id} in packages/web/tests/contract/quotes-put.test.ts

  - Evidence: `evidence/T006/` with failing test results, update validation tests### API Contract Tests

  - MCP: Browser test quote update API with data persistence validation- [ ] T005 [P] Contract test GET /api/quotes in tests/contract/quotes-get.test.ts

  - Validation: `node .specify/tools/pre-task-check.js T006`- [ ] T006 [P] Contract test POST /api/quotes in tests/contract/quotes-post.test.ts

  - Completion: `node .specify/tools/post-task-validation.js T006`- [ ] T007 [P] Contract test PUT /api/quotes/:id in tests/contract/quotes-put.test.ts

- [ ] T008 [P] Contract test POST /api/quotes/:id/duplicate in tests/contract/quotes-duplicate.test.ts

- [ ] T007 [P] Contract test POST /api/quotes/{id}/duplicate in packages/web/tests/contract/quotes-duplicate.test.ts- [ ] T009 [P] Contract test POST /api/quotes/:id/convert in tests/contract/quotes-convert.test.ts

  - Evidence: `evidence/T007/` with failing test results, duplication logic tests- [ ] T010 [P] Contract test POST /api/quotes/bulk/status-update in tests/contract/quotes-bulk.test.ts

  - MCP: Browser test quote duplication API with data integrity validation- [ ] T011 [P] Contract test POST /api/quotes/export in tests/contract/quotes-export.test.ts

  - Validation: `node .specify/tools/pre-task-check.js T007`

  - Completion: `node .specify/tools/post-task-validation.js T007`### Component Integration Tests

- [ ] T012 [P] Integration test QuoteActionMenu business logic restoration in tests/integration/quote-actions.test.tsx

- [ ] T008 [P] Contract test POST /api/quotes/{id}/convert in packages/web/tests/contract/quotes-convert.test.ts- [ ] T013 [P] Integration test QuoteComposer navigation flow in tests/integration/quote-composer.test.tsx

  - Evidence: `evidence/T008/` with failing test results, conversion workflow tests- [ ] T014 [P] Integration test QuoteExportSystem PDF/Excel generation in tests/integration/quote-export.test.tsx

  - MCP: Browser test quote conversion API with business logic validation- [ ] T015 [P] Integration test BulkOperations progress tracking in tests/integration/bulk-operations.test.tsx

  - Validation: `node .specify/tools/pre-task-check.js T008`- [ ] T016 [P] Integration test QuoteFilters date range and search in tests/integration/quote-filters.test.tsx

  - Completion: `node .specify/tools/post-task-validation.js T008`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T009 [P] Contract test POST /api/quotes/bulk in packages/web/tests/contract/quotes-bulk.test.ts

  - Evidence: `evidence/T009/` with failing test results, bulk operation tests### P0 Critical Fixes - Restore Broken Functionality

  - MCP: Browser test bulk operations API with progress tracking validation- [ ] T017 [P] Define Quote entity types and Zod schemas in src/types/quote.ts

  - Validation: `node .specify/tools/pre-task-check.js T009`- [ ] T018 [P] Define BulkOperation and Export entity types in src/types/operations.ts

  - Completion: `node .specify/tools/post-task-validation.js T009`- [ ] T019 Implement QuoteService with TanStack Query mutations in src/services/quoteService.ts

- [ ] T020 Fix QuoteActionMenu business logic (remove console.log placeholders) in src/components/quotes/QuoteActionMenu.tsx

- [ ] T010 [P] Contract test GET /api/quotes/{id}/export in packages/web/tests/contract/quotes-export.test.ts- [ ] T021 Restore QuoteComposer navigation integration in src/components/quotes/QuoteList.tsx

  - Evidence: `evidence/T010/` with failing test results, export API tests- [ ] T022 Implement quote status update API integration with optimistic updates in src/hooks/useQuoteOperations.ts

  - MCP: Browser test export API with file generation validation

  - Validation: `node .specify/tools/pre-task-check.js T010`### P1 Missing Features - New Functionality Implementation

  - Completion: `node .specify/tools/post-task-validation.js T010`- [ ] T023 [P] Implement QuoteExportSystem with PDF individual generation in src/components/quotes/export/QuoteExportSystem.tsx

- [ ] T024 [P] Implement Excel bulk export functionality in src/services/exportService.ts

- [ ] T011 [P] Integration test quote edit workflow in packages/web/tests/integration/quote-actions.test.tsx- [ ] T025 Implement BulkOperations component with progress bar and cancel in src/components/quotes/bulk/BulkOperations.tsx

  - Evidence: `evidence/T011/` with failing integration tests, user workflow tests- [ ] T026 [P] Implement QuotePreviewModal for quick quote details in src/components/quotes/QuotePreviewModal.tsx

  - MCP: **REQUIRED** - Browser test complete edit workflow with screenshots- [ ] T027 [P] Implement QuoteFilters with date range picker in src/components/quotes/QuoteFilters.tsx

  - Validation: `node .specify/tools/pre-task-check.js T011`- [ ] T028 Implement enhanced search with quote number/customer filtering in src/hooks/useQuoteSearch.ts

  - Completion: `node .specify/tools/post-task-validation.js T011`

## Phase 3.4: Integration & Performance

- [ ] T012 [P] Integration test quote filtering system in packages/web/tests/integration/quote-filters.test.tsx- [ ] T029 Implement progressive loading with skeleton states for 1,000+ quotes in src/hooks/useProgressiveQuoteLoading.ts

  - Evidence: `evidence/T012/` with failing filter tests, search validation- [ ] T030 Configure bundle optimization and performance monitoring for quote components

  - MCP: **REQUIRED** - Browser test filtering UI with multiple filter combinations

  - Validation: `node .specify/tools/pre-task-check.js T012`## Phase 3.5: Missing Requirements Coverage

  - Completion: `node .specify/tools/post-task-validation.js T012`- [ ] T031 [P] Implement keyboard shortcuts for power users (Ctrl+N new quote, Ctrl+E edit, Ctrl+D duplicate) in src/hooks/useKeyboardShortcuts.ts

- [ ] T032 [P] Implement mobile responsiveness testing and validation for quote management workflows in tests/integration/mobile-responsive.test.tsx

- [ ] T013 [P] Integration test bulk operations in packages/web/tests/integration/bulk-operations.test.tsx- [ ] T033 [P] Implement audit logging for quote status changes and operations in src/services/auditService.ts

  - Evidence: `evidence/T013/` with failing bulk operation tests, progress validation

  - MCP: **REQUIRED** - Browser test bulk operations with progress bar validation## Dependencies

  - Validation: `node .specify/tools/pre-task-check.js T013`- Setup (T001-T004) before all other phases

  - Completion: `node .specify/tools/post-task-validation.js T013`- Tests (T005-T016) before implementation (T017-T033)

- T017-T018 (types) before all service and component tasks

- [ ] T014 [P] Integration test export system in packages/web/tests/integration/quote-export.test.tsx- T019 (QuoteService) blocks T020-T022, T028

  - Evidence: `evidence/T014/` with failing export tests, file generation validation- T023-T024 (export services) before T025 (bulk operations integration)

  - MCP: **REQUIRED** - Browser test export functionality with file download validation- T026-T027 can run in parallel after T017-T018

  - Validation: `node .specify/tools/pre-task-check.js T014`- Performance tasks (T029-T030) after all functional implementation

  - Completion: `node .specify/tools/post-task-validation.js T014`- Missing requirements tasks (T031-T033) can run in parallel after T017-T018



## Phase 3: Core Implementation (ONLY after tests are failing)## Parallel Execution Examples



- [ ] T015 Fix QuoteActionMenu console.log placeholders in packages/web/src/components/quotes/QuoteActionMenu.tsx### Phase 3.2 - Contract Tests (can run simultaneously)

  - Evidence: `evidence/T015/` with before/after code comparison, functional validation```bash

  - MCP: **REQUIRED** - Browser test all quote actions (Edit, Duplicate, Convert, Archive) with interaction logging# Launch T005-T011 together:

  - Validation: `node .specify/tools/pre-task-check.js T015`Task: "Contract test GET /api/quotes in tests/contract/quotes-get.test.ts"

  - Completion: `node .specify/tools/post-task-validation.js T015`Task: "Contract test POST /api/quotes in tests/contract/quotes-post.test.ts" 

Task: "Contract test PUT /api/quotes/:id in tests/contract/quotes-put.test.ts"

- [ ] T016 Restore quote navigation in packages/web/src/components/quotes/QuoteList.tsxTask: "Contract test POST /api/quotes/:id/duplicate in tests/contract/quotes-duplicate.test.ts"

  - Evidence: `evidence/T016/` with navigation implementation, route testingTask: "Contract test POST /api/quotes/:id/convert in tests/contract/quotes-convert.test.ts"

  - MCP: **REQUIRED** - Browser test quote edit navigation with page transitionsTask: "Contract test POST /api/quotes/bulk/status-update in tests/contract/quotes-bulk.test.ts"

  - Validation: `node .specify/tools/pre-task-check.js T016`Task: "Contract test POST /api/quotes/export in tests/contract/quotes-export.test.ts"

  - Completion: `node .specify/tools/post-task-validation.js T016````



- [ ] T017 Implement useQuoteOperations hook in packages/web/src/hooks/quotes/useQuoteOperations.ts### Phase 3.2 - Integration Tests (can run simultaneously)  

  - Evidence: `evidence/T017/` with hook implementation, state management validation```bash

  - MCP: **REQUIRED** - Browser test hook integration with quote operations# Launch T012-T016 together:

  - Validation: `node .specify/tools/pre-task-check.js T017`Task: "Integration test QuoteActionMenu business logic restoration in tests/integration/quote-actions.test.tsx"

  - Completion: `node .specify/tools/post-task-validation.js T017`Task: "Integration test QuoteComposer navigation flow in tests/integration/quote-composer.test.tsx"

Task: "Integration test QuoteExportSystem PDF/Excel generation in tests/integration/quote-export.test.tsx"

- [ ] T018 Create quote search functionality in packages/web/src/hooks/useQuoteSearch.tsTask: "Integration test BulkOperations progress tracking in tests/integration/bulk-operations.test.tsx"

  - Evidence: `evidence/T018/` with search implementation, performance metricsTask: "Integration test QuoteFilters date range and search in tests/integration/quote-filters.test.tsx"

  - MCP: **REQUIRED** - Browser test search functionality with various query types```

  - Validation: `node .specify/tools/pre-task-check.js T018`

  - Completion: `node .specify/tools/post-task-validation.js T018`### Phase 3.3 - Type Definitions (can run simultaneously)

```bash

- [ ] T019 [P] Implement progressive loading hook in packages/web/src/hooks/useProgressiveQuoteLoading.ts# Launch T017-T018 together:

  - Evidence: `evidence/T019/` with loading implementation, performance validationTask: "Define Quote entity types and Zod schemas in src/types/quote.ts"

  - MCP: **REQUIRED** - Browser test progressive loading with 1,000+ quotes simulationTask: "Define BulkOperation and Export entity types in src/types/operations.ts"

  - Validation: `node .specify/tools/pre-task-check.js T019````

  - Completion: `node .specify/tools/post-task-validation.js T019`

### Phase 3.3 - Independent Components (after T017-T018 complete)

- [ ] T020 [P] Create quote skeleton component in packages/web/src/components/quotes/QuoteSkeleton.tsx```bash

  - Evidence: `evidence/T020/` with skeleton UI implementation, loading state validation# Launch T023, T024, T026, T027 together:

  - MCP: **REQUIRED** - Browser test skeleton loading states with screenshotsTask: "Implement QuoteExportSystem with PDF individual generation in src/components/quotes/export/QuoteExportSystem.tsx"

  - Validation: `node .specify/tools/pre-task-check.js T020`Task: "Implement Excel bulk export functionality in src/services/exportService.ts"

  - Completion: `node .specify/tools/post-task-validation.js T020`Task: "Implement QuotePreviewModal for quick quote details in src/components/quotes/QuotePreviewModal.tsx"

Task: "Implement QuoteFilters with date range picker in src/components/quotes/QuoteFilters.tsx"

## Phase 4: Missing Features Implementation```



- [ ] T021 Create quote preview modal in packages/web/src/components/quotes/QuotePreviewModal.tsx### Phase 3.5 - Missing Requirements (can run simultaneously after T017-T018)

  - Evidence: `evidence/T021/` with modal implementation, accessibility validation```bash

  - MCP: **REQUIRED** - Browser test modal functionality with keyboard navigation# Launch T031-T033 together:

  - Validation: `node .specify/tools/pre-task-check.js T021`Task: "Implement keyboard shortcuts for power users (Ctrl+N new quote, Ctrl+E edit, Ctrl+D duplicate) in src/hooks/useKeyboardShortcuts.ts"

  - Completion: `node .specify/tools/post-task-validation.js T021`Task: "Implement mobile responsiveness testing and validation for quote management workflows in tests/integration/mobile-responsive.test.tsx"

Task: "Implement audit logging for quote status changes and operations in src/services/auditService.ts"

- [ ] T022 Implement date range filtering in packages/web/src/components/quotes/QuoteFilters.tsx```

  - Evidence: `evidence/T022/` with date picker implementation, filter validation

  - MCP: **REQUIRED** - Browser test date range filtering with multiple date ranges## Constitutional Compliance Requirements

  - Validation: `node .specify/tools/pre-task-check.js T022`

  - Completion: `node .specify/tools/post-task-validation.js T022`### Evidence-First Development (Apply to ALL tasks)

- Every task completion MUST be validated with `node .specify/tools/constitutional-checker.js`

- [ ] T023 Create export service layer in packages/web/src/services/exportService.ts- UI functionality MUST be verified with MCP browser testing

  - Evidence: `evidence/T023/` with export service implementation, file generation tests- Progress claims MUST be supported by demonstrable evidence

  - MCP: N/A (service layer)- No console.log placeholders allowed in production code

  - Validation: `node .specify/tools/pre-task-check.js T023`

  - Completion: `node .specify/tools/post-task-validation.js T023`### Test Coverage Requirements

- Unit tests: ≥90% coverage for all business logic

- [ ] T024 Build quote export system in packages/web/src/components/quotes/export/QuoteExportSystem.tsx- Integration tests: All user workflows must be covered

  - Evidence: `evidence/T024/` with export UI implementation, user workflow validation- Contract tests: All API endpoints must have corresponding tests

  - MCP: **REQUIRED** - Browser test export system with PDF and Excel generation- Component tests: All UI interactions must be tested

  - Validation: `node .specify/tools/pre-task-check.js T024`

  - Completion: `node .specify/tools/post-task-validation.js T024`### Performance Requirements  

- Quote list loading: <3s initial load with progressive loading

- [ ] T025 Implement bulk operations UI in packages/web/src/components/quotes/bulk/BulkOperations.tsx- User interactions: <100ms response time maintained

  - Evidence: `evidence/T025/` with bulk UI implementation, progress tracking- 1,000+ quotes: Virtual scrolling and skeleton states required

  - MCP: **REQUIRED** - Browser test bulk operations with selection and progress validation- Bundle size: Monitor and optimize to prevent degradation

  - Validation: `node .specify/tools/pre-task-check.js T025`

  - Completion: `node .specify/tools/post-task-validation.js T025`### Accessibility Requirements

- WCAG 2.1 AA compliance for all quote components

- [ ] T026 [P] Create keyboard shortcuts system in packages/web/src/hooks/useKeyboardShortcuts.ts- Screen reader compatibility tested and validated

  - Evidence: `evidence/T026/` with keyboard implementation, accessibility validation- Keyboard navigation fully functional

  - MCP: **REQUIRED** - Browser test keyboard shortcuts with key event validation- Focus management implemented correctly

  - Validation: `node .specify/tools/pre-task-check.js T026`

  - Completion: `node .specify/tools/post-task-validation.js T026`## Task Details



- [ ] T027 [P] Create keyboard shortcuts help modal in packages/web/src/components/ui/KeyboardShortcutsHelp.tsx### T001: Initialize Constitutional Development Environment

  - Evidence: `evidence/T027/` with help modal implementation, user guidance validation**Priority**: P0 | **Size**: Small | **Files**: `.specify/`, `package.json`

  - MCP: **REQUIRED** - Browser test help modal with keyboard navigation**Acceptance Criteria**:

  - Validation: `node .specify/tools/pre-task-check.js T027`- [ ] Constitutional checker tool is functional

  - Completion: `node .specify/tools/post-task-validation.js T027`- [ ] Component status template is available

- [ ] Validation scripts are executable

## Phase 5: Polish & Optimization- [ ] Development environment follows constitutional principles



- [ ] T028 [P] Create performance configuration in packages/web/src/config/performance.ts### T005: Contract Test GET /api/quotes

  - Evidence: `evidence/T028/` with performance configuration, metrics validation**Priority**: P0 | **Size**: Small | **Files**: `tests/contract/quotes-get.test.ts`

  - MCP: N/A (configuration)**Acceptance Criteria**:

  - Validation: `node .specify/tools/pre-task-check.js T028`- [ ] Test validates GetQuotesRequest interface

  - Completion: `node .specify/tools/post-task-validation.js T028`- [ ] Test validates GetQuotesResponse structure

- [ ] Test validates pagination parameters

- [ ] T029 [P] Add utility functions for currency and date in packages/web/src/utils/- [ ] Test validates filter parameters

  - Evidence: `evidence/T029/` with utility implementation, unit test coverage- [ ] Test MUST FAIL before implementation

  - MCP: N/A (utility functions)

  - Validation: `node .specify/tools/pre-task-check.js T029`### T020: Fix QuoteActionMenu Business Logic

  - Completion: `node .specify/tools/post-task-validation.js T029`**Priority**: P0 | **Size**: Medium | **Files**: `src/components/quotes/QuoteActionMenu.tsx`

**Acceptance Criteria**:

- [ ] T030 Create mobile responsive tests in packages/web/tests/integration/mobile-responsive.test.ts- [ ] All console.log placeholders replaced with actual business logic

  - Evidence: `evidence/T030/` with responsive test implementation, device testing- [ ] Loading states implemented for all actions

  - MCP: **REQUIRED** - Browser test responsive design on multiple device sizes- [ ] Error handling with user-friendly messages

  - Validation: `node .specify/tools/pre-task-check.js T030`- [ ] Success notifications implemented

  - Completion: `node .specify/tools/post-task-validation.js T030`- [ ] **MCP Validation**: Browser test each action (Edit, Duplicate, Convert, Archive) executes business logic

- [ ] **Constitutional Validation**: Run `node .specify/tools/constitutional-checker.js` and achieve LEVEL 4+ status

## Dependencies- [ ] **Evidence Documentation**: Document validation steps with screenshots and test results



**Sequential Dependencies**:### T023: Implement QuoteExportSystem

- T001, T002, T003 → All other tasks (foundation)**Priority**: P1 | **Size**: Large | **Files**: `src/components/quotes/export/QuoteExportSystem.tsx`

- T004-T014 → T015-T030 (tests before implementation)**Acceptance Criteria**:

- T015 → T016 (fix actions before navigation)- [ ] PDF generation for individual quotes

- T016 → T017 (navigation before operations)- [ ] Export options UI (include details, date range)

- T023 → T024 (service before UI)- [ ] Progress tracking during export generation

- [ ] Download functionality implemented

**Parallel Groups** [P]:- [ ] Error handling for export failures

- T004-T014: All contract and integration tests can run in parallel- [ ] Constitutional LEVEL 4+ completion achieved

- T019, T020: Loading components can be developed independently

- T026, T027: Keyboard shortcuts components independent### T025: Implement BulkOperations Component

- T028, T029: Configuration and utilities independent**Priority**: P1 | **Size**: Large | **Files**: `src/components/quotes/bulk/BulkOperations.tsx`

- T030: Mobile testing independent**Acceptance Criteria**:

- [ ] Simple progress bar with percentage display

## Constitutional Validation Requirements- [ ] Cancel operation functionality

- [ ] Completion notification system

- **Evidence Directories**: All tasks must create `evidence/[taskId]/` with required artifacts- [ ] Error handling for partial failures

- **MCP Browser Testing**: 18 tasks require browser interaction evidence and screenshots- [ ] Integration with bulk operation API

- **Anti-Hallucination**: All console.log placeholders must be replaced with functional business logic- [ ] Constitutional compliance validation

- **Validation Gates**: Pre and post-task validation must pass for each task

- **Compliance Threshold**: Must maintain ≥80% constitutional compliance throughout### T031: Implement Keyboard Shortcuts for Power Users

**Priority**: P2 | **Size**: Medium | **Files**: `src/hooks/useKeyboardShortcuts.ts`

## Parallel Execution Examples**Acceptance Criteria**:

- [ ] Ctrl+N creates new quote (navigates to composer)

**Test Phase** (after T003):- [ ] Ctrl+E edits selected quote

```bash- [ ] Ctrl+D duplicates selected quote

# Run contract tests in parallel- [ ] Ctrl+F focuses search input

Task T004 & Task T005 & Task T006 & Task T007 & Task T008 & Task T009 & Task T010- [ ] Accessibility compliance (screen reader announces shortcuts)

- [ ] **MCP Validation**: Test keyboard shortcuts work in browser

# Run integration tests in parallel  - [ ] **Constitutional Validation**: LEVEL 4+ completion with evidence

Task T011 & Task T012 & Task T013 & Task T014

```### T032: Implement Mobile Responsiveness Testing

**Priority**: P2 | **Size**: Medium | **Files**: `tests/integration/mobile-responsive.test.tsx`

**Polish Phase** (after T027):**Acceptance Criteria**:

```bash- [ ] Quote list displays properly on mobile (320px-768px)

# Run optimization tasks in parallel- [ ] Quote actions accessible via touch interface

Task T028 & Task T029 & Task T030- [ ] Export functionality works on mobile devices

```- [ ] Navigation flows optimized for mobile UX

- [ ] **MCP Validation**: Test responsive behavior in browser dev tools

---- [ ] **Constitutional Validation**: Document mobile UX validation evidence



**CONSTITUTIONAL MANDATE**: This tasks.md is immediately executable with constitutional compliance - each task includes evidence requirements, MCP validation for UI functionality, and validation gates to prevent hallucination-based false completion claims.### T033: Implement Audit Logging Service
**Priority**: P3 | **Size**: Medium | **Files**: `src/services/auditService.ts`
**Acceptance Criteria**:
- [ ] Log all quote status changes with user, timestamp, old/new values
- [ ] Log quote operations (create, edit, duplicate, convert, archive)
- [ ] Log bulk operations with affected quote IDs
- [ ] Integration with existing API error handling
- [ ] **Constitutional Validation**: Test coverage ≥90% for audit functions
- [ ] **Evidence Documentation**: Validate audit logs are created and stored correctly

## Success Criteria

### Functional Success
- [ ] All 22 functional requirements implemented and tested (100% coverage achieved)
- [ ] Zero console.log placeholders in production code
- [ ] All quote actions execute actual business logic
- [ ] Export system generates valid PDF and Excel files
- [ ] Bulk operations provide proper user feedback
- [ ] Keyboard shortcuts implemented for power users
- [ ] Mobile responsiveness validated across quote workflows
- [ ] Audit logging captures all quote operations

### Technical Success
- [ ] ≥90% test coverage across all quote functionality
- [ ] All components achieve LEVEL 4+ constitutional status
- [ ] Performance requirements met (100ms response, progressive loading)
- [ ] WCAG 2.1 AA accessibility compliance validated
- [ ] Mobile responsiveness tested and functional
- [ ] Bundle size optimization maintained

### Constitutional Success
- [ ] All progress claims validated with constitutional checker
- [ ] MCP browser testing confirms actual functionality
- [ ] No false functionality claims in documentation
- [ ] Evidence-first development principles followed throughout
- [ ] All 33 tasks include explicit validation requirements

## Notes
- [P] tasks can run in parallel (different files, no shared dependencies)
- Verify all tests fail before implementing corresponding functionality
- Commit constitutional validation results after each task completion
- Use MCP browser testing for all UI functionality claims
- Follow TDD approach: Tests → Implementation → Refactor → Validate