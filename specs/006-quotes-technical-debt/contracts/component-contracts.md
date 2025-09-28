# Component Contracts: Quote System

**Generated**: September 28, 2025  
**Feature**: 007-quotes-technical-debt  

## Component Interface Contracts

### QuoteActionMenu Component
```typescript
interface QuoteActionMenuProps {
  quote: Quote
  onEdit: (quoteId: string) => Promise<void>
  onDuplicate: (quoteId: string) => Promise<void>
  onConvert: (quoteId: string) => Promise<void>
  onArchive: (quoteId: string) => Promise<void>
  onStatusChange: (quoteId: string, newStatus: QuoteStatus) => Promise<void>
  disabled?: boolean
  loading?: boolean
  permissions?: {
    canEdit: boolean
    canDuplicate: boolean
    canConvert: boolean
    canArchive: boolean
    canChangeStatus: boolean
  }
}

interface QuoteActionMenuEvents {
  'action:started': { action: string, quoteId: string }
  'action:completed': { action: string, quoteId: string, result: any }
  'action:failed': { action: string, quoteId: string, error: string }
}
```

### QuoteComposer Component
```typescript
interface QuoteComposerProps {
  mode: 'create' | 'edit'
  quoteId?: string
  initialData?: Partial<Quote>
  onSave: (quoteData: CreateQuoteRequest | UpdateQuoteRequest) => Promise<Quote>
  onCancel: () => void
  onDuplicate?: (sourceQuoteId: string) => Promise<Quote>
  customers: Customer[]
  products: Product[]
  isLoading?: boolean
  validationRules?: QuoteValidationRules
}

interface QuoteComposerState {
  quote: Partial<Quote>
  items: QuoteItem[]
  validation: ValidationState
  isDirty: boolean
  isSaving: boolean
  error?: string
}
```

### QuoteExportSystem Component
```typescript
interface QuoteExportSystemProps {
  selectedQuoteIds: string[]
  onExportRequest: (request: ExportQuotesRequest) => Promise<string>
  onExportStatusCheck: (exportId: string) => Promise<ExportRequest>
  onDownload: (exportId: string) => Promise<void>
  supportedFormats: ExportFormat[]
  maxQuoteLimit: number
}

interface QuoteExportSystemState {
  activeExports: Map<string, ExportRequest>
  exportOptions: ExportOptions
  isExporting: boolean
  error?: string
}
```

### QuoteBulkOperations Component
```typescript
interface QuoteBulkOperationsProps {
  selectedQuoteIds: string[]
  availableOperations: BulkOperationType[]
  onBulkOperation: (request: BulkOperationRequest) => Promise<string>
  onOperationStatusCheck: (operationId: string) => Promise<BulkOperation>
  onOperationCancel: (operationId: string) => Promise<void>
  maxSelectionLimit: number
}

interface QuoteBulkOperationsState {
  activeOperations: Map<string, BulkOperation>
  operationProgress: Map<string, BulkOperationProgress>
  canCancel: boolean
  error?: string
}
```

### QuotePreviewModal Component
```typescript
interface QuotePreviewModalProps {
  quoteId: string
  isOpen: boolean
  onClose: () => void
  onEdit?: (quoteId: string) => void
  onDuplicate?: (quoteId: string) => void
  onConvert?: (quoteId: string) => void
  showActions?: boolean
  loading?: boolean
}

interface QuotePreviewModalState {
  quote?: Quote
  isLoading: boolean
  error?: string
}
```

### QuoteFilters Component
```typescript
interface QuoteFiltersProps {
  currentFilters: QuoteFilter
  onFiltersChange: (filters: QuoteFilter) => void
  onFiltersReset: () => void
  availableStatuses: QuoteStatus[]
  availableCustomers: Array<{id: string, name: string}>
  availableAssignees: Array<{id: string, name: string}>
  datePresets: Array<{key: string, label: string, range: DateRange}>
}

interface QuoteFiltersState {
  filters: QuoteFilter
  isExpanded: boolean
  hasActiveFilters: boolean
}
```

## Hook Contracts

### useQuoteOperations Hook
```typescript
interface UseQuoteOperationsReturn {
  // Operations
  editQuote: (quoteId: string) => Promise<void>
  duplicateQuote: (quoteId: string) => Promise<Quote>
  convertQuote: (quoteId: string) => Promise<{quote: Quote, invoice: any}>
  archiveQuote: (quoteId: string) => Promise<Quote>
  updateQuoteStatus: (quoteId: string, status: QuoteStatus) => Promise<Quote>
  
  // State
  operationStates: Map<string, OperationState>
  isLoading: (quoteId: string) => boolean
  getError: (quoteId: string) => string | undefined
  
  // Control
  retryOperation: (quoteId: string, operation: string) => Promise<void>
  cancelOperation: (quoteId: string) => void
}

interface OperationState {
  type: QuoteOperationType
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string
  canRetry: boolean
}
```

