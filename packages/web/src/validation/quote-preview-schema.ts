/**
 * Quote Preview Validation Schemas
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD006: PDF generation error handling
 * Addresses TD008: Performance optimization needed for quote preview
 * Addresses TD004: Validation schemas missing for API requests
 */

import { z } from 'zod';
import {
    PdfErrorCode,
    PdfFormat,
    PdfOrientation,
    QuotePreviewSortField,
    QuoteStatus,
    SortDirection,
    WatermarkPosition
} from '../types/quote-preview';

// Core quote preview schema
export const QuotePreviewSchema = z.object({
  id: z.string().uuid('Invalid quote ID format'),
  number: z.string().min(1, 'Quote number is required').max(50, 'Quote number too long'),
  title: z.string().min(1, 'Quote title is required').max(200, 'Quote title too long'),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name too long'),
  customerEmail: z.string().email('Invalid email format').optional(),
  status: z.nativeEnum(QuoteStatus),
  totalAmount: z.number().min(0, 'Total amount must be non-negative'),
  currency: z.string().length(3, 'Currency code must be 3 characters').regex(/^[A-Z]{3}$/, 'Invalid currency code'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
  lineItemsCount: z.number().int().min(0, 'Line items count must be non-negative'),
  thumbnail: z.object({
    url: z.string().url('Invalid thumbnail URL'),
    width: z.number().int().min(1, 'Width must be positive'),
    height: z.number().int().min(1, 'Height must be positive'),
    generatedAt: z.coerce.date(),
    fileSize: z.number().int().min(0, 'File size must be non-negative')
  }).optional(),
  metadata: z.object({
    isOptimized: z.boolean().optional(),
    lastOptimizedAt: z.coerce.date().optional(),
    optimizationVersion: z.string().optional(),
    renderTime: z.number().min(0, 'Render time must be non-negative').optional(),
    thumbnailGenerationTime: z.number().min(0, 'Thumbnail generation time must be non-negative').optional(),
    lastViewedAt: z.coerce.date().optional(),
    viewCount: z.number().int().min(0, 'View count must be non-negative').optional()
  }).and(z.record(z.string(), z.unknown())).optional()
});

// PDF generation schemas
export const PdfWatermarkSchema = z.object({
  text: z.string().min(1, 'Watermark text is required').max(100, 'Watermark text too long'),
  opacity: z.number().min(0, 'Opacity must be at least 0').max(1, 'Opacity must be at most 1'),
  position: z.nativeEnum(WatermarkPosition),
  fontSize: z.number().int().min(8, 'Font size must be at least 8').max(72, 'Font size must be at most 72'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)')
});

export const PdfCustomizationSchema = z.object({
  headerColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid header color format').optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid accent color format').optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  footerText: z.string().max(200, 'Footer text too long').optional(),
  hideSystemBranding: z.boolean().optional()
});

export const PdfOptionsSchema = z.object({
  format: z.nativeEnum(PdfFormat),
  orientation: z.nativeEnum(PdfOrientation),
  includeLineItems: z.boolean(),
  includeTerms: z.boolean(),
  includeSignature: z.boolean(),
  watermark: PdfWatermarkSchema.optional(),
  customization: PdfCustomizationSchema.optional()
});

export const PdfGenerationRequestSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID format'),
  options: PdfOptionsSchema,
  userId: z.string().uuid('Invalid user ID format'),
  requestId: z.string().uuid('Invalid request ID format')
});

export const PdfGenerationErrorSchema = z.object({
  code: z.nativeEnum(PdfErrorCode),
  message: z.string().min(1, 'Error message is required'),
  details: z.record(z.string(), z.unknown()).optional(),
  retryable: z.boolean(),
  retryAfter: z.number().int().min(0, 'Retry after must be non-negative').optional()
});

export const PdfGenerationMetadataSchema = z.object({
  generationTime: z.number().min(0, 'Generation time must be non-negative'),
  templateVersion: z.string().min(1, 'Template version is required'),
  engineVersion: z.string().min(1, 'Engine version is required'),
  pageCount: z.number().int().min(1, 'Page count must be at least 1'),
  optimized: z.boolean(),
  compressionRatio: z.number().min(0, 'Compression ratio must be non-negative').max(1, 'Compression ratio must be at most 1').optional()
});

