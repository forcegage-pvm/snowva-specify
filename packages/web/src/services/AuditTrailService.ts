import { recordNavigationMetric } from '@/lib/metrics/performanceMetrics';

export type DocumentAuditEventPayload = {
  exportId: string;
  action:
    | 'previewed'
    | 'downloaded'
    | 'resent'
    | 'regenerated'
    | 'share_link_copied'
    | 'share_link_accessed'
    | 'sent'
    | 'failed'
    | 'queued';
  timestamp: string;
  context?: Record<string, unknown>;
};

const DOCUMENT_EVENT_THRESHOLDS: Record<DocumentAuditEventPayload['action'], number> = {
  previewed: 500,
  downloaded: 500,
  resent: 800,
  regenerated: 600,
  share_link_copied: 300,
  share_link_accessed: 300,
  sent: 700,
  failed: 700,
  queued: 500,
};

const documentEventLog: DocumentAuditEventPayload[] = [];

const clonePayload = (payload: DocumentAuditEventPayload): DocumentAuditEventPayload => ({
  ...payload,
  context: payload.context ? { ...payload.context } : undefined,
});

const emitPerformanceMetric = (payload: DocumentAuditEventPayload) => {
  const thresholdMs = DOCUMENT_EVENT_THRESHOLDS[payload.action] ?? 500;
  const eventTimestamp = new Date(payload.timestamp).getTime();
  const durationMs = Math.max(0, Date.now() - eventTimestamp);

  recordNavigationMetric({
    name: `documents:${payload.action}`,
    durationMs,
    thresholdMs,
    metadata: {
      exportId: payload.exportId,
      ...payload.context,
    },
  });
};

export async function appendDocumentEvent(payload: DocumentAuditEventPayload): Promise<void> {
  documentEventLog.unshift(clonePayload(payload));

  try {
    emitPerformanceMetric(payload);
  } catch (error) {
    console.error('[AuditTrailService] failed to emit performance metric', error);
  }
}

export function getDocumentEventLog(): DocumentAuditEventPayload[] {
  return documentEventLog.map(clonePayload);
}
