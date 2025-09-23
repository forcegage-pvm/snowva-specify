# Feature Specification: Core Business Management System

**Feature Branch**: `001-core-features`  
**Created**: 2025-09-23  
**Status**: Draft  
**Input**: User description: "core-features"

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

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

Snowva staff members need a comprehensive web application to manage their entire sales lifecycle for over 150 retail customers (including major chains like Outdoor Warehouse with 40+ branches, Sportsmans Warehouse with 30+ branches) and individual consumers. The system must handle their complete product range (Snowva Ultimate Ice Maker, Makabrai braai stands, Braai Grids, BraaiTas, etc.) with distinct retail vs consumer pricing (typically 20-30% markup for consumers). The system must support complex multi-branch organizations where each location can be billed separately while maintaining parent company relationships, generate professional invoices with VAT calculations, produce consolidated statements with 30-day payment terms, and track all transactions with proper item codes and order numbers.

### Acceptance Scenarios

1. **Given** a new retail inquiry from "Outdoor Warehouse - New Branch", **When** staff creates a customer record linking it to parent company "Outdoor Warehouse" with Net 30 payment terms, **Then** the system stores the branch relationship and establishes credit terms for future transactions.

2. **Given** the current product catalog with Snowva Ultimate Ice Maker at R315 (retail) and R400 (consumer), **When** staff updates pricing for the new financial period to R330 (retail) and R420 (consumer), **Then** the system creates a new versioned pricelist while preserving the old pricing for existing quotes and invoices.

3. **Given** Sportsmans Warehouse requests a quote for 50 Snowva Ultimate Ice Makers across 10 branches, **When** staff creates a multi-line quote with current retail pricing (R315 each), **Then** the system generates a professional quote document with item codes (1013250) that can be printed, downloaded, or emailed.

4. **Given** an approved quote for Trans Africa Self drive adventures, **When** staff converts it to invoice #250827101 with 5 Snowva Ultimate Ice Makers, 5 Braai Grid - Small, and 10 BraaiTas, **Then** the system creates an editable invoice with VAT calculations that can be modified until finalization.

5. **Given** invoice #250827101 for R15,180.00 is finalized, **When** the system processes the invoice, **Then** the invoice amount is added to Trans Africa's customer balance and the invoice becomes non-editable with proper audit trail.

6. **Given** Sportsmans Warehouse has Net 30 payment terms and multiple outstanding invoices from October and December 2024, **When** the statement period arrives, **Then** the system automatically generates consolidated statements showing all branch invoices (Nelspruit, Northridge, Polokwane, etc.) with total due amount and 30-day payment terms.

7. **Given** Holdsport Group (t/a Sportsmans Warehouse) makes a payment of R20,000, **When** staff records the payment against statement #241007404, **Then** the system applies it against specific branch invoices and updates the customer balance accordingly.

8. **Given** Sportsmans Warehouse parent company with branches in Nelspruit, Northridge, and Polokwane, **When** staff creates an invoice for Snowva Ultimate Ice Makers, **Then** they can choose to bill the parent company or individual branches (with specific branch codes) while maintaining separate branch transaction records.

### Edge Cases

- What happens when Outdoor Warehouse's payment terms change from Net 30 to Net 60 mid-cycle with outstanding invoices across 40+ branches?
- How does the system handle partial payments of R10,000 against a statement total of R47,120.00 using FIFO allocation across multiple branch invoices?
- What occurs when customer-specific item codes or pricing overrides conflict with historical quote data during invoice conversion?
- How are branch relationships managed when Sportsmans Warehouse acquires new locations or closes existing branches?
- What happens when a finalized invoice #250827101 for R15,180.00 needs to be corrected for VAT calculation errors?
- How does the system handle when the same customer (like Sportsmans Warehouse) has different VAT numbers for different branches?
- What occurs when order numbers (like PO10630114) are duplicated across different customer branches?
- How does the system manage sequential invoice numbering continuity across system upgrades, data migrations, or multi-user concurrent access?

## Requirements _(mandatory)_

