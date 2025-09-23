# Quickstart Guide: Core Business Management System

**Date**: 2025-09-23  
**Feature**: Core Business Management System  
**Phase**: Phase 1 Design

## Constitutional Compliance Validation

This quickstart guide validates adherence to Snowva Business Management System Constitution v1.0.0. All test scenarios verify:

- **[Constitutional Principle I: Component-First Development]**: UI features built as reusable components with Tailwind CSS patterns
- **[Constitutional Principle II: Test-First Development]**: TDD workflow with comprehensive test coverage (≥90%)
- **[Constitutional Principle III: Business Data Integrity]**: Financial calculations with precise decimal arithmetic and audit trails
- **[Constitutional Principle IV: Design System Consistency]**: Consistent Tailwind design tokens and responsive patterns
- **[Constitutional Principle V: Performance and Accessibility]**: <3s load times, WCAG 2.1 AA compliance, Lighthouse scores ≥90

## Development Environment Setup

### Prerequisites

- Node.js 18+ installed
- Git installed
- VS Code (recommended) with TypeScript extension
- Chrome/Firefox for testing

### Initial Setup

```bash
# Clone repository (if needed)
git clone <repository-url>
cd snowva

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with local configuration

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Project Structure

```
snowva/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── customers/       # Customer management pages
│   │   ├── products/        # Product management pages
│   │   ├── quotes/          # Quote management pages
│   │   ├── invoices/        # Invoice management pages
│   │   ├── payments/        # Payment management pages
│   │   └── reports/         # Reporting pages
│   ├── components/          # Shared UI components
│   │   ├── ui/              # Basic UI components
│   │   ├── forms/           # Form components
│   │   └── business/        # Business logic components
│   ├── features/            # Feature-specific logic
│   │   ├── customers/
│   │   ├── products/
│   │   ├── quotes/
│   │   ├── invoices/
│   │   └── payments/
│   ├── lib/                 # Utilities and configurations
│   │   ├── utils.ts         # Helper functions
│   │   ├── validations.ts   # Zod schemas
│   │   └── mock-data.ts     # Mock data generators
│   ├── types/               # TypeScript type definitions
│   └── data/                # Mock data files
├── public/                  # Static assets
├── tests/                   # Test files
│   ├── __mocks__/          # Test mocks
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── docs/                    # Documentation
└── .specify/               # Specification framework
```

## Core Workflow Validation

### Test Scenario 1: Customer Management

**Objective**: Verify complete customer lifecycle management

#### Steps:

1. **Navigate to Customers page**

   - URL: `http://localhost:3000/customers`
   - Should display customer list with search and filter options
   - Should show "Create Customer" button

2. **Create Retail Customer**

   ```typescript
   // Test data
   const retailCustomer = {
     type: "retail",
     name: "Test Outdoor Warehouse",
     tradingName: "Outdoor Warehouse Test Branch",
     vatNumber: "4080304928",
     registrationNumber: "2010/007043/07",
     contactPerson: "John Smith",
     email: "john@outdoorwarehouse.co.za",
     phone: "+27 11 234 5678",
     address: {
       street: "123 Test Street",
       city: "Johannesburg",
       province: "Gauteng",
       postalCode: "2000",
       country: "South Africa",
     },
     paymentTerms: 30,
   };
   ```

   - Fill customer form with test data
   - Submit and verify customer appears in list
   - Verify customer detail page shows all information correctly

3. **Add Branch to Customer**
   ```typescript
   const branch = {
     branchCode: "JHB001",
     name: "Johannesburg Main Branch",
     address: {
       street: "456 Branch Street",
       city: "Johannesburg",
       province: "Gauteng",
       postalCode: "2001",
       country: "South Africa",
     },
     contactPerson: "Jane Doe",
     email: "jane@outdoorwarehouse.co.za",
     phone: "+27 11 234 5679",
   };
   ```
   - Navigate to customer detail page
   - Click "Add Branch" button
   - Fill branch form and submit
   - Verify branch appears in customer's branch list

