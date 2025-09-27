# Tasks: Quotes Index Workspace

**Input**: Design documents from `/specs/004-sprint-4-quotes/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Found: Next.js 15 App Router, TypeScript 5.1+, TanStack Query v5, TanStack Virtual v3
2. Load optional design documents:
   → ✅ data-model.md: Quote, QuoteStatus, QuoteLineItem entities
   → ✅ contracts/: quotes-api.yaml with 8 endpoints
   → ✅ research.md: TanStack Virtual performance decisions
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, hooks, components
   → Integration: API routes, routing, navigation
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → ✅ All 8 contracts have tests
   → ✅ All 3 entities have models  
   → ✅ All 10 user scenarios have integration tests
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `packages/web/src/`, `packages/web/__tests__/`
- All paths relative to repository root

## Phase 3.1: Setup
- [x] T001 Create Next.js quotes workspace structure in packages/web/src/app/(dashboard)/quotes/
- [x] **T002: TypeScript Config**
- [x] **T003: Core Types**
- [x] **T004: Validation Schema**

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests [P] - API Endpoint Validation
- [x] T005 [P] Contract test GET /api/v1/quotes in packages/web/__tests__/contracts/quotes-list.test.ts
- [x] T006 [P] Contract test POST /api/v1/quotes in packages/web/__tests__/contracts/quotes-create.test.ts  
- [x] T007 [P] Contract test GET /api/v1/quotes/{quoteId} in packages/web/__tests__/contracts/quotes-get.test.ts
- [x] T008 [P] Contract test PUT /api/v1/quotes/{quoteId} in packages/web/__tests__/contracts/quotes-update.test.ts
- [x] T009 [P] Contract test DELETE /api/v1/quotes/{quoteId} in packages/web/__tests__/contracts/quotes-delete.test.ts
- [x] T010 [P] Contract test PATCH /api/v1/quotes/{quoteId}/status in packages/web/__tests__/contracts/quotes-status.test.ts
- [x] T011 [P] Contract test POST /api/v1/quotes/{quoteId}/duplicate in packages/web/__tests__/contracts/quotes-duplicate.test.ts
- [x] T012 [P] Contract test POST /api/v1/quotes/{quoteId}/convert in packages/web/__tests__/contracts/quotes-convert.test.ts
- [x] T013 [P] Contract test POST /api/v1/quotes/export in packages/web/__tests__/contracts/quotes-export.test.ts
- [x] T014 [P] Contract test PATCH /api/v1/quotes/bulk-actions in packages/web/__tests__/contracts/quotes-bulk.test.ts

### Integration Tests [P] - User Scenario Validation
- [x] T015 [P] Integration test "Load quotes workspace page" in packages/web/__tests__/integration/quotes-listing.test.tsx
- [x] T016 [P] Integration test "Apply status filters" in packages/web/__tests__/integration/quotes-filtering.test.tsx  
- [x] T017 [P] Integration test "Sort quotes by various fields" in packages/web/__tests__/integration/quotes-sorting.test.tsx
- [x] T018 [P] Integration test "Search by customer name" in packages/web/__tests__/integration/quotes-search.test.tsx
- [x] T019 [P] Integration test "Quote actions menu interactions" in packages/web/__tests__/integration/quotes-actions.test.tsx
- [x] T020 [P] Integration test "Quote composer navigation" in packages/web/__tests__/integration/quotes-composer-integration.test.tsx
- [x] T021 [P] Integration test "Duplicate quote workflow" in packages/web/__tests__/integration/quotes-duplication.test.tsx
- [x] T022 [P] Integration test "Status change workflow" in packages/web/__tests__/integration/quotes-status-change.test.tsx
- [x] T023 [P] Integration test "Bulk operations" in packages/web/__tests__/integration/quotes-bulk-operations.test.tsx
- [x] T024 [P] Integration test "Performance with 1000 quotes" in packages/web/__tests__/integration/quotes-performance.test.tsx
- [x] T024A [P] Integration test "Quote preview modal functionality" (FR-014) in packages/web/__tests__/integration/quotes-preview.test.tsx
- [x] T024B [P] Integration test "Filter/sort preferences persistence" (FR-015) in packages/web/__tests__/integration/quotes-session-preferences.test.tsx
- [x] T024C [P] Integration test "Quote totals and counts display" (FR-017) in packages/web/__tests__/integration/quotes-summary.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Layer [P] - TypeScript Models and Validation
- [x] T025 [P] Quote TypeScript interfaces in packages/web/src/types/quotes/Quote.ts
- [x] T026 [P] QuoteStatus enum and types in packages/web/src/types/quotes/QuoteStatus.ts
- [x] T027 [P] QuoteLineItem interface in packages/web/src/types/quotes/QuoteLineItem.ts
- [x] T028 [P] Zod validation schemas in packages/web/src/services/quotes/QuoteValidation.ts ✅ Complete
- [x] T029 [P] Mock quote data service in packages/web/src/data/quotes.ts ✅ Complete

### Service Layer [P] - Business Logic and API Client
- [x] T030 [P] QuoteService class with CRUD operations in packages/web/src/services/quotes/QuoteService.ts ✅ Complete
- [x] T031 [P] Quote status management service in packages/web/src/services/quotes/QuoteStatusService.ts ✅ Complete
- [x] T032 [P] Quote filtering and search logic in packages/web/src/services/quotes/QuoteFilterService.ts ✅ Complete

### Hook Layer - TanStack Query Integration
- [x] T033 useQuotes hook for listing and caching in packages/web/src/hooks/quotes/useQuotes.tsx
- [x] T034 [P] useQuoteActions hook for mutations in packages/web/src/hooks/quotes/useQuoteActions.tsx
- [x] T035 [P] useQuoteFilters hook for filter state in packages/web/src/hooks/quotes/useQuoteFilters.tsx

### Component Layer - UI Components
- [x] T036 QuoteStatusBadge component in packages/web/src/components/quotes/QuoteStatusBadge.tsx
- [x] T037 [P] QuoteActionsMenu component in packages/web/src/components/quotes/QuoteActionsMenu.tsx
- [x] T038 QuotesTable with TanStack Virtual in packages/web/src/components/quotes/QuotesTable.tsx
- [x] T039 QuoteFiltersBar component in packages/web/src/components/quotes/QuoteFiltersBar.tsx  
- [x] T040 [P] QuickPreviewCard modal component in packages/web/src/components/quotes/QuickPreviewCard.tsx
- [x] T040A [P] QuoteSummaryCard component for totals/counts display (FR-017) in packages/web/src/components/quotes/QuoteSummaryCard.tsx
- [x] T040B [P] SessionPreferences hook for filter persistence (FR-015) in packages/web/src/hooks/quotes/useSessionPreferences.tsx

## Phase 3.4: Integration - API Routes and Navigation

### API Implementation
- [x] T041 GET /api/v1/quotes endpoint in packages/web/src/app/api/v1/quotes/route.ts
- [x] T042 POST /api/v1/quotes endpoint in packages/web/src/app/api/v1/quotes/route.ts
- [x] T043 GET /api/v1/quotes/[quoteId] endpoint in packages/web/src/app/api/v1/quotes/[quoteId]/route.ts
- [x] T044 PUT /api/v1/quotes/[quoteId] endpoint in packages/web/src/app/api/v1/quotes/[quoteId]/route.ts
- [x] T045 DELETE /api/v1/quotes/[quoteId] endpoint in packages/web/src/app/api/v1/quotes/[quoteId]/route.ts
- [x] T046 [P] PATCH /api/v1/quotes/[quoteId]/status endpoint in packages/web/src/app/api/v1/quotes/[quoteId]/status/route.ts
- [x] T047 [P] POST /api/v1/quotes/[quoteId]/duplicate endpoint in packages/web/src/app/api/v1/quotes/[quoteId]/duplicate/route.ts
- [x] T048 [P] POST /api/v1/quotes/[quoteId]/convert endpoint in packages/web/src/app/api/v1/quotes/[quoteId]/convert/route.ts
- [x] T049 [P] POST /api/v1/quotes/export endpoint in packages/web/src/app/api/v1/quotes/export/route.ts
- [x] T050 [P] PATCH /api/v1/quotes/bulk-actions endpoint in packages/web/src/app/api/v1/quotes/bulk-actions/route.ts

### Page Implementation and Navigation
- [x] T051 Main quotes workspace page in packages/web/src/app/(dashboard)/quotes/page.tsx
- [x] T052 [P] Update dashboard navigation with quotes entry in packages/web/src/components/layout/DashboardNav.tsx
- [x] T053 [P] Implement breadcrumb navigation in packages/web/src/components/layout/Breadcrumbs.tsx
- [x] T054 [P] Error boundary for quotes workspace in packages/web/src/components/quotes/QuotesErrorBoundary.tsx

## Phase 3.5: Polish - Testing, Performance, and Documentation

### Storybook Stories [P] - Component Documentation
- [x] T055 [P] QuotesTable story in packages/web/src/stories/quotes/QuotesTable.stories.tsx
- [x] T056 [P] QuoteFiltersBar story in packages/web/src/stories/quotes/QuoteFiltersBar.stories.tsx
- [x] T057 [P] QuoteStatusBadge story in packages/web/src/stories/quotes/QuoteStatusBadge.stories.tsx
- [x] T058 [P] QuoteActionsMenu story in packages/web/src/stories/quotes/QuoteActionsMenu.stories.tsx
- [x] T059 [P] QuickPreviewCard story in packages/web/src/stories/quotes/QuickPreviewCard.stories.tsx
- [x] T059A [P] QuoteSummaryCard story in packages/web/src/stories/quotes/QuoteSummaryCard.stories.tsx

### Unit Tests [P] - Component and Hook Testing  
- [x] T060 [P] QuotesTable unit tests in packages/web/__tests__/components/quotes/QuotesTable.test.tsx
- [x] T061 [P] QuoteFiltersBar unit tests in packages/web/__tests__/components/quotes/QuoteFiltersBar.test.tsx
- [x] T062 [P] useQuotes hook unit tests in packages/web/__tests__/hooks/quotes/useQuotes.test.tsx
- [x] T063 [P] QuoteService unit tests in packages/web/__tests__/services/quotes/QuoteService.test.ts
- [x] T063A [P] QuoteSummaryCard unit tests in packages/web/__tests__/components/quotes/QuoteSummaryCard.test.tsx
- [x] T063B [P] useSessionPreferences hook unit tests in packages/web/__tests__/hooks/quotes/useSessionPreferences.test.tsx

### Performance and Accessibility [P]
- [x] T064 [P] Performance optimization verification (<1s load, <500ms filters) in packages/web/__tests__/performance/quotes-performance.test.ts
- [x] T065 [P] Accessibility compliance testing (WCAG 2.1 AA) in packages/web/__tests__/accessibility/quotes-accessibility.test.tsx
- [x] T066 [P] Bundle size analysis for quotes feature in packages/web/scripts/analyze-quotes-bundle.js

### Documentation and Cleanup
- [x] T067 [P] Update quickstart validation steps in specs/004-sprint-4-quotes/quickstart.md
- [x] T068 [P] Add quotes workspace to main README.md
- [x] T069 [P] Code cleanup and optimization pass
- [x] T070 [P] Final integration testing and bug fixes

## Dependencies
```
Setup (T001-T004) → Tests (T005-T024C) → Core Implementation (T025-T040B) → Integration (T041-T054) → Polish (T055-T070)

