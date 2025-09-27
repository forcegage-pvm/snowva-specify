# Tasks: Sprint 004.1 – Technical Debt Resolution

**Input**: Design documents from `/specs/005-sprint-004-1/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: TypeScript 5.1+, Next.js 15 App Router, React 18, Zod validation, TanStack Query
   → Structure: Web app with packages/web/ directory
2. Load optional design documents ✓
   → data-model.md: Timeline events, API parameters, error responses
   → contracts/: timeline-api.yaml, quote-api-enhanced.yaml
   → research.md: Next.js 15 async parameters, mock timeline service
   → quickstart.md: Implementation phases and validation steps
3. Generate tasks by category ✓
   → Setup: dependencies, environment validation
   → Tests: contract tests, integration tests (TDD approach)
   → Core: timeline API, parameter updates, error handling
   → Integration: mock services, validation schemas
   → Polish: test coverage, performance, documentation
4. Apply task rules ✓
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓
   → All contracts have tests ✓
   → All entities have models ✓
   → All endpoints implemented ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Web app structure**: `packages/web/src/app/`, `packages/web/tests/`, `packages/web/__tests__/`

## Phase 3.1: Setup
- [x] T001 Validate development environment (Node.js 18+, TypeScript 5.1+, Next.js 15)
- [x] T002 Install missing dependencies for enhanced error handling and validation
- [x] T003 [P] Configure Jest test environment for timeline API testing

## Phase 3.2: Tests First (TDD) ✅ COMPLETED
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test GET /api/v1/quotes/{quoteId}/timeline in `packages/web/__tests__/api/timeline.contract.test.ts`
- [x] T005 [P] Contract test GET /api/v1/quotes/{quoteId} enhanced error handling in `packages/web/__tests__/api/quotes.contract.test.ts`
- [x] T006 [P] Contract test PUT /api/v1/quotes/{quoteId} validation errors in `packages/web/__tests__/api/quotes-update.contract.test.ts`
- [x] T007 [P] Integration test timeline API with mock data in `packages/web/__tests__/integration/timeline-integration.test.ts`
- [x] T008 [P] Integration test async parameter handling in `packages/web/__tests__/integration/quote-params.test.ts`
- [x] T009 [P] Unit test TimelineEvent validation schema with property-based testing in `packages/web/__tests__/unit/timeline-validation.test.ts`
- [x] T010 [P] Unit test ApiError response schema with property-based testing in `packages/web/__tests__/unit/error-schema.test.ts`
- [x] T011 [P] Unit tests for timeline service with edge cases in `packages/web/__tests__/unit/timeline-service.test.ts`
- [x] T012 [P] Unit tests for API error handler with comprehensive scenarios in `packages/web/__tests__/unit/api-error-handler.test.ts`
- [x] T013 [P] Unit tests for validation middleware with malformed inputs in `packages/web/__tests__/unit/validation-middleware.test.ts`
- [x] T014 [P] E2E test complete quote composer workflow in `packages/web/__tests__/e2e/quote-composer-workflow.test.ts`
- [x] T015 [P] E2E test quote timeline integration workflow in `packages/web/__tests__/e2e/quote-timeline-workflow.test.ts`
- [x] T016 [P] E2E test quote conversion workflow with async parameters in `packages/web/__tests__/e2e/quote-conversion-workflow.test.ts`

## Phase 3.3: Core Implementation ✅ IN PROGRESS
- [x] T017 [P] TimelineEvent interface and types in `packages/web/src/types/timeline.ts`
- [x] T018 [P] ApiError interface and error types in `packages/web/src/types/api-errors.ts`
- [x] T019 [P] QuotePreview interface and PDF types in `packages/web/src/types/quote-preview.ts`  
- [x] T020 [P] Timeline validation schema with Zod in `packages/web/src/validation/timeline-schema.ts`
- [x] T021 [P] API error validation schema with Zod in `packages/web/src/validation/error-schema.ts`
- [x] T022 [P] Quote preview validation schema with Zod in `packages/web/src/validation/quote-preview-schema.ts`
- [x] T023 [P] Mock timeline service in `packages/web/src/services/timeline-service.ts`
- [x] T024 [P] Quote preview and PDF generation service in `packages/web/src/services/quote-pdf-service.ts`
- [x] T025 GET /api/v1/quotes/{quoteId}/timeline endpoint in `packages/web/src/app/api/v1/timeline/[entityType]/[entityId]/route.ts`
- [x] T026 GET /api/v1/quotes/{quoteId}/preview endpoint in `packages/web/src/app/api/v1/quotes/[quoteId]/preview/route.ts`
- [x] T027 POST /api/v1/quotes/{quoteId}/pdf endpoint in `packages/web/src/app/api/v1/quotes/[quoteId]/pdf/route.ts`
- [x] T028 Update GET /api/v1/quotes/{quoteId} with async params in `packages/web/src/app/api/v1/quotes/[quoteId]/route.ts`
- [x] T029 Update PUT /api/v1/quotes/{quoteId} with async params in `packages/web/src/app/api/v1/quotes/[quoteId]/route.ts`
- [x] T030 Update DELETE /api/v1/quotes/{quoteId} with async params in `packages/web/src/app/api/v1/quotes/[quoteId]/route.ts`
- [x] T031 Update POST /api/v1/quotes/{quoteId}/convert with async params in `packages/web/src/app/api/v1/quotes/[quoteId]/convert/route.ts`
- [x] T032 Update POST /api/v1/quotes/{quoteId}/duplicate with async params in `packages/web/src/app/api/v1/quotes/[quoteId]/duplicate/route.ts`
- [x] T033 Update PATCH /api/v1/quotes/{quoteId}/status with async params in `packages/web/src/app/api/v1/quotes/[quoteId]/status/route.ts`
- [x] T034 Standardized error handling utility in `packages/web/src/lib/api-error-handler.ts`
- [x] T035 Request validation middleware in `packages/web/src/middleware/validation.ts`
- [x] T036 Error boundary components for quote operations in `packages/web/src/components/common/ErrorBoundary.tsx`
- [x] T037 Loading state components for quote operations in `packages/web/src/components/common/LoadingStates.tsx`

## Phase 3.4: Integration
- [x] T038 Create comprehensive error handling middleware in `packages/web/src/middleware/error-handler.ts`
- [x] T039 Implement request/response validation middleware in `packages/web/src/middleware/validation.ts`
- [x] T040 Connect TimelineService with API routes in `packages/web/src/integrations/timeline-integration.ts`
- [x] T041 Update quote service to use enhanced error handling in `packages/web/src/services/quote-service.ts`
- [x] T042 Fast Refresh optimization for QuoteComposer component - eliminate state causing full reloads in `packages/web/src/components/sales/QuoteComposer.tsx`
- [x] T043 Fast Refresh optimization for QuoteTimeline component - implement React.memo in `packages/web/src/components/sales/QuoteTimeline.tsx`
- [x] T044 Integrate error boundaries into quote composer workflow
- [x] T045 Integrate loading states into quote timeline and PDF generation

## Phase 3.5: Polish
- [x] T046 Performance tests for timeline API (<500ms) in `packages/web/__tests__/performance/timeline-performance.test.ts`
- [x] T047: Performance tests for PDF generation (<2s) in `packages/web/__tests__/performance/pdf-generation-performance.test.ts`
- [x] T048 [P] Update API documentation with timeline and PDF endpoints
- [x] T049: Update OpenAPI specifications
- [x] T050 Remove timeline 404 workarounds from quote composer
- [x] T051 Remove PDF generation placeholder components
- [x] T052 Run manual testing scenarios from quickstart.md
- [x] T053 Validate all technical debt items resolved per roadmap

## Dependencies
**Sequential Dependencies:**
- Setup (T001-T003) must complete before tests
- Tests (T004-T016) must FAIL before implementation (T017-T037) - **CRITICAL TDD REQUIREMENT**
- T017-T019 (types) must complete before T020-T022 (validation schemas)  
- T020-T024 (schemas/services) must complete before API endpoints (T025-T033)
- T025-T027 (new endpoints) must complete before T038-T039 (integration)
- Core implementation (T017-T037) must complete before integration (T038-T045)
- Integration (T038-T045) must complete before polish (T046-T053)

**File-Level Dependencies:**
- T028-T030 modify same file (`route.ts`) - must be sequential
- T042-T043 modify different quote components - can be parallel
- E2E tests (T014-T016) test different workflows - can be parallel

**Constitutional Compliance:**
- All unit tests (T009-T013) include property-based testing as required
- Error boundaries (T036) and loading states (T037) meet accessibility standards
- Performance tests (T046-T047) validate <500ms timeline, <2s PDF requirements
- T004-T010 all create different test files - can be parallel [P]
- T011-T015 all create different source files - can be parallel [P]
- T029-T031 all create different test files - can be parallel [P]

## Parallel Example
```
# Launch T004-T008 together (Phase 3.2 - Contract & Integration Tests):
Task: "Contract test GET /api/v1/quotes/{quoteId}/timeline in packages/web/__tests__/api/timeline.contract.test.ts"
Task: "Contract test GET /api/v1/quotes/{quoteId} enhanced error handling in packages/web/__tests__/api/quotes.contract.test.ts"
Task: "Contract test PUT /api/v1/quotes/{quoteId} validation errors in packages/web/__tests__/api/quotes-update.contract.test.ts"
Task: "Integration test timeline API with mock data in packages/web/__tests__/integration/timeline-integration.test.ts"
Task: "Integration test async parameter handling in packages/web/__tests__/integration/quote-params.test.ts"

