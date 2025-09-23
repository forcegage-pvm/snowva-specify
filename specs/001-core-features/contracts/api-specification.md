# API Contracts: Core Business Management System

**Date**: 2025-09-23  
**Feature**: Core Business Management System  
**Phase**: Phase 1 Design

## Constitutional Compliance

All API endpoints MUST adhere to Snowva Business Management System Constitution v1.0.0:

- **[Constitutional Principle III: Business Data Integrity]**: Multi-layer validation using Zod schemas, precise decimal arithmetic for monetary values, immutable audit trails for financial operations
- **[Constitutional Principle II: Test-First Development]**: All endpoints require contract tests with realistic business scenarios before implementation
- **Security Requirements**: Input validation, XSS prevention, rate limiting, and audit logging for financial operations

## API Specification

### Base Configuration

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer token (future implementation)
- **Rate Limiting**: 100 requests/minute per client

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Business rule violation
- `INTERNAL_ERROR`: Server error

## Customer Management API

### List Customers

```http
GET /api/v1/customers?type={retail|consumer}&search={query}&page={number}&limit={number}
```

**Response**:

```typescript
interface ListCustomersResponse extends ApiResponse<Customer[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Get Customer

```http
GET /api/v1/customers/{id}
```

**Response**: `ApiResponse<Customer & { branches?: Branch[] }>`

### Create Customer

```http
POST /api/v1/customers
```

**Request Body**:

```typescript
interface CreateCustomerRequest {
  type: "retail" | "consumer";
  name: string;
  tradingName?: string;
  vatNumber?: string;
  registrationNumber?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address: Address;
  paymentTerms?: number; // Default: 30
  parentCustomerId?: string;
}
```

**Response**: `ApiResponse<Customer>`

### Update Customer

```http
PUT /api/v1/customers/{id}
```

**Request Body**: `Partial<CreateCustomerRequest>`  
**Response**: `ApiResponse<Customer>`

### Deactivate Customer

```http
DELETE /api/v1/customers/{id}
```

**Response**: `ApiResponse<{ message: string }>`

## Branch Management API

### List Customer Branches

```http
GET /api/v1/customers/{customerId}/branches
```

**Response**: `ApiResponse<Branch[]>`

### Create Branch

```http
POST /api/v1/customers/{customerId}/branches
```

**Request Body**:

```typescript
interface CreateBranchRequest {
  branchCode: string;
  name: string;
  address: Address;
  contactPerson?: string;
  email?: string;
  phone?: string;
}
```

**Response**: `ApiResponse<Branch>`

### Update Branch

```http
PUT /api/v1/branches/{id}
```

**Request Body**: `Partial<CreateBranchRequest>`  
**Response**: `ApiResponse<Branch>`

## Product Management API

### List Products

```http
GET /api/v1/products?category={string}&active={boolean}&search={query}
```

**Response**: `ApiResponse<Product[]>`

### Get Product with Pricing

```http
GET /api/v1/products/{id}/pricing?customerId={id}
```

**Response**:

```typescript
interface ProductPricingResponse
  extends ApiResponse<{
    product: Product;
    pricing: {
      retailPrice: number;
      consumerPrice: number;
      effectivePrice: number; // Based on customer type and overrides
      customOverride?: CustomerProductOverride;
    };
  }> {}
