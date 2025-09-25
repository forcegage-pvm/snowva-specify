import type { AllocationAuditEvent } from '@/features/finance/components/PaymentAllocationPanel';
import type { InvoiceMutationTimelineEvent } from '@/features/sales/api/useQuoteToInvoiceMutation';
import {
    mergeDocumentTimelineEvents,
    transformBranchAuditTrailEvents,
    transformInvoiceMutationTimelineEvents,
    transformPaymentAllocationAuditEvents,
    transformStatementEmailHistory,
    transformStatementExportEvent,
} from '@/features/shared/utils/eventTransformers';

describe('eventTransformers', () => {
  describe('transformBranchAuditTrailEvents', () => {
    it('normalizes branch audit trail messages into document timeline events with derived types', () => {
      const events = [
        {
          id: 'evt-branch-001-001',
          actor: 'Farah Daniels',
          actorRole: 'Account Manager',
          message: 'Generated monthly statement for November',
          occurredAt: '2023-12-01T06:00:00.000Z',
        },
        {
          id: 'evt-branch-001-002',
          actor: 'Michael Jacobs',
          actorRole: 'Credit Controller',
          message: 'Issued payment reminder for overdue invoices',
          occurredAt: '2023-12-12T14:20:00.000Z',
        },
      ];

      const timeline = transformBranchAuditTrailEvents(events, { branchName: 'Tokai' });

      expect(timeline).toHaveLength(2);
      expect(timeline[0]).toMatchObject({
        eventId: 'evt-branch-001-002',
        eventType: 'reminder',
        actor: 'Michael Jacobs',
        summary: 'Issued payment reminder for overdue invoices',
        details: 'Role: Credit Controller',
      });
      expect(timeline[1]).toMatchObject({
        eventId: 'evt-branch-001-001',
        eventType: 'generated',
        actor: 'Farah Daniels',
        summary: 'Generated monthly statement for November',
      });
    });
  });

  describe('transformInvoiceMutationTimelineEvents', () => {
    it('applies invoice timeline metadata and preserves event order', () => {
      const events: InvoiceMutationTimelineEvent[] = [
        {
          eventId: 'evt-1',
          timestamp: '2024-09-01T08:00:00Z',
          type: 'created',
          actor: 'Melissa Jacobs',
          summary: 'Invoice draft generated from quote INV-2024-0001',
        },
        {
          eventId: 'evt-2',
          timestamp: '2024-09-02T10:30:00Z',
          type: 'finalized',
          actor: 'David Singh',
          summary: 'Invoice finalized and emailed to customer',
        },
      ];

      const timeline = transformInvoiceMutationTimelineEvents(events);

      expect(timeline).toHaveLength(2);
      expect(timeline[0].eventType).toBe('finalized');
      expect(timeline[0].actor).toBe('David Singh');
      expect(timeline[1].eventType).toBe('created');
    });
  });

  describe('transformPaymentAllocationAuditEvents', () => {
    it('maps allocation audit events to timeline entries with details', () => {
      const events: AllocationAuditEvent[] = [
        {
          eventId: 'audit_alloc_02',
          timestamp: '2025-01-08T09:37:00Z',
          actor: 'Lerato Nkosi',
          action: 'Manual overrides captured',
          details: 'TOKAI-102: ZAR 150000.00',
        },
        {
          eventId: 'audit_alloc_03',
          timestamp: '2025-01-08T09:45:00Z',
          actor: 'Finance Automation',
          action: 'Allocation committed',
          details: 'R1,540,000 applied with R460,000 remaining.',
        },
      ];

      const timeline = transformPaymentAllocationAuditEvents(events, { documentLabel: 'Payment PAY-2025-01-020' });

      expect(timeline).toHaveLength(2);
      expect(timeline[0]).toMatchObject({
        eventId: 'audit_alloc_03',
        eventType: 'allocation',
        actor: 'Finance Automation',
        summary: 'Allocation committed',
        details: 'R1,540,000 applied with R460,000 remaining.',
      });
      expect(timeline[1]).toMatchObject({
        eventId: 'audit_alloc_02',
        eventType: 'override',
        details: 'TOKAI-102: ZAR 150000.00',
      });
    });
  });

  describe('statement-related transformers', () => {
    it('generates timeline events for statement email history and exports', () => {
      const emails = [
        {
          id: 'email_01',
          sentAt: '2024-12-20T08:05:00Z',
          status: 'Delivered',
          recipients: ['finance@sportsmans.co.za'],
        },
      ];

      const emailTimeline = transformStatementEmailHistory(emails, {
        documentLabel: 'Statement Dec 2024',
      });

      expect(emailTimeline).toHaveLength(1);
      expect(emailTimeline[0]).toMatchObject({
        eventId: 'email_01',
        eventType: 'email-delivered',
        summary: 'Statement Dec 2024 email delivered',
        details: 'Recipients: finance@sportsmans.co.za',
      });

      const exportTimeline = transformStatementExportEvent({
        generatedAt: '2024-12-20T08:00:00Z',
        url: 'https://cdn.snowva.com/statements/stm_sportsmans_2024_12.pdf',
      }, {
        documentLabel: 'Statement Dec 2024',
      });

      expect(exportTimeline).toHaveLength(1);
      expect(exportTimeline[0]).toMatchObject({
        eventType: 'exported',
        summary: 'Statement Dec 2024 PDF generated',
      });
    });
  });

  describe('mergeDocumentTimelineEvents', () => {
    it('deduplicates by event id and sorts descending by timestamp', () => {
      const branchEvents = transformBranchAuditTrailEvents([
        {
          id: 'evt-branch-001-001',
          actor: 'System',
          actorRole: 'Automation',
          message: 'Generated monthly statement for December',
          occurredAt: '2023-12-05T05:55:00.000Z',
        },
      ]);

      const invoiceEvents = transformInvoiceMutationTimelineEvents([
        {
          eventId: 'evt-branch-001-001',
          timestamp: '2024-01-02T07:00:00Z',
          type: 'note',
          actor: 'Automation',
          summary: 'Placeholder note',
        },
      ]);

      const merged = mergeDocumentTimelineEvents(branchEvents, invoiceEvents);

      expect(merged).toHaveLength(1);
      expect(merged[0]).toMatchObject({
        eventId: 'evt-branch-001-001',
        eventType: 'note',
        summary: 'Placeholder note',
      });
    });
  });
});
