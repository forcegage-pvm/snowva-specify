# Snowva Operations Console – Implementation Roadmap

_Last updated: 2025-09-26_

## 1. Context & Objectives
- **Product vision**: Deliver a unified console for Snowva's finance, sales, and operations teams to manage customers, pricing, quotes, invoices, statements, and payments.
- **Current status**: Core layout and navigation are live under the Next.js App Router. High-fidelity workspaces exist for customer branches, invoice lifecycle, payment allocation, seasonal pricing, quote composer, and finance statements. Root route now redirects to `/dashboard` with KPIs, shortcuts, and branch spotlight panels. **NEW: Documents workspace fully implemented** with complete UI, API layer, performance monitoring, and accessibility compliance. Cypress E2E specs provide behavioral expectations for every major workspace.
- **Goal for next phases**: Convert the remaining mocked experiences into production-ready applications with resilient API layers, complete UI coverage, and automated quality gates. Operations Console – Implementation Roadmap

_Last updated: 2025-09-26_

## 1. Context & Objectives
- **Product vision**: Deliver a unified console for Snowva’s finance, sales, and operations teams to manage customers, pricing, quotes, invoices, statements, and payments.
- **Current status**: Core layout and navigation are live under the Next.js App Router. High-fidelity workspaces exist for customer branches, invoice lifecycle, payment allocation, seasonal pricing, quote composer, and finance statements. Root route now redirects to `/dashboard` with KPIs, shortcuts, and branch spotlight panels. Cypress E2E specs provide behavioral expectations for every major workspace.
- **Goal for next phases**: Convert the mocked experience into a production-ready application with resilient API layers, complete UI coverage, and automated quality gates.

---

## 2. Workstream Overview
| Workstream | Purpose | Success Criteria |
| --- | --- | --- |
| **UI Completion** | Replace placeholder pages (documents, quotes index, invoice index, etc.) with spec-compliant React screens. | All navigation links land on functional pages with test IDs referenced by E2E specs. |
| **Mock API Consolidation** | Serve deterministic fixtures via `/api/v1/*` routes that mirror spec contract. | Pages consume shared services; errors/empty states are demonstrated in Storybook / Cypress. |
| **Automated Quality** | Ensure lint, type-check, and Cypress run locally and in CI. | GitHub Action (or equivalent) fails builds on regression; green status required for merge. |
| **Design System Hardening** | Normalize layout primitives and theme tokens. | Shared components documented in Storybook; visual consistency maintained across workspaces. |
| **Real Data Integration (stretch)** | Replace mocks with production APIs / Firebase per platform roadmap. | Feature toggles allow staged rollout; React Query caches persist between routes. |

---

## 3. Execution Plan by Sprint
### ✅ Sprint 3 – "Documents workspace & API foundations" (COMPLETED)
**Delivered Sprint 003-sprint-3-1-documents (T001-T033):**
1. **✅ Documents workspace implementation**
   - Complete `/documents` page with searchable export history, advanced filters, preview modal
   - DocumentExportsTable with TanStack Virtual for performance (1000+ records)
   - DocumentFiltersBar with date ranges, status, type, and search filters
   - DocumentPreviewModal with share link generation and copy functionality
   - PublicLinkWarning component for security compliance
2. **✅ Production-grade API layer**
   - Full REST API at `/api/v1/document-exports/*` (GET, POST, PUT, DELETE, PATCH)
   - TanStack Query integration with optimistic updates and error handling
   - Comprehensive mock data with 50+ realistic document exports
3. **✅ Quality foundations**
   - 38 Storybook stories with comprehensive component coverage
   - Performance monitoring with React.memo and useMemo optimizations
   - WCAG 2.1 AA accessibility compliance with axe-core validation
   - TypeScript 5.1+ strict mode with comprehensive error handling
4. **✅ Testing & documentation**
   - Complete component test suite with edge cases and error scenarios
   - Comprehensive documentation for all components and API endpoints
   - Navigation integration in dashboard layout

### Sprint 4 – "Remaining workspace implementations"
1. **Complete remaining workspace implementations**
   - `/quotes` index: recent quotes, status chips, CTA into composer.
   - `/invoices` index: timeline feed, bulk actions, jump into `/invoices/[id]`.
   - `/payments` index: list of allocation cases linking to existing detail view.

