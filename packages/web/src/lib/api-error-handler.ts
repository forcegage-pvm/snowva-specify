/**
 * API Error Handler Implementation
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD002: Error handling not comprehensive
 * Addresses TD003: API error responses not standardized
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
    ApiError,
    ApiErrorCode,
    ErrorContext,
    ErrorHandlerConfig,
    ErrorResponse
} from '../types/api-errors';
import {
    validateErrorContext
} from '../validation/error-schema';

export class ApiErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      logErrors: config.logErrors ?? true,
      includeStack: config.includeStack ?? process.env.NODE_ENV === 'development',
      sanitizeOutput: config.sanitizeOutput ?? process.env.NODE_ENV === 'production',
      customErrorMessages: config.customErrorMessages ?? {}
    };
  }

  /**
   * Handle API errors and return standardized error responses
   * Addresses TD003: API error responses not standardized
   */
  handleError(
    error: unknown,
    request: NextRequest,
    context?: Partial<ErrorContext>
  ): NextResponse<ErrorResponse> {
    const errorContext = this.createErrorContext(request, context);
    const apiError = this.processError(error, errorContext);

    if (this.config.logErrors) {
      this.logError(apiError, errorContext, error);
    }

    const sanitizedError = this.config.sanitizeOutput 
      ? this.sanitizeError(apiError) 
      : apiError;

    const errorResponse: ErrorResponse = {
      error: sanitizedError,
      success: false
    };

    return NextResponse.json(errorResponse, { 
      status: apiError.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': errorContext.requestId
      }
    });
  }

  /**
   * Process different types of errors into standardized ApiError format
   */
  private processError(error: unknown, context: ErrorContext): ApiError {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return this.handleZodError(error, context);
    }

    // Handle known API errors
    if (this.isApiError(error)) {
      return this.enhanceApiError(error, context);
    }

    // Handle Next.js errors
    if (this.isNextError(error)) {
      return this.handleNextError(error, context);
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return this.handleStandardError(error, context);
    }

    // Handle unknown errors
    return this.handleUnknownError(error, context);
  }

  /**
   * Handle Zod validation errors
   * Addresses TD004: Validation schemas missing for API requests
   */
  private handleZodError(error: ZodError, context: ErrorContext): ApiError {
    const validationErrors = error.issues.map(issue => ({
      field: issue.path.join('.'),
      code: issue.code,
      message: issue.message,
      value: issue.input
    }));

    return {
      code: ApiErrorCode.VALIDATION_FAILED,
      message: this.getCustomMessage(
        ApiErrorCode.VALIDATION_FAILED,
        'Validation failed'
      ),
      details: {
        validationErrors,
        fieldErrors: this.groupValidationErrorsByField(validationErrors)
      },
      timestamp: context.timestamp,
      requestId: context.requestId,
      path: context.path,
      method: context.method,
      statusCode: 400
    };
  }

  /**
   * Handle Next.js specific errors (like NotFound)
   */
  private handleNextError(error: any, context: ErrorContext): ApiError {
    if (error.digest === 'NEXT_NOT_FOUND') {
      return {
        code: ApiErrorCode.NOT_FOUND,
        message: this.getCustomMessage(
          ApiErrorCode.NOT_FOUND,
          'Resource not found'
        ),
        timestamp: context.timestamp,
        requestId: context.requestId,
        path: context.path,
        method: context.method,
        statusCode: 404
      };
    }

    return this.handleStandardError(error, context);
  }

  /**
   * Handle standard JavaScript errors
   */
  private handleStandardError(error: Error, context: ErrorContext): ApiError {
    let code = ApiErrorCode.INTERNAL_SERVER_ERROR;
    let statusCode = 500;

    // Map common error patterns
    if (error.message.includes('not found') || error.message.includes('404')) {
      code = ApiErrorCode.NOT_FOUND;
      statusCode = 404;
    } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
      code = ApiErrorCode.UNAUTHORIZED;
      statusCode = 401;
    } else if (error.message.includes('forbidden') || error.message.includes('403')) {
      code = ApiErrorCode.FORBIDDEN;
      statusCode = 403;
    }

    return {
      code,
      message: this.getCustomMessage(code, error.message),
      details: {
        originalError: error.message,
        stack: this.config.includeStack ? error.stack : undefined
      },
      timestamp: context.timestamp,
      requestId: context.requestId,
      path: context.path,
      method: context.method,
      statusCode
    };
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: unknown, context: ErrorContext): ApiError {
    return {
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message: this.getCustomMessage(
        ApiErrorCode.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred'
      ),
      details: {
        originalError: String(error),
        type: typeof error
      },
      timestamp: context.timestamp,
      requestId: context.requestId,
      path: context.path,
      method: context.method,
      statusCode: 500
    };
  }

  /**
   * Enhance existing API errors with context
   */
  private enhanceApiError(error: ApiError, context: ErrorContext): ApiError {
    return {
      ...error,
      requestId: error.requestId || context.requestId,
      path: error.path || context.path,
      method: error.method || context.method,
      timestamp: error.timestamp || context.timestamp
    };
  }

  /**
   * Create error context from request
   */
  private createErrorContext(
    request: NextRequest,
    partialContext?: Partial<ErrorContext>
  ): ErrorContext {
    const requestId = partialContext?.requestId || 
      request.headers.get('x-request-id') || 
      crypto.randomUUID();

    const context: ErrorContext = {
      requestId,
      path: request.nextUrl.pathname,
      method: request.method as any,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: this.getClientIP(request),
      timestamp: new Date(),
      ...partialContext
    };

    const validation = validateErrorContext(context);
    if (!validation.success) {
      console.warn('Invalid error context:', validation.error);
      // Return basic context if validation fails
      return {
        requestId: crypto.randomUUID(),
        path: request.nextUrl.pathname,
        method: request.method as any,
        timestamp: new Date()
      };
    }

    return validation.data;
  }

  /**
   * Get client IP address from request
   */
  private getClientIP(request: NextRequest): string | undefined {
    const xForwardedFor = request.headers.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }

    const xRealIP = request.headers.get('x-real-ip');
    if (xRealIP) {
      return xRealIP;
    }

    // NextRequest doesn't have direct IP access in Edge Runtime
    return undefined;
  }

  /**
   * Group validation errors by field
   */
  private groupValidationErrorsByField(validationErrors: any[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    
    for (const error of validationErrors) {
      if (!grouped[error.field]) {
        grouped[error.field] = [];
      }
      grouped[error.field].push(error.message);
    }

    return grouped;
  }

  /**
   * Get custom error message if configured
   */
  private getCustomMessage(code: string, defaultMessage: string): string {
    return this.config.customErrorMessages?.[code] || defaultMessage;
  }

  /**
   * Sanitize error for production
   */
  private sanitizeError(error: ApiError): ApiError {
    const sanitized = { ...error };

    // Remove sensitive details in production
    if (sanitized.details) {
      delete sanitized.details.stack;
      delete sanitized.details.originalError;
    }

    // Use generic messages for internal errors
    if (error.statusCode >= 500) {
      sanitized.message = 'Internal server error';
      sanitized.details = undefined;
    }

    return sanitized;
  }

  /**
   * Log error with appropriate level
   */
  private logError(apiError: ApiError, context: ErrorContext, originalError: unknown): void {
    const logData = {
      error: apiError,
      context,
      originalError: originalError instanceof Error ? {
        name: originalError.name,
        message: originalError.message,
        stack: originalError.stack
      } : originalError
    };

    if (apiError.statusCode >= 500) {
      console.error('API Error [500+]:', logData);
    } else if (apiError.statusCode >= 400) {
      console.warn('API Error [400+]:', logData);
    } else {
      console.info('API Error [<400]:', logData);
    }
  }

  /**
   * Check if error is an ApiError
   */
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

  /**
   * Check if error is a Next.js error
   */
  private isNextError(error: unknown): error is { digest: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      typeof (error as any).digest === 'string'
    );
  }

  /**
   * Create specific error types
   */
  static createNotFoundError(resource: string, id?: string): ApiError {
    return {
      code: ApiErrorCode.NOT_FOUND,
      message: `${resource} not found${id ? ` with ID: ${id}` : ''}`,
      timestamp: new Date(),
      statusCode: 404
    };
  }

  static createValidationError(message: string, details?: any): ApiError {
    return {
      code: ApiErrorCode.VALIDATION_FAILED,
      message,
      details,
      timestamp: new Date(),
      statusCode: 400
    };
  }

  static createUnauthorizedError(message: string = 'Unauthorized'): ApiError {
    return {
      code: ApiErrorCode.UNAUTHORIZED,
      message,
      timestamp: new Date(),
      statusCode: 401
    };
  }

  static createForbiddenError(message: string = 'Forbidden'): ApiError {
    return {
      code: ApiErrorCode.FORBIDDEN,
      message,
      timestamp: new Date(),
      statusCode: 403
    };
  }

  static createInternalError(message: string = 'Internal server error'): ApiError {
    return {
      code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      message,
      timestamp: new Date(),
      statusCode: 500
    };
  }
}

// Global error handler instance
export const globalErrorHandler = new ApiErrorHandler();

// Convenience function for API routes
export function handleApiError(
  error: unknown,
  request: NextRequest,
  context?: Partial<ErrorContext>
): NextResponse<ErrorResponse> {
  return globalErrorHandler.handleError(error, request, context);
}