# Tasks: Quotes Technical Debt Resolution & Missing Features Implementation

**Branch**: 006-quotes-technical-debt | **Generated**: September 28, 2025  
**Sources**: /specs/006-quotes-technical-debt/spec.md, plan.md, data-model.md, contracts/, research.md, quickstart.md

## Constitutional Enforcement (MANDATORY)

**CRITICAL**: ALL tasks below are protected by Constitutional Amendments 1-3:

- **Pre-Task Gate**: node .specify/tools/pre-task-check.js [taskId] - MUST pass before starting
- **Evidence Directory**: Create evidence/[taskId]/ with required artifacts
- **MCP Browser Testing**: **REQUIRED** for ALL UI functionality - no exceptions
- **Post-Task Gate**: node .specify/tools/post-task-validation.js [taskId] - 3-gate validation
- **Constitutional Audit**: node .specify/tools/constitutional-audit.js - regular compliance checks

**ANTI-HALLUCINATION PROTOCOL**: NO task completion marking [x] without validation evidence

---

## 🎯 CURRENT STATUS & NEXT STEPS

**✅ COMPLETED TASKS**: 4/30 (13.3%)
- T001: Quote schema validation (Zod schemas) ✅
- T002: Quote service layer (API integration) ✅  
- T003: Audit service (operation logging) ✅
- T004: Contract test GET /api/quotes (15/15 tests passing) ✅

**🔥 IMMEDIATE NEXT PRIORITIES** (Test-First Development Phase):
1. **T005**: Contract test POST /api/quotes (quote creation API)
2. **T006**: Contract test PUT /api/quotes/{id} (quote updates API)
3. **T007**: Contract test POST /api/quotes/{id}/duplicate (duplication API)

**📋 READY FOR PARALLEL EXECUTION**:
- T005-T010: All contract tests can run simultaneously
- T011-T014: Integration tests (after contract tests complete)

**🔧 TDD-DRIVEN API FIXES** (Auto-Generated from Test Failures):
- T014.1-T014.3: CRITICAL API fixes identified by T005 contract tests (🚨 BLOCKING DEVELOPMENT)
- T014.4: HIGH priority API validation fix identified by T005 contract tests  
- T014.5-T014.6: MEDIUM priority API consistency fixes identified by T005 contract tests
- T014.7-T014.8: PENDING - Auto-generated after T006/T007 contract test execution

**⚠️ BLOCKED UNTIL API FIXES COMPLETE**:
- T015-T030: Core implementation and features (MUST wait for API layer stability)

**🏗️ CURRENT PHASE**: Phase 2 - Test-First Development (TDD)
**📊 CONSTITUTIONAL STATUS**: ✅ COMPLIANT - MCP Two-File Validation System Active

---

## Phase 1: Setup & Infrastructure

- [x] T001 Set up quote schema validation with Zod in packages/web/src/validation/quote-schema.ts
  - Evidence: evidence/T001/ with schema definition screenshots, validation test results
  - MCP: N/A (schema definition)
  - Validation: node .specify/tools/pre-task-check.js T001
  - Completion: node .specify/tools/post-task-validation.js T001

- [x] T002 Create quote service layer in packages/web/src/services/quoteService.ts
  - Evidence: evidence/T002/ with service implementation, API integration patterns
  - MCP: N/A (service layer)
  - Validation: node .specify/tools/pre-task-check.js T002
  - Completion: node .specify/tools/post-task-validation.js T002

- [x] T003 Create audit service for quote operations in packages/web/src/services/auditService.ts
  - Evidence: evidence/T003/ with audit logging implementation, test results
  - MCP: N/A (service layer)
  - Validation: node .specify/tools/pre-task-check.js T003
  - Completion: node .specify/tools/post-task-validation.js T003

## Phase 2: Test-First Development (TDD) ⚠️ MUST COMPLETE BEFORE PHASE 3

**CRITICAL**: These tests MUST be written and MUST FAIL before ANY implementation

- [x] T004 [P] Contract test GET /api/quotes in packages/web/tests/contract/quotes-get.test.ts
  - Evidence: evidence/T004/ with failing test results, contract test coverage
  - MCP: Browser test quote list API endpoint with network tab validation
  - Validation: node .specify/tools/pre-task-check.js T004
  - Completion: node .specify/tools/post-task-validation.js T004
  - **COMPLETED**: September 29, 2025 - Contract tests passing (15/15), MCP validation complete, constitutional compliance approved

