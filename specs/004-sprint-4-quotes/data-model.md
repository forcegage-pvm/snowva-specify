# Data Model: Quotes Index Workspace

**Feature**: Quotes Index Workspace  
**Date**: 2025-09-26  
**Source**: Extracted from feature specification and clarifications  

## Core Entities

### Quote
Primary business entity representing a price proposal to a customer.

```typescript
interface Quote {
  // Identity & Core Info
  id: string                    // Unique identifier (e.g., "quote_2025_001")
  quoteNumber: string          // Human-readable number (e.g., "Q-2025-001")
  customerId: string           // Reference to customer entity
  customerName: string         // Denormalized for display performance
  
  // Financial Data (precise decimal arithmetic)
  subtotal: Decimal            // Sum of line items before tax
  taxRate: Decimal            // VAT/tax rate as decimal (e.g., 0.20 for 20%)
  taxAmount: Decimal          // Calculated tax amount
  totalAmount: Decimal        // Final total including tax
  currency: string            // ISO currency code (e.g., "GBP", "USD")
  
  // Status & Workflow
  status: QuoteStatus         // Current workflow state
  statusHistory: QuoteStatusChange[]  // Audit trail of status changes
  
  // Temporal Data
  createdAt: Date            // When quote was created
  updatedAt: Date            // Last modification timestamp
  expiryDate: Date           // When quote expires
  validUntil: Date           // Business validity period
  
  // Content & Structure
  lineItems: QuoteLineItem[]  // Products/services included
  terms: string              // Terms and conditions text
  notes: string              // Internal notes (not customer-facing)
  
  // Integration & Links
  linkedInvoiceId?: string   // If converted to invoice
  originalQuoteId?: string   // If duplicated from another quote
  
  // Metadata
  createdBy: string          // User who created the quote
  lastModifiedBy: string     // User who last modified
  version: number            // Optimistic locking version
}
```

### QuoteStatus
Enumerated workflow states with strict transition rules.

```typescript
enum QuoteStatus {
  DRAFT = 'draft',           // Being created/edited
  PENDING = 'pending',       // Sent to customer, awaiting response
  APPROVED = 'approved',     // Customer accepted
  REJECTED = 'rejected',     // Customer declined
  CONVERTED = 'converted',   // Converted to invoice
  ARCHIVED = 'archived'      // No longer active
}

// Valid state transitions (enforced in business logic)
const VALID_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  [QuoteStatus.DRAFT]: [QuoteStatus.PENDING, QuoteStatus.ARCHIVED],
  [QuoteStatus.PENDING]: [QuoteStatus.APPROVED, QuoteStatus.REJECTED, QuoteStatus.DRAFT, QuoteStatus.ARCHIVED],
  [QuoteStatus.APPROVED]: [QuoteStatus.CONVERTED, QuoteStatus.ARCHIVED],
  [QuoteStatus.REJECTED]: [QuoteStatus.DRAFT, QuoteStatus.ARCHIVED],
  [QuoteStatus.CONVERTED]: [QuoteStatus.ARCHIVED],
  [QuoteStatus.ARCHIVED]: [] // Terminal state
};

interface QuoteStatusChange {
  fromStatus: QuoteStatus
  toStatus: QuoteStatus
  timestamp: Date
  userId: string
  reason?: string           // Optional justification for change
}
```

### QuoteLineItem
Individual products or services within a quote.

```typescript
interface QuoteLineItem {
  id: string                // Unique within quote
  productId?: string        // Reference to product catalog (if exists)
  description: string       // Product/service description
  quantity: Decimal         // Quantity ordered
  unitPrice: Decimal        // Price per unit (excluding tax)
  lineTotal: Decimal        // quantity * unitPrice
  taxRate: Decimal          // Tax rate for this line item
  taxAmount: Decimal        // Calculated tax for this line
  category?: string         // Product category for reporting
  order: number            // Display order within quote
}
```

### Customer (Reference Entity)
Customer information needed for quote display and filtering.