Critical Blocking Dependencies:
- All Tests (T005-T024C) MUST complete before ANY implementation (T025+)
- T025-T027 (Types) block T028-T032 (Services)
- T033-T035 (Hooks) depend on T030-T032 (Services)
- T036-T040B (Components) depend on T033-T035 (Hooks)
- T041-T050 (API Routes) depend on T025-T032 (Models & Services)
- T051 (Main Page) depends on T036-T040B (Components) and T041 (API)

Non-Blocking Dependencies (can run in parallel):
- Contract tests T005-T014 are independent
- Integration tests T015-T024C are independent  
- Type definitions T025-T027 are independent
- Service classes T030-T032 are independent (after types)
- Component files T036,T037,T040,T040A,T040B are independent
- API endpoint files T046-T050 are independent
- Storybook stories T055-T059A are independent
- Unit test files T060-T063B are independent
- Performance/accessibility tests T064-T066 are independent
```

## Parallel Execution Examples

### Phase 3.2: All Tests Launch Together
```bash
# Launch all contract tests simultaneously (T005-T014):
Task: "Contract test GET /api/v1/quotes in packages/web/__tests__/contracts/quotes-list.test.ts"
Task: "Contract test POST /api/v1/quotes in packages/web/__tests__/contracts/quotes-create.test.ts"  
Task: "Contract test GET /api/v1/quotes/{quoteId} in packages/web/__tests__/contracts/quotes-get.test.ts"
Task: "Contract test PUT /api/v1/quotes/{quoteId} in packages/web/__tests__/contracts/quotes-update.test.ts"
Task: "Contract test DELETE /api/v1/quotes/{quoteId} in packages/web/__tests__/contracts/quotes-delete.test.ts"
Task: "Contract test PATCH /api/v1/quotes/{quoteId}/status in packages/web/__tests__/contracts/quotes-status.test.ts"
Task: "Contract test POST /api/v1/quotes/{quoteId}/duplicate in packages/web/__tests__/contracts/quotes-duplicate.test.ts"
Task: "Contract test POST /api/v1/quotes/{quoteId}/convert in packages/web/__tests__/contracts/quotes-convert.test.ts"
Task: "Contract test POST /api/v1/quotes/export in packages/web/__tests__/contracts/quotes-export.test.ts"
Task: "Contract test PATCH /api/v1/quotes/bulk-actions in packages/web/__tests__/contracts/quotes-bulk.test.ts"

