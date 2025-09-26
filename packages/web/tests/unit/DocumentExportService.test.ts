import * as AuditTrailService from '@/services/AuditTrailService';
import {
    generateShareLink,
    getDocumentAuditTrail,
    getDocumentExport,
    listDocumentExports,
    resendDocumentExport,
} from '@/services/DocumentExportService';

jest.mock('@/services/AuditTrailService');

const mockedAuditTrail = jest.mocked(AuditTrailService);

describe('DocumentExportService', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('listDocumentExports', () => {
    it('filters exports based on search term and status filters', async () => {
      const result = await listDocumentExports({
        page: 1,
        pageSize: 25,
        sort: 'createdAt',
        search: 'invoice',
        filters: {
          statuses: ['failed'],
          documentTypes: ['invoice'],
        },
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((item) => {
        expect(item.title.toLowerCase()).toContain('invoice');
        expect(item.status).toBe('failed');
      });
      expect(result.total).toBeGreaterThan(0);
    });

    it('returns virtualization hint when result set exceeds threshold', async () => {
      const result = await listDocumentExports({
        page: 1,
        pageSize: 100,
      });

      expect(result).toHaveProperty('virtualization');
      expect(result.virtualization).toBeDefined();
      expect(result.virtualization!.threshold).toBeGreaterThanOrEqual(100);
    });
  });

  describe('generateShareLink', () => {
    it('creates a new share link with 30-day expiry and audit logging', async () => {
      const now = new Date('2025-08-22T06:10:05Z');
      jest.useFakeTimers().setSystemTime(now);

    const response = await generateShareLink('exp_invoice_2025_08_014');

      expect(response).toHaveProperty('token');
    const expiresAt = new Date(response.expiresAt);
      const diff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.round(diff)).toBe(30);
      expect(mockedAuditTrail.appendDocumentEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          exportId: 'exp_invoice_2025_08_014',
          action: 'share_link_regenerated',
        })
      );
    });
  });

  describe('resendDocumentExport', () => {
    it('transitions status and logs audit event on resend', async () => {
    const response = await resendDocumentExport('exp_invoice_2025_08_014');

      expect(response).toHaveProperty('status');
      expect(response.status).toBe('sent');
      expect(mockedAuditTrail.appendDocumentEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          exportId: 'exp_invoice_2025_08_014',
          action: 'resent',
        })
      );
    });
  });

  describe('getDocumentExport', () => {
    it('returns detailed export record with audit timeline', async () => {
    const record = await getDocumentExport('exp_stmt_2025_09_001');

      expect(record).toHaveProperty('auditTrail');
    expect(record.auditTrail.length).toBeGreaterThan(0);
    expect(record.preview.assetUrl).toMatch(/exp_stmt_2025_09_001/);
    });
  });

  describe('getDocumentAuditTrail', () => {
    it('paginates audit events in chronological order', async () => {
      const result = await getDocumentAuditTrail('exp_stmt_2025_09_001');

      expect(result).toHaveProperty('items');
      const timestamps = result.items.map((event) =>
        new Date(event.timestamp).getTime()
      );
      const sorted = [...timestamps].sort((a, b) => a - b);
      expect(timestamps).toEqual(sorted);
    });
  });
});