- [x] T005 [P] Contract test POST /api/quotes in packages/web/tests/contract/quotes-post.test.ts
  - Evidence: evidence/T005/ with failing test results, contract validation, **technical-debt.json**
  - MCP: Browser test quote creation API with request/response validation
  - Validation: node .specify/tools/pre-task-check.js T005
  - Completion: node .specify/tools/post-task-validation.js T005
  - ✅ **COMPLETED**: September 29, 2025 - Constitutional compliance achieved with MANDATE 10 validation, proper POST testing completed, contract tests identifying real business logic gaps (discount calculation, unique ID generation)
  - 📊 **Technical Debt**: 6 items identified (3 CRITICAL, 1 HIGH, 2 MEDIUM) → Generated T014.1-T014.6 implementation tasks

- [ ] T006 [P] Contract test PUT /api/quotes/{id} in packages/web/tests/contract/quotes-put.test.ts
  - Evidence: evidence/T006/ with failing test results, update validation tests
  - MCP: Browser test quote update API with data persistence validation
  - Validation: node .specify/tools/pre-task-check.js T006
  - Completion: node .specify/tools/post-task-validation.js T006

- [ ] T007 [P] Contract test POST /api/quotes/{id}/duplicate in packages/web/tests/contract/quotes-duplicate.test.ts
  - Evidence: evidence/T007/ with failing test results, duplication logic tests
  - MCP: Browser test quote duplication API with data integrity validation
  - Validation: node .specify/tools/pre-task-check.js T007
  - Completion: node .specify/tools/post-task-validation.js T007

- [ ] T008 [P] Contract test POST /api/quotes/{id}/convert in packages/web/tests/contract/quotes-convert.test.ts
  - Evidence: evidence/T008/ with failing test results, conversion workflow tests
  - MCP: Browser test quote conversion API with business logic validation
  - Validation: node .specify/tools/pre-task-check.js T008
  - Completion: node .specify/tools/post-task-validation.js T008

- [ ] T009 [P] Contract test POST /api/quotes/bulk in packages/web/tests/contract/quotes-bulk.test.ts
  - Evidence: evidence/T009/ with failing test results, bulk operation tests
  - MCP: Browser test bulk operations API with progress tracking validation
  - Validation: node .specify/tools/pre-task-check.js T009
  - Completion: node .specify/tools/post-task-validation.js T009

- [ ] T010 [P] Contract test GET /api/quotes/{id}/export in packages/web/tests/contract/quotes-export.test.ts
  - Evidence: evidence/T010/ with failing test results, export API tests
  - MCP: Browser test export API with file generation validation
  - Validation: node .specify/tools/pre-task-check.js T010
  - Completion: node .specify/tools/post-task-validation.js T010

- [ ] T011 [P] Integration test quote edit workflow in packages/web/tests/integration/quote-actions.test.tsx
  - Evidence: evidence/T011/ with failing integration tests, user workflow tests
  - MCP: **REQUIRED** - Browser test complete edit workflow with screenshots
  - Validation: node .specify/tools/pre-task-check.js T011
  - Completion: node .specify/tools/post-task-validation.js T011

- [ ] T012 [P] Integration test quote filtering system in packages/web/tests/integration/quote-filters.test.tsx
  - Evidence: evidence/T012/ with failing filter tests, search validation
  - MCP: **REQUIRED** - Browser test filtering UI with multiple filter combinations
  - Validation: node .specify/tools/pre-task-check.js T012
  - Completion: node .specify/tools/post-task-validation.js T012

- [ ] T013 [P] Integration test bulk operations in packages/web/tests/integration/bulk-operations.test.tsx
  - Evidence: evidence/T013/ with failing bulk operation tests, progress validation
  - MCP: **REQUIRED** - Browser test bulk operations with progress bar validation
  - Validation: node .specify/tools/pre-task-check.js T013
  - Completion: node .specify/tools/post-task-validation.js T013

- [ ] T014 [P] Integration test export system in packages/web/tests/integration/quote-export.test.tsx
  - Evidence: evidence/T014/ with failing export tests, file generation validation
  - MCP: **REQUIRED** - Browser test export functionality with file download validation
  - Validation: node .specify/tools/pre-task-check.js T014
  - Completion: node .specify/tools/post-task-validation.js T014

## Phase 2.5: TDD-Identified Technical Debt Resolution

