/**
 * Comprehensive error handling middleware
 * Provides centralized error processing with logging and monitoring
 */

import { errorResponseSchema } from '@/schemas/error-schema';
import { ApiError, ApiErrorCode } from '@/types/api-errors';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Error handling configuration
 */
interface ErrorHandlerConfig {
  logErrors: boolean;
  includeStackTrace: boolean;
  sanitizeErrors: boolean;
  enableMetrics: boolean;
}

/**
 * Default error handler configuration
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  logErrors: true,
  includeStackTrace: process.env.NODE_ENV === 'development',
  sanitizeErrors: process.env.NODE_ENV === 'production',
  enableMetrics: true,
};

/**
 * Error metrics tracking
 */
class ErrorMetrics {
  private static errorCounts = new Map<string, number>();
  private static lastReset = Date.now();

  static track(error: ApiError): void {
    const key = `${error.statusCode}_${error.code}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  static reset(): void {
    this.errorCounts.clear();
    this.lastReset = Date.now();
  }
}

/**
 * Comprehensive error handler middleware
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Handle API errors with comprehensive processing
   */
  async handleError(
    error: unknown,
    request: NextRequest,
    context?: Record<string, unknown>
  ): Promise<NextResponse> {
    const apiError = this.normalizeError(error);
    
    // Track error metrics
    if (this.config.enableMetrics) {
      ErrorMetrics.track(apiError);
    }

    // Log error with context
    if (this.config.logErrors) {
      this.logError(apiError, request, context);
    }

    // Build error response
    const response = this.buildErrorResponse(apiError);
    
    return NextResponse.json(response, {
      status: apiError.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Code': apiError.code,
        'X-Request-ID': apiError.requestId || 'unknown',
      },
    });
  }

  /**
   * Normalize various error types to ApiError
   */
  private normalizeError(error: unknown): ApiError {
    // Already an ApiError
    if (this.isApiError(error)) {
      return error;
    }

    // Zod validation errors
    if (error instanceof ZodError) {
      return {
        code: ApiErrorCode.VALIDATION_FAILED,
        message: 'Request validation failed',
        statusCode: 400,
        details: {
          validationErrors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
            value: 'input' in issue ? issue.input : undefined,
          })),
        },
        timestamp: new Date(),
      };
    }

    // Network/timeout errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: ApiErrorCode.SERVICE_UNAVAILABLE,
        message: 'Network request failed',
        statusCode: 503,
        timestamp: new Date(),
      };
    }

    // Generic Error objects
    if (error instanceof Error) {
      return {
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        message: this.config.sanitizeErrors 
          ? 'An internal error occurred' 
          : error.message,
        statusCode: 500,
        details: this.config.includeStackTrace 
          ? { stack: error.stack } 
          : undefined,
        timestamp: new Date(),
      };
    }

    // Unknown error types
    return {
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      statusCode: 500,
      details: this.config.includeStackTrace 
        ? { originalError: String(error) } 
        : undefined,
      timestamp: new Date(),
    };
  }

  /**
   * Check if error is already an ApiError
   */
  private isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'code' in error &&
      'message' in error &&
      'statusCode' in error
    );
  }

  /**
   * Log error with context information
   */
  private logError(
    error: ApiError,
    request: NextRequest,
    context?: Record<string, unknown>
  ): void {
    const logData = {
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
      request: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        userAgent: request.headers.get('user-agent'),
      },
      context,
      timestamp: new Date().toISOString(),
    };

    // Log based on severity
    if (error.statusCode >= 500) {
      console.error('API Error (Server):', JSON.stringify(logData, null, 2));
    } else if (error.statusCode >= 400) {
      console.warn('API Error (Client):', JSON.stringify(logData, null, 2));
    } else {
      console.info('API Error (Info):', JSON.stringify(logData, null, 2));
    }
  }

  /**
   * Build standardized error response
   */
  private buildErrorResponse(error: ApiError) {
    const response = {
      error: {
        code: error.code,
        message: error.message,
        timestamp: error.timestamp,
        statusCode: error.statusCode,
        ...(error.details && { details: error.details }),
      },
      success: false as const,
    };

    // Validate response structure
    try {
      return errorResponseSchema.parse(response);
    } catch (validationError) {
      // Fallback to basic error response if validation fails
      return {
        error: {
          code: ApiErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Error response validation failed',
          timestamp: new Date(),
          statusCode: 500,
        },
        success: false as const,
      };
    }
  }

  /**
   * Get error metrics
   */
  getMetrics(): Record<string, number> {
    return ErrorMetrics.getMetrics();
  }

  /**
   * Reset error metrics
   */
  resetMetrics(): void {
    ErrorMetrics.reset();
  }
}

/**
 * Default error handler instance
 */
export const defaultErrorHandler = new ErrorHandler();

/**
 * Convenience function for handling errors in API routes
 */
export async function handleApiError(
  error: unknown,
  request: NextRequest,
  context?: Record<string, unknown>
): Promise<NextResponse> {
  return defaultErrorHandler.handleError(error, request, context);
}

/**
 * Higher-order function to wrap API route handlers with error handling
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleApiError(error, request, {
        handler: handler.name,
        args: args.length,
      });
    }
  };
}

/**
 * Create custom error handler with specific configuration
 */
export function createErrorHandler(config: Partial<ErrorHandlerConfig>): ErrorHandler {
  return new ErrorHandler(config);
}