### useBulkOperations Hook
```typescript
interface UseBulkOperationsReturn {
  // Operations
  bulkStatusUpdate: (quoteIds: string[], status: QuoteStatus) => Promise<string>
  bulkArchive: (quoteIds: string[]) => Promise<string>
  bulkExport: (quoteIds: string[], format: ExportFormat) => Promise<string>
  
  // Status tracking
  getOperationStatus: (operationId: string) => BulkOperation | undefined
  cancelOperation: (operationId: string) => Promise<void>
  
  // State
  activeOperations: BulkOperation[]
  isOperationActive: (operationId: string) => boolean
  getProgress: (operationId: string) => BulkOperationProgress | undefined
}
```

### useQuoteExport Hook
```typescript
interface UseQuoteExportReturn {
  // Export operations
  requestExport: (request: ExportQuotesRequest) => Promise<string>
  checkExportStatus: (exportId: string) => Promise<ExportRequest>
  downloadExport: (exportId: string) => Promise<void>
  
  // State management
  activeExports: ExportRequest[]
  isExporting: (exportId: string) => boolean
  getExportProgress: (exportId: string) => number | undefined
  
  // Utilities
  getSupportedFormats: () => ExportFormat[]
  getMaxQuoteLimit: () => number
  validateExportRequest: (request: ExportQuotesRequest) => ValidationResult
}
```

## Service Layer Contracts

### QuoteService Interface
```typescript
interface QuoteService {
  // CRUD operations
  getQuotes(request: GetQuotesRequest): Promise<GetQuotesResponse>
  getQuote(id: string): Promise<GetQuoteResponse>
  createQuote(request: CreateQuoteRequest): Promise<CreateQuoteResponse>
  updateQuote(id: string, request: UpdateQuoteRequest): Promise<UpdateQuoteResponse>
  
  // Quote actions
  duplicateQuote(id: string, request: DuplicateQuoteRequest): Promise<DuplicateQuoteResponse>
  convertQuote(id: string, request: ConvertQuoteRequest): Promise<ConvertQuoteResponse>
  archiveQuote(id: string, request: ArchiveQuoteRequest): Promise<ArchiveQuoteResponse>
  
  // Search and filter
  searchQuotes(request: SearchQuotesRequest): Promise<SearchQuotesResponse>
  getFilterOptions(): Promise<GetFilterOptionsResponse>
}
```

### BulkOperationService Interface
```typescript
interface BulkOperationService {
  bulkStatusUpdate(request: BulkStatusUpdateRequest): Promise<BulkStatusUpdateResponse>
  bulkArchive(request: BulkArchiveRequest): Promise<BulkArchiveResponse>
  getBulkOperationStatus(operationId: string): Promise<GetBulkOperationResponse>
  cancelBulkOperation(operationId: string): Promise<CancelBulkOperationResponse>
}
```

### ExportService Interface
```typescript
interface ExportService {
  requestExport(request: ExportQuotesRequest): Promise<ExportQuotesResponse>
  getExportStatus(exportId: string): Promise<GetExportStatusResponse>
  downloadExport(exportId: string): Promise<Blob>
  getSupportedFormats(): ExportFormat[]
  getExportLimits(): {maxQuotes: number, maxConcurrent: number}
}
```

## Event System Contracts

### Quote Events
```typescript
type QuoteEvent = 
  | { type: 'quote:created', payload: Quote }
  | { type: 'quote:updated', payload: Quote }
  | { type: 'quote:status_changed', payload: {quote: Quote, oldStatus: QuoteStatus, newStatus: QuoteStatus} }
  | { type: 'quote:duplicated', payload: {original: Quote, duplicate: Quote} }
  | { type: 'quote:converted', payload: {quote: Quote, invoice: any} }
  | { type: 'quote:archived', payload: Quote }
  | { type: 'quote:operation_failed', payload: {quoteId: string, operation: string, error: string} }
```

### Bulk Operation Events
```typescript
type BulkOperationEvent = 
  | { type: 'bulk:operation_started', payload: BulkOperation }
  | { type: 'bulk:operation_progress', payload: {operationId: string, progress: BulkOperationProgress} }
  | { type: 'bulk:operation_completed', payload: BulkOperation }
  | { type: 'bulk:operation_cancelled', payload: {operationId: string, completedCount: number} }
  | { type: 'bulk:operation_failed', payload: {operationId: string, error: string} }
```

### Export Events
```typescript
type ExportEvent = 
  | { type: 'export:requested', payload: ExportRequest }
  | { type: 'export:generating', payload: {exportId: string, progress: number} }
  | { type: 'export:completed', payload: ExportRequest }
  | { type: 'export:failed', payload: {exportId: string, error: string} }
  | { type: 'export:downloaded', payload: {exportId: string, filename: string} }
```

## Validation Contracts

### Quote Validation Rules
```typescript
interface QuoteValidationRules {
  customer: {
    required: boolean
    validateExists: boolean
  }
  items: {
    minItems: number
    maxItems: number
    requirePositiveQuantity: boolean
    requirePositivePrice: boolean
  }
  amounts: {
    maxTotalAmount: number
    requireNonZeroTotal: boolean
  }
  dates: {
    requireFutureExpiration: boolean
    maxExpirationDays: number
  }
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  field: string
  code: string
  message: string
  value?: any
}
```