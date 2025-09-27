/**
 * API Error Types
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD002: Error handling not comprehensive
 * Addresses TD003: API error responses not standardized
 */

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetails;
  timestamp: Date;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode: number;
}

export interface ApiErrorDetails {
  [key: string]: unknown;
  // Validation errors
  validationErrors?: ValidationError[];
  // Field-specific errors
  fieldErrors?: Record<string, string[]>;
  // Context information
  context?: Record<string, unknown>;
  // User-facing suggestions
  suggestions?: string[];
  // Technical details for debugging
  stack?: string;
  originalError?: string;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, unknown>;
}

export enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  
  // Timeline-specific
  TIMELINE_NOT_FOUND = 'TIMELINE_NOT_FOUND',
  TIMELINE_ACCESS_DENIED = 'TIMELINE_ACCESS_DENIED',
  
  // Quote-specific
  QUOTE_NOT_FOUND = 'QUOTE_NOT_FOUND',
  QUOTE_LOCKED = 'QUOTE_LOCKED',
  QUOTE_ALREADY_CONVERTED = 'QUOTE_ALREADY_CONVERTED'
}

export interface ErrorResponse {
  error: ApiError;
  success: false;
}

export interface SuccessResponse<T = unknown> {
  data: T;
  success: true;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  cursor?: string;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export interface ErrorHandlerConfig {
  logErrors: boolean;
  includeStack: boolean;
  sanitizeOutput: boolean;
  customErrorMessages?: Record<string, string>;
}

export interface ErrorContext {
  userId?: string;
  requestId: string;
  path: string;
  method: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
}