/**
 * Quote Preview and PDF Types
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD006: PDF generation error handling
 * Addresses TD008: Performance optimization needed for quote preview
 */

export interface QuotePreview {
  id: string;
  number: string;
  title: string;
  customerName: string;
  customerEmail?: string;
  status: QuoteStatus;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  lineItemsCount: number;
  thumbnail?: QuoteThumbnail;
  metadata?: QuotePreviewMetadata;
}

export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted'
}

export interface QuoteThumbnail {
  url: string;
  width: number;
  height: number;
  generatedAt: Date;
  fileSize: number;
}

export interface QuotePreviewMetadata {
  [key: string]: unknown;
  // Preview optimization flags
  isOptimized?: boolean;
  lastOptimizedAt?: Date;
  optimizationVersion?: string;
  // Performance metrics
  renderTime?: number;
  thumbnailGenerationTime?: number;
  // User interaction
  lastViewedAt?: Date;
  viewCount?: number;
}

export interface PdfGenerationRequest {
  quoteId: string;
  options: PdfOptions;
  userId: string;
  requestId: string;
}

export interface PdfOptions {
  format: PdfFormat;
  orientation: PdfOrientation;
  includeLineItems: boolean;
  includeTerms: boolean;
  includeSignature: boolean;
  watermark?: PdfWatermark;
  customization?: PdfCustomization;
}

export enum PdfFormat {
  A4 = 'A4',
  LETTER = 'Letter',
  LEGAL = 'Legal'
}

export enum PdfOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

export interface PdfWatermark {
  text: string;
  opacity: number;
  position: WatermarkPosition;
  fontSize: number;
  color: string;
}

export enum WatermarkPosition {
  CENTER = 'center',
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right'
}

export interface PdfCustomization {
  headerColor?: string;
  accentColor?: string;
  logoUrl?: string;
  footerText?: string;
  hideSystemBranding?: boolean;
}

export interface PdfGenerationResult {
  success: boolean;
  pdfUrl?: string;
  fileName?: string;
  fileSize?: number;
  generatedAt?: Date;
  error?: PdfGenerationError;
  metadata?: PdfGenerationMetadata;
}

export interface PdfGenerationError {
  code: PdfErrorCode;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  retryAfter?: number;
}

export enum PdfErrorCode {
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  QUOTE_NOT_FOUND = 'QUOTE_NOT_FOUND',
  GENERATION_FAILED = 'GENERATION_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  TIMEOUT = 'TIMEOUT',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',
  INVALID_OPTIONS = 'INVALID_OPTIONS',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export interface PdfGenerationMetadata {
  generationTime: number;
  templateVersion: string;
  engineVersion: string;
  pageCount: number;
  optimized: boolean;
  compressionRatio?: number;
}

export interface QuotePreviewFilter {
  status?: QuoteStatus[];
  customerName?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
}

export interface QuotePreviewSort {
  field: QuotePreviewSortField;
  direction: SortDirection;
}

export enum QuotePreviewSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TOTAL_AMOUNT = 'totalAmount',
  CUSTOMER_NAME = 'customerName',
  STATUS = 'status',
  EXPIRES_AT = 'expiresAt'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}