# Launch all integration tests simultaneously (T015-T024):
Task: "Integration test 'Load quotes workspace page' in packages/web/__tests__/integration/quotes-listing.test.tsx"
Task: "Integration test 'Apply status filters' in packages/web/__tests__/integration/quotes-filtering.test.tsx"
Task: "Integration test 'Sort quotes by various fields' in packages/web/__tests__/integration/quotes-sorting.test.tsx"
Task: "Integration test 'Search by customer name' in packages/web/__tests__/integration/quotes-search.test.tsx"
Task: "Integration test 'Quote actions menu interactions' in packages/web/__tests__/integration/quotes-actions.test.tsx"
Task: "Integration test 'Quote composer navigation' in packages/web/__tests__/integration/quotes-composer-integration.test.tsx"
Task: "Integration test 'Duplicate quote workflow' in packages/web/__tests__/integration/quotes-duplication.test.tsx"
Task: "Integration test 'Status change workflow' in packages/web/__tests__/integration/quotes-status-change.test.tsx"
Task: "Integration test 'Bulk operations' in packages/web/__tests__/integration/quotes-bulk-operations.test.tsx"
Task: "Integration test 'Performance with 1000 quotes' in packages/web/__tests__/integration/quotes-performance.test.tsx"
```

### Phase 3.3: Type Definitions Launch Together  
```bash
# Launch all type definitions simultaneously (T025-T027):
Task: "Quote TypeScript interfaces in packages/web/src/types/quotes/Quote.ts"
Task: "QuoteStatus enum and types in packages/web/src/types/quotes/QuoteStatus.ts"  
Task: "QuoteLineItem interface in packages/web/src/types/quotes/QuoteLineItem.ts"
```

### Phase 3.4: Independent API Endpoints Launch Together
```bash  
# Launch specialized endpoints simultaneously (T046-T050):
Task: "PATCH /api/v1/quotes/[quoteId]/status endpoint in packages/web/src/app/api/v1/quotes/[quoteId]/status/route.ts"
Task: "POST /api/v1/quotes/[quoteId]/duplicate endpoint in packages/web/src/app/api/v1/quotes/[quoteId]/duplicate/route.ts"
Task: "POST /api/v1/quotes/[quoteId]/convert endpoint in packages/web/src/app/api/v1/quotes/[quoteId]/convert/route.ts"
Task: "POST /api/v1/quotes/export endpoint in packages/web/src/app/api/v1/quotes/export/route.ts"
Task: "PATCH /api/v1/quotes/bulk-actions endpoint in packages/web/src/app/api/v1/quotes/bulk-actions/route.ts"
```

### Phase 3.5: All Polish Tasks Launch Together
```bash
# Launch all Storybook stories simultaneously (T055-T059):
Task: "QuotesTable story in packages/web/src/stories/quotes/QuotesTable.stories.tsx"
Task: "QuoteFiltersBar story in packages/web/src/stories/quotes/QuoteFiltersBar.stories.tsx"
Task: "QuoteStatusBadge story in packages/web/src/stories/quotes/QuoteStatusBadge.stories.tsx"
Task: "QuoteActionsMenu story in packages/web/src/stories/quotes/QuoteActionsMenu.stories.tsx"
Task: "QuickPreviewCard story in packages/web/src/stories/quotes/QuickPreviewCard.stories.tsx"

