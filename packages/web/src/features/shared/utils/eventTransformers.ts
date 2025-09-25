import type { BranchAuditTrailEvent } from '@/features/customers/api/useBranchDetailQuery';
import type { AllocationAuditEvent } from '@/features/finance/components/PaymentAllocationPanel';
import type { InvoiceMutationTimelineEvent } from '@/features/sales/api/useQuoteToInvoiceMutation';
import type { InvoiceTimelineEvent } from '@/features/sales/components/InvoiceWorkspace';
import type { DocumentTimelineEvent } from '@/features/shared/components/DocumentTimeline';

const KEYWORD_EVENT_TYPES: Array<{ eventType: string; pattern: RegExp }> = [
  { eventType: 'finalized', pattern: /(finali[sz]ed|locked|finalise|finalize)/i },
  { eventType: 'reminder', pattern: /(reminder|follow[-\s]?up|followup|queued)/i },
  { eventType: 'email', pattern: /(email|emailed|sent|delivery|recipient)/i },
  { eventType: 'allocation', pattern: /(allocation|allocated|allocating|committed|commit)/i },
  { eventType: 'override', pattern: /(override|overridden)/i },
  { eventType: 'payment', pattern: /(payment|paid|settlement|receipt)/i },
  { eventType: 'generated', pattern: /(generated|generate|auto-created|auto generated)/i },
  { eventType: 'created', pattern: /(created|create|captured|draft)/i },
  { eventType: 'updated', pattern: /(updated|update|edited|edit|change|changed|modified|amended|adjusted)/i },
  { eventType: 'recommendation', pattern: /(recommendation|recommend|suggest)/i },
  { eventType: 'note', pattern: /(note|comment)/i },
  { eventType: 'exported', pattern: /(download|export|pdf)/i },
  { eventType: 'approval', pattern: /(approve|approval|authori[sz]e|authori[sz]ed)/i },
  { eventType: 'warning', pattern: /(warning|alert|caution)/i },
  { eventType: 'cancelled', pattern: /(cancel|cancelled|void|voided)/i },
];

const slugify = (input?: string | null): string | null => {
  if (!input) {
    return null;
  }

  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const slug = trimmed
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  return slug || null;
};

const deriveEventType = (
  rawType: string | null | undefined,
  ...candidates: Array<string | null | undefined>
): string => {
  const normalizedRaw = slugify(rawType);
  if (normalizedRaw) {
    return normalizedRaw;
  }

  const allCandidates = [rawType, ...candidates];

  for (const candidate of allCandidates) {
    if (!candidate) {
      continue;
    }

    for (const { eventType, pattern } of KEYWORD_EVENT_TYPES) {
      if (pattern.test(candidate)) {
        return eventType;
      }
    }
  }

  for (const candidate of allCandidates) {
    const slug = slugify(candidate);
    if (slug) {
      return slug;
    }
  }

  return 'activity';
};

const toIsoTimestamp = (value?: string | number | Date | null): string => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date().toISOString() : value.toISOString();
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  return new Date().toISOString();
};

const coerceActor = (actor?: string | null): string => {
  const normalized = actor?.trim();
  return normalized && normalized.length > 0 ? normalized : 'System';
};

const coerceSummary = (summary: string | null | undefined, fallback: string): string => {
  const normalized = summary?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
};

const joinDetails = (parts: Array<string | null | undefined>): string | undefined => {
  const normalized = parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part && part.length > 0));
  if (normalized.length === 0) {
    return undefined;
  }

  return normalized.join(' • ');
};

type StatementEmailHistoryItem = {
  id: string;
  sentAt: string;
  status: string;
  recipients?: string[] | null;
  actor?: string | null;
};

type StatementPdfExportMetadata = {
  generatedAt: string;
  url?: string | null;
  actor?: string | null;
};

const sortTimelineEvents = (events: DocumentTimelineEvent[]): DocumentTimelineEvent[] =>
  [...events].sort((left, right) => {
    const leftTime = Date.parse(left.timestamp);
    const rightTime = Date.parse(right.timestamp);

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
      return left.summary.localeCompare(right.summary);
    }

    if (Number.isNaN(leftTime)) {
      return 1;
    }

    if (Number.isNaN(rightTime)) {
      return -1;
    }

    return rightTime - leftTime;
  });

export const transformBranchAuditTrailEvents = (
  events?: BranchAuditTrailEvent[] | null,
  options?: { branchName?: string }
): DocumentTimelineEvent[] => {
  if (!events?.length) {
    return [];
  }

  return sortTimelineEvents(
    events.map((event, index) => {
      const eventType = deriveEventType(undefined, event.message, event.actorRole);
      const summary = coerceSummary(
        event.message,
        options?.branchName ? `${options.branchName} branch activity` : 'Branch activity recorded',
      );
      const details = joinDetails([
        event.actorRole ? `Role: ${event.actorRole}` : null,
      ]);

      return {
        eventId: event.id || `branch-event-${index}`,
        timestamp: toIsoTimestamp(event.occurredAt),
        eventType,
        actor: coerceActor(event.actor),
        summary,
        details,
      } satisfies DocumentTimelineEvent;
    }),
  );
};

