/**
 * Audit Service for Quote Operations
 * Comprehensive audit logging for all quote-related business operations
 *
 * Constitutional Compliance: LEVEL 4 - Business Logic Implementation
 * Evidence: Audit service implementation with comprehensive event tracking
 * Test Coverage: Unit tests required for all public methods
 */

import { z } from "zod";

// Audit Event Types
export type QuoteAuditEventType =
  | "quote:created"
  | "quote:updated"
  | "quote:deleted"
  | "quote:archived"
  | "quote:status_changed"
  | "quote:duplicated"
  | "quote:converted"
  | "quote:exported"
  | "quote:bulk_operation"
  | "quote:validation_failed"
  | "quote:access_denied"
  | "quote:system_error";

// Audit Event Payload Schema
export const AuditEventSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.enum([
    "quote:created",
    "quote:updated",
    "quote:deleted",
    "quote:archived",
    "quote:status_changed",
    "quote:duplicated",
    "quote:converted",
    "quote:exported",
    "quote:bulk_operation",
    "quote:validation_failed",
    "quote:access_denied",
    "quote:system_error",
  ]),
  quoteId: z.string().min(1),
  userId: z.string().min(1),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  changes: z
    .record(
      z.string(),
      z.object({
        before: z.unknown().optional(),
        after: z.unknown().optional(),
      })
    )
    .optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
      stack: z.string().optional(),
    })
    .optional(),
  sessionId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

// Service Error Class
export class AuditServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AuditServiceError";
  }
}

// Audit Service Implementation
export class AuditService {
  private auditLog: AuditEvent[] = [];
  private readonly maxLogSize = 10000; // Prevent memory issues

  /**
   * Log a quote operation event
   */
  async logQuoteEvent(
    eventType: QuoteAuditEventType,
    quoteId: string,
    userId: string,
    metadata?: Record<string, unknown>,
    changes?: Record<string, { before?: unknown; after?: unknown }>,
    error?: { message: string; code: string; stack?: string }
  ): Promise<void> {
    try {
      const auditEvent: AuditEvent = {
        eventId: this.generateEventId(),
        eventType,
        quoteId,
        userId,
        timestamp: new Date().toISOString(),
        metadata,
        changes,
        error,
        sessionId: this.getCurrentSessionId(),
        ipAddress: this.getCurrentIpAddress(),
        userAgent: this.getCurrentUserAgent(),
      };

      // Validate event data
      const validatedEvent = AuditEventSchema.parse(auditEvent);

      // Store in memory log (in production, this would go to database/external service)
      this.auditLog.unshift(validatedEvent);

      // Maintain log size
      if (this.auditLog.length > this.maxLogSize) {
        this.auditLog = this.auditLog.slice(0, this.maxLogSize);
      }

      // In production, would also send to external audit service
      await this.persistToExternalService(validatedEvent);
    } catch (error) {
      console.error("[AuditService] Failed to log quote event:", error);
      throw new AuditServiceError(
        `Failed to log audit event: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "LOG_EVENT_ERROR"
      );
    }
  }

  /**
   * Log quote creation
   */
  async logQuoteCreated(
    quoteId: string,
    userId: string,
    quoteData: Record<string, unknown>
  ): Promise<void> {
    await this.logQuoteEvent("quote:created", quoteId, userId, {
      quoteNumber: quoteData.quoteNumber,
      customerName: quoteData.customerName,
      totalAmount: quoteData.totalAmount,
      itemCount: Array.isArray(quoteData.items) ? quoteData.items.length : 0,
    });
  }

  /**
   * Log quote update with change tracking
   */
  async logQuoteUpdated(
    quoteId: string,
    userId: string,
    beforeData: Record<string, unknown>,
    afterData: Record<string, unknown>
  ): Promise<void> {
    const changes = this.calculateChanges(beforeData, afterData);

    await this.logQuoteEvent(
      "quote:updated",
      quoteId,
      userId,
      {
        changeCount: Object.keys(changes).length,
        updatedFields: Object.keys(changes),
      },
      changes
    );
  }

  /**
   * Log quote status change
   */
  async logQuoteStatusChanged(
    quoteId: string,
    userId: string,
    oldStatus: string,
    newStatus: string,
    reason?: string
  ): Promise<void> {
    await this.logQuoteEvent(
      "quote:status_changed",
      quoteId,
      userId,
      {
        reason,
        statusTransition: `${oldStatus} → ${newStatus}`,
      },
      {
        status: {
          before: oldStatus,
          after: newStatus,
        },
      }
    );
  }

  /**
   * Log quote duplication
   */
  async logQuoteDuplicated(
    originalQuoteId: string,
    newQuoteId: string,
    userId: string
  ): Promise<void> {
    await this.logQuoteEvent("quote:duplicated", newQuoteId, userId, {
      originalQuoteId,
      operation: "duplicate",
    });
  }

  /**
   * Log quote conversion
   */
  async logQuoteConverted(
    quoteId: string,
    userId: string,
    targetType: string,
    targetId: string
  ): Promise<void> {
    await this.logQuoteEvent("quote:converted", quoteId, userId, {
      targetType,
      targetId,
      operation: "convert",
    });
  }

  /**
   * Log bulk operation
   */
  async logBulkOperation(
    operation: string,
    quoteIds: string[],
    userId: string,
    results: { success: string[]; failed: string[] }
  ): Promise<void> {
    // Log a single event for the bulk operation
    await this.logQuoteEvent(
      "quote:bulk_operation",
      "bulk-" + this.generateEventId().slice(0, 8),
      userId,
      {
        operation,
        totalQuotes: quoteIds.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        quoteIds: quoteIds,
        successfulQuotes: results.success,
        failedQuotes: results.failed,
      }
    );
  }

  /**
   * Log quote export
   */
  async logQuoteExported(
    quoteIds: string[],
    userId: string,
    format: string,
    filename?: string
  ): Promise<void> {
    await this.logQuoteEvent(
      "quote:exported",
      quoteIds.length === 1
        ? quoteIds[0]
        : "multi-" + this.generateEventId().slice(0, 8),
      userId,
      {
        format,
        filename,
        quoteCount: quoteIds.length,
        exportedQuotes: quoteIds,
      }
    );
  }

  /**
   * Log system error
   */
  async logSystemError(
    quoteId: string,
    userId: string,
    error: Error,
    operation: string
  ): Promise<void> {
    await this.logQuoteEvent(
      "quote:system_error",
      quoteId,
      userId,
      {
        operation,
        errorName: error.name,
      },
      undefined,
      {
        message: error.message,
        code: "SYSTEM_ERROR",
        stack: error.stack,
      }
    );
  }

  /**
   * Get audit trail for a specific quote
   */
  async getQuoteAuditTrail(quoteId: string): Promise<AuditEvent[]> {
    return this.auditLog
      .filter(
        (event) =>
          event.quoteId === quoteId ||
          (event.metadata?.quoteIds as string[])?.includes(quoteId) ||
          (event.metadata?.exportedQuotes as string[])?.includes(quoteId) ||
          event.metadata?.originalQuoteId === quoteId
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  /**
   * Get audit trail for a specific user
   */
  async getUserAuditTrail(userId: string, limit = 100): Promise<AuditEvent[]> {
    return this.auditLog
      .filter((event) => event.userId === userId)
      .slice(0, limit)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  /**
   * Get audit events by type
   */
  async getAuditEventsByType(
    eventType: QuoteAuditEventType,
    limit = 100
  ): Promise<AuditEvent[]> {
    return this.auditLog
      .filter((event) => event.eventType === eventType)
      .slice(0, limit)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  /**
   * Get recent audit events
   */
  async getRecentAuditEvents(limit = 50): Promise<AuditEvent[]> {
    return this.auditLog
      .slice(0, limit)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  /**
   * Search audit events
   */
  async searchAuditEvents(
    filters: {
      quoteId?: string;
      userId?: string;
      eventType?: QuoteAuditEventType;
      startDate?: string;
      endDate?: string;
    },
    limit = 100
  ): Promise<AuditEvent[]> {
    let filteredEvents = this.auditLog;

    if (filters.quoteId) {
      filteredEvents = filteredEvents.filter(
        (event) => event.quoteId === filters.quoteId
      );
    }

    if (filters.userId) {
      filteredEvents = filteredEvents.filter(
        (event) => event.userId === filters.userId
      );
    }

    if (filters.eventType) {
      filteredEvents = filteredEvents.filter(
        (event) => event.eventType === filters.eventType
      );
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.timestamp) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.timestamp) <= endDate
      );
    }

    return filteredEvents
      .slice(0, limit)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentActivity: AuditEvent[];
    topUsers: Array<{ userId: string; eventCount: number }>;
  }> {
    const eventsByType: Record<string, number> = {};
    const userEventCounts: Record<string, number> = {};

    this.auditLog.forEach((event) => {
      // Count by event type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

      // Count by user
      userEventCounts[event.userId] = (userEventCounts[event.userId] || 0) + 1;
    });

    const topUsers = Object.entries(userEventCounts)
      .map(([userId, eventCount]) => ({ userId, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    return {
      totalEvents: this.auditLog.length,
      eventsByType,
      recentActivity: await this.getRecentAuditEvents(10),
      topUsers,
    };
  }

  // Private utility methods
  private generateEventId(): string {
    return (
      "evt_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
    );
  }

  private getCurrentSessionId(): string {
    // In a real app, this would come from session management
    return "session_" + Date.now().toString(36);
  }

  private getCurrentIpAddress(): string {
    // In a real app, this would come from request context
    return "127.0.0.1";
  }

  private getCurrentUserAgent(): string {
    // In a real app, this would come from request headers
    return typeof window !== "undefined"
      ? window.navigator.userAgent
      : "Server";
  }

  private calculateChanges(
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Record<string, { before?: unknown; after?: unknown }> {
    const changes: Record<string, { before?: unknown; after?: unknown }> = {};

    // Find changed and added fields
    Object.keys(after).forEach((key) => {
      if (before[key] !== after[key]) {
        changes[key] = {
          before: before[key],
          after: after[key],
        };
      }
    });

    // Find removed fields
    Object.keys(before).forEach((key) => {
      if (!(key in after)) {
        changes[key] = {
          before: before[key],
          after: undefined,
        };
      }
    });

    return changes;
  }

  private async persistToExternalService(event: AuditEvent): Promise<void> {
    // Production implementation would integrate with external audit services
    // Examples: DataDog, Splunk, CloudWatch, etc.

    // Simulate external service call with proper error handling
    try {
      // In development/testing, we validate the event structure
      if (!event.eventType || !event.timestamp || !event.userId) {
        throw new Error(
          "Invalid audit event structure for external persistence"
        );
      }

      // External service integration point
      // await externalAuditService.sendEvent(event);

      // For now, we successfully "persist" by validating the event
      return Promise.resolve();
    } catch (error) {
      // Log to application logger instead of console
      // In production: await logger.error('Audit persistence failed', { error, event });
      throw new Error(
        `External audit service persistence failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Export singleton instance
export const auditService = new AuditService();
