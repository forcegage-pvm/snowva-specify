# Tasks: Quotes Technical Debt Resolution & Missing Features Implementation

**Input**: Design documents from `/specs/007-quotes-technical-debt/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   ✅ COMPLETED: Tech stack extracted (TypeScript 5.1+, Next.js 15, React 18, TanStack Query)
2. Load optional design documents:
   ✅ data-model.md: Entities extracted (Quote, QuoteOperation, BulkOperation, ExportRequest)
   ✅ contracts/: API and component contracts loaded
   ✅ research.md: Architecture decisions and current state analysis loaded
3. Generate tasks by category:
   ✅ Setup: project dependencies, constitutional tools setup
   ✅ Tests: contract tests for API endpoints, component integration tests
   ✅ Core: quote models, services, components restoration
   ✅ Integration: API integration, bulk operations, export system
   ✅ Polish: performance optimization, accessibility, constitutional compliance
4. Apply task rules:
   ✅ Different files = marked [P] for parallel execution
   ✅ Same file = sequential (no [P] marking)
   ✅ Tests before implementation (TDD approach)
5. Number tasks sequentially (T001, T002...)
   ✅ 33 tasks generated covering all functional requirements
6. Generate dependency graph
   ✅ Dependencies mapped for proper execution order
7. Create parallel execution examples
   ✅ Parallel task groups identified and documented
8. Validate task completeness:
   ✅ All API contracts have corresponding tests
   ✅ All entities have model/interface definitions
   ✅ All components have implementation and test tasks
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app structure**: `src/components/`, `src/services/`, `src/types/`, `tests/`
- Paths based on Next.js 15 App Router with TypeScript

## Phase 3.1: Setup & Constitutional Framework
- [ ] T001 Initialize constitutional development environment and validation tools
- [ ] T002 [P] Configure TypeScript strict mode and Zod validation schemas
- [ ] T003 [P] Set up TanStack Query v5 configuration with proper error boundaries
- [ ] T004 [P] Configure Jest and React Testing Library for constitutional testing requirements

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Contract Tests
- [ ] T005 [P] Contract test GET /api/quotes in tests/contract/quotes-get.test.ts
- [ ] T006 [P] Contract test POST /api/quotes in tests/contract/quotes-post.test.ts
- [ ] T007 [P] Contract test PUT /api/quotes/:id in tests/contract/quotes-put.test.ts
- [ ] T008 [P] Contract test POST /api/quotes/:id/duplicate in tests/contract/quotes-duplicate.test.ts
- [ ] T009 [P] Contract test POST /api/quotes/:id/convert in tests/contract/quotes-convert.test.ts
- [ ] T010 [P] Contract test POST /api/quotes/bulk/status-update in tests/contract/quotes-bulk.test.ts
- [ ] T011 [P] Contract test POST /api/quotes/export in tests/contract/quotes-export.test.ts

### Component Integration Tests
- [ ] T012 [P] Integration test QuoteActionMenu business logic restoration in tests/integration/quote-actions.test.tsx
- [ ] T013 [P] Integration test QuoteComposer navigation flow in tests/integration/quote-composer.test.tsx
- [ ] T014 [P] Integration test QuoteExportSystem PDF/Excel generation in tests/integration/quote-export.test.tsx
- [ ] T015 [P] Integration test BulkOperations progress tracking in tests/integration/bulk-operations.test.tsx
- [ ] T016 [P] Integration test QuoteFilters date range and search in tests/integration/quote-filters.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### P0 Critical Fixes - Restore Broken Functionality
- [ ] T017 [P] Define Quote entity types and Zod schemas in src/types/quote.ts
- [ ] T018 [P] Define BulkOperation and Export entity types in src/types/operations.ts
- [ ] T019 Implement QuoteService with TanStack Query mutations in src/services/quoteService.ts
- [ ] T020 Fix QuoteActionMenu business logic (remove console.log placeholders) in src/components/quotes/QuoteActionMenu.tsx
- [ ] T021 Restore QuoteComposer navigation integration in src/components/quotes/QuoteList.tsx
- [ ] T022 Implement quote status update API integration with optimistic updates in src/hooks/useQuoteOperations.ts

### P1 Missing Features - New Functionality Implementation
- [ ] T023 [P] Implement QuoteExportSystem with PDF individual generation in src/components/quotes/export/QuoteExportSystem.tsx
- [ ] T024 [P] Implement Excel bulk export functionality in src/services/exportService.ts
- [ ] T025 Implement BulkOperations component with progress bar and cancel in src/components/quotes/bulk/BulkOperations.tsx
- [ ] T026 [P] Implement QuotePreviewModal for quick quote details in src/components/quotes/QuotePreviewModal.tsx
- [ ] T027 [P] Implement QuoteFilters with date range picker in src/components/quotes/QuoteFilters.tsx
- [ ] T028 Implement enhanced search with quote number/customer filtering in src/hooks/useQuoteSearch.ts

## Phase 3.4: Integration & Performance
- [ ] T029 Implement progressive loading with skeleton states for 1,000+ quotes in src/hooks/useProgressiveQuoteLoading.ts
- [ ] T030 Configure bundle optimization and performance monitoring for quote components

## Phase 3.5: Missing Requirements Coverage
- [ ] T031 [P] Implement keyboard shortcuts for power users (Ctrl+N new quote, Ctrl+E edit, Ctrl+D duplicate) in src/hooks/useKeyboardShortcuts.ts
- [ ] T032 [P] Implement mobile responsiveness testing and validation for quote management workflows in tests/integration/mobile-responsive.test.tsx
- [ ] T033 [P] Implement audit logging for quote status changes and operations in src/services/auditService.ts

## Dependencies
- Setup (T001-T004) before all other phases
- Tests (T005-T016) before implementation (T017-T033)
- T017-T018 (types) before all service and component tasks
- T019 (QuoteService) blocks T020-T022, T028
- T023-T024 (export services) before T025 (bulk operations integration)
- T026-T027 can run in parallel after T017-T018
- Performance tasks (T029-T030) after all functional implementation
- Missing requirements tasks (T031-T033) can run in parallel after T017-T018

## Parallel Execution Examples

### Phase 3.2 - Contract Tests (can run simultaneously)
```bash
# Launch T005-T011 together:
Task: "Contract test GET /api/quotes in tests/contract/quotes-get.test.ts"
Task: "Contract test POST /api/quotes in tests/contract/quotes-post.test.ts" 
Task: "Contract test PUT /api/quotes/:id in tests/contract/quotes-put.test.ts"
Task: "Contract test POST /api/quotes/:id/duplicate in tests/contract/quotes-duplicate.test.ts"
Task: "Contract test POST /api/quotes/:id/convert in tests/contract/quotes-convert.test.ts"
Task: "Contract test POST /api/quotes/bulk/status-update in tests/contract/quotes-bulk.test.ts"
Task: "Contract test POST /api/quotes/export in tests/contract/quotes-export.test.ts"
```

### Phase 3.2 - Integration Tests (can run simultaneously)  
```bash
# Launch T012-T016 together:
Task: "Integration test QuoteActionMenu business logic restoration in tests/integration/quote-actions.test.tsx"
Task: "Integration test QuoteComposer navigation flow in tests/integration/quote-composer.test.tsx"
Task: "Integration test QuoteExportSystem PDF/Excel generation in tests/integration/quote-export.test.tsx"
Task: "Integration test BulkOperations progress tracking in tests/integration/bulk-operations.test.tsx"
Task: "Integration test QuoteFilters date range and search in tests/integration/quote-filters.test.tsx"
```

### Phase 3.3 - Type Definitions (can run simultaneously)
```bash
# Launch T017-T018 together:
Task: "Define Quote entity types and Zod schemas in src/types/quote.ts"
Task: "Define BulkOperation and Export entity types in src/types/operations.ts"
```

### Phase 3.3 - Independent Components (after T017-T018 complete)
```bash
# Launch T023, T024, T026, T027 together:
Task: "Implement QuoteExportSystem with PDF individual generation in src/components/quotes/export/QuoteExportSystem.tsx"
Task: "Implement Excel bulk export functionality in src/services/exportService.ts"
Task: "Implement QuotePreviewModal for quick quote details in src/components/quotes/QuotePreviewModal.tsx"
Task: "Implement QuoteFilters with date range picker in src/components/quotes/QuoteFilters.tsx"
```

### Phase 3.5 - Missing Requirements (can run simultaneously after T017-T018)
```bash
# Launch T031-T033 together:
Task: "Implement keyboard shortcuts for power users (Ctrl+N new quote, Ctrl+E edit, Ctrl+D duplicate) in src/hooks/useKeyboardShortcuts.ts"
Task: "Implement mobile responsiveness testing and validation for quote management workflows in tests/integration/mobile-responsive.test.tsx"
Task: "Implement audit logging for quote status changes and operations in src/services/auditService.ts"
```

## Constitutional Compliance Requirements

### Evidence-First Development (Apply to ALL tasks)
- Every task completion MUST be validated with `node .specify/tools/constitutional-checker.js`
- UI functionality MUST be verified with MCP browser testing
- Progress claims MUST be supported by demonstrable evidence
- No console.log placeholders allowed in production code

### Test Coverage Requirements
- Unit tests: ≥90% coverage for all business logic
- Integration tests: All user workflows must be covered
- Contract tests: All API endpoints must have corresponding tests
- Component tests: All UI interactions must be tested

### Performance Requirements  
- Quote list loading: <3s initial load with progressive loading
- User interactions: <100ms response time maintained
- 1,000+ quotes: Virtual scrolling and skeleton states required
- Bundle size: Monitor and optimize to prevent degradation

### Accessibility Requirements
- WCAG 2.1 AA compliance for all quote components
- Screen reader compatibility tested and validated
- Keyboard navigation fully functional
- Focus management implemented correctly

## Task Details

### T001: Initialize Constitutional Development Environment
**Priority**: P0 | **Size**: Small | **Files**: `.specify/`, `package.json`
**Acceptance Criteria**:
- [ ] Constitutional checker tool is functional
- [ ] Component status template is available
- [ ] Validation scripts are executable
- [ ] Development environment follows constitutional principles

### T005: Contract Test GET /api/quotes
**Priority**: P0 | **Size**: Small | **Files**: `tests/contract/quotes-get.test.ts`
**Acceptance Criteria**:
- [ ] Test validates GetQuotesRequest interface
- [ ] Test validates GetQuotesResponse structure
- [ ] Test validates pagination parameters
- [ ] Test validates filter parameters
- [ ] Test MUST FAIL before implementation

### T020: Fix QuoteActionMenu Business Logic
**Priority**: P0 | **Size**: Medium | **Files**: `src/components/quotes/QuoteActionMenu.tsx`
**Acceptance Criteria**:
- [ ] All console.log placeholders replaced with actual business logic
- [ ] Loading states implemented for all actions
- [ ] Error handling with user-friendly messages
- [ ] Success notifications implemented
- [ ] **MCP Validation**: Browser test each action (Edit, Duplicate, Convert, Archive) executes business logic
- [ ] **Constitutional Validation**: Run `node .specify/tools/constitutional-checker.js` and achieve LEVEL 4+ status
- [ ] **Evidence Documentation**: Document validation steps with screenshots and test results

### T023: Implement QuoteExportSystem
**Priority**: P1 | **Size**: Large | **Files**: `src/components/quotes/export/QuoteExportSystem.tsx`
**Acceptance Criteria**:
- [ ] PDF generation for individual quotes
- [ ] Export options UI (include details, date range)
- [ ] Progress tracking during export generation
- [ ] Download functionality implemented
- [ ] Error handling for export failures
- [ ] Constitutional LEVEL 4+ completion achieved

### T025: Implement BulkOperations Component
**Priority**: P1 | **Size**: Large | **Files**: `src/components/quotes/bulk/BulkOperations.tsx`
**Acceptance Criteria**:
- [ ] Simple progress bar with percentage display
- [ ] Cancel operation functionality
- [ ] Completion notification system
- [ ] Error handling for partial failures
- [ ] Integration with bulk operation API
- [ ] Constitutional compliance validation

### T031: Implement Keyboard Shortcuts for Power Users
**Priority**: P2 | **Size**: Medium | **Files**: `src/hooks/useKeyboardShortcuts.ts`
**Acceptance Criteria**:
- [ ] Ctrl+N creates new quote (navigates to composer)
- [ ] Ctrl+E edits selected quote
- [ ] Ctrl+D duplicates selected quote
- [ ] Ctrl+F focuses search input
- [ ] Accessibility compliance (screen reader announces shortcuts)
- [ ] **MCP Validation**: Test keyboard shortcuts work in browser
- [ ] **Constitutional Validation**: LEVEL 4+ completion with evidence

### T032: Implement Mobile Responsiveness Testing
**Priority**: P2 | **Size**: Medium | **Files**: `tests/integration/mobile-responsive.test.tsx`
**Acceptance Criteria**:
- [ ] Quote list displays properly on mobile (320px-768px)
- [ ] Quote actions accessible via touch interface
- [ ] Export functionality works on mobile devices
- [ ] Navigation flows optimized for mobile UX
- [ ] **MCP Validation**: Test responsive behavior in browser dev tools
- [ ] **Constitutional Validation**: Document mobile UX validation evidence

### T033: Implement Audit Logging Service
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