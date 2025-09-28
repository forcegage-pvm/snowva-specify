import { QuoteStatus, QuoteStatusChange } from './QuoteStatus';

/**
 * Quote line item
 */
export interface QuoteLineItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
  discountAmount?: number;
  totalPrice?: number; // Alias for total - optional for backward compatibility
  taxable: boolean;
  notes?: string;
  category?: string;
  sortOrder?: number;
}

/**
 * Core Quote entity representing a price proposal to a customer
 */
export interface Quote {
  // Identity & Core Info
  id: string;                    // Unique identifier (e.g., "quote_2025_001")
  quoteNumber: string;           // Human-readable number (e.g., "Q-2025-001")
  customerId: string;            // Reference to customer entity
  customerName: string;          // Denormalized for display performance
  
  // Financial Data (precise decimal arithmetic)
  subtotal: number;              // Sum of line items before tax (stored as cents)
  taxRate: number;              // VAT/tax rate as decimal (e.g., 0.20 for 20%)
  taxAmount: number;            // Calculated tax amount (stored as cents)
  totalAmount: number;          // Final total including tax (stored as cents)
  currency: string;             // ISO currency code (e.g., "GBP", "USD")
  
  // Status & Workflow
  status: QuoteStatus;          // Current workflow state
  statusHistory: QuoteStatusChange[];  // Audit trail of status changes
  
  // Temporal Data
  createdAt: Date;              // When quote was created
  updatedAt: Date;              // Last modification timestamp
  expiryDate: Date;             // When quote expires
  validUntil: Date;             // Business validity period
  
  // Content & Structure
  lineItems: QuoteLineItem[];   // Products/services included
  terms: string;                // Terms and conditions text
  notes: string;                // Internal notes (not customer-facing)
  
  // Integration & Links
  linkedInvoiceId?: string;     // If converted to invoice
  originalQuoteId?: string;     // If duplicated from another quote
  
  // Metadata
  createdBy: string;            // User who created the quote
  lastModifiedBy: string;       // User who last modified
  version: number;              // Optimistic locking version
  isArchived: boolean;          // Soft delete flag
}

/**
 * Simplified quote data for list display
 */
export interface QuoteListItem {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  currency: string;
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
  expiryDate: Date;
  isArchived: boolean;
}

/**
 * Quote summary statistics
 */
export interface QuotesSummary {
  totalQuotes: number;
  totalAmount: number;
  averageAmount: number;
  statusCounts: Record<QuoteStatus, number>;
}

/**
 * Pagination information
 */
export interface QuotesPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Filter criteria for quotes
 */
export interface QuotesFilters {
  status?: QuoteStatus[];
  customerId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  includeArchived?: boolean;
}

/**
 * Sorting options for quotes
 */
export interface QuotesSorting {
  field: 'createdAt' | 'updatedAt' | 'totalAmount' | 'quoteNumber' | 'customerName' | 'status';
  order: 'asc' | 'desc';
}

// Related types are now defined in this file