**CONSTITUTIONAL REQUIREMENT**: These tasks address business logic gaps identified by failing contract tests. They MUST be completed before Phase 3 UI implementation to ensure functional dependencies are satisfied.

- [ ] T014.1 [CRITICAL] Fix POST /api/quotes line item calculation logic in packages/web/src/app/api/v1/quotes/route.ts  
  - **TDD Source**: T005 contract test failures - "Expected: 135, Received: 150" for multi-item calculations
  - **Business Impact**: Incorrect quote totals, business calculation errors  
  - **Auto-Generated**: September 29, 2025 by tdd-debt-analyzer.js
  - Evidence: evidence/T014.1/ with line item calculation implementation, business logic validation
  - MCP: **REQUIRED** - Browser test quote creation with multiple items via API
  - Validation: node .specify/tools/pre-task-check.js T014.1
  - Completion: node .specify/tools/post-task-validation.js T014.1

- [ ] T014.2 [CRITICAL] Fix POST /api/quotes discount calculation logic in packages/web/src/app/api/v1/quotes/route.ts
  - **TDD Source**: T005 contract test failures - "Expected: 850, Received: 1000" for discount calculations
  - **Business Impact**: Quote totals incorrect, pricing integrity compromised
  - **Auto-Generated**: September 29, 2025 by tdd-debt-analyzer.js
  - Evidence: evidence/T014.2/ with discount calculation implementation, business logic validation
  - MCP: **REQUIRED** - Browser test quote creation with discount calculations via API
  - Validation: node .specify/tools/pre-task-check.js T014.2
  - Completion: node .specify/tools/post-task-validation.js T014.2

- [ ] T014.3 [CRITICAL] Fix POST /api/quotes unique ID generation in packages/web/src/app/api/v1/quotes/route.ts
  - **TDD Source**: T005 contract test failures - duplicate IDs in concurrent requests "quote-1759139791801"
  - **Business Impact**: Potential duplicate quote IDs in high-traffic scenarios
  - **Auto-Generated**: September 29, 2025 by tdd-debt-analyzer.js
  - Evidence: evidence/T014.3/ with UUID implementation, concurrency testing
  - MCP: **REQUIRED** - Browser test rapid quote creation to validate unique IDs
  - Validation: node .specify/tools/pre-task-check.js T014.3
  - Completion: node .specify/tools/post-task-validation.js T014.3

- [ ] T014.4 [HIGH] Fix POST /api/quotes discount validation in packages/web/src/app/api/v1/quotes/route.ts
  - **TDD Source**: T005 contract test failures - "Expected: 400, Received: 201" for invalid discount values
  - **Business Impact**: Invalid discount values accepted, data integrity risks
  - **Auto-Generated**: September 29, 2025 by tdd-debt-analyzer.js
  - Evidence: evidence/T014.4/ with discount validation implementation, error handling validation
  - MCP: **REQUIRED** - Browser test invalid discount scenarios via API
  - Validation: node .specify/tools/pre-task-check.js T014.4
  - Completion: node .specify/tools/post-task-validation.js T014.4

- [ ] T014.5 [MEDIUM] Fix POST /api/quotes response structure consistency in packages/web/src/app/api/v1/quotes/route.ts
  - **TDD Source**: T005 contract test failures - toMatchObject expected vs received format differences
  - **Business Impact**: Response format inconsistency, type matching issues
  - **Auto-Generated**: September 29, 2025 by tdd-debt-analyzer.js
  - Evidence: evidence/T014.5/ with response structure fixes, type validation
  - MCP: **REQUIRED** - Browser test API response structure validation
  - Validation: node .specify/tools/pre-task-check.js T014.5
  - Completion: node .specify/tools/post-task-validation.js T014.5

- [ ] T014.6 [MEDIUM] Fix POST /api/quotes date comparison logic in packages/web/src/app/api/v1/quotes/route.ts
  - **TDD Source**: T005 contract test failures - "toBe vs toStrictEqual" for expiry date comparisons
  - **Business Impact**: Date comparison test failures, minor API inconsistency  
  - **Auto-Generated**: September 29, 2025 by tdd-debt-analyzer.js
  - Evidence: evidence/T014.6/ with date comparison fixes, test alignment
  - MCP: **REQUIRED** - Browser test date field consistency via API
  - Validation: node .specify/tools/pre-task-check.js T014.6
  - Completion: node .specify/tools/post-task-validation.js T014.6

