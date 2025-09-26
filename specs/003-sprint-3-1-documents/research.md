# Research Summary – Documents Workspace Export History

_Last updated: 2025-09-26_

## Document export data access pattern
- **Decision**: Use Next.js App Router server components with a typed data service that queries `/api/v1/document-exports` endpoints backed by deterministic fixtures (transitioning to real APIs later).
- **Rationale**: Keeps data fetching consistent with existing dashboard patterns, enables streaming/prefetch, and matches constitution’s component-first separation.
- **Alternatives considered**:
  - Fetching directly from Firestore: deferred until real backend integration; mocks keep development predictable.
  - Client-only fetch via SWR: rejected because server components already wrap React Query cache hydration.

## Large list performance & virtualization
- **Decision**: Implement TanStack Virtual (or React Aria Virtuoso equivalent) for the exports table when results exceed 100 rows, with pagination + virtual scrolling hybrid.
- **Rationale**: Ensures smooth rendering for ~18k rows/year, meets <3s load and <500ms navigation goals.
- **Alternatives considered**:
  - Plain pagination without virtualization: would cause long render times when filters return many results.
  - Windowing via manual IntersectionObserver: higher maintenance cost vs. well-supported library.

## Share link security & expiry
- **Decision**: Generate unguessable, signed tokens via existing `TokenService` convention; links expire in 30 days and are tracked in audit log.
- **Rationale**: Aligns with requirement for public access while mitigating token leakage risk through short TTL and immutable audit trail.
- **Alternatives considered**:
  - Authentication-gated links: conflicts with clarified need for frictionless customer access.
  - Shorter expiry (24h): increases resend burden during support calls.

## Audit logging and analytics
- **Decision**: Extend `AuditTrailService` mocks to include document export events (preview, download, share, resend) and pipe metrics to `performanceMetrics.ts` for monitoring.
- **Rationale**: Meets constitution’s business data integrity principle and ensures observability of high-sensitivity actions.
- **Alternatives considered**:
  - Logging only resend events: insufficient for compliance; preview/download also need traceability.

## Archived export handling
- **Decision**: Provide an inline banner and CTA that routes to `/support/document-archive-request` for records >365 days, with service fallback to `DocumentArchiveReference` stub.
- **Rationale**: Satisfies retention policy while guiding operators toward manual recovery workflow.
- **Alternatives considered**:
  - Automatically loading archives into the table: contradicts timeline performance needs and mix of storage systems.
