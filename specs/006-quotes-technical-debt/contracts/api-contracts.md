# API Contracts: Quote Operations

**Generated**: September 28, 2025  
**Feature**: 007-quotes-technical-debt  

## Base Response Types

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: ResponseMetadata
}

interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  retryable: boolean
}

interface ResponseMetadata {
  timestamp: string
  requestId: string
  executionTime: number
}
```

## Quote CRUD Operations

### Get Quote List
```typescript
// GET /api/quotes
interface GetQuotesRequest {
  page?: number
  pageSize?: number
  filters?: QuoteFilter
  sortBy?: QuoteSortField  
  sortDirection?: 'asc' | 'desc'
  cursor?: string
}

interface GetQuotesResponse extends ApiResponse<{
  quotes: Quote[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    hasMore: boolean
    nextCursor?: string
  }
  appliedFilters: QuoteFilter
}> {}
```

### Get Individual Quote
```typescript
// GET /api/quotes/:id
interface GetQuoteResponse extends ApiResponse<Quote> {}
```

### Create Quote
```typescript  
// POST /api/quotes
interface CreateQuoteRequest {
  customerId: string
  items: Omit<QuoteItem, 'id' | 'totalPrice'>[]
  expiresAt?: Date
  notes?: string
  assignedTo?: string
}

interface CreateQuoteResponse extends ApiResponse<Quote> {}
```

### Update Quote
```typescript
// PUT /api/quotes/:id  
interface UpdateQuoteRequest {
  customerId?: string
  items?: Omit<QuoteItem, 'id' | 'totalPrice'>[]
  status?: QuoteStatus
  expiresAt?: Date
  notes?: string
  assignedTo?: string
}

interface UpdateQuoteResponse extends ApiResponse<Quote> {}
```

## Quote Action Operations

### Duplicate Quote
```typescript
// POST /api/quotes/:id/duplicate
interface DuplicateQuoteRequest {
  customerId?: string // Override customer if needed
  notes?: string
  assignedTo?: string
}

interface DuplicateQuoteResponse extends ApiResponse<Quote> {}
```

### Convert to Invoice
```typescript
// POST /api/quotes/:id/convert
interface ConvertQuoteRequest {
  invoiceOptions?: {
    dueDate?: Date
    paymentTerms?: string
    notes?: string
  }
}

interface ConvertQuoteResponse extends ApiResponse<{
  quote: Quote
  invoice: {
    id: string
    invoiceNumber: string
    status: string
  }
}> {}
```

### Archive Quote
```typescript
// POST /api/quotes/:id/archive
interface ArchiveQuoteRequest {
  reason?: string
}

interface ArchiveQuoteResponse extends ApiResponse<Quote> {}
```

## Bulk Operations

### Bulk Status Update
```typescript
// POST /api/quotes/bulk/status-update
interface BulkStatusUpdateRequest {
  quoteIds: string[]
  newStatus: QuoteStatus
  reason?: string
}

interface BulkStatusUpdateResponse extends ApiResponse<{
  batchId: string
  operationId: string
  totalCount: number
  estimatedDuration: number
}> {}
```

### Bulk Archive
```typescript
// POST /api/quotes/bulk/archive
interface BulkArchiveRequest {
  quoteIds: string[]  
  reason?: string
}

interface BulkArchiveResponse extends ApiResponse<{
  batchId: string
  operationId: string
  totalCount: number
  estimatedDuration: number
}> {}
```

### Get Bulk Operation Status
```typescript
// GET /api/operations/bulk/:operationId
interface GetBulkOperationResponse extends ApiResponse<BulkOperation> {}
```

### Cancel Bulk Operation
```typescript
// POST /api/operations/bulk/:operationId/cancel
interface CancelBulkOperationResponse extends ApiResponse<{
  cancelled: boolean
  completedCount: number
  cancelledCount: number
}> {}
```

## Export Operations

### Request Export
```typescript
// POST /api/quotes/export
interface ExportQuotesRequest {
  quoteIds: string[]
  format: 'pdf' | 'excel'
  options: ExportOptions
}

interface ExportQuotesResponse extends ApiResponse<{
  exportId: string
  estimatedDuration: number
  format: 'pdf' | 'excel'
  quoteCount: number
}> {}
```

### Get Export Status
```typescript
// GET /api/exports/:exportId
interface GetExportStatusResponse extends ApiResponse<ExportRequest> {}
```

### Download Export
```typescript
// GET /api/exports/:exportId/download
// Returns file stream with appropriate headers:
// Content-Type: application/pdf | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// Content-Disposition: attachment; filename="quotes-export-YYYY-MM-DD.{pdf|xlsx}"
```

## Search and Filter Operations

### Search Quotes
```typescript
// GET /api/quotes/search
interface SearchQuotesRequest {
  query: string
  searchType: 'all' | 'quote_number' | 'customer_name'
  filters?: QuoteFilter
  limit?: number
}

interface SearchQuotesResponse extends ApiResponse<{
  quotes: Quote[]
  totalMatches: number
  searchQuery: string
  searchType: string
  executionTime: number
}> {}
```

### Get Filter Options
```typescript
// GET /api/quotes/filter-options
interface GetFilterOptionsResponse extends ApiResponse<{
  statuses: QuoteStatus[]
  customers: Array<{id: string, name: string}>
  assignees: Array<{id: string, name: string}>
  datePresets: Array<{
    key: string
    label: string
    startDate: Date
    endDate: Date
  }>
}> {}
```

## Error Response Codes

### Quote Operations
- `QUOTE_NOT_FOUND` (404): Quote ID does not exist
- `QUOTE_ACCESS_DENIED` (403): Insufficient permissions
- `QUOTE_INVALID_STATUS` (400): Invalid status transition
- `QUOTE_EXPIRED` (400): Cannot modify expired quote
- `QUOTE_ALREADY_CONVERTED` (400): Quote already converted to invoice

### Bulk Operations  
- `BULK_INVALID_QUOTES` (400): Some quote IDs invalid or inaccessible
- `BULK_OPERATION_LIMIT` (429): Too many concurrent bulk operations
- `BULK_OPERATION_CANCELLED` (409): Operation was cancelled by user
- `BULK_OPERATION_TIMEOUT` (408): Operation exceeded time limit

### Export Operations
- `EXPORT_TOO_MANY_QUOTES` (400): Quote count exceeds export limit
- `EXPORT_GENERATION_FAILED` (500): File generation failed
- `EXPORT_EXPIRED` (410): Export download link expired
- `EXPORT_FORMAT_UNSUPPORTED` (400): Requested format not supported

## Rate Limiting

### Operation Limits
- Quote CRUD: 100 requests/minute per user
- Bulk operations: 5 concurrent operations per user
- Export requests: 10 requests/hour per user
- Search queries: 50 requests/minute per user

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Type: quote_operations
```