/**
 * Timeline Validation Schemas
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD001: Timeline API returns 404 errors
 * Addresses TD004: Validation schemas missing for API requests
 */

import { z } from 'zod';
import { EntityType, TimelineEventType } from '../types/timeline';

// Core TimelineEvent schema
export const TimelineEventSchema = z.object({
  id: z.string().uuid('Invalid timeline event ID format'),
  type: z.nativeEnum(TimelineEventType),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  timestamp: z.coerce.date(),
  userId: z.string().uuid('Invalid user ID format'),
  userDisplayName: z.string().min(1, 'User display name is required').max(100, 'User display name too long'),
  userAvatarUrl: z.string().url('Invalid avatar URL').optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  relatedEntityId: z.string().uuid('Invalid related entity ID format').optional(),
  relatedEntityType: z.nativeEnum(EntityType).optional()
});

// Timeline metadata schema with specific validations
export const TimelineEventMetadataSchema = z.object({
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1|::)$/, 'Invalid IP address').optional(),
  userAgent: z.string().max(500, 'User agent too long').optional(),
  source: z.string().max(50, 'Source too long').optional(),
  previousStatus: z.string().max(50, 'Previous status too long').optional(),
  newStatus: z.string().max(50, 'New status too long').optional(),
  changesSummary: z.array(z.string().max(200, 'Change summary item too long')).optional(),
  fileName: z.string().max(255, 'File name too long').optional(),
  fileSize: z.number().int().min(0, 'File size must be non-negative').optional(),
  fileType: z.string().max(50, 'File type too long').optional()
}).and(z.record(z.string(), z.unknown())); // Allow additional fields

// Timeline filters schema
export const TimelineFiltersSchema = z.object({
  eventTypes: z.array(z.nativeEnum(TimelineEventType)).optional(),
  userId: z.string().uuid('Invalid user ID format').optional(),
  dateRange: z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
  }).refine(
    (data) => data.start <= data.end,
    { message: 'Start date must be before or equal to end date' }
  ).optional(),
  entityId: z.string().uuid('Invalid entity ID format').optional(),
  entityType: z.nativeEnum(EntityType).optional()
});

// Timeline response schema
export const TimelineResponseSchema = z.object({
  events: z.array(TimelineEventSchema),
  totalCount: z.number().int().min(0, 'Total count must be non-negative'),
  hasMore: z.boolean(),
  nextCursor: z.string().optional()
});

// Timeline error schema
export const TimelineErrorSchema = z.object({
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.coerce.date()
});

// API request schemas
export const GetTimelineRequestSchema = z.object({
  entityId: z.string().uuid('Invalid entity ID format'),
  entityType: z.nativeEnum(EntityType),
  filters: TimelineFiltersSchema.optional(),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  cursor: z.string().optional()
});

export const CreateTimelineEventRequestSchema = z.object({
  type: z.nativeEnum(TimelineEventType),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  relatedEntityId: z.string().uuid('Invalid related entity ID format'),
  relatedEntityType: z.nativeEnum(EntityType),
  metadata: TimelineEventMetadataSchema.optional()
});

// Type exports for use in components and services
export type TimelineEventInput = z.infer<typeof TimelineEventSchema>;
export type TimelineFiltersInput = z.infer<typeof TimelineFiltersSchema>;
export type TimelineResponseInput = z.infer<typeof TimelineResponseSchema>;
export type GetTimelineRequestInput = z.infer<typeof GetTimelineRequestSchema>;
export type CreateTimelineEventRequestInput = z.infer<typeof CreateTimelineEventRequestSchema>;

// Validation helper functions
export const validateTimelineEvent = (data: unknown) => {
  return TimelineEventSchema.safeParse(data);
};

export const validateTimelineFilters = (data: unknown) => {
  return TimelineFiltersSchema.safeParse(data);
};

export const validateGetTimelineRequest = (data: unknown) => {
  return GetTimelineRequestSchema.safeParse(data);
};

export const validateCreateTimelineEventRequest = (data: unknown) => {
  return CreateTimelineEventRequestSchema.safeParse(data);
};