export const transformInvoiceTimelineEvents = (
  events?: InvoiceTimelineEvent[] | null,
  options?: { defaultSummary?: string }
): DocumentTimelineEvent[] => {
  if (!events?.length) {
    return [];
  }

  return sortTimelineEvents(
    events.map((event, index) => ({
      eventId: event.eventId || `invoice-event-${index}`,
      timestamp: toIsoTimestamp(event.timestamp),
      eventType: deriveEventType(event.type, event.summary),
      actor: coerceActor(event.actor),
      summary: coerceSummary(event.summary, options?.defaultSummary ?? 'Invoice activity recorded'),
      details: undefined,
    } satisfies DocumentTimelineEvent)),
  );
};

export const transformInvoiceMutationTimelineEvents = (
  events?: InvoiceMutationTimelineEvent[] | null,
  options?: { defaultSummary?: string }
): DocumentTimelineEvent[] => {
  if (!events?.length) {
    return [];
  }

  return transformInvoiceTimelineEvents(
    events.map((event) => ({
      eventId: event.eventId,
      timestamp: event.timestamp,
      type: event.type,
      actor: event.actor,
      summary: event.summary,
    })),
    options,
  );
};

export const transformPaymentAllocationAuditEvents = (
  events?: AllocationAuditEvent[] | null,
  options?: { documentLabel?: string }
): DocumentTimelineEvent[] => {
  if (!events?.length) {
    return [];
  }

  return sortTimelineEvents(
    events.map((event, index) => ({
      eventId: event.eventId || `allocation-event-${index}`,
      timestamp: toIsoTimestamp(event.timestamp),
      eventType: deriveEventType(undefined, event.action, event.details),
      actor: coerceActor(event.actor),
      summary: coerceSummary(
        event.action,
        options?.documentLabel ? `${options.documentLabel} allocation activity` : 'Payment allocation activity',
      ),
      details: joinDetails([event.details]),
    } satisfies DocumentTimelineEvent)),
  );
};

export const transformStatementEmailHistory = (
  emails?: StatementEmailHistoryItem[] | null,
  options?: { documentLabel?: string; actor?: string | null }
): DocumentTimelineEvent[] => {
  if (!emails?.length) {
    return [];
  }

  const documentLabel = options?.documentLabel ?? 'Statement';

  return sortTimelineEvents(
    emails.map((email, index) => {
      const statusSlug = slugify(email.status) ?? 'sent';
      const eventType = deriveEventType(`email-${statusSlug}`, email.status);
      const recipients = email.recipients?.length ? `Recipients: ${email.recipients.join(', ')}` : null;
      const summary = `${documentLabel} email ${email.status.toLowerCase()}`;

      return {
        eventId: email.id || `statement-email-${index}`,
        timestamp: toIsoTimestamp(email.sentAt),
        eventType,
        actor: coerceActor(email.actor ?? options?.actor ?? 'Automation'),
        summary,
        details: joinDetails([recipients]),
      } satisfies DocumentTimelineEvent;
    }),
  );
};

export const transformStatementExportEvent = (
  exportMetadata?: StatementPdfExportMetadata | null,
  options?: { documentLabel?: string; actor?: string | null }
): DocumentTimelineEvent[] => {
  if (!exportMetadata) {
    return [];
  }

  const documentLabel = options?.documentLabel ?? 'Statement';
  const details = exportMetadata.url ? `Download: ${exportMetadata.url}` : undefined;

  return [
    {
      eventId: `${documentLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-export-${exportMetadata.generatedAt}`,
      timestamp: toIsoTimestamp(exportMetadata.generatedAt),
      eventType: deriveEventType('exported', details, documentLabel),
      actor: coerceActor(exportMetadata.actor ?? options?.actor ?? 'Automation'),
      summary: `${documentLabel} PDF generated`,
      details,
    } satisfies DocumentTimelineEvent,
  ];
};

export const mergeDocumentTimelineEvents = (
  ...groups: Array<DocumentTimelineEvent[] | null | undefined>
): DocumentTimelineEvent[] => {
  const flattened = groups.flatMap((group) => group ?? []);

  if (flattened.length === 0) {
    return [];
  }

  const byEventId = new Map<string, DocumentTimelineEvent>();

  flattened.forEach((event) => {
    if (!byEventId.has(event.eventId)) {
      byEventId.set(event.eventId, event);
      return;
    }

    const existing = byEventId.get(event.eventId)!;
    if (Date.parse(event.timestamp) > Date.parse(existing.timestamp)) {
      byEventId.set(event.eventId, event);
    }
  });

  return sortTimelineEvents(Array.from(byEventId.values()));
};
