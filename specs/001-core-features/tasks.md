# Tasks: Core Business Management System

**Input**: Design documents from `/specs/001-core-features/`
\*\*Prerequisi- [x] T047 [P] CustomerList component with search in packages/web/src/components/lists/CustomerList.tsx

- [x] T048 [P] ProductCatalog component in packages/web/src/components/catalog/ProductCatalog.tsx
- [x] T049 [P] QuoteBuilder component in packages/web/src/components/quotes/QuoteBuilder.tsx
- [x] T050 [P] InvoiceViewer component in packages/web/src/components/invoices/InvoiceViewer.tsx
- [x] T051 [P] PaymentForm component in packages/web/src/components/payments/PaymentForm.tsx
- [x] T052 [P] StatementViewer component in packages/web/src/components/statements/StatementViewer.tsx plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Tech stack: Next.js 14, TypeScript 5.0+, Tailwind CSS 3.4, React 18
   → Structure: Web application (frontend + backend)
2. Load design documents:
   → data-model.md: 16 entities extracted → model tasks
   → contracts/: API + Component specs → contract test tasks
   → quickstart.md: 4 test scenarios → integration test tasks
3. Generate tasks by category:
   → Setup: Next.js project, dependencies, linting
   → Tests: API contract tests, component tests, integration tests
   → Core: models, services, API routes, components
   → Integration: mock data, validation, PDF generation
   → Polish: unit tests, performance, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `packages/web/src/`
- **Tests**: `packages/web/tests/`
- **Mock data**: `packages/web/src/data/mock/`

## Phase 3.1: Setup

- [x] T001 Create Next.js 14 project structure in packages/web
- [x] T002 [P] Initialize API structure in packages/web/src/app/api/
- [x] T003 [P] Initialize components structure in packages/web/src/components/
- [x] T004 [P] Configure ESLint, Prettier, and Jest testing framework in packages/web/
- [x] T005 [P] Set up Tailwind CSS design system configuration in packages/web/

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Contract Tests

- [x] T006 [P] Contract test GET /api/v1/customers in packages/web/tests/contract/customers.test.ts
- [x] T007 [P] Contract test POST /api/v1/customers in packages/web/tests/contract/customers.test.ts
- [x] T008 [P] Contract test GET /api/v1/products in packages/web/tests/contract/products.test.ts
- [x] T009 [P] Contract test POST /api/v1/quotes in packages/web/tests/contract/quotes.test.ts
- [x] T010 [P] Contract test POST /api/v1/invoices in packages/web/tests/contract/invoices.test.ts
- [x] T011 [P] Contract test POST /api/v1/payments in packages/web/tests/contract/payments.test.ts
- [x] T012 [P] Contract test GET /api/v1/statements/{id} in packages/web/tests/contract/statements.test.ts

### Component Contract Tests

- [x] T013 [P] Component test CustomerForm in packages/web/tests/components/CustomerForm.test.tsx
- [x] T014 [P] Component test ProductCatalog in packages/web/tests/components/ProductCatalog.test.tsx
- [x] T015 [P] Component test QuoteBuilder in packages/web/tests/components/QuoteBuilder.test.tsx
- [x] T016 [P] Component test InvoiceViewer in packages/web/tests/components/InvoiceViewer.test.tsx
- [x] T017 [P] Component test PaymentForm in packages/web/tests/components/PaymentForm.test.tsx

### Integration Tests

- [x] T018 [P] Integration test Customer Management workflow in packages/web/tests/integration/customer-management.test.ts
- [x] T019 [P] Integration test Product and Pricing Setup in packages/web/tests/integration/product-pricing.test.ts
- [x] T020 [P] Integration test Quote-to-Invoice workflow in packages/web/tests/integration/quote-invoice.test.ts
- [x] T021 [P] Integration test Payment Processing in packages/web/tests/integration/payment-processing.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Models

- [x] T022 [P] Customer model with validation in packages/web/src/models/Customer.ts
- [x] T023 [P] Branch model with validation in packages/web/src/models/Branch.ts
- [x] T024 [P] BillTo model with validation in packages/web/src/models/BillTo.ts
- [x] T025 [P] Product model with validation in packages/web/src/models/Product.ts
- [x] T026 [P] Pricelist model with validation in packages/web/src/models/Pricelist.ts
- [x] T027 [P] Quote model with validation in packages/web/src/models/Quote.ts
- [x] T028 [P] Invoice model with validation in packages/web/src/models/Invoice.ts
- [x] T029 [P] Payment model with validation in packages/web/src/models/Payment.ts
- [x] T030 [P] Statement model with validation in packages/web/src/models/Statement.ts

