/**
 * Timeline Service Implementation
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD001: Timeline API returns 404 errors
 * Addresses TD002: Error handling not comprehensive
 */

import { ApiError, ApiErrorCode } from '../types/api-errors';
import {
    EntityType,
    TimelineEvent,
    TimelineEventType,
    TimelineResponse
} from '../types/timeline';
import { createValidationError } from '../validation/error-schema';
import {
    CreateTimelineEventRequestInput,
    GetTimelineRequestInput,
    validateTimelineEvent
} from '../validation/timeline-schema';

export class TimelineService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = '/api/v1', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get timeline events for an entity
   * Addresses TD001: Timeline API returns 404 errors
   */
  async getTimeline(request: GetTimelineRequestInput): Promise<TimelineResponse> {
    try {
      const url = new URL(`${this.baseUrl}/timeline/${request.entityType}/${request.entityId}`);
      
      // Add query parameters
      if (request.filters) {
        if (request.filters.eventTypes) {
          request.filters.eventTypes.forEach(type => 
            url.searchParams.append('eventTypes', type)
          );
        }
        if (request.filters.userId) {
          url.searchParams.set('userId', request.filters.userId);
        }
        if (request.filters.dateRange) {
          url.searchParams.set('startDate', request.filters.dateRange.start.toISOString());
          url.searchParams.set('endDate', request.filters.dateRange.end.toISOString());
        }
      }
      
      url.searchParams.set('limit', String(request.limit));
      if (request.cursor) {
        url.searchParams.set('cursor', request.cursor);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const data = await response.json();
      return this.validateTimelineResponse(data);
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to fetch timeline', error);
    }
  }

  /**
   * Create a new timeline event
   * Addresses TD002: Error handling not comprehensive
   */
  async createEvent(request: CreateTimelineEventRequestInput): Promise<TimelineEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/timeline/events`, {
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
      const validation = validateTimelineEvent(data);
      
      if (!validation.success) {
        throw createValidationError(
          validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            code: issue.code,
            message: issue.message,
            value: issue.input
          }))
        );
      }

      return validation.data;
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to create timeline event', error);
    }
  }

  /**
   * Get timeline event by ID
   */
  async getEventById(eventId: string): Promise<TimelineEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/timeline/events/${eventId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const data = await response.json();
      const validation = validateTimelineEvent(data);
      
      if (!validation.success) {
        throw createValidationError(
          validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            code: issue.code,
            message: issue.message,
            value: issue.input
          }))
        );
      }

      return validation.data;
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to fetch timeline event', error);
    }
  }

  /**
   * Delete timeline event by ID
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/timeline/events/${eventId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw await this.handleApiError(response);
      }
    } catch (error) {
      if (this.isApiError(error)) {
        throw error;
      }
      throw this.createInternalError('Failed to delete timeline event', error);
    }
  }

  /**
   * Get timeline statistics for an entity
   */
  async getTimelineStats(entityId: string, entityType: EntityType): Promise<{
    totalEvents: number;
    eventsByType: Record<TimelineEventType, number>;
    lastActivity: Date | null;
    mostActiveUser: { userId: string; displayName: string; eventCount: number } | null;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/timeline/${entityType}/${entityId}/stats`,
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
      throw this.createInternalError('Failed to fetch timeline statistics', error);
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
      method: 'GET'
    };

    return apiError;
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case 404:
        return ApiErrorCode.TIMELINE_NOT_FOUND;
      case 403:
        return ApiErrorCode.TIMELINE_ACCESS_DENIED;
      case 400:
        return ApiErrorCode.VALIDATION_FAILED;
      case 401:
        return ApiErrorCode.UNAUTHORIZED;
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

  private validateTimelineResponse(data: unknown): TimelineResponse {
    // Basic validation for timeline response structure
    if (!data || typeof data !== 'object') {
      throw createValidationError([{
        field: 'response',
        code: 'invalid_type',
        message: 'Response must be an object'
      }]);
    }

    const responseData = data as any;
    
    if (!Array.isArray(responseData.events)) {
      throw createValidationError([{
        field: 'events',
        code: 'invalid_type',
        message: 'Events must be an array'
      }]);
    }

    // Validate each event
    const validatedEvents: TimelineEvent[] = [];
    const validationErrors: any[] = [];

    for (let i = 0; i < responseData.events.length; i++) {
      const validation = validateTimelineEvent(responseData.events[i]);
      if (validation.success) {
        validatedEvents.push(validation.data);
      } else {
        validationErrors.push(...validation.error.issues.map(issue => ({
          field: `events[${i}].${issue.path.join('.')}`,
          code: issue.code,
          message: issue.message,
          value: issue.input
        })));
      }
    }

    if (validationErrors.length > 0) {
      throw createValidationError(validationErrors);
    }

    return {
      events: validatedEvents,
      totalCount: responseData.totalCount ?? 0,
      hasMore: responseData.hasMore ?? false,
      nextCursor: responseData.nextCursor
    };
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
   * Utility method to create common timeline events
   */
  static createQuoteEvent(
    type: TimelineEventType.QUOTE_CREATED | TimelineEventType.QUOTE_UPDATED | TimelineEventType.QUOTE_CONVERTED,
    quoteId: string,
    userId: string,
    userDisplayName: string,
    title: string,
    metadata?: Record<string, unknown>
  ): CreateTimelineEventRequestInput {
    return {
      type,
      title,
      relatedEntityId: quoteId,
      relatedEntityType: EntityType.QUOTE,
      metadata: {
        ...metadata,
        source: 'quote_management',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Utility method to create system events
   */
  static createSystemEvent(
    entityId: string,
    entityType: EntityType,
    title: string,
    description?: string,
    metadata?: Record<string, unknown>
  ): CreateTimelineEventRequestInput {
    return {
      type: TimelineEventType.SYSTEM_EVENT,
      title,
      description,
      relatedEntityId: entityId,
      relatedEntityType: entityType,
      metadata: {
        ...metadata,
        source: 'system',
        automated: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}