### Sprint 4 – "Design system & interactive polish"
1. Extract shared primitives (cards, tables, modals, toasts) into `@/components/ui`.
2. Implement global loading & error banners with React Query state.
3. Add Storybook stories for key flows (quote wizard steps, payment allocation table, statements diff modal).
4. Accessibility audit (axe) and color/contrast fixes.

### Sprint 5 – "Data integration & release readiness"
1. Replace mock fetches with real API/Firebase calls behind service layer.
2. Introduce optimistic updates, skeletons, and retry patterns.
3. End-to-end regression with real backend (or contract tests if backend unavailable).
4. Build release checklist: environment variables, security review, load testing.

---

## 4. Task Backlog (Updated)
### ✅ Completed (Sprint 003-sprint-3-1-documents)
- [x] **Documents workspace UI & API** - Complete implementation with advanced filtering, virtualization, and preview functionality
- [x] **Shared mock data layer & typed adapters** - TanStack Query integration with comprehensive mock data
- [x] **API route enhancements** - Full REST API with error states, pagination, and comprehensive CRUD operations
- [x] **Storybook bootstrap & stories** - 38 comprehensive stories covering all document components and scenarios
- [x] **Accessibility compliance** - WCAG 2.1 AA compliance with axe-core validation and screen reader support
- [x] **Performance optimization** - TanStack Virtual, React.memo, and useMemo for handling 1000+ records

### 🔄 Active Development
- [ ] **Quotes index page** with filtering and spec-aligned data test IDs.
- [ ] **Invoices index** list + timeline summary.
- [ ] **Payments index** overview.
- [ ] **Cypress CI workflow** definition and E2E test updates.
- [ ] **Real API client** scaffolding (React Query service wrappers).

(Transfer each checkbox into issue tracker tickets aligned with sprint scope.)

---

## 5. Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Divergence between mocks and eventual backend contracts | Broken flows on integration | Develop TypeScript types shared between mocks and real client; add contract tests. |
| Cypress flakiness blocking CI | Delivery delays | Use deterministic fixtures, disable unnecessary animations in tests, run tests in parallel shards. |
| Design creep with bespoke components | UI inconsistency | Enforce design tokens and shared primitives during Sprint 4; conduct weekly design QA. |
| Performance hit from large data tables | Poor UX for ops team | Implement virtualization (react-virtual) and pagination early once real data size confirmed. |

---

## 6. Deliverables & Checkpoints
- **✅ End Sprint 3 (003-sprint-3-1-documents)**: Documents workspace fully implemented with production-grade API layer, performance optimization, accessibility compliance, and comprehensive testing. Navigation integration complete. Storybook catalog established with 38+ stories.
- **End Sprint 4**: Complete remaining workspace implementations (quotes, invoices, payments indexes); Cypress suite updates; shared component library hardening.
- **End Sprint 5**: Deployed beta backed by real data source; release checklist signed off.

---

---

## 7. Implementation Details

### Sprint 003-sprint-3-1-documents Technical Summary
- **Architecture**: Next.js 15 App Router with TypeScript 5.1+ strict mode
- **State Management**: TanStack Query for server state, React hooks for local state
- **Performance**: TanStack Virtual for large data sets, React.memo for component optimization
- **UI Framework**: Tailwind CSS 3.4+ with Headless UI for accessible components
- **Testing**: Comprehensive Storybook stories, axe-core accessibility testing
- **API Layer**: Complete REST endpoints at `/api/v1/document-exports/*`
- **Components Delivered**:
  - `DocumentExportsTable` - Virtualized data table with sorting and selection
  - `DocumentFiltersBar` - Advanced filtering with date ranges and search
  - `DocumentPreviewModal` - Document preview with share link generation
  - `PublicLinkWarning` - Security compliance component
- **Development Standards**: WCAG 2.1 AA compliance, comprehensive error handling, performance monitoring

---

## 8. References
- [`docs/system-current/`](./system-current/) for the latest domain PDFs and extracted text.
- Cypress specs in `packages/web/tests/e2e/` for expected UI behaviors.
- Sprint implementation details in `.github/copilot-instructions.md` (auto-updated).
- Storybook documentation at `http://localhost:6006` for component catalog.

*Keep this document updated at the close of each sprint to reflect scope changes, blockers, and new deliverables.*