- [ ] T014.7 [PENDING] Fix PUT /api/quotes/{id} business logic gaps (TDD-driven)
  - **TDD Source**: T006 contract test results (pending execution)
  - **Status**: Task will be auto-generated based on T006 failing test analysis
  - Evidence: Auto-generated after T006 contract test completion
  - Dependencies: T006 contract test must run first

- [ ] T014.8 [PENDING] Fix POST /api/quotes/{id}/duplicate business logic gaps (TDD-driven)
  - **TDD Source**: T007 contract test results (pending execution)
  - **Status**: Task will be auto-generated based on T007 failing test analysis
  - Evidence: Auto-generated after T007 contract test completion
  - Dependencies: T007 contract test must run first

## Phase 3: Core Implementation (ONLY after tests are failing AND API fixes complete)

- [ ] T015 Fix QuoteActionMenu console.log placeholders in packages/web/src/components/quotes/QuoteActionMenu.tsx
  - Evidence: evidence/T015/ with before/after code comparison, functional validation
  - MCP: **REQUIRED** - Browser test all quote actions (Edit, Duplicate, Convert, Archive) with interaction logging
  - Validation: node .specify/tools/pre-task-check.js T015
  - Completion: node .specify/tools/post-task-validation.js T015

- [ ] T016 Restore quote navigation in packages/web/src/components/quotes/QuoteList.tsx
  - Evidence: evidence/T016/ with navigation implementation, route testing
  - MCP: **REQUIRED** - Browser test quote edit navigation with page transitions
  - Validation: node .specify/tools/pre-task-check.js T016
  - Completion: node .specify/tools/post-task-validation.js T016

- [ ] T017 Implement useQuoteOperations hook in packages/web/src/hooks/quotes/useQuoteOperations.ts
  - Evidence: evidence/T017/ with hook implementation, state management validation
  - MCP: **REQUIRED** - Browser test hook integration with quote operations
  - Validation: node .specify/tools/pre-task-check.js T017
  - Completion: node .specify/tools/post-task-validation.js T017

- [ ] T018 Create quote search functionality in packages/web/src/hooks/useQuoteSearch.ts
  - Evidence: evidence/T018/ with search implementation, performance metrics
  - MCP: **REQUIRED** - Browser test search functionality with various query types
  - Validation: node .specify/tools/pre-task-check.js T018
  - Completion: node .specify/tools/post-task-validation.js T018

- [ ] T019 [P] Implement progressive loading hook in packages/web/src/hooks/useProgressiveQuoteLoading.ts
  - Evidence: evidence/T019/ with loading implementation, performance validation
  - MCP: **REQUIRED** - Browser test progressive loading with 1,000+ quotes simulation
  - Validation: node .specify/tools/pre-task-check.js T019
  - Completion: node .specify/tools/post-task-validation.js T019

- [ ] T020 [P] Create quote skeleton component in packages/web/src/components/quotes/QuoteSkeleton.tsx
  - Evidence: evidence/T020/ with skeleton UI implementation, loading state validation
  - MCP: **REQUIRED** - Browser test skeleton loading states with screenshots
  - Validation: node .specify/tools/pre-task-check.js T020
  - Completion: node .specify/tools/post-task-validation.js T020

## Phase 4: Missing Features Implementation

- [ ] T021 Create quote preview modal in packages/web/src/components/quotes/QuotePreviewModal.tsx
  - Evidence: evidence/T021/ with modal implementation, accessibility validation
  - MCP: **REQUIRED** - Browser test modal functionality with keyboard navigation
  - Validation: node .specify/tools/pre-task-check.js T021
  - Completion: node .specify/tools/post-task-validation.js T021

- [ ] T022 Implement date range filtering in packages/web/src/components/quotes/QuoteFilters.tsx
  - Evidence: evidence/T022/ with date picker implementation, filter validation
  - MCP: **REQUIRED** - Browser test date range filtering with multiple date ranges
  - Validation: node .specify/tools/pre-task-check.js T022
  - Completion: node .specify/tools/post-task-validation.js T022

- [ ] T023 Create export service layer in packages/web/src/services/exportService.ts
  - Evidence: evidence/T023/ with export service implementation, file generation tests
  - MCP: N/A (service layer)
  - Validation: node .specify/tools/pre-task-check.js T023
  - Completion: node .specify/tools/post-task-validation.js T023

