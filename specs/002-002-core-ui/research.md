# Phase 0 Research – 002-core-ui

## Tailwind UI Blocks Adoption

- **Decision**: Base layout on Tailwind UI application shell/sidebar, form layouts, and data tables.
- **Rationale**: Matches Snowva requirements for clean, modern UI; accelerates component-first development aligned with constitution; responsive patterns already vetted.
- **Alternatives Considered**: Custom in-house design system (slower, risks inconsistency); Chakra UI (conflicts with Tailwind-only mandate).

## Data-Intensive Table Performance

- **Decision**: Use server-driven pagination combined with row virtualization (React Virtual) for grids exceeding 100 rows.
- **Rationale**: Ensures ≤2 s initial loads while supporting smooth scrolling through 150+ company records; compatible with Tailwind table styling.
- **Alternatives Considered**: Infinite scroll (harder to maintain branch grouping); pure pagination (slower for bulk scanning by operations).

## Responsive Full-Access Workflows

- **Decision**: Implement adaptive layouts with breakpoint-specific component condensation (e.g., filter drawers on mobile, persistent sidebar on desktop).
- **Rationale**: Upholds shared role access while ensuring usability across ≥375 px mobile screens; leverages Tailwind responsive utilities.
- **Alternatives Considered**: Desktop-only support (fails requirement); separate mobile app (scope creep).

## Timeline & Audit Trail Visualization

- **Decision**: Create reusable `TimelineEvent` component with chronological stacking, status indicators, and expandable metadata panels.
- **Rationale**: Provides consistent audit trail visual for quotes→invoices→payments; aligns with component-first and audit requirements.
- **Alternatives Considered**: Table-based timeline (less readable); external charting library (unnecesary complexity).

## Session Timeout Experience

- **Decision**: Display modal warning at 25 minutes of inactivity with countdown timer and "Stay signed in" action; auto-save drafts before 30-minute logout.
- **Rationale**: Satisfies 30-minute timeout requirement while protecting user work; consistent with accessibility guidelines.
- **Alternatives Considered**: Silent logout (poor UX); banner-only warning (less noticeable for multitasking users).
