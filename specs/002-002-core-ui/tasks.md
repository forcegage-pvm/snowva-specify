# Tasks: 002-core-ui UI Delivery

**Input**: Design documents from `/specs/002-002-core-ui/`
**Prerequisites**: plan.md (required), research.md, data-model.md

## Phase 3.1: Setup

- [x] T001 Update `frontend/package.json` to add required UI dependencies (`@headlessui/react`, `@heroicons/react`, `@tanstack/react-query`, `@tanstack/react-virtual`, `tailwindcss-animate`) and align npm scripts with TDD workflow.
- [x] T002 Configure Snowva brand tokens and Tailwind UI block presets in `frontend/tailwind.config.ts` and create `frontend/src/styles/theme.css` to expose colors/spacing/typography.
- [x] T003 Establish global providers in `frontend/src/app/providers.tsx` and `frontend/src/lib/queryClient.ts` for React Query, session context, and Toast notifications.
- [x] T004 [P] Scaffold UI data contract stubs (`customer-directory.json`, `quote-composer.json`, `invoice-workspace.json`, `payment-allocation.json`, `statement-overview.json`) under `specs/002-002-core-ui/contracts/ui/` to document expected payloads.
- [x] T005 [P] Configure multi-viewport Cypress + Playwright settings in `frontend/cypress.config.ts` and `frontend/tests/e2e/support/commands.ts` for desktop/tablet/mobile coverage.
- [x] T006 [P] Update `frontend/.storybook/preview.ts` to load Tailwind theme tokens and register component documentation scaffolds.

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

- [x] T007 Create Jest/Testing Library tests for dashboard metrics tiles in `frontend/tests/components/dashboard/DashboardTile.spec.tsx` (loading, thresholds, trend indicators).
- [x] T008 [P] Create Jest tests for the virtualized customer directory table in `frontend/tests/components/customers/CustomerDirectoryTable.spec.tsx` (filtering, pagination, 2 s SLA mocks).
- [x] T009 [P] Create Jest tests for branch detail panel editing flows in `frontend/tests/components/customers/BranchDetailPanel.spec.tsx` (inline edits, audit log rendering).
- [x] T010 [P] Create Jest tests for product catalog cards in `frontend/tests/components/products/ProductCatalogEntry.spec.tsx` (dual pricing, override badge, version history chips).
- [x] T011 [P] Create Jest tests for price list version timeline in `frontend/tests/components/products/PriceListVersionTimeline.spec.tsx` (state transitions, archival badges).
- [x] T012 [P] Create Jest tests for quote composer wizard in `frontend/tests/components/sales/QuoteComposer.spec.tsx` (step progression, VAT/order validation, preview snapshot).
- [x] T013 [P] Create Jest tests for invoice workspace timeline in `frontend/tests/components/sales/InvoiceWorkspace.spec.tsx` (draft vs finalized states, mutation guards).
- [x] T014 [P] Create Jest tests for payment allocation panel in `frontend/tests/components/finance/PaymentAllocation.spec.tsx` (FIFO recommendations, manual overrides, remaining balance calc, audit log event rendering).
- [x] T015 [P] Create Jest tests for statement overview table in `frontend/tests/components/finance/StatementOverview.spec.tsx` (branch grouping, export triggers).
- [x] T016 [P] Create Jest tests for shared document timeline component in `frontend/tests/components/shared/DocumentTimeline.spec.tsx` (event rendering, filters, accessibility roles).
- [x] T017 [P] Create Jest tests for session timeout hook in `frontend/tests/hooks/useSessionTimeout.spec.ts` (25-min warning, 30-min logout, draft auto-save callback).
- [x] T018 Author Cypress flow for dashboard quick insights in `frontend/tests/e2e/dashboard.cy.ts` (KPI tiles, shortcuts navigation).
- [x] T019 [P] Author Cypress flow for customer & branch management in `frontend/tests/e2e/customer-branches.cy.ts` (search, branch edit, audit log view).
- [x] T020 [P] Author Cypress flow for seasonal price update workflow in `frontend/tests/e2e/pricing.cy.ts` (price edit, version diff, confirmation).
- [x] T021 [P] Author Cypress flow for quote creation to invoice preview in `frontend/tests/e2e/quote-to-invoice.cy.ts` (wizard, preview, conversion).
- [x] T022 [P] Author Cypress flow for invoice status tracking in `frontend/tests/e2e/invoice-tracking.cy.ts` (timeline, finalization lock, email action).
- [x] T023 [P] Author Cypress flow for payment allocation lifecycle in `frontend/tests/e2e/payment-allocation.cy.ts` (FIFO suggestion, manual override, audit log timeline visibility, balance update).
- [x] T024 [P] Author Cypress flow for consolidated statement generation in `frontend/tests/e2e/statements.cy.ts` (filters, PDF export, due totals).

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [x] T025 Implement dashboard metric tiles component in `frontend/src/features/dashboard/components/DashboardTile.tsx` with dynamic thresholds and hero icon support.
- [x] T026 [P] Implement virtualized customer directory view in `frontend/src/features/customers/components/CustomerDirectoryTable.tsx` with React Query + react-virtual integration.
- [x] T027 [P] Implement branch detail panel in `frontend/src/features/customers/components/BranchDetailPanel.tsx` including inline edit forms and audit timeline slot.
- [ ] T028 [P] Implement product catalog card grid in `frontend/src/features/products/components/ProductCatalogEntryCard.tsx` with dual pricing badges and override callouts.
- [ ] T029 [P] Implement price list version timeline in `frontend/src/features/products/components/PriceListVersionTimeline.tsx` reflecting state transitions.
- [ ] T030 [P] Implement quote composer wizard in `frontend/src/features/sales/components/QuoteComposerWizard.tsx` with validation guards and preview pane.
- [ ] T031 [P] Implement invoice workspace timeline in `frontend/src/features/sales/components/InvoiceWorkspace.tsx` with draft/final controls and locking rules.
- [ ] T032 [P] Implement payment allocation panel in `frontend/src/features/finance/components/PaymentAllocationPanel.tsx` including FIFO recommendations, manual override UI, and an embedded audit log listing allocator, timestamp, and affected invoices.
- [ ] T033 [P] Implement statement overview table in `frontend/src/features/finance/components/StatementOverview.tsx` with branch grouping and export triggers.
- [ ] T034 [P] Implement shared document timeline component in `frontend/src/features/shared/components/DocumentTimeline.tsx` with filter chips and accessibility roles.
- [ ] T035 Implement session timeout hook + modal in `frontend/src/features/session/useSessionTimeout.ts` and `frontend/src/features/session/components/SessionTimeoutModal.tsx` (auto-save + warning UX).
- [ ] T036 Create customer directory data hooks in `frontend/src/features/customers/api/useCustomerDirectoryQuery.ts` with pagination + filter params.
- [ ] T037 [P] Create branch detail data hook in `frontend/src/features/customers/api/useBranchDetailQuery.ts` including audit log fetch.
- [ ] T038 [P] Create product catalog query hook in `frontend/src/features/products/api/useProductCatalogQuery.ts` supporting version snapshots.
- [ ] T039 [P] Create quote/invoice mutation hooks in `frontend/src/features/sales/api/useQuoteToInvoiceMutation.ts` covering conversion flow.
- [ ] T040 [P] Create payment allocation mutation hook in `frontend/src/features/finance/api/usePaymentAllocationMutation.ts` handling FIFO/manual paths.
- [ ] T040a [P] Create payment allocation audit log query in `frontend/src/features/finance/api/usePaymentAllocationAuditLogQuery.ts` and wire it into the allocation panel timeline.
- [ ] T041 [P] Create statement history query hook in `frontend/src/features/finance/api/useStatementHistoryQuery.ts` with branch aggregations.
- [ ] T042 Compose application shell layout in `frontend/src/app/(dashboard)/layout.tsx` adopting Tailwind sidebar shell and injecting providers/navigation.