- [ ] T024 Build quote export system in packages/web/src/components/quotes/export/QuoteExportSystem.tsx
  - Evidence: evidence/T024/ with export UI implementation, user workflow validation
  - MCP: **REQUIRED** - Browser test export system with PDF and Excel generation
  - Validation: node .specify/tools/pre-task-check.js T024
  - Completion: node .specify/tools/post-task-validation.js T024

- [ ] T025 Implement bulk operations UI in packages/web/src/components/quotes/bulk/BulkOperations.tsx
  - Evidence: evidence/T025/ with bulk UI implementation, progress tracking
  - MCP: **REQUIRED** - Browser test bulk operations with selection and progress validation
  - Validation: node .specify/tools/pre-task-check.js T025
  - Completion: node .specify/tools/post-task-validation.js T025

- [ ] T026 [P] Create keyboard shortcuts system in packages/web/src/hooks/useKeyboardShortcuts.ts
  - Evidence: evidence/T026/ with keyboard implementation, accessibility validation
  - MCP: **REQUIRED** - Browser test keyboard shortcuts with key event validation
  - Validation: node .specify/tools/pre-task-check.js T026
  - Completion: node .specify/tools/post-task-validation.js T026

- [ ] T027 [P] Create keyboard shortcuts help modal in packages/web/src/components/ui/KeyboardShortcutsHelp.tsx
  - Evidence: evidence/T027/ with help modal implementation, user guidance validation
  - MCP: **REQUIRED** - Browser test help modal with keyboard navigation
  - Validation: node .specify/tools/pre-task-check.js T027
  - Completion: node .specify/tools/post-task-validation.js T027

## Phase 5: Polish & Optimization

- [ ] T028 [P] Create performance configuration in packages/web/src/config/performance.ts
  - Evidence: evidence/T028/ with performance configuration, metrics validation
  - MCP: N/A (configuration)
  - Validation: node .specify/tools/pre-task-check.js T028
  - Completion: node .specify/tools/post-task-validation.js T028

- [ ] T029 [P] Add utility functions for currency and date in packages/web/src/utils/
  - Evidence: evidence/T029/ with utility implementation, unit test coverage
  - MCP: N/A (utility functions)
  - Validation: node .specify/tools/pre-task-check.js T029
  - Completion: node .specify/tools/post-task-validation.js T029

- [ ] T030 Create mobile responsive tests in packages/web/tests/integration/mobile-responsive.test.ts
  - Evidence: evidence/T030/ with responsive test implementation, device testing
  - MCP: **REQUIRED** - Browser test responsive design on multiple device sizes
  - Validation: node .specify/tools/pre-task-check.js T030
  - Completion: node .specify/tools/post-task-validation.js T030

## Dependencies

**Sequential Dependencies**:
- T001, T002, T003 → All other tasks (foundation)
- T004-T014 → T015-T030 (tests before implementation)
- T015 → T016 (fix actions before navigation)
- T016 → T017 (navigation before operations)
- T023 → T024 (service before UI)

**Parallel Groups** [P]:
- T004-T014: All contract and integration tests can run in parallel
- T019, T020: Loading components can be developed independently
- T026, T027: Keyboard shortcuts components independent
- T028, T029: Configuration and utilities independent
- T030: Mobile testing independent

## Constitutional Validation Requirements

- **Evidence Directories**: All tasks must create evidence/[taskId]/ with required artifacts
- **MCP Browser Testing**: 18 tasks require browser interaction evidence and screenshots
- **Anti-Hallucination**: All console.log placeholders must be replaced with functional business logic
- **Validation Gates**: Pre and post-task validation must pass for each task
- **Compliance Threshold**: Must maintain ≥80% constitutional compliance throughout

## Parallel Execution Examples

**Test Phase** (after T003):
```bash
# Run contract tests in parallel
Task T004 & Task T005 & Task T006 & Task T007 & Task T008 & Task T009 & Task T010

# Run integration tests in parallel  
Task T011 & Task T012 & Task T013 & Task T014
```

**Polish Phase** (after T027):
```bash
# Run optimization tasks in parallel
Task T028 & Task T029 & Task T030
```

## Progress Summary

**COMPLETED**: 1/30 tasks (3.3%)
**IN PROGRESS**: T002 (Quote Service Layer)
**PENDING**: T003-T030
**CONSTITUTIONAL STATUS**: ✅ COMPLIANT - Evidence-first development active

---

**CONSTITUTIONAL MANDATE**: This tasks.md is immediately executable with constitutional compliance - each task includes evidence requirements, MCP validation for UI functionality, and validation gates to prevent hallucination-based false completion claims.
