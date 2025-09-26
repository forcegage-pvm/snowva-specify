# Quickstart – 002-core-ui UI Delivery

This runbook captures everything a teammate needs to install dependencies, run the Snowva UI locally, execute the automated test suites, and validate the end-to-end workflows delivered in this feature.

---

## 1. Prerequisites

| Requirement | Recommended Version | Notes |
|-------------|---------------------|-------|
| Node.js     | 18.x LTS            | Matches project toolchain; bundled with npm 10 |
| npm         | 10.x                | Used for all workspace scripts |
| PowerShell  | 5.1+ (Windows)      | Required for utility scripts under `.specify/scripts` |
| Chrome      | 130+                | Required for Cypress/Lighthouse validation |

> **Tip:** Run `node -v` and `npm -v` before continuing. If they differ from the versions above, update Node via [nvm-windows](https://github.com/coreybutler/nvm-windows) or your package manager.

---

## 2. Initial Setup

1. **Clone the repository**
   ```powershell
   git clone git@github.com:forcegage-pvm/snowva-specify.git
   cd snowva-specify
   git checkout 002-002-core-ui
   ```

2. **Install workspace dependencies** (from repo root; npm workspaces will hydrate `packages/web` automatically):
   ```powershell
   npm install
   ```

3. **Verify environment**
   ```powershell
   npm run lint --workspaces=false
   ```
   Linting all packages ensures tooling (ESLint, TypeScript) compiled successfully.

---

## 3. Local Development Server

Run the Next.js dev server (Turbopack is enabled by default):
```powershell
cd packages/web
npm run dev
```

- The app serves at http://localhost:3000.
- To disable Turbopack (useful when debugging webpack-specific behaviour):
  ```powershell
  npm run dev -- --no-turbo
  ```
- To force the legacy webpack dev server:
  ```powershell
  $env:NEXT_DISABLE_TURBOPACK=1
  npm run dev
  ```

---

## 4. Automated Test Suites

> Run tests from `packages/web` unless otherwise noted.

### 4.1 Unit & Integration (Jest)
```powershell
npm test            # Single run
npm run test:watch  # Watch mode
npm run test:coverage
```

### 4.2 Linting
```powershell
npm run lint
npm run lint:fix    # Optional auto-fix
```

### 4.3 Accessibility Checks
The Axe regression suite in `tests/accessibility/dashboard.a11y.spec.tsx` runs with Jest:
```powershell
npm test -- --runTestsByPath tests/accessibility/dashboard.a11y.spec.tsx
```

### 4.4 End-to-End Workflows (Cypress)
```powershell
npm run cy:open     # Interactive runner
npm run cy:run      # Headless (CI)
```
Cypress specs live under `tests/e2e/` and cover the dashboard, customer/branch flows, pricing, quote-to-invoice conversion, invoice tracking, payment allocation, and statements.

### 4.5 Cross-browser Regression (Playwright)
```powershell
npm run test:playwright
```
Use this to confirm parity across Chromium/Firefox/WebKit.

---

## 5. Storybook for Component Review

A comprehensive Storybook covers all feature components with responsive controls:
```powershell
npm run storybook
```
- Opens at http://localhost:6006.
- Use the global “Theme” toolbar control to preview light/dark palettes.

To produce the static bundle:
```powershell
npm run storybook:build
```
Artifacts render into `packages/web/storybook-static/` (suitable for CI artifacts or documentation portals).

---

## 6. End-to-End Validation Checklist

Follow this script after installing dependencies to confirm the feature behaves as specified.

1. **Dashboard Insights**
   - Visit `/dashboard` and confirm KPI tiles display current values, warning/critical badges, and shortcuts panel renders.
   - Ensure Lighthouse performance ≥90 and accessibility ≥95 (`npm run lint` + optional Lighthouse audit).

2. **Customer & Branch Operations**
   - Navigate to the customer directory, filter branches, and open a branch detail panel.
   - Edit a branch contact; confirm autosave states and audit timeline update.

3. **Product Pricing**
   - View product catalog entries; verify dual pricing badges and version history timeline in the Price List Version timeline.

4. **Quote → Invoice Flow**
   - Create a quote via Quote Composer, apply discount, then convert it to an invoice in Invoice Workspace.
   - Confirm draft vs finalized logic (finalize locks fields, timeline records event).

5. **Payment Allocation**
   - Allocate a payment using FIFO recommendations; override one allocation manually and confirm audit log entry.

6. **Statements**
   - Generate a consolidated customer statement, verify branch grouping, export/download controls, and recent history summary.

7. **Session Timeout**
   - Use Storybook `SessionTimeoutModal` story or adjust the timeout hook test to simulate inactivity; confirm 25-minute warning and draft auto-save before logout.

Each step is already mirrored in Jest/Cypress suites; performing the manual walk-through ensures configuration and environment parity.

---

## 7. Maintenance Tips

- **Analytics & Performance** – Metrics instrumentation lives in `src/lib/metrics/performanceMetrics.ts`; update thresholds centrally.
- **Design Tokens** – Tailwind tokens and theme CSS live under `src/app/globals.css` and `tailwind.config.ts`.
- **Data Hooks** – All React Query hooks for customers, products, sales, finance reside in `src/features/*/api`. Keep cache keys co-located.
- **Session UX** – Timeout hook/provider is managed in `src/app/providers.tsx`; Storybook mock of `next/navigation` ensures components render outside Next runtime.

---

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `npm run dev` hangs or reports Turbopack EBUSY | Terminate stale Node processes (`taskkill /IM node.exe /F`) and restart. |
| Storybook fails to compile TypeScript stories | Ensure `babel-loader` and `@babel/preset-typescript` are installed (already in `devDependencies`) and clear cache: `npx rimraf node_modules/.cache/storybook`. |
| Cypress cannot find Chrome | Install Chrome ≥130 and set `CYPRESS_INSTALL_BINARY=0` before `npm install` if behind firewall. |
| Accessibility test fails due to Axe violations | Review `tests/accessibility/dashboard.a11y.spec.tsx` for detailed node information; address semantics before re-running. |

---

## 9. Next Steps for Releases

1. Run full test matrix (lint, Jest coverage, Cypress headless, Playwright) on CI.
2. Capture Lighthouse report for `/dashboard` and archive it in `docs/system-current/ui-performance/002-core-ui.md` (see T052).
3. Update `specs/002-002-core-ui/qa-signoff.md` with manual validation evidence (see T053).
4. Submit PR targeting `main`, referencing the feature spec and attaching Storybook or Cypress artifacts as required by the release checklist.

---

By following this quickstart, any engineer or QA teammate can bootstrap the Snowva UI, run the regression suites, and validate the core operational workflows introduced in feature 002-core-ui.