#### Expected Results:

- ✅ Customer created successfully with all fields saved
- ✅ Customer appears in filtered list (retail customers only)
- ✅ Branch linked to customer correctly
- ✅ Customer-branch relationship visible in UI
- ✅ Validation errors shown for missing required fields

### Test Scenario 2: Product and Pricing Setup

**Objective**: Verify product catalog and pricing management

#### Steps:

1. **View Product Catalog**

   - Navigate to `/products`
   - Should display 11 Snowva products from mock data
   - Should show current pricing for retail vs consumer

2. **Set Customer-Specific Pricing**

   ```typescript
   const priceOverride = {
     customerId: "test-customer-id",
     productId: "snowva-ultimate-ice-maker",
     customItemCode: "OW-ICE-001",
     customDescription: "Snowva Ultimate Ice Maker (OW Spec)",
     customPrice: 300.0, // Custom price instead of R315
   };
   ```

   - Navigate to customer detail page
   - Go to "Pricing Overrides" tab
   - Add override for Snowva Ultimate Ice Maker
   - Verify override appears in customer's pricing view

3. **Create New Pricelist Version**
   ```typescript
   const newPricelist = {
     version: "2025.2",
     effectiveDate: new Date("2025-10-01"),
     items: [
       {
         productId: "snowva-ultimate-ice-maker",
         retailPrice: 330.0, // Increased from R315
         consumerPrice: 420.0, // Increased from R400
       },
       // ... other products
     ],
   };
   ```
   - Navigate to `/products/pricing`
   - Click "Create New Pricelist"
   - Set future effective date
   - Update prices for all products
   - Verify new pricelist created but not yet active

#### Expected Results:

- ✅ Product catalog displays correctly with current pricing
- ✅ Customer-specific overrides work for quotes/invoices
- ✅ New pricelist created but doesn't affect current pricing
- ✅ Price history preserved for existing quotes

### Test Scenario 3: Quote-to-Invoice Workflow

**Objective**: Verify complete sales process from quote to payment

#### Steps:

1. **Create Quote**

   ```typescript
   const quote = {
     customerId: "test-customer-id",
     branchId: "test-branch-id",
     validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
     lineItems: [
       {
         productId: "snowva-ultimate-ice-maker",
         quantity: 5,
         // unitPrice will be calculated based on customer pricing
       },
       {
         productId: "braai-grid-small",
         quantity: 10,
       },
     ],
     notes: "Test quote for validation",
   };
   ```

   - Navigate to `/quotes/new`
   - Select test customer and branch
   - Add line items using product selector
   - Verify pricing calculations (subtotal, VAT, total)
   - Save as draft and verify quote number generated

2. **Convert Quote to Invoice**

   - Open saved quote
   - Click "Convert to Invoice"
   - Add order number: "PO-TEST-001"
   - Verify all quote data transferred correctly
   - Verify new invoice number generated (YYMMDDXXX format)
   - Save as draft invoice

3. **Finalize Invoice**
   - Open draft invoice
   - Review all details for accuracy
   - Click "Finalize Invoice"
   - Verify invoice becomes read-only
   - Verify due date calculated (invoice date + 30 days)
   - Verify customer balance updated

#### Expected Results:

- ✅ Quote created with correct pricing and calculations
- ✅ Quote converts to invoice preserving all data
- ✅ Invoice generates sequential number correctly
- ✅ Finalized invoice cannot be edited
- ✅ Customer balance reflects new invoice amount

### Test Scenario 4: Payment Processing

**Objective**: Verify payment recording and allocation

#### Steps:

1. **Record Payment**

   ```typescript
   const payment = {
     customerId: "test-customer-id",
     amount: 5000.0, // Partial payment
     paymentDate: new Date(),
     paymentMethod: "bank_transfer",
     reference: "TXN-123456789",
     notes: "Test payment via bank transfer",
   };
   ```

   - Navigate to `/payments/new`
   - Select test customer
   - Enter payment amount (less than total outstanding)
   - Select payment method and add reference
   - Submit payment

