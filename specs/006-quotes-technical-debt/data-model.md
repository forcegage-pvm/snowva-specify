# Data Model: Quotes Technical Debt Resolution

**Generated**: September 28, 2025  
**Feature**: 007-quotes-technical-debt  

## Core Entities

### Quote Entity
```typescript
interface Quote {
  id: string
  quoteNumber: string
  customerId: string
  customerName: string
  status: QuoteStatus
  items: QuoteItem[]
  totalAmount: number
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  createdBy: string
  assignedTo?: string
  notes?: string
  metadata: QuoteMetadata
}

type QuoteStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'expired' 
  | 'converted'
  | 'archived'

interface QuoteItem {
  id: string
  productId: string
  productName: string
  description: string
  quantity: number
  unitPrice: number
  discount?: number
  totalPrice: number
}

interface QuoteMetadata {
  version: number
  source: 'manual' | 'imported' | 'duplicated'
  originalQuoteId?: string
  conversionDetails?: {
    invoiceId: string
    convertedAt: Date
    convertedBy: string
  }
}
```

### Quote Operation Entities
```typescript
interface QuoteOperation {
  id: string
  quoteId: string
  operationType: QuoteOperationType
  status: OperationStatus
  initiatedBy: string
  initiatedAt: Date
  completedAt?: Date
  errorMessage?: string
  metadata: OperationMetadata
}

type QuoteOperationType = 
  | 'edit'
  | 'duplicate' 
  | 'convert_to_invoice'
  | 'status_update'
  | 'archive'
  | 'export_pdf'
  | 'export_excel'
  | 'bulk_operation'

type OperationStatus = 
  | 'pending'
  | 'in_progress' 
  | 'completed'
  | 'failed'
  | 'cancelled'

interface OperationMetadata {
  batchId?: string // For bulk operations
  affectedQuoteIds?: string[] // For bulk operations
  exportFormat?: 'pdf' | 'excel'
  originalData?: Record<string, any> // For rollback
}
```

### Bulk Operation Entities
```typescript
interface BulkOperation {
  id: string
  batchId: string
  operationType: BulkOperationType
  targetQuoteIds: string[]
  status: BulkOperationStatus
  progress: BulkOperationProgress
  initiatedBy: string
  initiatedAt: Date
  completedAt?: Date
  results: BulkOperationResult[]
}

type BulkOperationType = 
  | 'bulk_status_update'
  | 'bulk_archive'
  | 'bulk_export'

interface BulkOperationStatus {
  overall: OperationStatus
  canCancel: boolean
  completedCount: number
  failedCount: number
  totalCount: number
}

interface BulkOperationProgress {
  percentage: number
  currentOperation?: string
  estimatedTimeRemaining?: number
}

interface BulkOperationResult {
  quoteId: string
  success: boolean
  errorMessage?: string
  resultData?: any
}
```

### Export System Entities
```typescript
interface ExportRequest {
  id: string
  requestType: ExportType
  quoteIds: string[]
  format: ExportFormat
  options: ExportOptions
  status: ExportStatus
  requestedBy: string
  requestedAt: Date
  completedAt?: Date
  downloadUrl?: string
  expiresAt?: Date
}

type ExportType = 'individual' | 'bulk'
type ExportFormat = 'pdf' | 'excel'

interface ExportOptions {
  includeItems: boolean
  includeCustomerDetails: boolean
  includeNotes: boolean
  dateRange?: {
    startDate: Date
    endDate: Date
  }
}

type ExportStatus = 
  | 'queued'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'expired'
```

### Filter and Search Entities
```typescript
interface QuoteFilter {
  dateRange?: {
    startDate: Date
    endDate: Date
    preset?: 'today' | 'this_week' | 'this_month' | 'custom'
  }
  statusFilter?: QuoteStatus[]
  customerFilter?: string[]
  amountRange?: {
    min: number
    max: number
  }
  assignedTo?: string[]
  searchQuery?: string
  searchType?: 'all' | 'quote_number' | 'customer_name'
}

interface QuoteSearchResult {
  quotes: Quote[]
  totalCount: number
  hasMore: boolean
  nextCursor?: string
  appliedFilters: QuoteFilter
  executionTime: number
}
```

## State Management

### Quote List State
```typescript
interface QuoteListState {
  quotes: Quote[]
  selectedQuoteIds: string[]
  filters: QuoteFilter
  searchQuery: string
  sortBy: QuoteSortField
  sortDirection: 'asc' | 'desc'
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    hasMore: boolean
  }
  loading: {
    initial: boolean
    refresh: boolean
    loadMore: boolean
  }
  error?: string
}

type QuoteSortField = 
  | 'quoteNumber'
  | 'customerName' 
  | 'totalAmount'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
```

### Operation State
```typescript
interface OperationState {
  activeOperations: Map<string, QuoteOperation>
  bulkOperations: Map<string, BulkOperation>
  exportRequests: Map<string, ExportRequest>
  lastError?: string
  canRetry: boolean
}
```

## Data Validation Schema

### Zod Validation Schemas
```typescript
import { z } from 'zod'

export const QuoteStatusSchema = z.enum([
  'draft', 'pending', 'approved', 'rejected', 'expired', 'converted', 'archived'
])

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  quoteNumber: z.string().min(1),
  customerId: z.string().uuid(),
  customerName: z.string().min(1),
  status: QuoteStatusSchema,
  items: z.array(QuoteItemSchema),
  totalAmount: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date(),
  createdBy: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().optional(),
  metadata: QuoteMetadataSchema
})

export const BulkOperationSchema = z.object({
  targetQuoteIds: z.array(z.string().uuid()).min(1),
  operationType: z.enum(['bulk_status_update', 'bulk_archive', 'bulk_export']),
  options: z.record(z.any()).optional()
})

export const ExportRequestSchema = z.object({
  quoteIds: z.array(z.string().uuid()).min(1),
  format: z.enum(['pdf', 'excel']),
  options: z.object({
    includeItems: z.boolean(),
    includeCustomerDetails: z.boolean(),
    includeNotes: z.boolean(),
    dateRange: z.object({
      startDate: z.date(),
      endDate: z.date()
    }).optional()
  })
})
```

## Performance Considerations

### Pagination Strategy
- Initial load: 50 quotes with skeleton states
- Progressive loading: 25 quotes per scroll/page
- Virtual scrolling for 1,000+ quotes
- Cursor-based pagination for consistent ordering

### Caching Strategy  
- Quote list cache: 5 minutes TTL
- Individual quote cache: 15 minutes TTL
- Filter results cache: 2 minutes TTL
- Export status cache: 30 seconds TTL

### Optimistic Updates
- Status changes: Show immediately, rollback on failure
- Selection state: Local state, no server sync
- Bulk operations: Server-first with progress tracking
- Export generation: Polling-based status updates