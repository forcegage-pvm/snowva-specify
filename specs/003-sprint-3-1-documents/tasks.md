# Tasks: Documents Workspace Export History

**Input**: Design documents from `/specs/003-sprint-3-1-documents/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Phase 3.1 – Setup
- [X] T001 Add `@tanstack/react-virtual` dependency in `packages/web/package.json` and align lockfile & TypeScript config for virtualization support.
- [X] T002 Seed Cypress fixture dataset in `packages/web/cypress/fixtures/document-exports.json` representing 365-day history with varied statuses and archive edge cases.

## Phase 3.2 – Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
- [X] T003 [P] Flesh out `packages/web/tests/contract/documents.test.ts` covering list, detail, resend, share-link, and audit endpoints per contract schema.
- [X] T004 Create failing Cypress spec skeleton in `packages/web/tests/e2e/documents-workspace.cy.ts` for initial load, search highlighting, and pagination smoke.
- [X] T005 Extend the Cypress spec to cover combined filters, virtualization threshold, and empty-state messaging.
- [X] T006 Extend the Cypress spec to validate preview modal metadata, share-link copy UX, and resend flow audit entries.
- [X] T007 Extend the Cypress spec to assert archived (>365 days) banner, expired share-link regeneration, and simulated error retry handling.
- [X] T008 [P] Author accessibility spec in `packages/web/tests/accessibility/documents.a11y.spec.tsx` checking keyboard focus order, ARIA labelling, and contrast tokens for table + modal components.
- [X] T009 [P] Add unit tests in `packages/web/tests/unit/DocumentExportService.test.ts` for list filtering, share-link expiry math, and audit trail logging behaviors.

## Phase 3.3 – Core Implementation (ONLY after tests are failing)
- [X] T010 Create `packages/web/src/features/documents/types.ts` defining data-model entities (DocumentExportRecord, ShareLinkToken, AuditEvent, ShareLinkAccessEvent, FilterState, DocumentArchiveReference).
- [X] T011 Populate deterministic fixtures in `packages/web/src/services/mocks/documentExportFixtures.ts` for 365-day history, share-link tokens, and archive references.
- [X] T012 Implement `packages/web/src/services/DocumentExportService.ts` with list, detail, resend, share-link, and audit-access methods backed by fixtures and enforcing business rules.
- [X] T013 Extend `packages/web/src/services/AuditTrailService.ts` to recognize document export events (preview, download, share, resend) and emit telemetry to `performanceMetrics.ts`.
- [X] T014 Build GET `/api/v1/document-exports` handler in `packages/web/src/app/api/v1/document-exports/route.ts` returning paginated filtered results and virtualization hints.
- [X] T015 Build GET `/api/v1/document-exports/[exportId]/route.ts` returning preview metadata and audit snapshot.
- [X] T016 Build POST `/api/v1/document-exports/[exportId]/resend/route.ts` performing resend validation, status transition, and audit entry.
- [X] T017 Build POST `/api/v1/document-exports/[exportId]/share-link/route.ts` generating 30-day public tokens and warning metadata.
- [X] T018 Build GET `/api/v1/document-exports/[exportId]/audit/route.ts` returning paginated audit events with cursor support.
- [X] T019 Create React Query hooks in `packages/web/src/features/documents/hooks/useDocumentExports.ts` for list and detail fetching with caching + retention filters.
- [X] T020 Implement `packages/web/src/features/documents/components/DocumentExportsTable.tsx` using TanStack Virtual, sort chips, and inline status indicators.
- [X] T021 Implement `packages/web/src/features/documents/components/DocumentFiltersBar.tsx` providing search, multi-select filters, and saved filter state restoration.
- [X] T022 Implement `packages/web/src/features/documents/components/DocumentPreviewModal.tsx` with metadata summary, PDF preview slot, share-link banner, resend action, and audit trail tab.
- [X] T023 Add `packages/web/src/features/documents/components/PublicLinkWarning.tsx` surfaced wherever share links are copied.
- [X] T024 Compose `/documents` workspace page in `packages/web/src/app/(dashboard)/documents/page.tsx` wiring hooks, components, archive banner, and loading/error states.

## Phase 3.4 – Integration & Wiring
- [ ] T025 Update `packages/web/src/lib/metrics/performanceMetrics.ts` and related telemetry utilities to track document export interactions and filter response timings.
- [ ] T026 Update navigation and access guards (`packages/web/src/app/(dashboard)/layout.tsx` & related config) to route to the new `/documents` workspace and ensure role coverage messaging.
- [ ] T027 Extend `packages/web/tests/e2e/support/commands.ts` with helpers for document export interactions and share-link assertions.
- [ ] T028 Wire Storybook mock providers for document components in `packages/web/.storybook/mocks/documents.ts` (and register in `.storybook/main.ts`).

## Phase 3.5 – Polish & Validation
- [ ] T029 [P] Add Storybook stories in `packages/web/src/stories/features/documents/` (table, filters, preview modal, share-link banner) with accessibility notes.
- [ ] T030 [P] Add visual regression baselines (Chromatic or Percy pipeline) or document manual snapshot process for the new components.
- [ ] T031 Document operator workflows in `docs/components.md` covering documents workspace usage and archive hand-off.
- [ ] T032 Run full validation suite from quickstart: lint, unit, contract, Cypress (`npm run lint`, `npm test`, `npm run cy:run -- --spec tests/e2e/documents-workspace.cy.ts`).
- [ ] T033 Prepare implementation summary for changelog/spec update in `specs/003-sprint-3-1-documents/quickstart.md` (append release notes section).

## Dependencies
- T001 → T002 (fixtures rely on dependency install)
- T002 → T004–T007 (tests consume fixture data)
- T003–T009 must complete before T010 onwards (TDD gate)
- T010 → T011 → T012 (types before fixtures before service)
- T012 → T014–T018 (API routes depend on service)
- T019 depends on T014–T018
- T020–T024 depend on T019 and earlier API/service tasks
- T025 depends on service + API instrumentation (T012–T024)
- T026 depends on workspace page (T024)
- T027 depends on Cypress spec scaffolding (T004–T007)
- T028 depends on components (T020–T024)
- T029–T030 depend on components (T020–T024)
- T031 depends on completed UI (T024) and metrics (T025)
- T032 depends on all implementation tasks (T010–T031)
- T033 depends on validation outcomes (T032)

## Parallel Execution Example
```
# After setup completes, run parallel test authoring tasks:
/specs/003-sprint-3-1-documents$ task run T003 T008 T009
```

## Notes
- Maintain TDD discipline: ensure tasks T003–T009 fail before implementing interfaces.
- For [P] tasks, confirm no shared files before parallelizing.
- Record significant architectural choices back into `plan.md` if scope shifts.
- Commit after each task completion to retain granular history.
