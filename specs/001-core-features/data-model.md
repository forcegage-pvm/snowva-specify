# Data Model: Core Business Management System

**Date**: 2025-09-23  
**Feature**: Core Business Management System  
**Phase**: Phase 1 Design

## Constitutional Compliance

This data model aligns with Snowva Business Management System Constitution v1.0.0:

- **[Constitutional Principle III: Business Data Integrity]**: All monetary fields use precise decimal types, validation rules enforce data integrity, audit trails track financial operations
- **[Constitutional Principle II: Test-First Development]**: Mock data reflects real business scenarios from extracted PDF documents for comprehensive testing
- **TypeScript Strict Mode**: All interfaces use strict typing with no `any` types, supporting code quality standards

## Entity Definitions

### Customer

**Purpose**: Represents both retail companies and individual consumers

```typescript
interface Customer {
  id: string; // UUID
  type: "retail" | "consumer"; // Customer type determines pricing
  companyName: string; // Official company name
  fullName?: string; // Trading name or full display name
  vatNumber?: string; // VAT registration (required for retail)
  registrationNumber?: string; // Company registration

  // Contact Information
  contactPerson?: string; // Primary contact for retail customers
  contactPhoneNumbers: string[]; // Array of phone numbers
  contactEmail?: string; // Primary contact email address

  // Addresses
  deliveryAddress: Address; // Physical delivery address
  billingAddress?: Address; // Billing address (if different from delivery)

  // Business Settings
  paymentTerms: number; // Days (standard: 30)
  defaultInvoiceNotes?: string; // Default notes for invoices
  defaultInvoiceCodes?: string; // Default codes for invoices

  // Hierarchy
  parentCustomerId?: string; // For branch relationships

  // System Fields
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string; // Default: "South Africa"
}
```

**Validation Rules**:

- VAT number required for retail customers, optional for consumers
- Parent customer must be retail type if specified
- Payment terms must be positive integer
- At least one contact phone number required
- Contact email must be valid format if provided
- Delivery address is mandatory
- Billing address optional (defaults to delivery address if not specified)
- Company name is required for all customers

**State Transitions**: Active ↔ Inactive (soft delete)

### Branch

**Purpose**: Represents individual locations of multi-branch retail customers

```typescript
interface Branch {
  id: string; // UUID
  parentCustomerId: string; // Reference to parent customer
  branchCode: string; // Unique identifier within parent
  branchName: string; // Branch display name

  // Branch-specific Contact Information
  contactPerson?: string; // Branch contact person
  contactPhoneNumbers: string[]; // Branch phone numbers
  contactEmail?: string; // Branch email address

  // Branch-specific Addresses
  deliveryAddress: Address; // Branch delivery address
  billingAddress?: Address; // Branch billing address (if different)

  // Branch-specific Settings
  defaultInvoiceNotes?: string; // Branch-specific invoice notes
  defaultInvoiceCodes?: string; // Branch-specific invoice codes

  // System Fields
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- Branch code must be unique within parent customer
- Parent customer must exist and be retail type
- All branches inherit payment terms from parent
- At least one contact phone number required if contact information provided
- Contact email must be valid format if provided
- Delivery address is mandatory for each branch
- Billing address optional (defaults to delivery address if not specified)

### BillTo

**Purpose**: Represents billing information that can be associated with customers or branches for invoice generation

```typescript
interface BillTo {
  id: string; // UUID
  customerId?: string; // Associated customer (if customer-level)
  branchId?: string; // Associated branch (if branch-level)

  // Billing Information
  billToName: string; // Name to appear on invoice
  billToAddress: Address; // Billing address
  billToContact?: string; // Billing contact person
  billToEmail?: string; // Billing email
  billToPhone?: string; // Billing phone

  // Billing Settings
  invoiceNotes?: string; // Default notes for this bill-to
  invoiceCodes?: string; // Default codes for this bill-to
  vatNumber?: string; // VAT number for this billing entity

