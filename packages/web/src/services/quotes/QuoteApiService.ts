import {
    type BulkActionRequest,
    type CreateQuoteRequest,
    type ExportRequest,
    type QuotesFilter,
    type StatusUpdateRequest
} from '@/services/quotes/QuoteValidation';
import type { Quote } from '@/types/quotes/Quote';
import type { QuoteStatus, QuoteStatusChange } from '@/types/quotes/QuoteStatus';

/**
 * API endpoints for quote operations
 */
const API_BASE = '/api/quotes';

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  };
}

export interface QuotesListResponse {
  quotes: Quote[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * HTTP client for quote API operations
 * Handles all REST API interactions with proper error handling,
 * request/response transformation, and authentication
 */
export class QuoteApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  
  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
  
  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Remove authentication token
   */
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }
  
  /**
   * Make HTTP request with error handling
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        }
      };
      
      const response = await fetch(url, config);
      
      // Handle non-JSON responses (like file downloads)
      if (options.headers && 
          (options.headers as Record<string, string>)['Accept'] !== 'application/json') {
        if (response.ok) {
          return { 
            success: true, 
            data: await response.blob() as T 
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            message: result.message || `HTTP ${response.status}: ${response.statusText}`,
            code: result.code || response.status.toString(),
            details: result.details
          }
        };
      }
      
      return {
        success: true,
        data: result.data || result,
        meta: result.meta
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }
  
  /**
   * Get quotes with filtering and pagination
   */
  async getQuotes(filters: Partial<QuotesFilter> = {}): Promise<ApiResponse<QuotesListResponse>> {
    const params = new URLSearchParams();
    
    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    const endpoint = params.toString() ? `?${params.toString()}` : '';
    return await this.makeRequest<QuotesListResponse>(endpoint);
  }
  
  /**
   * Get single quote by ID
   */
  async getQuoteById(id: string): Promise<ApiResponse<Quote>> {
    if (!id) {
      return {
        success: false,
        error: { message: 'Quote ID is required' }
      };
    }
    
    return await this.makeRequest<Quote>(`/${id}`);
  }
  
  /**
   * Create new quote
   */
  async createQuote(request: CreateQuoteRequest): Promise<ApiResponse<Quote>> {
    return await this.makeRequest<Quote>('', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
  
  /**
   * Update existing quote
   */
    async updateQuote(id: string, data: Partial<Quote>): Promise<Quote> {
    if (!id) {
      throw new Error('Quote ID is required');
    }
    
    const response = await this.makeRequest<Quote>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (!response.data) {
      throw new Error('Failed to update quote');
    }
    
    return response.data;
  }
  
  /**
   * Delete quote (soft delete)
   */
  async deleteQuote(id: string): Promise<ApiResponse<void>> {
    if (!id) {
      return {
        success: false,
        error: { message: 'Quote ID is required' }
      };
    }
    
    return await this.makeRequest<void>(`/${id}`, {
      method: 'DELETE'
    });
  }
  
  /**
   * Update quote status
   */
  async updateQuoteStatus(id: string, request: StatusUpdateRequest): Promise<ApiResponse<Quote>> {
    if (!id) {
      return {
        success: false,
        error: { message: 'Quote ID is required' }
      };
    }
    
    return await this.makeRequest<Quote>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(request)
    });
  }
  
  /**
   * Get status change history
   */
  async getStatusHistory(id: string): Promise<ApiResponse<QuoteStatusChange[]>> {
    if (!id) {
      return {
        success: false,
        error: { message: 'Quote ID is required' }
      };
    }
    
    return await this.makeRequest<QuoteStatusChange[]>(`/${id}/history`);
  }
  
  /**
   * Perform bulk actions
   */
  async bulkAction(request: BulkActionRequest): Promise<ApiResponse<void>> {
    return await this.makeRequest<void>('/bulk', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
  
  /**
   * Export quotes
   */
  async exportQuotes(request: ExportRequest): Promise<ApiResponse<Blob>> {
    const acceptType = request.format === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    return await this.makeRequest<Blob>('/export', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Accept': acceptType
      }
    });
  }
  
  /**
   * Get quote statistics
   */
  async getQuoteStats(filters?: Partial<QuotesFilter>): Promise<ApiResponse<QuoteStats>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }
    
    const endpoint = `/stats${params.toString() ? `?${params.toString()}` : ''}`;
    return await this.makeRequest<QuoteStats>(endpoint);
  }
  
  /**
   * Search quotes with full-text search
   */
  async searchQuotes(query: string, filters?: Partial<QuotesFilter>): Promise<ApiResponse<QuotesListResponse>> {
    const searchParams = new URLSearchParams({ search: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.set(key, value.toString());
          }
        }
      });
    }
    
    return await this.makeRequest<QuotesListResponse>(`/search?${searchParams.toString()}`);
  }
  
  /**
   * Duplicate an existing quote
   */
  async duplicateQuote(id: string): Promise<ApiResponse<Quote>> {
    if (!id) {
      return {
        success: false,
        error: { message: 'Quote ID is required' }
      };
    }
    
    return await this.makeRequest<Quote>(`/${id}/duplicate`, {
      method: 'POST'
    });
  }
  
  /**
   * Convert quote to invoice
   */
  async convertToInvoice(id: string): Promise<ApiResponse<{ invoiceId: string }>> {
    if (!id) {
      return {
        success: false,
        error: { message: 'Quote ID is required' }
      };
    }
    
    return await this.makeRequest<{ invoiceId: string }>(`/${id}/convert`, {
      method: 'POST'
    });
  }
  
  /**
   * Send quote to customer via email
   */
  async sendQuote(id: string, options?: {
    recipients?: string[];
    subject?: string;
    message?: string;
  }): Promise<ApiResponse<void>> {
    if (!id) {
      return {
        success: false,
        error: { message: 'Quote ID is required' }
      };
    }
    
    return await this.makeRequest<void>(`/${id}/send`, {
      method: 'POST',
      body: JSON.stringify(options || {})
    });
  }
}

/**
 * Quote statistics interface
 */
export interface QuoteStats {
  totalQuotes: number;
  totalValue: number;
  statusBreakdown: Record<QuoteStatus, number>;
  averageValue: number;
  conversionRate: number; // percentage of quotes that become invoices
  monthlyTrend: Array<{
    month: string;
    count: number;
    value: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    quoteCount: number;
    totalValue: number;
  }>;
}

/**
 * Utility functions for API operations
 */
export class QuoteApiUtils {
  /**
   * Handle API response with error throwing
   */
  static async handleResponse<T>(response: ApiResponse<T>): Promise<T> {
    if (!response.success) {
      throw new QuoteApiError(
        response.error?.message || 'Unknown API error',
        response.error?.code,
        response.error?.details
      );
    }
    
    if (response.data === undefined) {
      throw new QuoteApiError('No data received from API');
    }
    
    return response.data;
  }
  
  /**
   * Build filter query string
   */
  static buildFilterString(filters: Partial<QuotesFilter>): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    return params.toString();
  }
}

/**
 * Custom error for API operations
 */
export class QuoteApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'QuoteApiError';
  }
}

// Export singleton instance
export const quoteApi = new QuoteApiService();
export default quoteApi;