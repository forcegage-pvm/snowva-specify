# Feature Specification: 002-core-ui

**Feature Branch**: `002-002-core-ui`  
**Created**: 2025-09-24  
**Status**: Draft  
**Input**: User description: "core-ui given the core requirements and specs already created and implemented, we need to create a comprehensive but simple, clean, modern and completely functional user interface of all components required. This should be a comprehensive, working implementation of all core requirements and features and the datamodels specified"

## Execution Flow (main)

```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

## Clarifications

### Session 2025-09-24

- Q: Which responsive breakpoints must the UI support beyond standard desktop layouts? → A: Desktop + tablet + mobile (≥375 px)
- Q: Which user roles need distinct UI experiences and permissions? → A: All users share full access to every feature
- Q: What branding guidelines should the UI follow (colors/typography/logo usage)? → A: Follow Snowva marketing brand kit
- Q: What inactivity timeout should the UI enforce before auto-logout? → A: 30 minutes
- Q: What performance target should the UI meet when loading large data views (e.g., 150+ customers)? → A: ≤2 seconds

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

Snowva's operations team needs a cohesive, modern web interface that allows sales, finance, and support staff to manage the full lifecycle of customers, branches, product catalogues, quotes, invoices, statements, and payments. The UI must expose all capabilities defined in the core business specification across more than 150 retail partners (including complex parent/branch structures like Sportsmans Warehouse and Outdoor Warehouse) and individual consumer accounts, while clearly presenting dual retail vs consumer pricing, VAT-inclusive documentation, and consolidated statements such as the R47,120.00 balance for Holdsport Group. The experience should let team members quickly locate records (e.g., Trans Africa Self Drive Adventures invoice #250827101), understand outstanding actions, and execute tasks with minimal training.

### Acceptance Scenarios

1. **Given** a sales coordinator opens the application, **When** the global dashboard loads, **Then** it highlights key KPIs (outstanding balance totals, pending quotes, recently finalized invoices) and exposes shortcuts into customer, product, and document workspaces without overwhelming the user.
2. **Given** an account manager needs to update Sportsmans Warehouse branch details, **When** they search for "Sportsmans" and select the parent company, **Then** the UI displays an expandable branch tree (e.g., Nelspruit, Northridge, Tokai) with inline editing for addresses, VAT numbers, and payment terms while preserving audit context.
3. **Given** pricing updates are due for the new season, **When** the finance analyst opens the product catalog, filters by "Retail", and edits the Snowva Ultimate Ice Maker price (R315 → R330), **Then** the UI shows the impacted price list version, dual consumer pricing, and a change summary before confirmation.
4. **Given** Trans Africa Self drive adventures requests a quote, **When** the sales coordinator launches the quote wizard and selects products (5 Ice Makers, 5 Braai Grids, 10 BraaiTas), **Then** the UI validates quantities, previews VAT-exclusive line totals, and presents a professional preview matching existing invoice layouts.
5. **Given** invoice #250827101 requires a quick status check, **When** a finance clerk views the document center, **Then** the UI shows a searchable timeline including quote origin, finalization status, payment progress, and provides download/email actions for the same layout used in official PDFs.
6. **Given** Holdsport Group submits a R20,000 payment, **When** the payment allocation screen loads, **Then** the UI suggests FIFO allocations across outstanding branch invoices, allows manual adjustments, and updates the consolidated statement balance in real time.
7. **Given** an operations manager must prepare end-of-month statements, **When** they filter statements by due date and select Sportsmans Warehouse, **Then** the UI displays the full invoice roster (e.g., 30+ branch records from October and December 2024) with totals, due dates, and export options for PDF/email.

### Edge Cases

- What happens when the user list contains 150+ companies and the UI must maintain performance while filtering or paginating large datasets?
- How does the interface prevent accidental edits when multiple staff members view the same invoice, branch record, or price list simultaneously?
- What experience is provided when document previews fail to generate due to missing or malformed legacy data (e.g., older statements without branch codes)?
- How does the UI respond when a user attempts to finalize an invoice with incomplete customer VAT information or missing order numbers?
- What is the fallback when a user operates on a low-bandwidth connection and downloads of PDF statements time out?
- How does the system surface alerts if customer-specific overrides (custom item codes or pricing) conflict with new global price list versions?

## Requirements _(mandatory)_

### Functional Requirements

#### Global Experience & Navigation

- **FR-001**: UI MUST present a unified navigation structure that exposes dashboard, customers, products, quotes, invoices, statements, payments, and document center without requiring multiple browser tabs.
- **FR-002**: UI MUST provide responsive layouts that adapt across desktop (≥1280 px), tablet (≥768 px), and mobile (≥375 px) breakpoints while preserving full functionality.
- **FR-003**: UI MUST include contextual breadcrumbs and persistent page titles so users always know whether they are working in a parent company, branch, product, or document context.
- **FR-004**: UI MUST offer a global search that can locate customers (e.g., "Sportsmans"), branches ("Tokai"), products ("BraaiTas"), and document numbers (#250827101) with clear type labels on results.
- **FR-005**: UI MUST surface real-time status notifications for critical events (invoice finalization, payment allocations, statement exports) without requiring page refreshes.
- **FR-006**: UI MUST provide user assistance elements (inline tips, quick-start guides) referencing Snowva's terminology (e.g., Net 30 statements) to reduce onboarding time.
- **FR-007**: UI MUST support theming consistent with the Snowva marketing brand kit (approved colors, typography, and logo treatments).

#### User Access & Personas

- **FR-008**: UI MUST expose the complete feature set to every authenticated user without role-based segmentation, supporting staff across sales, finance, operations, and support functions.
- **FR-009**: UI MUST communicate that all capabilities are available to the signed-in user (e.g., absence of restricted-state indicators) to avoid assumptions about hidden features.

#### Customer & Branch Management Interfaces

- **FR-010**: UI MUST list all parent companies (150+ entries) with sortable columns (name, VAT, credit terms) and allow pagination or infinite scrolling without performance degradation, delivering initial results within 2 seconds under normal load.
- **FR-011**: UI MUST provide branch-level panels showing relationship hierarchy, key contacts, and outstanding balances, including examples like Outdoor Warehouse's 40+ branches.
- **FR-012**: UI MUST support inline editing for customer attributes (payment terms, VAT numbers, addresses) with confirmation steps before committing changes.
- **FR-013**: UI MUST display linked documents (quotes, invoices, statements) within the customer/branch view to provide context without leaving the page.
- **FR-014**: UI MUST highlight overdue balances and upcoming statement due dates within the customer workspace.

#### Product Catalog & Pricing Views

- **FR-015**: UI MUST separate retail vs consumer pricing, showing both values (e.g., Snowva Ultimate Ice Maker R315 vs R400) with clear labels.
- **FR-016**: UI MUST allow filtering by product type (Snowva, Makabrai, Braai Grid sizes, Braai Baks capacities, BraaiTas, Outray, Borki) and by active/inactive status.
- **FR-017**: UI MUST display historical price list versions with effective dates and provide comparison before applying updates.
- **FR-018**: UI MUST surface customer-specific overrides (custom item codes or pricing) and alert users when overrides conflict with standard pricing.
- **FR-019**: UI MUST provide bulk update workflows for seasonal price adjustments with review and confirmation screens.

#### Quote & Invoice Workflows

- **FR-020**: UI MUST provide a multi-step wizard for creating quotes capturing customer selection, line items, pricing confirmation, and preview.
- **FR-021**: UI MUST show VAT-exclusive and VAT-inclusive totals in real time while editing quotes and invoices.
- **FR-022**: UI MUST allow conversion from quote to invoice while displaying a change log and preserving original pricing.
- **FR-023**: UI MUST prevent finalization of invoices until mandatory fields (customer VAT number, order number for retail customers, banking details) are validated.
- **FR-024**: UI MUST offer a side-by-side comparison of draft vs finalized invoice states for audit reviews.
- **FR-025**: UI MUST present a timeline view for each document, capturing creation, edits, approvals, finalization, and payment events.
- **FR-026**: UI MUST allow export, print, and email actions directly from the document preview panel with confirmation of recipient details.

#### Statements & Payment Allocation Interfaces

- **FR-027**: UI MUST list statements with filters for date range, balance size, and customer type (retail vs consumer) to support monthly batch processing.
- **FR-028**: UI MUST display statement line items mirroring existing documents (date, invoice #, order #, branch, item code, amount) with sortable columns.
- **FR-029**: UI MUST provide payment allocation tools that recommend FIFO distribution while allowing manual overrides and highlighting remaining balances.
- **FR-030**: UI MUST show consolidated totals and branch-level subtotals for customers like Holdsport Group with many branches.
- **FR-031**: UI MUST maintain a clear audit log of payment allocations, including user, timestamp, and applied invoices.

#### Document Center & Communications

- **FR-032**: UI MUST maintain a centralized document center with filters by document type (quote, invoice, statement), status, and customer.
- **FR-033**: UI MUST provide high-fidelity previews that match official PDF outputs for invoices, quotes, and statements.
- **FR-034**: UI MUST notify users when document generation fails and offer retry or support escalation options.
- **FR-035**: UI MUST log email delivery attempts for documents, indicating success/failure for compliance tracking.

#### Accessibility, Compliance & Support

- **FR-036**: UI MUST adhere to accessibility standards for contrast, keyboard navigation, and screen reader compatibility, validated by automated Axe scans (zero serious violations) and Lighthouse Accessibility score ≥ 90 across desktop, tablet, and mobile breakpoints.
- **FR-037**: UI MUST surface legal and financial disclaimers on relevant screens (invoices, statements) consistent with current documents.
- **FR-038**: UI MUST provide contextual help links or embedded knowledge base content for complex workflows (e.g., statement reconciliations).
- **FR-039**: UI MUST capture user feedback or issue reports within the interface to support continuous improvement.
- **FR-040**: UI MUST enforce a 30-minute inactivity timeout with a warning prompt before auto-logout to protect sensitive financial information.

### Key Entities _(include if feature involves data)_

- **Dashboard Tile**: Represents aggregated metrics (e.g., outstanding balances, pending quotes) with thresholds and drill-through actions to relevant records.
- **Customer Workspace View**: Visual container linking parent company, branches, contacts, outstanding documents, and payment terms, reflecting data from `Customer` and `Branch` entities.
- **Product Catalog Entry**: UI representation of a product with dual pricing, item codes, variant attributes, and associated price list versions.
- **Sales Document Timeline**: Chronological view for quotes and invoices, capturing status transitions, linked statements, and payment allocations.
- **Statement Summary Panel**: Consolidated view of invoices per customer/branch with totals, due dates, and export metadata.
- **Payment Allocation Record**: UI layer that maps payments to invoices/statements, reflecting allocation decisions and remaining balances.

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed
