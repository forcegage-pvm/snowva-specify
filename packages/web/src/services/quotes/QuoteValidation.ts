import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { z } from 'zod';

/**
 * Line item validation schema
 */
export const QuoteLineItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1, 'Description is required'),
  productId: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  totalPrice: z.number().min(0),
  notes: z.string().optional(),
  taxable: z.boolean().default(true),
  sortOrder: z.number().default(0)
});

/**
 * Quote status change validation schema
 */
export const QuoteStatusChangeSchema = z.object({
  id: z.string().min(1),
  quoteId: z.string().min(1),
  fromStatus: z.nativeEnum(QuoteStatus),
  toStatus: z.nativeEnum(QuoteStatus),
  changedBy: z.string().min(1),
  changedAt: z.date(),
  reason: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

/**
 * Quote validation schema
 */
export const QuoteSchema = z.object({
  id: z.string().min(1),
  quoteNumber: z.string().min(1),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  
  // Financial data validation with precision requirements
  subtotal: z.number().min(0),
  taxRate: z.number().min(0).max(1),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  currency: z.string().length(3, 'Currency must be 3-letter ISO code'),
  
  status: z.nativeEnum(QuoteStatus),
  statusHistory: z.array(QuoteStatusChangeSchema).default([]),
  
  createdAt: z.date(),
  updatedAt: z.date(),
  expiryDate: z.date(),
  validUntil: z.date(),
  
  lineItems: z.array(QuoteLineItemSchema).min(1, 'At least one line item is required'),
  terms: z.string().default(''),
  notes: z.string().default(''),
  
  linkedInvoiceId: z.string().optional(),
  originalQuoteId: z.string().optional(),
  
  createdBy: z.string().min(1),
  lastModifiedBy: z.string().min(1),
  version: z.number().min(1).default(1),
  isArchived: z.boolean().default(false)
}).refine((data) => {
  // Validate financial calculations
  const calculatedSubtotal = data.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const calculatedTax = calculatedSubtotal * data.taxRate;
  const calculatedTotal = calculatedSubtotal + calculatedTax;
  
  return Math.abs(data.subtotal - calculatedSubtotal) < 0.01 &&
         Math.abs(data.taxAmount - calculatedTax) < 0.01 &&
         Math.abs(data.totalAmount - calculatedTotal) < 0.01;
}, {
  message: 'Financial calculations do not match line items',
  path: ['totalAmount']
}).refine((data) => {
  // Validate expiry date is in the future
  return data.expiryDate > new Date();
}, {
  message: 'Expiry date must be in the future',
  path: ['expiryDate']
});

/**
 * Quote list item schema for API responses
 */
export const QuoteListItemSchema = z.object({
  id: z.string(),
  quoteNumber: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  status: z.nativeEnum(QuoteStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiryDate: z.date(),
  isArchived: z.boolean()
});

/**
 * Create quote request schema
 */
export const CreateQuoteRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    productId: z.string().optional(),
    category: z.string().optional(),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
    discount: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
    taxable: z.boolean().default(true)
  })).min(1, 'At least one line item is required'),
  taxRate: z.number().min(0).max(1).default(0.20),
  currency: z.string().length(3).default('GBP'),
  expiryDate: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  terms: z.string().default(''),
  notes: z.string().default('')
});

/**
 * Update quote request schema
 */
export const UpdateQuoteRequestSchema = CreateQuoteRequestSchema.partial().extend({
  version: z.number().min(1) // Required for optimistic locking
});

/**
 * Status update request schema
 */
export const StatusUpdateRequestSchema = z.object({
  status: z.nativeEnum(QuoteStatus),
  reason: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

/**
 * Quotes filter schema for API queries
 */
export const QuotesFilterSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(25),
  sort: z.enum(['createdAt', 'updatedAt', 'totalAmount', 'quoteNumber', 'customerName', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.array(z.nativeEnum(QuoteStatus)).optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional().refine((val) => {
    if (!val) return true;
    try {
      const date = new Date(val);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, "Invalid date format"),
  dateTo: z.string().optional().refine((val) => {
    if (!val) return true;
    try {
      const date = new Date(val);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, "Invalid date format"),
  includeArchived: z.boolean().default(false)
});

/**
 * Bulk action request schema
 */
export const BulkActionRequestSchema = z.object({
  action: z.enum(['updateStatus', 'archive', 'delete']),
  quoteIds: z.array(z.string()).min(1, 'At least one quote ID is required'),
  data: z.record(z.string(), z.any()).optional()
});

/**
 * Export request schema
 */
export const ExportRequestSchema = z.object({
  format: z.enum(['pdf', 'excel']),
  quoteIds: z.array(z.string()).optional(),
  filters: QuotesFilterSchema.omit({ page: true, pageSize: true }).optional()
});

/**
 * Validation utility functions
 */
export class QuoteValidation {
  /**
   * Validate quote creation request
   */
  static validateCreateRequest(data: unknown) {
    return CreateQuoteRequestSchema.safeParse(data);
  }

  /**
   * Validate quote update request
   */
  static validateUpdateRequest(data: unknown) {
    return UpdateQuoteRequestSchema.safeParse(data);
  }

  /**
   * Validate status update request
   */
  static validateStatusUpdate(data: unknown) {
    return StatusUpdateRequestSchema.safeParse(data);
  }

  /**
   * Validate filters and pagination
   */
  static validateFilters(data: unknown) {
    return QuotesFilterSchema.safeParse(data);
  }

  /**
   * Validate bulk action request
   */
  static validateBulkAction(data: unknown) {
    return BulkActionRequestSchema.safeParse(data);
  }

  /**
   * Validate export request
   */
  static validateExport(data: unknown) {
    return ExportRequestSchema.safeParse(data);
  }

  /**
   * Parse and validate quote from external source
   */
  static parseQuote(data: unknown) {
    return QuoteSchema.safeParse(data);
  }
}

// Re-export types derived from schemas
export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteLineItem = z.infer<typeof QuoteLineItemSchema>;
export type QuoteStatusChange = z.infer<typeof QuoteStatusChangeSchema>;
export type QuoteListItem = z.infer<typeof QuoteListItemSchema>;
export type CreateQuoteRequest = z.infer<typeof CreateQuoteRequestSchema>;
export type UpdateQuoteRequest = z.infer<typeof UpdateQuoteRequestSchema>;
export type StatusUpdateRequest = z.infer<typeof StatusUpdateRequestSchema>;
export type QuotesFilter = z.infer<typeof QuotesFilterSchema>;
export type BulkActionRequest = z.infer<typeof BulkActionRequestSchema>;
export type ExportRequest = z.infer<typeof ExportRequestSchema>;