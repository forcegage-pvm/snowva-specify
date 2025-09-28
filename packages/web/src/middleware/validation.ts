/**
 * Validation Middleware Implementation
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD004: Validation schemas missing for API requests
 * Addresses TD005: Async parameters not handled properly in Next.js 15
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { ApiErrorHandler } from '../lib/api-error-handler';

export interface ValidationConfig {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
  skipValidation?: boolean;
  customErrorMessages?: Record<string, string>;
}

export interface ValidatedRequest extends NextRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type-erased holder for validated body data, cast to specific types in ValidatedRequestWithBody<T>
  validatedBody?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type-erased holder for validated query data, cast to specific types in ValidatedRequestWithQuery<T>
  validatedQuery?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type-erased holder for validated params data, cast to specific types in ValidatedRequestWithParams<T>
  validatedParams?: any;
  validatedHeaders?: Record<string, string>;
}

export interface ValidatedRequestWithBody<T> extends NextRequest {
  validatedBody: T;
}

export interface ValidatedRequestWithQuery<T> extends NextRequest {
  validatedQuery: T;
}

export interface ValidatedRequestWithParams<T> extends NextRequest {
  validatedParams: T;
}

/**
 * Validation middleware for API routes
 * Addresses TD004: Validation schemas missing for API requests
 */
export function withValidation(
  config: ValidationConfig,
  handler: (request: ValidatedRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest, context?: { params?: Record<string, string> }): Promise<NextResponse> => {
    const errorHandler = new ApiErrorHandler({
      customErrorMessages: config.customErrorMessages
    });

    try {
      if (config.skipValidation) {
        return await handler(request as ValidatedRequest, context);
      }

      const validatedRequest = request as ValidatedRequest;

      // Validate request body
      if (config.body) {
        try {
          const bodyText = await request.text();
          const bodyData = bodyText ? JSON.parse(bodyText) : {};
          const validatedBody = config.body.parse(bodyData);
          validatedRequest.validatedBody = validatedBody;
          
          // Create new request with validated body for downstream handlers
          const newRequest = new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(validatedBody)
          });
          Object.setPrototypeOf(newRequest, NextRequest.prototype);
          Object.assign(validatedRequest, newRequest);
        } catch (error) {
          if (error instanceof ZodError) {
            return errorHandler.handleError(error, request);
          }
          if (error instanceof SyntaxError) {
            return errorHandler.handleError(
              ApiErrorHandler.createValidationError(
                'Invalid JSON in request body',
                { parseError: error.message }
              ),
              request
            );
          }
          throw error;
        }
      }

      // Validate query parameters
      if (config.query) {
        try {
          const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
          const validatedQuery = config.query.parse(queryParams);
          validatedRequest.validatedQuery = validatedQuery;
        } catch (error) {
          if (error instanceof ZodError) {
            return errorHandler.handleError(error, request);
          }
          throw error;
        }
      }

      // Validate route parameters (for dynamic routes)
      // Addresses TD005: Async parameters not handled properly in Next.js 15
      if (config.params && context?.params) {
        try {
          // Handle async params in Next.js 15
          const params = await Promise.resolve(context.params);
          const validatedParams = config.params.parse(params);
          validatedRequest.validatedParams = validatedParams;
        } catch (error) {
          if (error instanceof ZodError) {
            return errorHandler.handleError(error, request);
          }
          throw error;
        }
      }

      // Validate headers
      if (config.headers) {
        try {
          const headersObj = Object.fromEntries(request.headers.entries());
          const validatedHeaders = config.headers.parse(headersObj);
          validatedRequest.validatedHeaders = validatedHeaders as Record<string, string>;
        } catch (error) {
          if (error instanceof ZodError) {
            return errorHandler.handleError(error, request);
          }
          throw error;
        }
      }

      return await handler(validatedRequest, context);
    } catch (error) {
      return errorHandler.handleError(error, request);
    }
  };
}

