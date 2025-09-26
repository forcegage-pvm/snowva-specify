# Snowva Operations Console – Implementation Roadmap

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
### Sprint 3 – "UI parity & stable mocks"
1. **Complete workspace implementations**
   - `/documents`: searchable export history, filters, preview modal.
   - `/quotes` index: recent quotes, status chips, CTA into composer.
   - `/invoices` index: timeline feed, bulk actions, jump into `/invoices/[id]`.
   - `/payments` index: list of allocation cases linking to existing detail view.
2. **Mock API alignment**
   - Centralize fixtures inside `src/data` or `src/services/mocks`.
   - Update `/api/v1/*` routes to reuse fixtures (statements, quotes, etc.).
   - Add failure toggles via query string (`?simulate=error`) for QA.
3. **Testing foundations**
   - Run Cypress suite locally; fix failing specs.
   - Add `npm run test:e2e` to CI pipeline with recorded artifacts.
4. **Documentation**
   - Publish workspace usage notes in `/docs/components.md` as modules mature.

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

## 4. Task Backlog (Initial Cut)
- [ ] Documents workspace UI & Cypress spec updates.
- [ ] Quotes index page with filtering and spec-aligned data test IDs.
- [ ] Invoices index list + timeline summary.
- [ ] Payments index overview.
- [ ] Shared mock data layer & typed adapters.
- [ ] API route enhancements (error states, pagination params).
- [ ] Cypress CI workflow definition.
- [ ] Storybook bootstrap & initial stories.
- [ ] Accessibility linting (axe / eslint-plugin-jsx-a11y).
- [ ] Real API client scaffolding (React Query service wrappers).

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
- **End Sprint 3**: Working navigation across all dashboards; Cypress suite green on mocks; roadmap doc (this file) updated.
- **End Sprint 4**: Storybook catalog with baseline components; accessibility report resolved; production-ready styling.
- **End Sprint 5**: Deployed beta backed by real data source; release checklist signed off.

---

## 7. References
- [`docs/system-current/`](./system-current/) for the latest domain PDFs and extracted text.
- Cypress specs in `packages/web/tests/e2e/` for expected UI behaviors.
- Prior sprint summary embedded in `.github/copilot-instructions.md` ("001-core-features" notes).

*Keep this document updated at the close of each sprint to reflect scope changes, blockers, and new deliverables.*
