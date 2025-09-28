import { z } from 'zod';

/**
 * Quote Status Schema
 * Represents the lifecycle state of a quote
 */
export const QuoteStatusSchema = z.enum([
  'draft',
  'pending', 
  'approved',
  'rejected',
  'expired',
  'converted',
  'archived'
]);

/**
 * Quote Item Schema
 * Individual line items within a quote
 */
export const QuoteItemSchema = z.object({
  id: z.string().min(1, 'Quote item ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  description: z.string(),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  discount: z.number().nonnegative('Discount must be non-negative').optional(),
  totalPrice: z.number().nonnegative('Total price must be non-negative')
});

/**
 * Quote Metadata Schema
 * Tracking information for quote history and source
 */
export const QuoteMetadataSchema = z.object({
  version: z.number().int().positive('Version must be a positive integer'),
  source: z.enum(['manual', 'imported', 'duplicated']),
  originalQuoteId: z.string().optional()
});

/**
 * Main Quote Schema
 * Complete quote entity with validation rules
 */
export const QuoteSchema = z.object({
  id: z.string().min(1, 'Quote ID is required'),
  quoteNumber: z.string().min(1, 'Quote number is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  status: QuoteStatusSchema,
  items: z.array(QuoteItemSchema).min(1, 'Quote must have at least one item'),
  totalAmount: z.number().nonnegative('Total amount must be non-negative'),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date(),
  createdBy: z.string().min(1, 'Created by is required'),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  metadata: QuoteMetadataSchema
});

/**
 * Quote Creation Schema
 * Validation for new quote creation (excludes generated fields)
 */
export const QuoteCreateSchema = QuoteSchema.omit({
  id: true,
  quoteNumber: true,
  createdAt: true,
  updatedAt: true,
  metadata: true
}).extend({
  metadata: QuoteMetadataSchema.partial()
});

/**
 * Quote Update Schema  
 * Validation for quote updates (partial fields allowed)
 */
export const QuoteUpdateSchema = QuoteSchema.partial().extend({
  id: z.string().min(1, 'Quote ID is required for updates')
});

/**
 * Quote Filter Schema
 * Validation for quote list filtering
 */
export const QuoteFilterSchema = z.object({
  status: QuoteStatusSchema.optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
  assignedTo: z.string().optional(),
  searchText: z.string().optional()
}).refine(
  (data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo,
  {
    message: 'Date from must be less than or equal to date to',
    path: ['dateTo']
  }
).refine(
  (data) => !data.minAmount || !data.maxAmount || data.minAmount <= data.maxAmount,
  {
    message: 'Minimum amount must be less than or equal to maximum amount',
    path: ['maxAmount']
  }
);

/**
 * Bulk Operation Schema
 * Validation for bulk quote operations
 */
export const BulkQuoteOperationSchema = z.object({
  quoteIds: z.array(z.string().min(1)).min(1, 'At least one quote ID is required'),
  operation: z.enum(['archive', 'delete', 'updateStatus', 'export']),
  parameters: z.record(z.string(), z.unknown()).optional()
});

// Type exports for TypeScript integration
export type QuoteStatus = z.infer<typeof QuoteStatusSchema>;
export type QuoteItem = z.infer<typeof QuoteItemSchema>;
export type QuoteMetadata = z.infer<typeof QuoteMetadataSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteCreate = z.infer<typeof QuoteCreateSchema>;
export type QuoteUpdate = z.infer<typeof QuoteUpdateSchema>;
export type QuoteFilter = z.infer<typeof QuoteFilterSchema>;
export type BulkQuoteOperation = z.infer<typeof BulkQuoteOperationSchema>;

/**
 * Validation helper functions
 */
export const validateQuote = (data: unknown): Quote => {
  return QuoteSchema.parse(data);
};

export const validateQuoteCreate = (data: unknown): QuoteCreate => {
  return QuoteCreateSchema.parse(data);
};

export const validateQuoteUpdate = (data: unknown): QuoteUpdate => {
  return QuoteUpdateSchema.parse(data);
};

export const validateQuoteFilter = (data: unknown): QuoteFilter => {
  return QuoteFilterSchema.parse(data);
};

export const validateBulkOperation = (data: unknown): BulkQuoteOperation => {
  return BulkQuoteOperationSchema.parse(data);
};