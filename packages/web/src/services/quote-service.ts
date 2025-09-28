/**
 * Quote Service Implementation
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD002: Error handling not comprehensive
 * Addresses TD006: Service layer not properly integrated with API routes
 */

import { ApiError, ApiErrorCode } from '@/types/api-errors';

export interface Quote {
  id: string;
  title: string;
  description?: string;
  customerId: string;
  customerName: string;
  status: QuoteStatus;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  metadata?: Record<string, unknown>;
}

export enum QuoteStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

export interface CreateQuoteRequest {
  title: string;
  description?: string;
  customerId: string;
  items: Omit<QuoteItem, 'id' | 'total'>[];
  validUntil: Date;
  metadata?: Record<string, unknown>;
}

export interface UpdateQuoteRequest {
  title?: string;
  description?: string;
  items?: Omit<QuoteItem, 'id' | 'total'>[];
  validUntil?: Date;
  metadata?: Record<string, unknown>;
}

export interface QuoteQuery {
  customerId?: string;
  status?: QuoteStatus;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'total' | 'validUntil';
  sortOrder?: 'asc' | 'desc';
}

export interface QuoteResponse {
  quotes: Quote[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Quote Service with Enhanced Error Handling
 */
export class QuoteService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = '/api/v1', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get quotes with filtering and pagination
   */
  async getQuotes(query: QuoteQuery = {}): Promise<QuoteResponse> {
    try {
      const url = new URL(`${this.baseUrl}/quotes`, this.getBaseUrl());
      
      // Add query parameters
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const data = await response.json();
      return this.validateQuoteResponse(data);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to fetch quotes', error);
    }
  }

  /**
   * Get quote by ID
   */
  async getQuote(quoteId: string): Promise<Quote> {
    try {
      if (!quoteId || quoteId.trim() === '') {
        throw this.createValidationError('Quote ID is required');
      }

      const response = await fetch(`${this.baseUrl}/quotes/${quoteId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const data = await response.json();
      return this.validateQuote(data);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to fetch quote', error);
    }
  }

  /**
   * Create new quote
   */
  async createQuote(request: CreateQuoteRequest): Promise<Quote> {
    try {
      this.validateCreateQuoteRequest(request);

      const response = await fetch(`${this.baseUrl}/quotes`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const data = await response.json();
      return this.validateQuote(data);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to create quote', error);
    }
  }

  /**
   * Update existing quote
   */
  async updateQuote(quoteId: string, request: UpdateQuoteRequest): Promise<Quote> {
    try {
      if (!quoteId || quoteId.trim() === '') {
        throw this.createValidationError('Quote ID is required');
      }

      this.validateUpdateQuoteRequest(request);

      const response = await fetch(`${this.baseUrl}/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const data = await response.json();
      return this.validateQuote(data);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to update quote', error);
    }
  }

  /**
   * Delete quote
   */
  async deleteQuote(quoteId: string): Promise<boolean> {
    try {
      if (!quoteId || quoteId.trim() === '') {
        throw this.createValidationError('Quote ID is required');
      }

      const response = await fetch(`${this.baseUrl}/quotes/${quoteId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      return true;
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to delete quote', error);
    }
  }

  /**
   * Convert quote to invoice
   */
  async convertToInvoice(quoteId: string): Promise<{ invoiceId: string }> {
    try {
      if (!quoteId || quoteId.trim() === '') {
        throw this.createValidationError('Quote ID is required');
      }

      const response = await fetch(`${this.baseUrl}/quotes/${quoteId}/convert`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const data = await response.json();
      
      if (!data.invoiceId) {
        throw this.createInternalError('Invalid conversion response');
      }

      return data;
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to convert quote to invoice', error);
    }
  }

  /**
   * Duplicate quote
   */
  async duplicateQuote(quoteId: string): Promise<Quote> {
    try {
      if (!quoteId || quoteId.trim() === '') {
        throw this.createValidationError('Quote ID is required');
      }

      const response = await fetch(`${this.baseUrl}/quotes/${quoteId}/duplicate`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const data = await response.json();
      return this.validateQuote(data);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to duplicate quote', error);
    }
  }

  /**
   * Update quote status
   */
  async updateStatus(quoteId: string, status: QuoteStatus): Promise<Quote> {
    try {
      if (!quoteId || quoteId.trim() === '') {
        throw this.createValidationError('Quote ID is required');
      }

      if (!Object.values(QuoteStatus).includes(status)) {
        throw this.createValidationError('Invalid quote status');
      }

      const response = await fetch(`${this.baseUrl}/quotes/${quoteId}/status`, {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const data = await response.json();
      return this.validateQuote(data);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to update quote status', error);
    }
  }

  /**
   * Validation methods
   */
  private validateCreateQuoteRequest(request: CreateQuoteRequest): void {
    if (!request.title || request.title.trim() === '') {
      throw this.createValidationError('Quote title is required');
    }

    if (!request.customerId || request.customerId.trim() === '') {
      throw this.createValidationError('Customer ID is required');
    }

    if (!request.items || request.items.length === 0) {
      throw this.createValidationError('At least one quote item is required');
    }

    if (!request.validUntil || request.validUntil <= new Date()) {
      throw this.createValidationError('Valid until date must be in the future');
    }

    // Validate items
    request.items.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        throw this.createValidationError(`Item ${index + 1}: Description is required`);
      }

      if (!item.quantity || item.quantity <= 0) {
        throw this.createValidationError(`Item ${index + 1}: Quantity must be greater than 0`);
      }

      if (!item.unitPrice || item.unitPrice < 0) {
        throw this.createValidationError(`Item ${index + 1}: Unit price must be 0 or greater`);
      }
    });
  }

  private validateUpdateQuoteRequest(request: UpdateQuoteRequest): void {
    if (request.title !== undefined && (!request.title || request.title.trim() === '')) {
      throw this.createValidationError('Quote title cannot be empty');
    }

    if (request.validUntil !== undefined && request.validUntil <= new Date()) {
      throw this.createValidationError('Valid until date must be in the future');
    }

    if (request.items) {
      if (request.items.length === 0) {
        throw this.createValidationError('At least one quote item is required');
      }

      request.items.forEach((item, index) => {
        if (!item.description || item.description.trim() === '') {
          throw this.createValidationError(`Item ${index + 1}: Description is required`);
        }

        if (!item.quantity || item.quantity <= 0) {
          throw this.createValidationError(`Item ${index + 1}: Quantity must be greater than 0`);
        }

        if (!item.unitPrice || item.unitPrice < 0) {
          throw this.createValidationError(`Item ${index + 1}: Unit price must be 0 or greater`);
        }
      });
    }
  }

  private validateQuote(data: unknown): Quote {
    // Basic validation - in a real app, use Zod or similar
    if (!data || typeof data !== 'object') {
      throw this.createValidationError('Invalid quote data');
    }

    const quote = data as Quote;

    if (!quote.id || !quote.title || !quote.customerId) {
      throw this.createValidationError('Quote missing required fields');
    }

    return quote;
  }

  private validateQuoteResponse(data: unknown): QuoteResponse {
    // Basic validation - in a real app, use Zod or similar
    if (!data || typeof data !== 'object') {
      throw this.createValidationError('Invalid quote response data');
    }

    const response = data as QuoteResponse;

    if (!Array.isArray(response.quotes)) {
      throw this.createValidationError('Quotes must be an array');
    }

    return response;
  }

  /**
   * Error handling utilities
   */
  private async handleApiError(response: Response): Promise<ApiError> {
    let errorData: Record<string, unknown> = {};

    try {
      errorData = await response.json();
    } catch {
      // Response doesn't contain JSON
    }

    const apiError: ApiError = {
      code: this.getErrorCodeFromStatus(response.status),
      message: (typeof errorData.message === 'string' ? errorData.message : undefined) || this.getDefaultErrorMessage(response.status),
      statusCode: response.status,
      timestamp: new Date(),
      details: {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        ...(errorData.details && typeof errorData.details === 'object' ? errorData.details as Record<string, unknown> : {}),
      },
    };

    return apiError;
  }

  private getErrorCodeFromStatus(status: number): ApiErrorCode {
    switch (status) {
      case 400:
        return ApiErrorCode.VALIDATION_FAILED;
      case 401:
        return ApiErrorCode.UNAUTHORIZED;
      case 403:
        return ApiErrorCode.FORBIDDEN;
      case 404:
        return ApiErrorCode.NOT_FOUND;
      case 409:
        return ApiErrorCode.RESOURCE_CONFLICT;
      case 422:
        return ApiErrorCode.INVALID_INPUT;
      case 429:
        return ApiErrorCode.RATE_LIMIT_EXCEEDED;
      case 500:
        return ApiErrorCode.INTERNAL_SERVER_ERROR;
      case 503:
        return ApiErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ApiErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Quote not found';
      case 409:
        return 'Quote conflict';
      case 422:
        return 'Invalid quote data';
      case 429:
        return 'Too many requests';
      case 500:
        return 'Internal server error';
      case 503:
        return 'Service unavailable';
      default:
        return 'An error occurred';
    }
  }

  private createValidationError(message: string): ApiError {
    return {
      code: ApiErrorCode.VALIDATION_FAILED,
      message,
      statusCode: 400,
      timestamp: new Date(),
    };
  }

  private createInternalError(message: string, originalError?: unknown): ApiError {
    return {
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message,
      statusCode: 500,
      timestamp: new Date(),
      details: {
        originalError: originalError instanceof Error ? originalError.message : String(originalError),
      },
    };
  }

  private isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'statusCode' in error
    );
  }

  /**
   * HTTP utilities
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }
}

/**
 * Default quote service instance
 */
export const defaultQuoteService = new QuoteService();

/**
 * Create custom quote service with specific configuration
 */
export function createQuoteService(baseUrl?: string, apiKey?: string): QuoteService {
  return new QuoteService(baseUrl, apiKey);
}