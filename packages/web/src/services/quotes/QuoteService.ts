import { MockQuoteService } from '@/data/quotes';
import {
    QuoteValidation,
    type BulkActionRequest,
    type CreateQuoteRequest,
    type ExportRequest,
    type QuotesFilter,
    type StatusUpdateRequest,
    type UpdateQuoteRequest
} from '@/services/quotes/QuoteValidation';
import type { Quote, QuoteLineItem } from '@/types/quotes/Quote';
import type { QuoteStatus, QuoteStatusChange } from '@/types/quotes/QuoteStatus';

/**
 * Quote service interface for dependency injection and testing
 */
export interface IQuoteService {
  // Read operations
  getQuotes(filters?: QuotesFilter): Promise<{
    quotes: Quote[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
  
  getQuoteById(id: string): Promise<Quote | null>;
  
  // Write operations
  createQuote(request: CreateQuoteRequest): Promise<Quote>;
  updateQuote(id: string, request: UpdateQuoteRequest): Promise<Quote>;
  deleteQuote(id: string): Promise<void>;
  
  // Status management
  updateQuoteStatus(id: string, request: StatusUpdateRequest): Promise<Quote>;
  getStatusHistory(id: string): Promise<QuoteStatusChange[]>;
  
  // Bulk operations
  bulkAction(request: BulkActionRequest): Promise<void>;
  
  // Export operations
  exportQuotes(request: ExportRequest): Promise<Blob>;
  
  // Validation
  validateQuote(quote: Partial<Quote>): Promise<{ valid: boolean; errors: string[] }>;
}

/**
 * Production quote service implementation
 * Handles all quote-related business operations with proper error handling,
 * validation, and business rule enforcement
 */
export class QuoteService implements IQuoteService {
  private mockService: MockQuoteService;
  
  constructor() {
    // In production, this would be replaced with actual API service
    this.mockService = new MockQuoteService();
  }
  
  /**
   * Get quotes with filtering, pagination, and sorting
   */
  async getQuotes(filters: Partial<QuotesFilter> = {}) {
    try {
      // Validate filters
      const validation = QuoteValidation.validateFilters(filters);
      if (!validation.success) {
        throw new Error(`Invalid filters: ${validation.error.message}`);
      }
      
      const validFilters = validation.data;
      return await this.mockService.getQuotes(validFilters);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw new QuoteServiceError('Failed to fetch quotes', error);
    }
  }
  
  /**
   * Get single quote by ID
   */
  async getQuoteById(id: string): Promise<Quote | null> {
    try {
      if (!id) {
        throw new Error('Quote ID is required');
      }
      
      return await this.mockService.getQuoteById(id);
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw new QuoteServiceError('Failed to fetch quote', error);
    }
  }
  
  /**
   * Create new quote with validation and business rules
   */
  async createQuote(request: CreateQuoteRequest): Promise<Quote> {
    try {
      // Validate request
      const validation = QuoteValidation.validateCreateRequest(request);
      if (!validation.success) {
        throw new Error(`Invalid create request: ${validation.error.message}`);
      }
      
      const validRequest = validation.data;
      
      // Calculate totals
      const lineItems: QuoteLineItem[] = validRequest.lineItems.map((item, index) => {
        const totalPrice = (item.unitPrice * item.quantity) - ((item.unitPrice * item.quantity * (item.discount || 0)) / 100);
        return {
          id: `item-${Date.now()}-${index}`,
          description: item.description,
          productId: item.productId,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          total: totalPrice, // Required by QuoteLineItem interface
          discountAmount: ((item.unitPrice * item.quantity * (item.discount || 0)) / 100),
          totalPrice: totalPrice, // Alias for total
          notes: item.notes,
          taxable: item.taxable,
          sortOrder: index + 1
        };
      });
      
      const subtotal = lineItems.reduce((sum, item) => sum + (item.totalPrice || item.total), 0);
      const taxAmount = subtotal * validRequest.taxRate;
      const totalAmount = subtotal + taxAmount;
      
      // Create expiry dates if not provided
      const now = new Date();
      const expiryDate = validRequest.expiryDate 
        ? new Date(validRequest.expiryDate)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const validUntil = validRequest.validUntil
        ? new Date(validRequest.validUntil)
        : expiryDate;
      
      const quoteData = {
        customerId: validRequest.customerId,
        customerName: validRequest.customerName,
        lineItems,
        subtotal: Math.round(subtotal * 100) / 100,
        taxRate: validRequest.taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        currency: validRequest.currency,
        expiryDate,
        validUntil,
        terms: validRequest.terms,
        notes: validRequest.notes,
        createdBy: 'current-user' // Would come from auth context
      };
      
      return await this.mockService.createQuote(quoteData);
    } catch (error) {
      console.error('Error creating quote:', error);
      throw new QuoteServiceError('Failed to create quote', error);
    }
  }
  
  /**
   * Update existing quote with validation and optimistic locking
   */
  async updateQuote(id: string, request: UpdateQuoteRequest): Promise<Quote> {
    try {
      if (!id) {
        throw new Error('Quote ID is required');
      }
      
      // Validate request
      const validation = QuoteValidation.validateUpdateRequest(request);
      if (!validation.success) {
        throw new Error(`Invalid update request: ${validation.error.message}`);
      }
      
      const validRequest = validation.data;
      
      // Get current quote for version check
      const currentQuote = await this.mockService.getQuoteById(id);
      if (!currentQuote) {
        throw new Error('Quote not found');
      }
      
      // Check version for optimistic locking
      if (validRequest.version && validRequest.version !== currentQuote.version) {
        throw new Error('Quote has been modified by another user. Please refresh and try again.');
      }
      
      // Recalculate totals if line items changed
      const { expiryDate, validUntil, lineItems: rawLineItems, ...restValidRequest } = validRequest;
      let updates: Partial<Quote> = { 
        ...restValidRequest,
        // Convert string dates to Date objects
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined
      };
      
      if (rawLineItems) {
        const lineItems: QuoteLineItem[] = rawLineItems.map((item, index) => {
          const totalPrice = (item.unitPrice * item.quantity) - (item.discount ? ((item.unitPrice * item.quantity * item.discount) / 100) : 0);
          return {
            ...item,
            id: `item-${Date.now()}-${index}`, // Generate id for new items
            total: totalPrice, // Required by QuoteLineItem interface
            discountAmount: item.discount ? ((item.unitPrice * item.quantity * item.discount) / 100) : 0,
            totalPrice: totalPrice, // Alias for total
            sortOrder: index + 1
          };
        });
        
        const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = subtotal * (validRequest.taxRate || currentQuote.taxRate);
        const totalAmount = subtotal + taxAmount;
        
        updates = {
          ...updates,
          lineItems,
          subtotal: Math.round(subtotal * 100) / 100,
          taxAmount: Math.round(taxAmount * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100
        };
      }
      
      const updatedQuote = await this.mockService.updateQuote(id, updates);
      if (!updatedQuote) {
        throw new Error('Quote not found');
      }
      
      return updatedQuote;
    } catch (error) {
      console.error('Error updating quote:', error);
      throw new QuoteServiceError('Failed to update quote', error);
    }
  }
  
  /**
   * Delete quote (soft delete - archive)
   */
  async deleteQuote(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Quote ID is required');
      }
      
      const quote = await this.mockService.getQuoteById(id);
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      // Soft delete by archiving
      await this.mockService.updateQuote(id, { 
        isArchived: true,
        lastModifiedBy: 'current-user'
      });
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw new QuoteServiceError('Failed to delete quote', error);
    }
  }
  
  /**
   * Update quote status with business rule validation
   */
  async updateQuoteStatus(id: string, request: StatusUpdateRequest): Promise<Quote> {
    try {
      if (!id) {
        throw new Error('Quote ID is required');
      }
      
      // Validate request
      const validation = QuoteValidation.validateStatusUpdate(request);
      if (!validation.success) {
        throw new Error(`Invalid status update: ${validation.error.message}`);
      }
      
      const validRequest = validation.data;
      
      const updatedQuote = await this.mockService.updateQuoteStatus(
        id, 
        validRequest.status,
        validRequest.reason,
        'current-user' // Would come from auth context
      );
      
      if (!updatedQuote) {
        throw new Error('Quote not found');
      }
      
      return updatedQuote;
    } catch (error) {
      console.error('Error updating quote status:', error);
      throw new QuoteServiceError('Failed to update quote status', error);
    }
  }
  
  /**
   * Get status change history for a quote
   */
  async getStatusHistory(id: string): Promise<QuoteStatusChange[]> {
    try {
      if (!id) {
        throw new Error('Quote ID is required');
      }
      
      const quote = await this.mockService.getQuoteById(id);
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      return quote.statusHistory;
    } catch (error) {
      console.error('Error fetching status history:', error);
      throw new QuoteServiceError('Failed to fetch status history', error);
    }
  }
  
  /**
   * Perform bulk actions on multiple quotes
   */
  async bulkAction(request: BulkActionRequest): Promise<void> {
    try {
      // Validate request
      const validation = QuoteValidation.validateBulkAction(request);
      if (!validation.success) {
        throw new Error(`Invalid bulk action: ${validation.error.message}`);
      }
      
      const validRequest = validation.data;
      
      // Process each quote
      const results = await Promise.allSettled(
        validRequest.quoteIds.map(async (quoteId) => {
          switch (validRequest.action) {
            case 'updateStatus':
              if (!validRequest.data?.status) {
                throw new Error('Status is required for status update action');
              }
              return await this.updateQuoteStatus(quoteId, {
                status: validRequest.data.status as QuoteStatus,
                reason: validRequest.data.reason as string
              });
              
            case 'archive':
              return await this.mockService.updateQuote(quoteId, { isArchived: true });
              
            case 'delete':
              return await this.deleteQuote(quoteId);
              
            default:
              throw new Error(`Unknown bulk action: ${validRequest.action}`);
          }
        })
      );
      
      // Check for failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`${failures.length} quotes failed bulk action:`, failures);
        throw new Error(`Failed to process ${failures.length} out of ${validRequest.quoteIds.length} quotes`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw new QuoteServiceError('Failed to perform bulk action', error);
    }
  }
  
  /**
   * Export quotes to PDF or Excel
   */
  async exportQuotes(request: ExportRequest): Promise<Blob> {
    try {
      // Validate request
      const validation = QuoteValidation.validateExport(request);
      if (!validation.success) {
        throw new Error(`Invalid export request: ${validation.error.message}`);
      }
      
      // This would integrate with actual export service
      // For now, return a mock blob
      const mockData = JSON.stringify({ 
        message: 'Export functionality not yet implemented',
        request: validation.data 
      });
      
      return new Blob([mockData], { 
        type: request.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (error) {
      console.error('Error exporting quotes:', error);
      throw new QuoteServiceError('Failed to export quotes', error);
    }
  }
  
  /**
   * Validate quote data against business rules
   */
  async validateQuote(quote: Partial<Quote>): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const validation = QuoteValidation.parseQuote(quote);
      
      if (validation.success) {
        return { valid: true, errors: [] };
      } else {
        const errors = validation.error.issues.map((err) => 
          `${err.path.join('.')}: ${err.message}`
        );
        return { valid: false, errors };
      }
    } catch (error) {
      console.error('Error validating quote:', error);
      return { valid: false, errors: ['Validation failed due to internal error'] };
    }
  }
}

/**
 * Custom error class for quote service operations
 */
export class QuoteServiceError extends Error {
  constructor(message: string, public cause?: Error | unknown) {
    super(message);
    this.name = 'QuoteServiceError';
  }
}

/**
 * Service factory for dependency injection
 */
export class QuoteServiceFactory {
  private static instance: IQuoteService | undefined;
  
  static getInstance(): IQuoteService {
    if (!this.instance) {
      this.instance = new QuoteService();
    }
    return this.instance;
  }
  
  static setInstance(service: IQuoteService) {
    this.instance = service;
  }
  
  static reset() {
    this.instance = undefined;
  }
}

// Export default instance
export default QuoteServiceFactory.getInstance();