### Functional Requirements

#### Customer Management

- **FR-001**: System MUST allow creation and management of two customer types: retail customers (companies like Outdoor Warehouse, Sportsmans Warehouse) and individual consumers (like Hendrik Coetzee)
- **FR-002**: System MUST support parent company structures with multiple branches (e.g., Sportsmans Warehouse parent with 30+ branches including Nelspruit, Northridge, Polokwane, Tokai, etc.)
- **FR-003**: System MUST allow invoicing against either the parent company (Holdsport Group t/a Sportsmans Warehouse) or individual branches with specific branch identifiers, determined by the order source (who placed the original order)
- **FR-004**: System MUST store customer payment terms (standard Net 30 days from invoice) and VAT numbers (e.g., VAT #: 4080304928) for automatic statement generation
- **FR-005**: System MUST maintain customer contact information, billing addresses (e.g., PO Box 2721, Cape Town, 8000), and communication preferences
- **FR-006**: System MUST handle complex customer names with trading aliases (e.g., "Holdsport Group Pty Ltd t/a Sportsmans Warehouse")

#### Product and Pricing Management

- **FR-007**: System MUST maintain a product catalog with 11 core products (Snowva Ultimate Ice Maker, Makabrai, BraaiTas, Braai Grids in 3 sizes, Braai Baks in 3 capacities, Outray, Borki) with separate retail and consumer pricing
- **FR-008**: System MUST support significant pricing differences between retail and consumer sales (e.g., Snowva Ultimate Ice Maker: R315 retail vs R400 consumer, Makabrai: R580 retail vs R750 consumer)
- **FR-009**: System MUST support versioned pricelists based on date to maintain historical pricing accuracy for ongoing quotes and invoices
- **FR-010**: System MUST allow creation of new pricelist versions while preserving historical data for audit and reference purposes
- **FR-011**: System MUST automatically apply the correct pricelist version based on transaction date and customer type (retail vs consumer)
- **FR-012**: System MUST manage product item codes with different rules by customer type: consumer invoices exclude item codes entirely, while retail invoices use default item codes (e.g., 1013250 for Snowva Ultimate Ice Maker) unless overridden by customer-specific settings
- **FR-013**: System MUST handle products with multiple size/capacity variants (Small/Medium/Large for Braai Grids, 2.5L/3.8L/5.2L for Braai Baks)
- **FR-014**: System MUST support customer-specific product overrides for retail customers, allowing custom pricing, descriptions, and item codes that supersede default product settings on all invoices for that customer

#### Quote Management

- **FR-015**: System MUST allow creation of quotes for both retail customers (like Trans Africa Self drive adventures) and individual consumers
- **FR-016**: System MUST generate quotes using current pricing at time of creation with proper item codes and descriptions
- **FR-017**: System MUST allow printing, downloading, and emailing of quotes to customers with professional formatting
- **FR-018**: System MUST support conversion of quotes to invoices while preserving original pricing from the quote date regardless of current pricing changes, maintaining customer commitment to quoted prices
- **FR-019**: System MUST handle multi-line quotes with various products and quantities (e.g., 5 Ice Makers + 5 Braai Grids + 10 BraaiTas)

#### Invoice Management

- **FR-020**: System MUST allow creation of invoices directly or from existing quotes with sequential numbering (format: YYMMDDXXX, e.g., 250827101)
- **FR-021**: System MUST allow editing of invoices until they are finalized with full audit trail of changes
- **FR-022**: System MUST prevent editing of finalized invoices and automatically add them to customer balance
- **FR-023**: System MUST generate professional invoice documents with company details (Snowva™ Trading Pty Ltd, 2010/007043/07, 67 Wildevy Street, Lynnwood Manor, Pretoria, VAT #: 4100263500)
- **FR-024**: System MUST calculate VAT at 15% with clear subtotal, VAT amount, and total breakdown
- **FR-025**: System MUST include banking details on all invoices (First National Bank, Branch code 250 655, Account number 62264885082)
- **FR-026**: System MUST support different invoice formats for retail customers (with order numbers) vs individual consumers
- **FR-027**: System MUST handle delivery fees and special charges as separate line items
- **FR-028**: System MUST assign unique invoice numbers for tracking and reference using sequential numbering that never resets (e.g., 250827101, 250827102, 250827103) continuing indefinitely across all invoice types

#### Payment and Statement Management

- **FR-029**: System MUST track customer balances based on finalized invoices and received payments with real-time updates
- **FR-030**: System MUST generate consolidated statements for multi-branch customers showing all branch invoices (e.g., statement #241007404 showing invoices from Nelspruit, Northridge, Polokwane branches)
- **FR-031**: System MUST calculate due dates based on standard "30 Days from Invoice" terms clearly displayed on statements
- **FR-032**: System MUST allow recording of payments against specific invoices, statements, or customer accounts with automatic FIFO (First In, First Out) allocation tracking for partial payments across oldest outstanding invoices first
- **FR-033**: System MUST support partial payments and payment allocation across multiple invoices using FIFO (oldest invoices first) with detailed breakdown
- **FR-034**: System MUST display total amounts due prominently on statements (e.g., "TOTAL DUE (VAT incl) R 47,120.00")
- **FR-035**: System MUST group invoices by date and order number on statements for easy reconciliation
- **FR-036**: System MUST include all invoice details on statements: Date, Invoice #, Order #, Branch, Description, Item Code, Amount

#### Document Management

- **FR-037**: System MUST provide document templates matching current formats for quotes, invoices (retail vs individual), and statements
- **FR-038**: System MUST support multiple delivery methods: print, download PDF, and email with professional formatting
- **FR-039**: System MUST maintain document history and audit trail for all generated documents with version control
- **FR-040**: System MUST include proper company branding and legal information on all documents (Snowva™ Trading Pty Ltd logos, registration numbers, VAT details)
- **FR-041**: System MUST generate sequential document numbers with date-based formatting for easy tracking and filing

### Key Entities _(include if feature involves data)_

- **Customer**: Represents both retail companies (like Holdsport Group t/a Sportsmans Warehouse with VAT #4080304928) and individual consumers (like Hendrik Coetzee), with fields for contact information, billing address, customer type (retail/consumer), payment terms (standard Net 30), VAT numbers, and parent company relationships for multi-branch operations

- **Branch**: Sub-entity of parent retail customers representing different locations (e.g., Sportsmans Warehouse - Nelspruit, Sportsmans Warehouse - Northridge) that can be billed separately while maintaining parent company relationships and consolidated statements

- **Product**: Represents Snowva's 11 core inventory items including Snowva Ultimate Ice Maker (item codes: 078119125409, 1013250), Makabrai braai stands, BraaiTas, Braai Grids (Small/Medium/Large), Braai Baks (2.5L/3.8L/5.2L), Outray, and Borki with descriptions, multiple item codes, categories, and active status

- **Pricelist**: Time-versioned pricing structure containing effective dates and dual pricing (retail: R315 vs consumer: R400 for Snowva Ultimate Ice Maker), linked to products with significant markup differences (20-30%) between customer types

- **Quote**: Pre-sale document containing customer information, line items with products and quantities, pricing snapshot from current pricelist, and conversion status to invoice with professional formatting

- **Invoice**: Billable document with sequential numbering (YYMMDDXXX format), customer details, line items with item codes, VAT calculations at 15%, totals, finalization status, order numbers for retail customers, and document generation history

- **Payment**: Financial transaction record linking to customer accounts with amount, date, allocation to specific invoices/statements, payment method, and detailed tracking for partial payments across multiple invoices

- **Statement**: Consolidated customer balance summary showing multiple outstanding invoices grouped by date and order number, branch details, 30-day payment terms, total amounts due (VAT inclusive), and professional formatting with company banking details

- **Order**: Purchase order tracking entity for retail customers linking multiple invoices to original orders (e.g., PO10630114 spanning multiple branches and delivery dates)

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
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
- [x] Review checklist passed