# Launch all unit tests simultaneously (T060-T063):
Task: "QuotesTable unit tests in packages/web/__tests__/components/quotes/QuotesTable.test.tsx"
Task: "QuoteFiltersBar unit tests in packages/web/__tests__/components/quotes/QuoteFiltersBar.test.tsx"
Task: "useQuotes hook unit tests in packages/web/__tests__/hooks/quotes/useQuotes.test.tsx"
Task: "QuoteService unit tests in packages/web/__tests__/services/quotes/QuoteService.test.ts"

# Launch all performance/accessibility tests simultaneously (T064-T066):
Task: "Performance optimization verification in packages/web/__tests__/performance/quotes-performance.test.ts"
Task: "Accessibility compliance testing in packages/web/__tests__/accessibility/quotes-accessibility.test.ts"  
Task: "Bundle size analysis in packages/web/scripts/analyze-quotes-bundle.js"
```

## Notes
- **[P] tasks** = different files, no dependencies, can run in parallel
- **Sequential tasks** = same file or shared dependencies, must run in order
- **TDD Critical**: All tests T005-T024 MUST fail before implementing T025+
- **Performance Requirements**: <1 second initial page load, <500ms filter responses
- **Accessibility**: WCAG 2.1 AA compliance with axe-core validation
- **Testing Stack**: Jest + React Testing Library + Cypress E2E + Storybook
- Commit after each completed task for incremental progress

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts (quotes-api.yaml)**:
   - 8 endpoints → 10 contract test tasks [P] (T005-T014)
   - 8 endpoints → 10 API implementation tasks (T041-T050)
   
2. **From Data Model (data-model.md)**:
   - 3 entities → 3 model creation tasks [P] (T025-T027)
   - Business logic → 3 service layer tasks [P] (T030-T032)
   
3. **From User Stories (spec.md)**:
   - 10 scenarios → 10 integration tests [P] (T015-T024)
   - UI workflows → 5 component tasks (T036-T040)

4. **From Quickstart (quickstart.md)**:
   - TDD workflow → test-first ordering
   - Performance goals → performance validation tasks
   - Storybook requirement → story creation tasks

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All 8 API contracts have corresponding tests (T005-T014)
- [x] All 3 entities have model tasks (T025-T027)
- [x] All tests come before implementation (T005-T024 before T025+)
- [x] Parallel tasks truly independent (different files, no shared state)
- [x] Each task specifies exact file path (packages/web/src/...)
- [x] No task modifies same file as another [P] task
- [x] Dependencies clearly documented in dependency graph
- [x] TDD principles enforced (tests must fail before implementation)
- [x] Constitutional requirements addressed (Component-First, Test-First, Performance, Accessibility)
- [x] Technology stack properly utilized (Next.js 15, TanStack Query v5, TanStack Virtual v3, Tailwind CSS)

**Status**: ✅ Ready for execution - 76 tasks generated with proper dependencies and parallel execution guidance