```typescript
interface CustomerReference {
  id: string               // Customer unique identifier
  name: string            // Business/contact name
  email: string           // Primary email address
  phone?: string          // Contact phone number
  
  // Address (for quote display)
  billingAddress: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
  
  // Business metadata
  company?: string        // Company name if different from name
  vatNumber?: string      // VAT/tax identification number
  
  // Display & Filtering
  tags: string[]          // Customer categories/tags
  isActive: boolean       // Whether customer is active
}
```

### QuoteActions (Derived Entity)
Available operations based on current quote status and user permissions.

```typescript
interface QuoteActions {
  canEdit: boolean        // Navigate to quote composer for editing
  canDuplicate: boolean   // Create copy in composer
  canConvert: boolean     // Convert to invoice (approved quotes only)
  canArchive: boolean     // Archive quote (any status)
  canRestore: boolean     // Restore from archive
  canExport: boolean      // Generate PDF/Excel export
  canChangeStatus: boolean // Update status manually
  
  // Available status transitions
  availableStatusChanges: QuoteStatus[]
}

// Business rules for action permissions (all users have same permissions per clarification)
function getQuoteActions(quote: Quote, userRole: UserRole): QuoteActions {
  const isArchived = quote.status === QuoteStatus.ARCHIVED;
  const isConverted = quote.status === QuoteStatus.CONVERTED;
  
  return {
    canEdit: !isArchived && !isConverted,
    canDuplicate: true, // Always allow duplication
    canConvert: quote.status === QuoteStatus.APPROVED,
    canArchive: !isArchived,
    canRestore: isArchived,
    canExport: true, // Always allow export
    canChangeStatus: !isArchived && !isConverted,
    availableStatusChanges: VALID_TRANSITIONS[quote.status] || []
  };
}
```

## Data Relationships

### Quote → Customer (Many-to-One)
- Each quote belongs to exactly one customer
- Customers can have multiple quotes
- Customer name denormalized in quote for display performance
- Customer details fetched separately for full customer info

### Quote → QuoteLineItem (One-to-Many)
- Each quote contains 0 or more line items
- Line items are owned by quote (cascade delete)
- Line items ordered by `order` field for consistent display

### Quote → QuoteStatusChange (One-to-Many)
- Each quote has history of all status changes
- Immutable audit trail for business compliance
- Includes user attribution and timestamps

### Quote → Invoice (Optional One-to-One)
- Converted quotes link to generated invoice
- Invoice system owns the relationship
- Used for display and preventing re-conversion

## Validation Rules

### Business Rules
1. **Quote Number Uniqueness**: Must be unique across all quotes
2. **Financial Consistency**: Line item totals must sum to subtotal
3. **Tax Calculation**: Tax amount must match (subtotal * taxRate)
4. **Status Transitions**: Only valid transitions allowed per VALID_TRANSITIONS
5. **Expiry Date**: Must be in the future when quote is created
6. **Line Item Validation**: At least one line item required for non-draft quotes

### Data Integrity Rules
1. **Decimal Precision**: All monetary values use 4 decimal places for accuracy
2. **Currency Consistency**: All amounts in quote use same currency
3. **Temporal Constraints**: updatedAt >= createdAt, expiryDate > createdAt
4. **Reference Integrity**: customerId must reference valid customer
5. **Immutable Audit**: Status history cannot be modified once created

### Performance Constraints
1. **Data Volume**: System designed for <1,000 total quotes
2. **Pagination**: Default 25 quotes per page, max 50 per page
3. **Filtering**: Client-side filtering for responsive UX
4. **Caching**: TanStack Query caches quote list for 5 minutes

## Integration Patterns

### API Data Flow
```
Client Request → API Route → Service Layer → Data Transform → Client Response
```

### State Management
```
TanStack Query → Local Component State → UI Updates
```

### Error Handling
```
API Error → Service Layer Error → TanStack Query Error → UI Error State
```

## Migration & Evolution

### Current Implementation
- Mock data in `/src/data/quotes.ts`
- Deterministic test fixtures
- TypeScript interfaces in `/src/types/`

### Future Evolution (Post-Implementation)
- Firebase Firestore collections
- Real-time quote updates via subscriptions
- Advanced reporting and analytics
- Integration with external CRM systems

**Status**: ✅ Data model complete, ready for contract generation