# Launch T009-T013 together (Phase 3.2 - Unit Tests with Property-Based Testing):
Task: "Unit test TimelineEvent validation schema with property-based testing in packages/web/__tests__/unit/timeline-validation.test.ts"
Task: "Unit test ApiError response schema with property-based testing in packages/web/__tests__/unit/error-schema.test.ts"
Task: "Unit tests for timeline service with edge cases in packages/web/__tests__/unit/timeline-service.test.ts"
Task: "Unit tests for API error handler with comprehensive scenarios in packages/web/__tests__/unit/api-error-handler.test.ts"
Task: "Unit tests for validation middleware with malformed inputs in packages/web/__tests__/unit/validation-middleware.test.ts"

# Launch T014-T016 together (Phase 3.2 - E2E Tests for TD006):
Task: "E2E test complete quote composer workflow in packages/web/__tests__/e2e/quote-composer-workflow.test.ts"
Task: "E2E test quote timeline integration workflow in packages/web/__tests__/e2e/quote-timeline-workflow.test.ts"
Task: "E2E test quote conversion workflow with async parameters in packages/web/__tests__/e2e/quote-conversion-workflow.test.ts"

# Launch T017-T022 together (Phase 3.3 - Types & Schemas):
Task: "TimelineEvent interface and types in packages/web/src/types/timeline.ts"
Task: "ApiError interface and error types in packages/web/src/types/api-errors.ts"
Task: "QuotePreview interface and PDF types in packages/web/src/types/quote-preview.ts"
Task: "Timeline validation schema with Zod in packages/web/src/validation/timeline-schema.ts"
Task: "API error validation schema with Zod in packages/web/src/validation/error-schema.ts"
Task: "Quote preview validation schema with Zod in packages/web/src/validation/quote-preview-schema.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD principle)
- Commit after each task completion
- T017-T019 modify same route.ts file - MUST be sequential
- All quote API routes use same async parameter pattern
- Timeline API must respond within 500ms (performance requirement)
- Build must fail on Fast Refresh optimization issues
- Test coverage must reach 90% for quote service layer

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - timeline-api.yaml → T004 (contract test), T016 (implementation)
   - quote-api-enhanced.yaml → T005-T006 (contract tests), T017-T022 (implementations)
   