/**
 * Validate request body middleware
 * Simplified version for body-only validation
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (
    handler: (request: ValidatedRequestWithBody<T>, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse
  ) => {
    return withValidation({ body: schema }, handler as (request: ValidatedRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse);
  };
}

/**
 * Validate query parameters middleware
 * Simplified version for query-only validation
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (
    handler: (request: ValidatedRequestWithQuery<T>, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse
  ) => {
    return withValidation({ query: schema }, handler as (request: ValidatedRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse);
  };
}

/**
 * Validate route parameters middleware
 * Addresses TD005: Async parameters not handled properly in Next.js 15
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (
    handler: (request: ValidatedRequestWithParams<T>, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse
  ) => {
    return withValidation({ params: schema }, handler as (request: ValidatedRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse);
  };
}

/**
 * Combined validation for common API patterns
 */
export function validateApiRequest<TBody = unknown, TQuery = unknown, TParams = unknown>(config: {
  body?: ZodSchema<TBody>;
  query?: ZodSchema<TQuery>;
  params?: ZodSchema<TParams>;
}) {
  return (
    handler: (
      request: NextRequest & {
        validatedBody?: TBody;
        validatedQuery?: TQuery;
        validatedParams?: TParams;
      },
      context?: { params?: Record<string, string> }
    ) => Promise<NextResponse> | NextResponse
  ) => {
    return withValidation(config, handler);
  };
}

/**
 * Validation utilities for manual validation
 */
export class ValidationUtils {
  /**
   * Manually validate data with a schema
   */
  static validate<T>(schema: ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: ZodError } {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof ZodError) {
        return { success: false, error };
      }
      throw error;
    }
  }

  /**
   * Safe parse with detailed error information
   */
  static safeParse<T>(schema: ZodSchema<T>, data: unknown) {
    return schema.safeParse(data);
  }

  /**
   * Extract validation errors in a friendly format
   */
  static extractValidationErrors(error: ZodError): {
    field: string;
    message: string;
    code: string;
    value?: unknown;
  }[] {
    return error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
      value: issue.input
    }));
  }

  /**
   * Create field-specific error messages
   */
  static createFieldErrors(error: ZodError): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};
    
    for (const issue of error.issues) {
      const field = issue.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }

    return fieldErrors;
  }

  /**
   * Check if request has JSON content type
   */
  static hasJsonContentType(request: NextRequest): boolean {
    const contentType = request.headers.get('content-type');
    return contentType?.includes('application/json') ?? false;
  }

  /**
   * Parse request body safely
   */
  static async parseRequestBody(request: NextRequest): Promise<unknown> {
    try {
      const text = await request.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      throw new SyntaxError('Invalid JSON in request body');
    }
  }

  /**
   * Convert search params to object
   */
  static searchParamsToObject(searchParams: URLSearchParams): Record<string, string | string[]> {
    const obj: Record<string, string | string[]> = {};
    
    for (const [key, value] of searchParams.entries()) {
      if (obj[key]) {
        // Handle multiple values for the same key
        if (Array.isArray(obj[key])) {
          (obj[key] as string[]).push(value);
        } else {
          obj[key] = [obj[key] as string, value];
        }
      } else {
        obj[key] = value;
      }
    }

    return obj;
  }
}

/**
 * Common validation patterns
 */
export const CommonValidations = {
  /**
   * UUID validation
   */
  uuid: (fieldName: string = 'id') => ({
    [fieldName]: (value: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(value);
    }
  }),

  /**
   * Pagination validation
   */
  pagination: {
    limit: (value: unknown, min: number = 1, max: number = 100) => 
      Number.isInteger(Number(value)) && 
      Number(value) >= min && 
      Number(value) <= max,
    
    offset: (value: unknown) => 
      Number.isInteger(Number(value)) && Number(value) >= 0,
    
    cursor: (value: unknown) => 
      typeof value === 'string' && value.length > 0
  },

  /**
   * Content type validation
   */
  contentType: {
    json: (request: NextRequest) => 
      request.headers.get('content-type')?.includes('application/json') ?? false,
    
    multipart: (request: NextRequest) => 
      request.headers.get('content-type')?.includes('multipart/form-data') ?? false
  }
};