### Services Layer

- [x] T031 [P] CustomerService CRUD operations in packages/web/src/services/CustomerService.ts
- [x] T032 [P] ProductService with pricing logic in packages/web/src/services/ProductService.ts
- [x] T033 [P] QuoteService with line item handling in packages/web/src/services/QuoteService.ts
- [x] T034 [P] InvoiceService with finalization logic in packages/web/src/services/InvoiceService.ts
- [x] T035 [P] PaymentService with FIFO allocation in packages/web/src/services/PaymentService.ts
- [x] T036 [P] StatementService with PDF generation in packages/web/src/services/StatementService.ts
- [x] T036a [P] InvoiceNumberingService with YYMMDDXXX format validation in packages/web/src/services/InvoiceNumberingService.ts

### API Routes (Next.js App Router)

- [x] T037 Customer CRUD endpoints in packages/web/src/app/api/v1/customers/
- [x] T038 Branch management endpoints in packages/web/src/app/api/v1/branches/
- [x] T039 Product catalog endpoints in packages/web/src/app/api/v1/products/
- [x] T040 Pricing endpoints in packages/web/src/app/api/v1/pricelists/
- [x] T041 Quote management endpoints in packages/web/src/app/api/v1/quotes/
- [x] T042 Invoice management endpoints in packages/web/src/app/api/v1/invoices/
- [x] T043 Payment processing endpoints in packages/web/src/app/api/v1/payments/
- [x] T044 Statement generation endpoints in packages/web/src/app/api/v1/statements/
- [x] T045 Reports endpoints in packages/web/src/app/api/v1/reports/
- [x] T045a Customer pricing override endpoints in packages/web/src/app/api/v1/customers/{id}/pricing-overrides/

### Frontend Components

- [x] T046 [P] CustomerForm component with validation in packages/web/src/components/forms/CustomerForm.tsx
- [x] T047 [P] CustomerList component with search in packages/web/src/components/lists/CustomerList.tsx
- [x] T048 [P] ProductCatalog component in packages/web/src/components/catalog/ProductCatalog.tsx
- [x] T049 [P] QuoteBuilder component in packages/web/src/components/quotes/QuoteBuilder.tsx
- [x] T050 [P] InvoiceViewer component in packages/web/src/components/invoices/InvoiceViewer.tsx
- [x] T051 [P] PaymentForm component in packages/web/src/components/payments/PaymentForm.tsx
- [x] T052 [P] StatementViewer component in packages/web/src/components/statements/StatementViewer.tsx

### Frontend Pages

- [x] T053 Customer dashboard page in packages/web/src/app/customers/page.tsx
- [x] T054 Product management page in packages/web/src/app/products/page.tsx
- [x] T055 Quote management page in packages/web/src/app/quotes/page.tsx
- [x] T056 Invoice management page in packages/web/src/app/invoices/page.tsx
- [x] T057 Payment tracking page in packages/web/src/app/payments/page.tsx

## Phase 3.4: Integration

- [x] T058 Mock data generation with real business scenarios in packages/web/src/data/mock/
- [x] T059 Zod validation schemas for all API endpoints in packages/web/src/validation/
- [x] T060 PDF generation service for quotes and invoices in packages/web/src/services/PDFService.ts
- [x] T061 Email notification service in packages/web/src/services/EmailService.ts
- [x] T062 Audit trail logging middleware in packages/web/src/middleware/auditLog.ts
- [x] T063 Error handling and logging middleware in packages/web/src/middleware/errorHandler.ts
- [x] T064 Rate limiting middleware in packages/web/src/middleware/rateLimit.ts
- [x] T064a Document versioning and audit trail service in packages/web/src/services/DocumentAuditService.ts

## Phase 3.5: Polish

