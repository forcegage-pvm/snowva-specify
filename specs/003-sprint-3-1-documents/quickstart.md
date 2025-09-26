# Quickstart – Documents Workspace Export History

## Prerequisites
- Node.js 18+
- pnpm or npm (project currently uses npm scripts)
- Cypress installed via repo dependencies (`npm install` already covers it)

## 1. Install & bootstrap
```powershell
cd "x:\Cloud Storage\Dropbox\Repositories\react\snowva\packages\web"
npm install
```

## 2. Run lint & unit tests first (TDD gate)
```powershell
cd "x:\Cloud Storage\Dropbox\Repositories\react\snowva\packages\web"
npm run lint
npm run test
```

## 3. Start development server
```powershell
cd "x:\Cloud Storage\Dropbox\Repositories\react\snowva\packages\web"
npm run dev
```
- Open http://localhost:3000/documents to access the workspace redirect.
- Confirm table renders with mock data; use filters and search to exercise live updates.

## 4. Validate preview & share workflow
1. Click an export row → open preview modal.
2. Verify metadata, AUDIT trail, and embedded PDF placeholder appear.
3. Click **Copy public link** → expect 30-day expiry indicator and toast.
4. Use network tab to confirm `/api/v1/document-exports/{id}/share-link` call returns signed token.

## 5. Exercise resend and failure states
1. Filter status to `Failed` to surface error cases.
2. Trigger **Resend** action → expect optimistic status update and audit trail entry.
3. Toggle query `?simulate=error=true` to ensure error banner appears with retry CTA.

## 6. Run Cypress smoke suite
```powershell
cd "x:\Cloud Storage\Dropbox\Repositories\react\snowva\packages\web"
npm run cy:run -- --spec "tests/e2e/documents-workspace.cy.ts"
```

## 7. Post-run checks
- Confirm audit log (mock) file updated with preview/download/share events.
- Inspect console for accessibility warnings; fix before merge.
- Update Storybook stories for new components (table, filters, preview modal) and regenerate visual snapshots if changed.