2. **Verify FIFO Allocation**

   - Check payment detail page
   - Verify payment allocated to oldest invoice first
   - Verify remaining balance if partial payment
   - Check customer balance updated correctly

3. **Generate Statement**
   ```typescript
   const statementPeriod = {
     customerId: "test-customer-id",
     fromDate: new Date("2025-01-01"),
     toDate: new Date("2025-09-23"),
   };
   ```
   - Navigate to customer detail page
   - Click "Generate Statement"
   - Select statement period
   - Verify statement shows all invoices and payments
   - Verify running balance calculations
   - Test PDF generation

#### Expected Results:

- ✅ Payment recorded successfully with all details
- ✅ FIFO allocation applied automatically
- ✅ Customer balance updated correctly
- ✅ Statement generated with accurate calculations
- ✅ PDF statement matches expected format

## Development Testing Guidelines

### Mock Data Usage

```typescript
// Use realistic mock data based on extracted PDFs
import {
  mockCustomers,
  mockProducts,
  mockInvoices,
  mockPayments,
} from "@/lib/mock-data";

// Example customer data matches real Snowva customers
const outdoorWarehouse = mockCustomers.find((c) =>
  c.name.includes("Outdoor Warehouse")
);
```

### Validation Testing

```typescript
// Test all form validations
const invalidCustomer = {
  type: "retail",
  name: "", // Should trigger required field error
  vatNumber: "123", // Should trigger invalid VAT format error
  email: "invalid-email", // Should trigger email format error
  paymentTerms: -1, // Should trigger positive number error
};
```

### Error Handling Testing

```typescript
// Test API error scenarios
// Mock network failures, validation errors, business rule violations
// Verify user-friendly error messages displayed
// Verify form state preserved during errors
```

### Performance Testing

```typescript
// Test with large datasets
const largeCustomerList = Array.from({ length: 1000 }, (_, i) =>
  generateMockCustomer(i)
);

// Verify pagination, virtualization, search performance
// Measure component render times
// Test memory usage with large datasets
```

## Verification Checklist

### ✅ Constitutional Compliance

- [ ] **Component-First Development**: All UI features implemented as reusable components with Tailwind CSS patterns
- [ ] **Test-First Development**: TDD workflow followed with ≥90% test coverage achieved
- [ ] **Business Data Integrity**: Financial calculations use precise decimal arithmetic with audit trails
- [ ] **Design System Consistency**: Consistent Tailwind design tokens and theming support implemented
- [ ] **Performance & Accessibility**: <3s load times, WCAG 2.1 AA compliance, Lighthouse scores ≥90

### ✅ Environment Setup

- [ ] Development server starts successfully
- [ ] All dependencies installed without errors
- [ ] TypeScript compilation passes
- [ ] Tailwind CSS styles loading correctly

### ✅ Core Functionality

- [ ] Customer management (CRUD operations)
- [ ] Branch management for retail customers
- [ ] Product catalog display with pricing
- [ ] Customer-specific pricing overrides
- [ ] Quote creation and management
- [ ] Quote-to-invoice conversion
- [ ] Invoice finalization and locking
- [ ] Payment recording with FIFO allocation
- [ ] Statement generation and PDF export

### ✅ Data Validation

- [ ] All form validations working
- [ ] Business rule enforcement (no editing finalized invoices)
- [ ] Calculation accuracy (VAT, totals, balances)
- [ ] Date handling and formatting
- [ ] Currency formatting (South African Rand)

### ✅ User Experience

- [ ] Responsive design on mobile/tablet
- [ ] Intuitive navigation between features
- [ ] Loading states for async operations
- [ ] Error messages user-friendly
- [ ] Keyboard accessibility support

### ✅ Integration Points

- [ ] API routes respond correctly
- [ ] Mock data integration seamless
- [ ] PDF generation working
- [ ] File download functionality
- [ ] Form state management consistent

---

**Status**: ✅ Quickstart Guide Complete  
**Next**: Execute Phase 2 task planning approach
