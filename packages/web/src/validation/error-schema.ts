/**
 * API Error Validation Schemas
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD002: Error handling not comprehensive
 * Addresses TD003: API error responses not standardized
 * Addresses TD004: Validation schemas missing for API requests
 */

import { z } from 'zod';
import { ApiErrorCode } from '../types/api-errors';

// Validation error schema
export const ValidationErrorSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  value: z.unknown().optional(),
  constraints: z.record(z.string(), z.unknown()).optional()
});

// API error details schema
export const ApiErrorDetailsSchema = z.object({
  validationErrors: z.array(ValidationErrorSchema).optional(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  suggestions: z.array(z.string()).optional(),
  stack: z.string().optional(),
  originalError: z.string().optional()
}).and(z.record(z.string(), z.unknown())); // Allow additional fields

// Core API error schema
export const ApiErrorSchema = z.object({
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  details: ApiErrorDetailsSchema.optional(),
  timestamp: z.coerce.date(),
  requestId: z.string().uuid('Invalid request ID format').optional(),
  path: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']).optional(),
  statusCode: z.number().int().min(100, 'Invalid HTTP status code').max(599, 'Invalid HTTP status code')
});

// Response metadata schema
export const ResponseMetaSchema = z.object({
  total: z.number().int().min(0, 'Total must be non-negative').optional(),
  page: z.number().int().min(1, 'Page must be at least 1').optional(),
  limit: z.number().int().min(1, 'Limit must be at least 1').optional(),
  hasMore: z.boolean().optional(),
  cursor: z.string().optional()
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: ApiErrorSchema,
  success: z.literal(false)
});

// Success response schema (generic)
export const SuccessResponseSchema = z.object({
  data: z.unknown(),
  success: z.literal(true),
  meta: ResponseMetaSchema.optional()
});

// API response union schema
export const ApiResponseSchema = z.union([
  SuccessResponseSchema,
  ErrorResponseSchema
]);

// Error handler configuration schema
export const ErrorHandlerConfigSchema = z.object({
  logErrors: z.boolean().default(true),
  includeStack: z.boolean().default(false),
  sanitizeOutput: z.boolean().default(true),
  customErrorMessages: z.record(z.string(), z.string()).optional()
});

// Error context schema
export const ErrorContextSchema = z.object({
  userId: z.string().uuid('Invalid user ID format').optional(),
  requestId: z.string().uuid('Invalid request ID format'),
  path: z.string().min(1, 'Path is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']),
  userAgent: z.string().optional(),
  ipAddress: z.string().regex(
    /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)$/,
    'Invalid IP address'
  ).optional(),
  timestamp: z.coerce.date()
});

// Specific error schemas for common scenarios
export const NotFoundErrorSchema = ApiErrorSchema.extend({
  code: z.literal(ApiErrorCode.NOT_FOUND),
  statusCode: z.literal(404)
});

export const ValidationFailedErrorSchema = ApiErrorSchema.extend({
  code: z.literal(ApiErrorCode.VALIDATION_FAILED),
  statusCode: z.literal(400),
  details: z.object({
    validationErrors: z.array(ValidationErrorSchema).min(1, 'At least one validation error is required'),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
    context: z.record(z.string(), z.unknown()).optional(),
    suggestions: z.array(z.string()).optional(),
    stack: z.string().optional(),
    originalError: z.string().optional()
  }).and(z.record(z.string(), z.unknown()))
});

export const UnauthorizedErrorSchema = ApiErrorSchema.extend({
  code: z.literal(ApiErrorCode.UNAUTHORIZED),
  statusCode: z.literal(401)
});

export const ForbiddenErrorSchema = ApiErrorSchema.extend({
  code: z.literal(ApiErrorCode.FORBIDDEN),
  statusCode: z.literal(403)
});

export const InternalServerErrorSchema = ApiErrorSchema.extend({
  code: z.literal(ApiErrorCode.INTERNAL_SERVER_ERROR),
  statusCode: z.literal(500)
});

// Timeline-specific error schemas
export const TimelineNotFoundErrorSchema = ApiErrorSchema.extend({
  code: z.literal(ApiErrorCode.TIMELINE_NOT_FOUND),
  statusCode: z.literal(404)
});

export const TimelineAccessDeniedErrorSchema = ApiErrorSchema.extend({
  code: z.literal(ApiErrorCode.TIMELINE_ACCESS_DENIED),
  statusCode: z.literal(403)
});

// Quote-specific error schemas
export const QuoteNotFoundErrorSchema = ApiErrorSchema.extend({
  code: z.literal(ApiErrorCode.QUOTE_NOT_FOUND),
  statusCode: z.literal(404)
});

export const QuoteLockedErrorSchema = ApiErrorSchema.extend({
  code: z.literal(ApiErrorCode.QUOTE_LOCKED),
  statusCode: z.literal(409)
});

// Type exports for use in components and services
export type ApiErrorInput = z.infer<typeof ApiErrorSchema>;
export type ErrorResponseInput = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponseInput = z.infer<typeof SuccessResponseSchema>;
export type ErrorContextInput = z.infer<typeof ErrorContextSchema>;
export type ValidationErrorInput = z.infer<typeof ValidationErrorSchema>;

// Validation helper functions
export const validateApiError = (data: unknown) => {
  return ApiErrorSchema.safeParse(data);
};

export const validateErrorResponse = (data: unknown) => {
  return ErrorResponseSchema.safeParse(data);
};

export const validateSuccessResponse = (data: unknown) => {
  return SuccessResponseSchema.safeParse(data);
};

export const validateErrorContext = (data: unknown) => {
  return ErrorContextSchema.safeParse(data);
};

// Error creation helpers
export const createValidationError = (errors: ValidationErrorInput[]): ErrorResponseInput => ({
  error: {
    code: ApiErrorCode.VALIDATION_FAILED,
    message: 'Validation failed',
    details: { validationErrors: errors },
    timestamp: new Date(),
    statusCode: 400
  },
  success: false
});

export const createNotFoundError = (resource: string, id?: string): ErrorResponseInput => ({
  error: {
    code: ApiErrorCode.NOT_FOUND,
    message: `${resource} not found${id ? ` with ID: ${id}` : ''}`,
    timestamp: new Date(),
    statusCode: 404
  },
  success: false
});