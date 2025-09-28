/**
 * Quote Service Layer
 * Comprehensive service layer for quote management operations
 * 
 * Constitutional Compliance: LEVEL 4 - Business Logic Implementation
 * Evidence: service layer implementation with proper error handling
 * Test Coverage: Unit tests required for all public methods
 */

import { z } from 'zod';
import { QuoteItemSchema, QuoteSchema, QuoteStatusSchema, type Quote, type QuoteItem, type QuoteStatus } from '../validation/quote-schema';
import { appendDocumentEvent } from './AuditTrailService';

// API Response Types
export interface QuoteListResponse {
  quotes: Quote[];
  total: number;
  page: number;
  limit: number;
}

export interface QuoteFilters {
  status?: QuoteStatus[];
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  assignedTo?: string;
}

export interface CreateQuoteRequest {
  customerId: string;
  customerName: string;
  items: Omit<QuoteItem, 'id' | 'totalPrice'>[];
  notes?: string;
  assignedTo?: string;
  expiresAt?: Date;
}

export interface UpdateQuoteRequest {
  customerName?: string;
  status?: QuoteStatus;
  items?: Omit<QuoteItem, 'id' | 'totalPrice'>[];
  notes?: string;
  assignedTo?: string;
  expiresAt?: Date;
}

export interface BulkOperationRequest {
  quoteIds: string[];
  operation: 'archive' | 'delete' | 'change_status' | 'assign';
  operationData?: {
    status?: QuoteStatus;
    assignedTo?: string;
  };
}

export interface ExportRequest {
  quoteIds: string[];
  format: 'pdf' | 'excel';
  includeDetails?: boolean;
}

// Service Implementation
export class QuoteServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'QuoteServiceError';
  }
}

export const quoteService = {
  /**
   * Retrieve quotes with filtering and pagination
   */
  async getQuotes(
    filters: QuoteFilters = {},
    page: number = 1,
    limit: number = 25
  ): Promise<QuoteListResponse> {
    try {
      // Validate pagination parameters
      if (page < 1) throw new QuoteServiceError('Page must be >= 1', 'INVALID_PAGE');
      if (limit < 1 || limit > 100) throw new QuoteServiceError('Limit must be between 1 and 100', 'INVALID_LIMIT');

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filters to params
      if (filters.status?.length) {
        params.append('status', filters.status.join(','));
      }
      if (filters.customerId) {
        params.append('customerId', filters.customerId);
      }
      if (filters.searchTerm) {
        params.append('search', filters.searchTerm);
      }
      if (filters.assignedTo) {
        params.append('assignedTo', filters.assignedTo);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString());
      }

      const response = await fetch(`/api/quotes?${params.toString()}`);
      
      if (!response.ok) {
        throw new QuoteServiceError(
          `Failed to fetch quotes: ${response.statusText}`,
          'FETCH_ERROR',
          response.status
        );
      }

      const data = await response.json();
      
      // Validate response structure
      const responseSchema = z.object({
        quotes: z.array(QuoteSchema),
        total: z.number().nonnegative(),
        page: z.number().positive(),
        limit: z.number().positive(),
      });
      
      return responseSchema.parse(data);
    } catch (error) {
      if (error instanceof QuoteServiceError) throw error;
      throw new QuoteServiceError(
        `Unexpected error fetching quotes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        500
      );
    }
  },

  /**
   * Retrieve a single quote by ID
   */
  async getQuoteById(id: string): Promise<Quote> {
    try {
      if (!id) throw new QuoteServiceError('Quote ID is required', 'MISSING_ID');

      const response = await fetch(`/api/quotes/${id}`);
      
      if (response.status === 404) {
        throw new QuoteServiceError('Quote not found', 'QUOTE_NOT_FOUND', 404);
      }
      
      if (!response.ok) {
        throw new QuoteServiceError(
          `Failed to fetch quote: ${response.statusText}`,
          'FETCH_ERROR',
          response.status
        );
      }

      const data = await response.json();
      return QuoteSchema.parse(data);
    } catch (error) {
      if (error instanceof QuoteServiceError) throw error;
      throw new QuoteServiceError(
        `Unexpected error fetching quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        500
      );
    }
  },

  /**
   * Create a new quote
   */
  async createQuote(request: CreateQuoteRequest): Promise<Quote> {
    try {
      // Validate request
      const createSchema = z.object({
        customerId: z.string().min(1),
        customerName: z.string().min(1),
        items: z.array(QuoteItemSchema.omit({ id: true, totalPrice: true })).min(1),
        notes: z.string().optional(),
        assignedTo: z.string().optional(),
        expiresAt: z.date().optional(),
      });
      
      const validatedRequest = createSchema.parse(request);

      // Calculate totals for items
      const itemsWithTotals = validatedRequest.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        totalPrice: item.quantity * item.unitPrice * (1 - (item.discount || 0))
      }));

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...validatedRequest,
          items: itemsWithTotals,
        }),
      });

      if (!response.ok) {
        throw new QuoteServiceError(
          `Failed to create quote: ${response.statusText}`,
          'CREATE_ERROR',
          response.status
        );
      }

      const data = await response.json();
      const quote = QuoteSchema.parse(data);

      // Log audit trail
      await appendDocumentEvent({
        exportId: quote.id,
        action: 'queued', // closest available action for creation
        timestamp: new Date().toISOString(),
        context: {
          quoteNumber: quote.quoteNumber,
          customerName: quote.customerName,
          totalAmount: quote.totalAmount,
          action: 'create',
        },
      });

      return quote;
    } catch (error) {
      if (error instanceof QuoteServiceError) throw error;
      throw new QuoteServiceError(
        `Unexpected error creating quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        500
      );
    }
  },

  /**
   * Update an existing quote
   */
  async updateQuote(id: string, request: UpdateQuoteRequest): Promise<Quote> {
    try {
      if (!id) throw new QuoteServiceError('Quote ID is required', 'MISSING_ID');

      // Validate request
      const updateSchema = z.object({
        customerName: z.string().min(1).optional(),
        status: QuoteStatusSchema.optional(),
        items: z.array(QuoteItemSchema.omit({ id: true, totalPrice: true })).optional(),
        notes: z.string().optional(),
        assignedTo: z.string().optional(),
        expiresAt: z.date().optional(),
      });
      
      const validatedRequest = updateSchema.parse(request);

      // Calculate totals for items if provided
      const requestData = { ...validatedRequest };
      if (validatedRequest.items) {
        requestData.items = validatedRequest.items.map(item => ({
          ...item,
          id: crypto.randomUUID(),
          totalPrice: item.quantity * item.unitPrice * (1 - (item.discount || 0))
        }));
      }

      const response = await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.status === 404) {
        throw new QuoteServiceError('Quote not found', 'QUOTE_NOT_FOUND', 404);
      }

      if (!response.ok) {
        throw new QuoteServiceError(
          `Failed to update quote: ${response.statusText}`,
          'UPDATE_ERROR',
          response.status
        );
      }

      const data = await response.json();
      const quote = QuoteSchema.parse(data);

      // Log audit trail
      await appendDocumentEvent({
        exportId: quote.id,
        action: 'downloaded', // closest available action
        timestamp: new Date().toISOString(),
        context: {
          quoteNumber: quote.quoteNumber,
          updates: Object.keys(validatedRequest),
          action: 'update',
        },
      });

      return quote;
    } catch (error) {
      if (error instanceof QuoteServiceError) throw error;
      throw new QuoteServiceError(
        `Unexpected error updating quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        500
      );
    }
  },

  /**
   * Duplicate an existing quote
   */
  async duplicateQuote(id: string): Promise<Quote> {
    try {
      if (!id) throw new QuoteServiceError('Quote ID is required', 'MISSING_ID');

      const response = await fetch(`/api/quotes/${id}/duplicate`, {
        method: 'POST',
      });

      if (response.status === 404) {
        throw new QuoteServiceError('Quote not found', 'QUOTE_NOT_FOUND', 404);
      }

      if (!response.ok) {
        throw new QuoteServiceError(
          `Failed to duplicate quote: ${response.statusText}`,
          'DUPLICATE_ERROR',
          response.status
        );
      }

      const data = await response.json();
      const quote = QuoteSchema.parse(data);

      // Log audit trail
      await appendDocumentEvent({
        exportId: quote.id,
        action: 'regenerated', // closest available action for duplication
        timestamp: new Date().toISOString(),
        context: {
          originalQuoteId: id,
          quoteNumber: quote.quoteNumber,
          action: 'duplicate',
        },
      });

      return quote;
    } catch (error) {
      if (error instanceof QuoteServiceError) throw error;
      throw new QuoteServiceError(
        `Unexpected error duplicating quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        500
      );
    }
  },

  /**
   * Convert quote to another entity (e.g., invoice)
   */
  async convertQuote(id: string, targetType: 'invoice'): Promise<{ id: string; type: string }> {
    try {
      if (!id) throw new QuoteServiceError('Quote ID is required', 'MISSING_ID');
      if (!targetType) throw new QuoteServiceError('Target type is required', 'MISSING_TARGET_TYPE');

      const response = await fetch(`/api/quotes/${id}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetType }),
      });

      if (response.status === 404) {
        throw new QuoteServiceError('Quote not found', 'QUOTE_NOT_FOUND', 404);
      }

      if (!response.ok) {
        throw new QuoteServiceError(
          `Failed to convert quote: ${response.statusText}`,
          'CONVERT_ERROR',
          response.status
        );
      }

      const data = await response.json();
      
      // Log audit trail
      await appendDocumentEvent({
        exportId: id,
        action: 'sent', // closest available action for conversion
        timestamp: new Date().toISOString(),
        context: {
          targetType,
          targetId: data.id,
          action: 'convert',
        },
      });

      return data;
    } catch (error) {
      if (error instanceof QuoteServiceError) throw error;
      throw new QuoteServiceError(
        `Unexpected error converting quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        500
      );
    }
  },

  /**
   * Perform bulk operations on multiple quotes
   */
  async bulkOperations(request: BulkOperationRequest): Promise<{ success: string[]; failed: string[] }> {
    try {
      // Validate request
      const bulkSchema = z.object({
        quoteIds: z.array(z.string().min(1)).min(1),
        operation: z.enum(['archive', 'delete', 'change_status', 'assign']),
        operationData: z.object({
          status: QuoteStatusSchema.optional(),
          assignedTo: z.string().optional(),
        }).optional(),
      });
      
      const validatedRequest = bulkSchema.parse(request);

      const response = await fetch('/api/quotes/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedRequest),
      });

      if (!response.ok) {
        throw new QuoteServiceError(
          `Failed to perform bulk operation: ${response.statusText}`,
          'BULK_ERROR',
          response.status
        );
      }

      const data = await response.json();

      // Log audit trail for successful operations
      if (data.success?.length > 0) {
        await appendDocumentEvent({
          exportId: 'bulk-operation',
          action: 'queued', // closest available action for bulk operations
          timestamp: new Date().toISOString(),
          context: {
            operation: validatedRequest.operation,
            successCount: data.success.length,
            failedCount: data.failed.length,
            quoteIds: data.success,
            action: `bulk_${validatedRequest.operation}`,
          },
        });
      }

      return data;
    } catch (error) {
      if (error instanceof QuoteServiceError) throw error;
      throw new QuoteServiceError(
        `Unexpected error performing bulk operation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        500
      );
    }
  },

  /**
   * Export quotes in specified format
   */
  async exportQuotes(request: ExportRequest): Promise<{ downloadUrl: string; filename: string }> {
    try {
      // Validate request
      const exportSchema = z.object({
        quoteIds: z.array(z.string().min(1)).min(1),
        format: z.enum(['pdf', 'excel']),
        includeDetails: z.boolean().optional(),
      });
      
      const validatedRequest = exportSchema.parse(request);

      const response = await fetch('/api/quotes/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedRequest),
      });

      if (!response.ok) {
        throw new QuoteServiceError(
          `Failed to export quotes: ${response.statusText}`,
          'EXPORT_ERROR',
          response.status
        );
      }

      const data = await response.json();

      // Log audit trail
      await appendDocumentEvent({
        exportId: 'quote-export',
        action: 'downloaded', // appropriate action for export
        timestamp: new Date().toISOString(),
        context: {
          format: validatedRequest.format,
          quoteCount: validatedRequest.quoteIds.length,
          filename: data.filename,
          action: 'export',
        },
      });

      return data;
    } catch (error) {
      if (error instanceof QuoteServiceError) throw error;
      throw new QuoteServiceError(
        `Unexpected error exporting quotes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        500
      );
    }
  },

  /**
   * Delete a quote (soft delete to archived status)
   */
  async archiveQuote(id: string): Promise<void> {
    try {
      if (!id) throw new QuoteServiceError('Quote ID is required', 'MISSING_ID');

      await this.updateQuote(id, { status: 'archived' });
    } catch (error) {
      if (error instanceof QuoteServiceError) throw error;
      throw new QuoteServiceError(
        `Unexpected error archiving quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        500
      );
    }
  },
};

export default quoteService;