export const PdfGenerationResultSchema = z.object({
  success: z.boolean(),
  pdfUrl: z.string().url('Invalid PDF URL').optional(),
  fileName: z.string().max(255, 'File name too long').optional(),
  fileSize: z.number().int().min(0, 'File size must be non-negative').optional(),
  generatedAt: z.coerce.date().optional(),
  error: PdfGenerationErrorSchema.optional(),
  metadata: PdfGenerationMetadataSchema.optional()
}).refine(
  (data) => data.success ? (data.pdfUrl && data.fileName && data.fileSize !== undefined) : data.error,
  { message: 'Success results must include pdfUrl, fileName, and fileSize. Failed results must include error.' }
);

// Filter and sort schemas
export const QuotePreviewFilterSchema = z.object({
  status: z.array(z.nativeEnum(QuoteStatus)).optional(),
  customerName: z.string().max(100, 'Customer name filter too long').optional(),
  dateRange: z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
  }).refine(
    (data) => data.start <= data.end,
    { message: 'Start date must be before or equal to end date' }
  ).optional(),
  amountRange: z.object({
    min: z.number().min(0, 'Minimum amount must be non-negative'),
    max: z.number().min(0, 'Maximum amount must be non-negative')
  }).refine(
    (data) => data.min <= data.max,
    { message: 'Minimum amount must be less than or equal to maximum amount' }
  ).optional(),
  searchQuery: z.string().max(200, 'Search query too long').optional()
});

export const QuotePreviewSortSchema = z.object({
  field: z.nativeEnum(QuotePreviewSortField),
  direction: z.nativeEnum(SortDirection)
});

// Request schemas for API endpoints
export const GetQuotePreviewsRequestSchema = z.object({
  filter: QuotePreviewFilterSchema.optional(),
  sort: QuotePreviewSortSchema.optional(),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  offset: z.number().int().min(0, 'Offset must be non-negative').default(0)
});

export const OptimizeQuotePreviewRequestSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID format'),
  regenerateThumbnail: z.boolean().default(false),
  forceOptimization: z.boolean().default(false)
});

// Response schemas
export const QuotePreviewsResponseSchema = z.object({
  previews: z.array(QuotePreviewSchema),
  totalCount: z.number().int().min(0, 'Total count must be non-negative'),
  hasMore: z.boolean(),
  nextOffset: z.number().int().min(0, 'Next offset must be non-negative').optional()
});

// Type exports for use in components and services
export type QuotePreviewInput = z.infer<typeof QuotePreviewSchema>;
export type PdfGenerationRequestInput = z.infer<typeof PdfGenerationRequestSchema>;
export type PdfGenerationResultInput = z.infer<typeof PdfGenerationResultSchema>;
export type QuotePreviewFilterInput = z.infer<typeof QuotePreviewFilterSchema>;
export type QuotePreviewSortInput = z.infer<typeof QuotePreviewSortSchema>;
export type GetQuotePreviewsRequestInput = z.infer<typeof GetQuotePreviewsRequestSchema>;

// Validation helper functions
export const validateQuotePreview = (data: unknown) => {
  return QuotePreviewSchema.safeParse(data);
};

export const validatePdfGenerationRequest = (data: unknown) => {
  return PdfGenerationRequestSchema.safeParse(data);
};

export const validatePdfGenerationResult = (data: unknown) => {
  return PdfGenerationResultSchema.safeParse(data);
};

export const validateQuotePreviewFilter = (data: unknown) => {
  return QuotePreviewFilterSchema.safeParse(data);
};

export const validateGetQuotePreviewsRequest = (data: unknown) => {
  return GetQuotePreviewsRequestSchema.safeParse(data);
};

// Performance optimization helpers
export const isOptimizationNeeded = (preview: QuotePreviewInput): boolean => {
  if (!preview.metadata?.isOptimized) return true;
  if (!preview.metadata?.lastOptimizedAt) return true;
  
  // Check if optimization is older than 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return preview.metadata.lastOptimizedAt < oneDayAgo;
};

export const shouldRegenerateThumbnail = (preview: QuotePreviewInput): boolean => {
  if (!preview.thumbnail) return true;
  
  // Check if thumbnail is older than 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return preview.thumbnail.generatedAt < sevenDaysAgo;
};