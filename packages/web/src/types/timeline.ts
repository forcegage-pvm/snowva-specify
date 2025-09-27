/**
 * Timeline Event Types
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD001: Timeline API returns 404 errors
 * Addresses TD002: Error handling not comprehensive
 */

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: Date;
  userId: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  metadata?: TimelineEventMetadata;
  relatedEntityId?: string;
  relatedEntityType?: EntityType;
}

export enum TimelineEventType {
  QUOTE_CREATED = 'quote_created',
  QUOTE_UPDATED = 'quote_updated',
  QUOTE_CONVERTED = 'quote_converted',
  QUOTE_SENT = 'quote_sent',
  QUOTE_ACCEPTED = 'quote_accepted',
  QUOTE_REJECTED = 'quote_rejected',
  COMMENT_ADDED = 'comment_added',
  FILE_UPLOADED = 'file_uploaded',
  STATUS_CHANGED = 'status_changed',
  SYSTEM_EVENT = 'system_event'
}

export enum EntityType {
  QUOTE = 'quote',
  INVOICE = 'invoice',
  CUSTOMER = 'customer',
  PRODUCT = 'product',
  DOCUMENT = 'document'
}

export interface TimelineEventMetadata {
  [key: string]: unknown;
  // Common metadata fields
  ipAddress?: string;
  userAgent?: string;
  source?: string;
  // Quote-specific metadata
  previousStatus?: string;
  newStatus?: string;
  changesSummary?: string[];
  // File metadata
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface TimelineFilters {
  eventTypes?: TimelineEventType[];
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  entityId?: string;
  entityType?: EntityType;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface TimelineError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}