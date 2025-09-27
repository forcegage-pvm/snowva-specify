/**
 * Quote PDF Service Implementation
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD006: PDF generation error handling
 * Addresses TD008: Performance optimization needed for quote preview
 */

import { ApiError, ApiErrorCode } from '../types/api-errors';
import {
    PdfFormat,
    PdfGenerationRequest,
    PdfGenerationResult,
    PdfOptions,
    PdfOrientation,
    QuotePreview
} from '../types/quote-preview';
import {
    validatePdfGenerationRequest,
    validatePdfGenerationResult
} from '../validation/quote-preview-schema';

export class QuotePdfService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = '/api/v1', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Generate PDF for a quote
   * Addresses TD006: PDF generation error handling
   */
  async generatePdf(request: PdfGenerationRequest): Promise<PdfGenerationResult> {
    try {
      // Validate request
      const validation = validatePdfGenerationRequest(request);
      if (!validation.success) {
        throw this.createValidationError('Invalid PDF generation request', validation.error);
      }

      // Start PDF generation
      const response = await fetch(`${this.baseUrl}/quotes/${request.quoteId}/pdf`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          options: request.options,
          requestId: request.requestId
        }),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const result = await response.json();
      
      // Validate result
      const resultValidation = validatePdfGenerationResult(result);
      if (!resultValidation.success) {
        throw this.createValidationError('Invalid PDF generation result', resultValidation.error);
      }

      return resultValidation.data;
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('PDF generation failed', error);
    }
  }

  /**
   * Get PDF generation status
   */
  async getPdfStatus(quoteId: string, requestId: string): Promise<PdfGenerationResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quotes/${quoteId}/pdf/status?requestId=${requestId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const result = await response.json();
      
      // Validate result
      const validation = validatePdfGenerationResult(result);
      if (!validation.success) {
        throw this.createValidationError('Invalid PDF status result', validation.error);
      }

      return validation.data;
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to get PDF status', error);
    }
  }

  /**
   * Generate quote preview with optimization
   * Addresses TD008: Performance optimization needed for quote preview
   */
  async generatePreview(
    quoteId: string,
    options: {
      regenerateThumbnail?: boolean;
      forceOptimization?: boolean;
      cacheKey?: string;
    } = {}
  ): Promise<QuotePreview> {
    try {
      const queryParams = new URLSearchParams();
      if (options.regenerateThumbnail) {
        queryParams.set('regenerateThumbnail', 'true');
      }
      if (options.forceOptimization) {
        queryParams.set('forceOptimization', 'true');
      }
      if (options.cacheKey) {
        queryParams.set('cacheKey', options.cacheKey);
      }

      const response = await fetch(
        `${this.baseUrl}/quotes/${quoteId}/preview?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to generate quote preview', error);
    }
  }

  /**
   * Batch generate PDFs for multiple quotes
   */
  async batchGeneratePdfs(requests: PdfGenerationRequest[]): Promise<{
    successful: PdfGenerationResult[];
    failed: { request: PdfGenerationRequest; error: ApiError }[];
  }> {
    const results = await Promise.allSettled(
      requests.map(request => this.generatePdf(request))
    );

    const successful: PdfGenerationResult[] = [];
    const failed: { request: PdfGenerationRequest; error: ApiError }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push({
          request: requests[index],
          error: this.isApiError(result.reason) 
            ? result.reason 
            : this.createInternalError('Batch PDF generation failed', result.reason)
        });
      }
    });

    return { successful, failed };
  }

  /**
   * Optimize quote preview performance
   * Addresses TD008: Performance optimization needed for quote preview
   */
  async optimizePreview(quoteId: string): Promise<{
    optimized: boolean;
    performanceGain: number;
    metadata: {
      originalRenderTime?: number;
      optimizedRenderTime?: number;
      compressionRatio?: number;
      thumbnailGenerated: boolean;
    };
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quotes/${quoteId}/optimize`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to optimize quote preview', error);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  private async handleApiError(response: Response): Promise<ApiError> {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const apiError: ApiError = {
      code: this.mapStatusToCode(response.status),
      message: errorData.error?.message || errorData.message || 'Unknown error',
      details: errorData.error?.details || errorData.details,
      timestamp: new Date(),
      statusCode: response.status,
      path: response.url,
      method: 'POST'
    };

    return apiError;
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case 404:
        return ApiErrorCode.NOT_FOUND;
      case 400:
        return ApiErrorCode.VALIDATION_FAILED;
      case 401:
        return ApiErrorCode.UNAUTHORIZED;
      case 403:
        return ApiErrorCode.FORBIDDEN;
      case 409:
        return ApiErrorCode.RESOURCE_CONFLICT;
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

  private isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      'statusCode' in error &&
      'timestamp' in error
    );
  }

  private createValidationError(message: string, details?: any): ApiError {
    return {
      code: ApiErrorCode.VALIDATION_FAILED,
      message,
      details,
      timestamp: new Date(),
      statusCode: 400
    };
  }

  private createInternalError(message: string, originalError?: unknown): ApiError {
    return {
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message,
      details: {
        originalError: originalError instanceof Error ? originalError.message : String(originalError)
      },
      timestamp: new Date(),
      statusCode: 500
    };
  }

  /**
   * Default PDF options for quote generation
   */
  static getDefaultPdfOptions(): PdfOptions {
    return {
      format: PdfFormat.A4,
      orientation: PdfOrientation.PORTRAIT,
      includeLineItems: true,
      includeTerms: true,
      includeSignature: false,
      customization: {
        headerColor: '#1f2937',
        accentColor: '#3b82f6',
        hideSystemBranding: false
      }
    };
  }

  /**
   * Create PDF generation request with default options
   */
  static createPdfRequest(
    quoteId: string,
    userId: string,
    options?: Partial<PdfOptions>
  ): PdfGenerationRequest {
    return {
      quoteId,
      userId,
      requestId: crypto.randomUUID(),
      options: {
        ...QuotePdfService.getDefaultPdfOptions(),
        ...options
      }
    };
  }
}