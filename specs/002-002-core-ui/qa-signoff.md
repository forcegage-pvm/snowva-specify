# QA Sign-off – 002-core-ui UI Delivery

| Field | Value |
| --- | --- |
| Feature | 002-core-ui UI Delivery |
| Branch | `002-002-core-ui` |
| Commit | `f958535d88b17199a0f9d45e0d4ca2b6d1e4af52` |
| Run Date | 2025-09-25 |
| Environment | Windows 11 · Node.js 20.12.2 · npm 10.8.1 |

## Automated Validation Matrix

| Check | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Frontend lint (`npm run lint`) | ❌ | Local run @ 2025-09-25 18:00 SAST | Fails with 9 errors / 8 warnings (React hooks ordering, `no-require-imports`, `no-explicit-any`, `react/no-unescaped-entities`, banned `@ts-ignore`). Rerun command for full output. Blocking for sign-off. |
| Accessibility regression (`npm test -- --runTestsByPath tests/accessibility/dashboard.a11y.spec.tsx`) | ✅ | Jest pass (251 ms). | Confirms no Axe violations on dashboard. Evidence: [`tests/accessibility/dashboard.a11y.spec.tsx`](../../packages/web/tests/accessibility/dashboard.a11y.spec.tsx). |
| Lighthouse desktop audit | ✅ | [`docs/system-current/ui-performance/002-core-ui.lighthouse.json`](../../docs/system-current/ui-performance/002-core-ui.lighthouse.json) | Scores — Performance 75, Accessibility 100, Best Practices 100, SEO 91. Summary in [`002-core-ui.md`](../../docs/system-current/ui-performance/002-core-ui.md). |
| Cypress E2E suite (`npm run cy:run`) | ⚠️ Not executed | Pending | Requires Next.js dev server and Chrome. Run instructions in [quickstart.md §4.4](quickstart.md). Capture artifacts under `tests/e2e/results/` before sign-off. |
| Playwright cross-browser (`npm run test:playwright`) | ⚠️ Not executed | Pending | Execute in CI matrix once lint blockers resolved. |

> **Action**: Resolve lint failures before granting release approval; rerun lint + CI suites afterwards.

## Manual Validation Checklist

Status legend: ✅ Completed · ⚠️ Blocked · ⬜ Pending

| Scenario | Status | Evidence / Notes |
| --- | --- | --- |
| Dashboard insights & shortcuts (Quickstart §6.1) | ⬜ Pending | Validate KPI tiles, thresholds, and shortcuts navigation on desktop & tablet. Capture screenshots in `docs/system-current/qa/`. |
| Customer + branch operations (Quickstart §6.2) | ⬜ Pending | Execute editing flow, confirm audit trail updates. Reference Cypress spec [`tests/e2e/customer-branches.cy.ts`](../../packages/web/tests/e2e/customer-branches.cy.ts). |
| Product pricing review (Quickstart §6.3) | ⬜ Pending | Verify dual pricing badges, version history timeline. |
| Quote → Invoice conversion (Quickstart §6.4) | ⬜ Pending | Run wizard, ensure validation + finalization locks. |
| Payment allocation lifecycle (Quickstart §6.5) | ⬜ Pending | Confirm FIFO recommendations + manual override reconciliation. |
| Statement generation (Quickstart §6.6) | ⬜ Pending | Validate branch grouping and export options. |
| Session timeout warning (Quickstart §6.7) | ⬜ Pending | Simulate 25 min inactivity or use Storybook [`SessionTimeoutModal`](../../packages/web/src/stories/features/session/SessionTimeoutModal.stories.tsx). |

## Outstanding Issues

1. **Lint blockers** (must-fix before release)
   - Conditional `useMemo` usage in `CustomerDirectoryTable.tsx` (violates hooks rules).
   - `require()` imports in `jest.config.js` & accessibility spec.
   - `@ts-ignore` usage in `src/middleware/rateLimit.ts`; replace with explicit types or `@ts-expect-error`.
   - `react/no-unescaped-entities` violation in `SessionTimeoutModal.tsx`.
   - Several `no-explicit-any` and unused variable warnings in service layer.
2. **E2E / Cross-browser suites not exercised** in this run; execute Cypress + Playwright after lint fixes.
3. **Manual walkthroughs outstanding**; capture evidence (screens, notes) per checklist above.

## Sign-off Decision

> **Current QA status: ⛔ BLOCKED** — do not release until lint errors are resolved and automated (Cypress/Playwright) plus manual validation checklists are executed with evidence captured.

Once the above blockers are cleared, update this document with rerun results (dates, commands, links) and record the final approval at the bottom with name, date, and decision.
