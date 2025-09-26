# 002 Core UI Lighthouse Snapshot

- **Captured**: 2025-09-25 17:36 UTC (Lighthouse 12.8.2, Headless Chrome 140)
- **Source**: `docs/system-current/ui-performance/002-core-ui.lighthouse.json`
- **Context**: Next.js dev server on Windows (`localhost:3000`, desktop preset)

## Scorecard

| Category | Score |
| --- | --- |
| Performance | 75 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 91 |

## Core Web Vitals

| Metric | Value | Status |
| --- | --- | --- |
| First Contentful Paint | 0.2 s | ✅ Good |
| Largest Contentful Paint | 0.6 s | ✅ Good |
| Time to Interactive | 3.1 s | ⚠️ Improve |
| Interaction to Next Paint | n/a | ⚠️ Not reported |
| Cumulative Layout Shift | 0 | ✅ Good |

## Notable Findings

- **Reduce initial server response time**: Root document responded in ~2.0 s, hurting overall TTI. Investigate build/runtime optimizations or API warmups before release.
- No accessibility, best practice, or console errors were flagged in this run.

## Reproduction

1. From `packages/web`, start the dev server:
   ```powershell
   npx next dev --hostname localhost --port 3000
   ```
2. In a separate shell from the repo root, capture the audit:
   ```powershell
   $env:LHCI_NO_LIGHTHOUSE_ERROR_REPORTING = "1"
   npx --yes lighthouse@12.8.2 http://localhost:3000 `
     --preset=desktop `
     --output=json `
     --output-path="docs/system-current/ui-performance/002-core-ui.lighthouse.json" `
     --chrome-flags="--headless=new --no-sandbox" `
     --quiet
   ```
