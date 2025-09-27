/**
 * Timeline Service Integration
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD006: Service layer not properly integrated with API routes
 * Connects TimelineService with API routes for basic functionality
 */

import { handleApiError } from '@/middleware/error-handler';
import { TimelineService } from '@/services/timeline-service';
import { EntityType, TimelineEventType } from '@/types/timeline';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Timeline service integration class
 */
export class TimelineServiceIntegration {
  private timelineService: TimelineService;

  constructor() {
    this.timelineService = new TimelineService();
  }

  /**
   * Get timeline for entity
   */
  async getTimeline(
    request: NextRequest,
    entityType: EntityType,
    entityId: string,
    limit: number = 20
  ): Promise<NextResponse> {
    try {
      const result = await this.timelineService.getTimeline({
        entityType,
        entityId,
        limit,
      });

      return NextResponse.json({
        data: result,
        success: true,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      return handleApiError(error, request, {
        service: 'timeline',
        operation: 'getTimeline',
        entityType,
        entityId,
      });
    }
  }

  /**
   * Create timeline event
   */
  async createEvent(
    request: NextRequest,
    eventData: {
      type: TimelineEventType;
      title: string;
      description?: string;
      userId: string;
      userDisplayName: string;
      entityType: EntityType;
      entityId: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<NextResponse> {
    try {
      const result = await this.timelineService.createEvent({
        type: eventData.type,
        title: eventData.title,
        description: eventData.description,
        relatedEntityType: eventData.entityType,
        relatedEntityId: eventData.entityId,
        metadata: eventData.metadata,
      });

      return NextResponse.json({
        data: result,
        success: true,
        meta: {
          created: true,
          timestamp: new Date().toISOString(),
        },
      }, { status: 201 });
    } catch (error) {
      return handleApiError(error, request, {
        service: 'timeline',
        operation: 'createEvent',
        eventData,
      });
    }
  }
}

/**
 * Default timeline service integration instance
 */
export const defaultTimelineIntegration = new TimelineServiceIntegration();

/**
 * Timeline API handlers
 */
export const TimelineHandlers = {
  /**
   * GET /api/v1/timeline/{entityType}/{entityId}
   */
  getTimeline: async (
    request: NextRequest, 
    { params }: { params: { entityType: string; entityId: string } }
  ) => {
    const { entityType, entityId } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    return defaultTimelineIntegration.getTimeline(
      request,
      entityType as EntityType,
      entityId,
      limit
    );
  },

  /**
   * POST /api/v1/timeline/events
   */
  createEvent: async (request: NextRequest) => {
    try {
      const eventData = await request.json();
      return defaultTimelineIntegration.createEvent(request, eventData);
    } catch (error) {
      return handleApiError(error, request, {
        operation: 'createEvent',
        error: 'Invalid JSON body',
      });
    }
  },
};

/**
 * Create custom timeline integration
 */
export function createTimelineIntegration(): TimelineServiceIntegration {
  return new TimelineServiceIntegration();
}