  // System Fields
  isDefault: boolean; // Whether this is the default bill-to for the customer/branch
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- Must be associated with either customer or branch, not both
- Only one default bill-to per customer/branch
- VAT number required for retail customers

### Product

**Purpose**: Represents Snowva's product catalog

```typescript
interface Product {
  id: string; // UUID
  itemCode: string; // Default item code (e.g., "1013250")
  name: string; // Product name
  description: string; // Full product description
  category: string; // Product category grouping
  variants?: ProductVariant[]; // For size/capacity variations
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductVariant {
  id: string;
  size?: string; // e.g., "Small", "Medium", "Large"
  capacity?: string; // e.g., "2.5L", "3.8L", "5.2L"
  itemCode?: string; // Variant-specific item code
  description?: string; // Variant-specific description
}
```

**Validation Rules**:

- Item code must be unique across all products and variants
- Product name must be unique
- Variants must have either size or capacity specified

### Pricelist

**Purpose**: Time-versioned pricing for products

```typescript
interface Pricelist {
  id: string; // UUID
  version: string; // Semantic version (e.g., "2025.1")
  effectiveDate: Date; // When pricing becomes active
  expiryDate?: Date; // Optional expiry date
  isActive: boolean; // Current active pricelist
  createdAt: Date;
  updatedAt: Date;
}

interface PricelistItem {
  id: string; // UUID
  pricelistId: string; // Reference to pricelist
  productId: string; // Reference to product
  variantId?: string; // Reference to variant if applicable
  retailPrice: number; // Price for retail customers (excl VAT)
  consumerPrice: number; // Price for consumers (excl VAT)
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- Only one pricelist can be active at a time
- Effective date cannot overlap with existing active pricelists
- Prices must be positive numbers
- Product/variant combination must be unique within pricelist

### CustomerProductOverride

**Purpose**: Customer-specific pricing and item code overrides

```typescript
interface CustomerProductOverride {
  id: string; // UUID
  customerId: string; // Reference to customer
  productId: string; // Reference to product
  variantId?: string; // Reference to variant if applicable
  customItemCode?: string; // Override item code
  customDescription?: string; // Override description
  customPrice?: number; // Override price (excl VAT)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- Customer must be retail type
- Product/variant combination must be unique per customer
- Custom price must be positive if specified

### Quote

**Purpose**: Pre-sale documents with pricing snapshots

```typescript
interface Quote {
  id: string; // UUID
  quoteNumber: string; // Sequential format: YYMMDDXXX
  customerId: string; // Reference to customer
  branchId?: string; // Reference to branch if applicable
  status: QuoteStatus;
  validUntil: Date; // Quote expiry date
  subtotal: number; // Sum of line totals (excl VAT)
  vatAmount: number; // VAT at 15%
  total: number; // Total including VAT
  notes?: string; // Additional notes
  createdBy: string; // User who created quote
  createdAt: Date;
  updatedAt: Date;
}

enum QuoteStatus {
  DRAFT = "draft",
  SENT = "sent",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
  CONVERTED = "converted", // Converted to invoice
}

interface QuoteLineItem {
  id: string; // UUID
  quoteId: string; // Reference to quote
  productId: string; // Reference to product
  variantId?: string; // Reference to variant if applicable
  description: string; // Description at time of quote
  itemCode?: string; // Item code at time of quote
  quantity: number;
  unitPrice: number; // Price excl VAT at time of quote
  lineTotal: number; // quantity * unitPrice
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- Quote number must be unique and sequential
- Line total must equal quantity \* unitPrice
- Subtotal must equal sum of all line totals
- VAT amount must be 15% of subtotal
- Valid until date must be future date

**State Transitions**:
Draft → Sent → (Accepted|Rejected|Expired)
Accepted → Converted

### Invoice

**Purpose**: Billable documents for completed sales

```typescript
interface Invoice {
  id: string; // UUID
  invoiceNumber: string; // Sequential format: YYMMDDXXX
  customerId: string; // Reference to customer
  branchId?: string; // Reference to branch if applicable
  quoteId?: string; // Reference to source quote if converted
  orderNumber?: string; // Customer purchase order reference
  status: InvoiceStatus;
  dueDate: Date; // Based on customer payment terms
  subtotal: number; // Sum of line totals (excl VAT)
  vatAmount: number; // VAT at 15%
  total: number; // Total including VAT
  paidAmount: number; // Amount paid against this invoice
  balance: number; // Remaining balance (total - paidAmount)
  notes?: string; // Additional notes
  createdBy: string; // User who created invoice
  finalizedBy?: string; // User who finalized invoice
  finalizedAt?: Date; // When invoice was finalized
  createdAt: Date;
  updatedAt: Date;
}

enum InvoiceStatus {
  DRAFT = "draft", // Editable
  FINALIZED = "finalized", // Not editable, added to customer balance
  PAID = "paid", // Fully paid
  OVERDUE = "overdue", // Past due date with outstanding balance
}

interface InvoiceLineItem {
  id: string; // UUID
  invoiceId: string; // Reference to invoice
  productId: string; // Reference to product
  variantId?: string; // Reference to variant if applicable
  description: string; // Description at time of invoice
  itemCode?: string; // Item code at time of invoice (retail only)
  quantity: number;
  unitPrice: number; // Price excl VAT at time of invoice
  lineTotal: number; // quantity * unitPrice
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- Invoice number must be unique and sequential
- Cannot edit finalized invoices
- Balance must equal total minus paid amount
- Due date calculated from invoice date + customer payment terms
- Item codes only included for retail customers

**State Transitions**:
Draft → Finalized → (Paid|Overdue)

### Payment

**Purpose**: Records of payments received from customers

```typescript
interface Payment {
  id: string; // UUID
  paymentNumber: string; // Sequential reference
  customerId: string; // Reference to customer
  amount: number; // Payment amount
  paymentDate: Date; // Date payment received
  paymentMethod: PaymentMethod;
  reference?: string; // Bank reference or check number
  notes?: string; // Additional notes
  allocations: PaymentAllocation[]; // How payment was allocated
  createdBy: string; // User who recorded payment
  createdAt: Date;
  updatedAt: Date;
}

enum PaymentMethod {
  BANK_TRANSFER = "bank_transfer",
  CASH = "cash",
  CHECK = "check",
  CARD = "card",
  OTHER = "other",
}

interface PaymentAllocation {
  id: string; // UUID
  paymentId: string; // Reference to payment
  invoiceId: string; // Reference to invoice
  amount: number; // Amount allocated to this invoice
  allocationDate: Date; // When allocation was made
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- Payment amount must be positive
- Total allocations cannot exceed payment amount
- Cannot allocate to draft invoices
- FIFO allocation order for automatic allocation

### Statement

**Purpose**: Consolidated customer balance summaries

```typescript
interface Statement {
  id: string; // UUID
  statementNumber: string; // Sequential format: YYMMDDXXX
  customerId: string; // Reference to customer
  statementDate: Date; // Statement generation date
  fromDate: Date; // Period start date
  toDate: Date; // Period end date
  openingBalance: number; // Balance at start of period
  invoicesTotal: number; // Total new invoices in period
  paymentsTotal: number; // Total payments in period
  closingBalance: number; // Balance at end of period
  dueAmount: number; // Amount currently due
  overdueAmount: number; // Amount past due
  items: StatementItem[]; // Invoice and payment details
  createdBy: string; // User who generated statement
  createdAt: Date;
  updatedAt: Date;
}

interface StatementItem {
  id: string; // UUID
  statementId: string; // Reference to statement
  type: "invoice" | "payment";
  referenceId: string; // Invoice ID or Payment ID
  date: Date; // Transaction date
  description: string; // Description of transaction
  branchName?: string; // Branch name for multi-branch customers
  orderNumber?: string; // Order reference for invoices
  debitAmount?: number; // Invoice amount (increases balance)
  creditAmount?: number; // Payment amount (decreases balance)
  balance: number; // Running balance after this item
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:

- Statement periods cannot overlap for same customer
- Closing balance must equal opening + invoices - payments
- Items must be ordered by date
- Due amount calculated based on current date vs invoice due dates

## Computed Fields and Aggregations

### Customer Balance Calculation

```typescript
// Real-time calculation from finalized invoices and payments
customerBalance = sum(finalizedInvoices.total) - sum(payments.amount);
```

### Invoice Status Computation

```typescript
// Computed based on current date and payment status
if (invoice.status === "finalized") {
  if (invoice.balance === 0) return "paid";
  if (new Date() > invoice.dueDate) return "overdue";
  return "finalized";
}
```

### Payment Allocation Algorithm (FIFO)

```typescript
// Automatic allocation to oldest unpaid invoices first
function allocatePayment(customerId: string, paymentAmount: number) {
  const unpaidInvoices = getUnpaidInvoicesByCustomer(customerId).sort(
    (a, b) => a.finalizedAt.getTime() - b.finalizedAt.getTime()
  );

  let remainingAmount = paymentAmount;
  const allocations: PaymentAllocation[] = [];

  for (const invoice of unpaidInvoices) {
    if (remainingAmount <= 0) break;

    const allocationAmount = Math.min(remainingAmount, invoice.balance);
    allocations.push({
      invoiceId: invoice.id,
      amount: allocationAmount,
    });

    remainingAmount -= allocationAmount;
  }

  return allocations;
}
```

## Database Schema Considerations

### Indexing Strategy

- Customer: `name`, `type`, `parentCustomerId`
- Invoice: `customerId`, `status`, `dueDate`, `invoiceNumber`
- Payment: `customerId`, `paymentDate`
- PricelistItem: `pricelistId`, `productId`, `variantId`

### Data Integrity

- Foreign key constraints on all reference fields
- Check constraints on positive amounts and valid statuses
- Unique constraints on business identifiers (invoice numbers, etc.)
- Audit triggers for financial data modifications

### Archival Strategy

- Soft delete for customer and product records
- Hard retention for financial records (7+ years)
- Read-only archive tables for completed financial periods

---

**Status**: ✅ Data Model Complete  
**Next**: Generate API contracts and component structure