2. **From Data Model**:
   - TimelineEvent entity → T011 (interface), T013 (validation), T015 (service)
   - ApiError entity → T012 (types), T014 (validation), T023 (handler)
   
3. **From Quickstart Scenarios**:
   - Phase 1 validation → T007 (integration test)
   - Phase 2 validation → T008 (parameter test) 
   - Performance validation → T032 (performance test)

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T004-T006 for both YAML files)
- [x] All entities have model tasks (T011-T012 for TimelineEvent and ApiError)
- [x] All tests come before implementation (T004-T010 before T011-T024)
- [x] Parallel tasks truly independent (different file paths verified)
- [x] Each task specifies exact file path (all tasks include full package path)
- [x] No task modifies same file as another [P] task (T017-T019 sequential, others parallel)

## Success Criteria Mapping
**Functional Requirements:**
- **FR-001**: T004, T025 (Timeline API endpoint) ✅ Complete coverage
- **FR-002**: T008, T028-T033 (Next.js 15 async parameters) ✅ Complete coverage  
- **FR-003**: T005-T006, T018, T021, T034 (Error handling) ✅ Complete coverage
- **FR-004**: T009-T010, T020-T022, T035 (Zod validation) ✅ Complete coverage
- **FR-005**: T042-T043 (Fast Refresh optimization) ✅ Enhanced specification
- **FR-006**: T014-T016 (E2E test coverage) ✅ **ADDED** - was missing
- **FR-007**: T036-T037, T044-T045 (Loading states & error boundaries) ✅ **ADDED** - was partial
- **FR-008**: T019, T024, T026-T027, T039 (Quote preview & PDF) ✅ **ADDED** - was missing
- **FR-009-012**: T018, T034, T048-T049 (API standardization & documentation) ✅ Complete coverage

**Non-Functional Requirements:**
- **NFR-001**: T046 (Timeline API <500ms) ✅ Complete coverage
- **NFR-002**: T047 (PDF generation <2s) ✅ **ADDED** new performance requirement
- **NFR-003**: T009-T013 (90% test coverage with property-based testing) ✅ Constitutional compliance
- **NFR-004**: T042-T043 (Build quality gates) ✅ Enhanced specification

**Technical Debt Items (from roadmap):**
- **TD001**: T004, T025 ✅ Timeline API (completed per roadmap)
- **TD002**: T008, T028-T033 ✅ Async parameters (completed per roadmap)
- **TD003**: T005-T006, T018, T021, T034 ✅ Error handling
- **TD004**: T009-T010, T020-T022, T035 ✅ API contract validation
- **TD005**: T042-T043 ✅ Fast Refresh optimization 
- **TD006**: T014-T016 ✅ **ADDED** E2E test coverage
- **TD007**: T036-T037, T044-T045 ✅ **ADDED** Loading states & error boundaries
- **TD008**: T019, T024, T026-T027, T039 ✅ **ADDED** Quote preview & PDF
- **TD009**: T018, T034 ✅ API response standardization
- **TD010**: T009-T013 ✅ Unit tests (moved to TDD phase)
- **TD011**: T001 ✅ TypeScript strict mode
- **TD012**: T048-T049 ✅ API documentation

**Total Tasks**: 53 tasks across 5 phases (+18 tasks added)
**Parallel Opportunities**: 28 tasks marked [P] for concurrent execution
**Estimated Duration**: 4-6 days (adjusted for comprehensive coverage)
**Constitutional Compliance**: ✅ All TDD, property-based testing, and performance requirements met