```

### Create Product

```http
POST /api/v1/products
```

**Request Body**:

```typescript
interface CreateProductRequest {
  itemCode: string;
  name: string;
  description: string;
  category: string;
  variants?: Omit<ProductVariant, "id">[];
}
```

**Response**: `ApiResponse<Product>`

## Pricing Management API

### Get Current Pricelist

```http
GET /api/v1/pricelists/current
```

**Response**: `ApiResponse<Pricelist & { items: PricelistItem[] }>`

### Create New Pricelist

```http
POST /api/v1/pricelists
```

**Request Body**:

```typescript
interface CreatePricelistRequest {
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;
  items: {
    productId: string;
    variantId?: string;
    retailPrice: number;
    consumerPrice: number;
  }[];
}
```

**Response**: `ApiResponse<Pricelist>`

### Set Customer Pricing Override

```http
POST /api/v1/customers/{customerId}/pricing-overrides
```

**Request Body**:

```typescript
interface CreatePricingOverrideRequest {
  productId: string;
  variantId?: string;
  customItemCode?: string;
  customDescription?: string;
  customPrice?: number;
}
```

**Response**: `ApiResponse<CustomerProductOverride>`

## Quote Management API

### List Quotes

```http
GET /api/v1/quotes?customerId={id}&status={status}&page={number}&limit={number}
```

**Response**: `ApiResponse<Quote[]>`

### Get Quote Details

```http
GET /api/v1/quotes/{id}
```

**Response**: `ApiResponse<Quote & { lineItems: QuoteLineItem[]; customer: Customer }>`

### Create Quote

```http
POST /api/v1/quotes
```

**Request Body**:

```typescript
interface CreateQuoteRequest {
  customerId: string;
  branchId?: string;
  validUntil: Date;
  notes?: string;
  lineItems: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice?: number; // Optional, will use current pricing if not provided
  }[];
}
```

**Response**: `ApiResponse<Quote>`

### Update Quote

```http
PUT /api/v1/quotes/{id}
```

**Request Body**: `Partial<CreateQuoteRequest>`  
**Response**: `ApiResponse<Quote>`

### Convert Quote to Invoice

```http
POST /api/v1/quotes/{id}/convert-to-invoice
```

**Request Body**:

```typescript
interface ConvertQuoteRequest {
  orderNumber?: string;
  notes?: string;
}
```

**Response**: `ApiResponse<Invoice>`

### Generate Quote PDF

```http
GET /api/v1/quotes/{id}/pdf
```

**Response**: PDF file download

## Invoice Management API

### List Invoices

```http
GET /api/v1/invoices?customerId={id}&status={status}&fromDate={date}&toDate={date}&page={number}&limit={number}
```

**Response**: `ApiResponse<Invoice[]>`

### Get Invoice Details

```http
GET /api/v1/invoices/{id}
```

**Response**: `ApiResponse<Invoice & { lineItems: InvoiceLineItem[]; customer: Customer; payments: PaymentAllocation[] }>`

### Create Invoice

```http
POST /api/v1/invoices
```

**Request Body**:

```typescript
interface CreateInvoiceRequest {
  customerId: string;
  branchId?: string;
  quoteId?: string;
  orderNumber?: string;
  notes?: string;
  lineItems: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice?: number; // Optional, will use current pricing if not provided
  }[];
}
```

**Response**: `ApiResponse<Invoice>`

### Update Invoice (Draft Only)

```http
PUT /api/v1/invoices/{id}
```

**Request Body**: `Partial<CreateInvoiceRequest>`  
**Response**: `ApiResponse<Invoice>`

### Finalize Invoice

```http
POST /api/v1/invoices/{id}/finalize
```

**Response**: `ApiResponse<Invoice>`

### Generate Invoice PDF

```http
GET /api/v1/invoices/{id}/pdf
```

**Response**: PDF file download

## Payment Management API

### List Payments

```http
GET /api/v1/payments?customerId={id}&fromDate={date}&toDate={date}&page={number}&limit={number}
```

**Response**: `ApiResponse<Payment[]>`

### Get Payment Details

```http
GET /api/v1/payments/{id}
```

**Response**: `ApiResponse<Payment & { allocations: PaymentAllocation[]; customer: Customer }>`

### Record Payment

```http
POST /api/v1/payments
```

**Request Body**:

```typescript
interface CreatePaymentRequest {
  customerId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  manualAllocations?: {
    invoiceId: string;
    amount: number;
  }[]; // Optional, will use FIFO if not provided
}
```

**Response**: `ApiResponse<Payment>`

### Get Customer Balance

```http
GET /api/v1/customers/{id}/balance
```

**Response**:

```typescript
interface CustomerBalanceResponse
  extends ApiResponse<{
    totalBalance: number;
    currentDue: number;
    overdue: number;
    unpaidInvoices: {
      id: string;
      invoiceNumber: string;
      dueDate: Date;
      balance: number;
      daysPastDue: number;
    }[];
  }> {}
```

## Statement Management API

### Generate Statement

```http
POST /api/v1/customers/{customerId}/statements
```

**Request Body**:

```typescript
interface GenerateStatementRequest {
  fromDate: Date;
  toDate: Date;
}
```

**Response**: `ApiResponse<Statement>`

### Get Statement Details

```http
GET /api/v1/statements/{id}
```

**Response**: `ApiResponse<Statement & { items: StatementItem[]; customer: Customer }>`

### Generate Statement PDF

```http
GET /api/v1/statements/{id}/pdf
```

**Response**: PDF file download

## Reports API

### Sales Summary

```http
GET /api/v1/reports/sales-summary?fromDate={date}&toDate={date}&customerId={id}
```

**Response**:

```typescript
interface SalesSummaryResponse
  extends ApiResponse<{
    totalRevenue: number;
    totalInvoices: number;
    averageInvoiceValue: number;
    topProducts: {
      productId: string;
      productName: string;
      quantitySold: number;
      revenue: number;
    }[];
    topCustomers: {
      customerId: string;
      customerName: string;
      totalRevenue: number;
      invoiceCount: number;
    }[];
  }> {}
```

### Outstanding Invoices Report

```http
GET /api/v1/reports/outstanding-invoices?customerId={id}&includeOverdue={boolean}
```

**Response**:

```typescript
interface OutstandingInvoicesResponse
  extends ApiResponse<{
    totalOutstanding: number;
    totalOverdue: number;
    invoices: {
      id: string;
      invoiceNumber: string;
      customerName: string;
      branchName?: string;
      dueDate: Date;
      balance: number;
      daysPastDue: number;
      status: "finalized" | "overdue";
    }[];
  }> {}
```

---

**Status**: ✅ API Contracts Complete  
**Next**: Generate component contracts and test scenarios