## Phase 3.4: Integration & Performance

- [ ] T043 Wire dashboard page data loading in `frontend/src/app/(dashboard)/page.tsx` combining metrics tiles and quick shortcuts.
- [ ] T044 [P] Implement reusable virtualized table container in `frontend/src/features/shared/components/VirtualizedTableContainer.tsx` with skeleton + empty states.
- [ ] T045 [P] Implement document timeline event transformers in `frontend/src/features/shared/utils/eventTransformers.ts` to normalize audit payloads.
- [ ] T046 [P] Implement autosave hooks for quote/invoice drafts in `frontend/src/features/sales/hooks/useDraftAutosave.ts` integrating with session timeout callbacks.
- [ ] T047 Configure analytics + performance instrumentation in `frontend/src/lib/metrics/performanceMetrics.ts` (2 s list SLA, navigation <500 ms events).
- [ ] T048 [P] Integrate email/download actions for invoices/statements using existing backend endpoints in `frontend/src/features/documents/actions.ts`.

## Phase 3.5: Polish & Validation

- [ ] T049 Run accessibility regression tests (Axe/Lighthouse) via `frontend/tests/accessibility/dashboard.a11y.spec.ts` and address violations.
- [ ] T050 [P] Add Storybook stories for all new components under `frontend/.storybook/stories/**/*.stories.tsx` with knobs for breakpoints.
- [ ] T051 [P] Document end-to-end runbook in `specs/002-002-core-ui/quickstart.md` (setup, test commands, launch instructions).
- [ ] T052 [P] Capture Lighthouse performance report and archive results in `docs/system-current/ui-performance/002-core-ui.md`.
- [ ] T053 Final manual QA sign-off checklist in `specs/002-002-core-ui/qa-signoff.md` (links to Cypress runs, accessibility reports).

## Dependencies

- T001 → T002 → T003; T004–T006 depend on T002 (theme) for accurate scaffolding.
- Tests (T007–T024) must run and fail before corresponding implementation tasks (T025–T048).
- For each feature area: T007 precedes T025, T008 precedes T026, T009 precedes T027, T010 precedes T028, T011 precedes T029, T012 precedes T030, T013 precedes T031, T014 precedes T032 and T040a, T015 precedes T033, T016 precedes T034, T017 precedes T035.
- Data hooks (T036–T041) depend on setup tasks (T001–T003) and relevant component tests.
- Integration tasks (T043–T048) depend on components/data hooks being implemented.
- Polish tasks (T049–T053) occur after all implementation and integration tasks.

## Parallel Execution Examples

```
# After completing T007, launch component test authoring in parallel:
Task: "T008 [P] Create Jest tests for the virtualized customer directory table..."
Task: "T009 [P] Create Jest tests for branch detail panel editing flows..."
Task: "T010 [P] Create Jest tests for product catalog cards..."
Task: "T011 [P] Create Jest tests for price list version timeline..."

# Once core components exist, run these implementation tasks simultaneously:
Task: "T032 [P] Implement payment allocation panel..."
Task: "T033 [P] Implement statement overview table..."
Task: "T034 [P] Implement shared document timeline component..."
Task: "T035 Implement session timeout hook + modal..." (waits for T017)
```

## Notes

- Maintain TDD discipline: ensure each Jest/Cypress spec fails before implementing dependent components.
- Keep component files focused; extract shared utilities into `frontend/src/features/shared/` to honour component-first principle.
- Record major decisions or deviations in `specs/002-002-core-ui/plan.md` if scope changes.