- [x] T065 [P] Unit tests for CustomerService in packages/web/tests/unit/CustomerService.test.ts
- [x] T066 [P] Unit tests for PaymentService FIFO logic in packages/web/tests/unit/PaymentService.test.ts
- [x] T067 [P] Unit tests for pricing calculations in packages/web/tests/unit/PricingService.test.ts
- [x] T068 [P] Performance tests for API endpoints (<500ms) in packages/web/tests/performance/
- [x] T069 [P] Accessibility tests for components (WCAG 2.1 AA) in packages/web/tests/accessibility/
- [x] T070 [P] Update API documentation in docs/api.md
- [x] T071 [P] Update component documentation in docs/components.md
- [x] T071a [P] Create Storybook documentation for all components in packages/web/src/stories/
- [x] T072 Remove code duplication and refactor
- [x] T073 Run quickstart manual testing scenarios
- [x] T074 Performance optimization and lighthouse audit

## Dependencies

- Setup (T001-T005) before everything
- Tests (T006-T021) before implementation (T022-T064a)
- Models (T022-T030) before services (T031-T036a)
- Services (T031-T036a) before API routes (T037-T045a)
- API routes (T037-T045a) before frontend pages (T053-T057)
- Core implementation (T022-T057) before integration (T058-T064a)
- Everything before polish (T065-T074)

## Parallel Execution Examples

### Contract Tests Phase (After T005)

```bash
# Launch T006-T012 together (different test files):
Task: "Contract test GET /api/v1/customers in backend/tests/contract/customers.test.ts"
Task: "Contract test POST /api/v1/customers in backend/tests/contract/customers.test.ts"
Task: "Contract test GET /api/v1/products in backend/tests/contract/products.test.ts"
Task: "Contract test POST /api/v1/quotes in backend/tests/contract/quotes.test.ts"
Task: "Contract test POST /api/v1/invoices in backend/tests/contract/invoices.test.ts"
Task: "Contract test POST /api/v1/payments in backend/tests/contract/payments.test.ts"
Task: "Contract test GET /api/v1/statements/{id} in backend/tests/contract/statements.test.ts"
```

### Model Creation Phase (After T021)

```bash
# Launch T022-T030 together (different model files):
Task: "Customer model with validation in backend/src/models/Customer.ts"
Task: "Branch model with validation in backend/src/models/Branch.ts"
Task: "BillTo model with validation in backend/src/models/BillTo.ts"
Task: "Product model with validation in backend/src/models/Product.ts"
Task: "Pricelist model with validation in backend/src/models/Pricelist.ts"
Task: "Quote model with validation in backend/src/models/Quote.ts"
Task: "Invoice model with validation in backend/src/models/Invoice.ts"
Task: "Payment model with validation in backend/src/models/Payment.ts"
Task: "Statement model with validation in backend/src/models/Statement.ts"
```

### Service Creation Phase (After T030)

```bash
# Launch T031-T036 together (different service files):
Task: "CustomerService CRUD operations in backend/src/services/CustomerService.ts"
Task: "ProductService with pricing logic in backend/src/services/ProductService.ts"
Task: "QuoteService with line item handling in backend/src/services/QuoteService.ts"
Task: "InvoiceService with finalization logic in backend/src/services/InvoiceService.ts"
Task: "PaymentService with FIFO allocation in backend/src/services/PaymentService.ts"
Task: "StatementService with PDF generation in backend/src/services/StatementService.ts"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify all tests fail before implementing
- Commit after each task completion
- API routes (T037-T045a) are sequential due to shared route.ts files in Next.js App Router structure
- Each API endpoint group (T037-T045a) may contain multiple route.ts files (GET, POST, PUT, DELETE)
- Frontend pages (T053-T057) are sequential due to shared layout components
- Constitutional compliance validation required at each phase

## Task Generation Rules Applied

1. **From API Contracts**: 34 endpoints → 9 contract test tasks + 9 implementation tasks
2. **From Component Contracts**: 7 main components → 5 component test tasks + 7 implementation tasks
3. **From Data Model**: 16 entities → 9 core model tasks (combining related interfaces)
4. **From Quickstart Scenarios**: 4 scenarios → 4 integration test tasks
5. **Constitutional Principles**: TDD approach, component-first development, performance requirements

## Validation Checklist ✅

- [x] All API contracts have corresponding tests (T006-T012)
- [x] All major components have test tasks (T013-T017)
- [x] All entities have model tasks (T022-T030)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies properly defined and ordered
- [x] Constitutional principles validated throughout
