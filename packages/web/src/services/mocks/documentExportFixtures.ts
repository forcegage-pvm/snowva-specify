import type {
    AuditEvent,
    DocumentArchiveReference,
    DocumentExportChannel,
    DocumentExportRecord,
    DocumentExportStatus,
    DocumentExportType,
    ShareLinkToken,
} from '@/features/documents/types';

const FIXTURE_ANCHOR = new Date('2025-09-25T09:00:00Z');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const DOCUMENT_TYPES: DocumentExportType[] = ['statement', 'invoice', 'quote', 'compliance'];
const DOCUMENT_STATUSES: DocumentExportStatus[] = ['queued', 'sent', 'failed', 'expired'];
const CHANNEL_POOL: DocumentExportChannel[] = ['email', 'portal', 'manual'];

const toIso = (date: Date) => date.toISOString();

const daysAgo = (days: number) => new Date(FIXTURE_ANCHOR.getTime() - days * ONE_DAY_MS);

const buildShareLink = (
  exportId: string,
  createdAt: Date,
  copiedBy: string,
  accessEvents: ShareLinkToken['accessLog'] = []
): ShareLinkToken => {
  const createdIso = toIso(createdAt);
  const expiresIso = toIso(new Date(createdAt.getTime() + 30 * ONE_DAY_MS));

  return {
    id: `token_${exportId}`,
    exportId,
    createdAt: createdIso,
    expiresAt: expiresIso,
    lastAccessedAt: accessEvents[accessEvents.length - 1]?.timestamp ?? null,
    copiedBy,
    accessLog: accessEvents,
  };
};

const buildAuditEvent = (
  exportId: string,
  action: AuditEvent['action'],
  timestamp: Date,
  context: Record<string, unknown> = {}
): AuditEvent => ({
  id: `${exportId}_${action}_${timestamp.getTime()}`,
  exportId,
  timestamp: toIso(timestamp),
  actor: action === 'sent' ? 'system' : 'nadiya@snowva.com',
  action,
  context,
});

const baseArchiveReference = (
  exportId: string,
  createdAt: Date
): DocumentArchiveReference => ({
  exportId,
  archiveLocation: `cold://document-exports/${createdAt.getUTCFullYear()}/${String(
    createdAt.getUTCMonth() + 1
  ).padStart(2, '0')}/${exportId}`,
  requestedBy: null,
  requestedAt: null,
  status: 'pending',
  deliveryEtaDays: null,
});

const curatedExports: DocumentExportRecord[] = [
  {
    id: 'exp_stmt_2025_09_001',
    documentType: 'statement',
    title: 'September 2025 Statement',
    customerBranchId: 'branch_cpt_hq',
    customerBranchName: 'Cape Town HQ',
    createdAt: toIso(daysAgo(3)),
  deliveredChannels: ['email', 'portal'] as DocumentExportChannel[],
    status: 'sent',
    lastDownloadedAt: toIso(daysAgo(2)),
    fileSizeBytes: 325_671,
    preview: {
      assetUrl: '/mock/documents/exp_stmt_2025_09_001.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 325_671,
    },
    shareLinkTokenId: 'token_exp_stmt_2025_09_001',
    shareLink: buildShareLink('exp_stmt_2025_09_001', daysAgo(3), 'kira.maseko@snowva.com', [
      {
        timestamp: toIso(daysAgo(2)),
        ipAddress: '102.67.44.10',
        userAgent: 'Mozilla/5.0 (Macintosh)',
        success: true,
      },
    ]),
    auditTrail: [
      buildAuditEvent('exp_stmt_2025_09_001', 'sent', daysAgo(3), {
        channels: ['email', 'portal'],
        recipient: 'finance@capetownhq.co.za',
      }),
      buildAuditEvent('exp_stmt_2025_09_001', 'downloaded', daysAgo(2), {
        user: 'kira.maseko@snowva.com',
      }),
      buildAuditEvent('exp_stmt_2025_09_001', 'share_link_copied', daysAgo(2), {
        expiresAt: toIso(new Date(daysAgo(3).getTime() + 30 * ONE_DAY_MS)),
      }),
    ],
  },
  {
    id: 'exp_invoice_2025_08_014',
    documentType: 'invoice',
    title: 'Invoice 884210',
    customerBranchId: 'branch_dbn_port',
    customerBranchName: 'Durban Port',
    createdAt: toIso(daysAgo(35)),
  deliveredChannels: ['email'] as DocumentExportChannel[],
    status: 'failed',
    lastDownloadedAt: null,
    fileSizeBytes: 198_443,
    preview: {
      assetUrl: '/mock/documents/exp_invoice_2025_08_014.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 198_443,
    },
    shareLinkTokenId: null,
    shareLink: null,
    failureReason: 'Mailbox full',
    auditTrail: [
      buildAuditEvent('exp_invoice_2025_08_014', 'sent', daysAgo(35), {
        channels: ['email'],
        recipient: 'accounts@harbourline.co.za',
      }),
      buildAuditEvent('exp_invoice_2025_08_014', 'failed', daysAgo(35), {
        reason: 'Mailbox full',
      }),
    ],
  },
  {
    id: 'exp_quote_2025_07_031',
    documentType: 'quote',
    title: 'Quote Q-310725',
    customerBranchId: 'branch_jhb_east',
    customerBranchName: 'Johannesburg East',
    createdAt: toIso(daysAgo(72)),
  deliveredChannels: ['portal'] as DocumentExportChannel[],
    status: 'expired',
    lastDownloadedAt: toIso(daysAgo(39)),
    fileSizeBytes: 154_821,
    preview: {
      assetUrl: '/mock/documents/exp_quote_2025_07_031.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 154_821,
    },
    shareLinkTokenId: 'token_exp_quote_2025_07_031',
    shareLink: buildShareLink('exp_quote_2025_07_031', daysAgo(72), 'nomvula.khanye@snowva.com'),
    auditTrail: [
      buildAuditEvent('exp_quote_2025_07_031', 'sent', daysAgo(72), {
        channels: ['portal'],
      }),
      buildAuditEvent('exp_quote_2025_07_031', 'downloaded', daysAgo(39), {
        user: 'nomvula.khanye@snowva.com',
      }),
    ],
  },
  {
    id: 'exp_archive_2024_07_001',
    documentType: 'statement',
    title: 'July 2024 Statement',
    customerBranchId: 'branch_ct_archive',
    customerBranchName: 'Cape Town Archive',
    createdAt: toIso(daysAgo(447)),
  deliveredChannels: ['email', 'portal'] as DocumentExportChannel[],
    status: 'sent',
    lastDownloadedAt: toIso(daysAgo(445)),
    fileSizeBytes: 217_654,
    preview: {
      assetUrl: '/mock/documents/exp_archive_2024_07_001.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 217_654,
    },
    shareLinkTokenId: null,
    shareLink: null,
    archiveReference: baseArchiveReference('exp_archive_2024_07_001', daysAgo(447)),
    auditTrail: [
      buildAuditEvent('exp_archive_2024_07_001', 'sent', daysAgo(447), {
        channels: ['email', 'portal'],
      }),
    ],
  },
];

const generatedExports: DocumentExportRecord[] = Array.from({ length: 120 }).map((_, index) => {
  const createdDate = daysAgo(5 + index);
  const documentType = DOCUMENT_TYPES[index % DOCUMENT_TYPES.length];
  const status = DOCUMENT_STATUSES[index % DOCUMENT_STATUSES.length];
  const exportId = `exp_${documentType}_${createdDate.getUTCFullYear()}_${String(
    index
  ).padStart(3, '0')}`;
  const channels: DocumentExportChannel[] =
    status === 'failed'
      ? ['email']
      : CHANNEL_POOL.slice(0, 1 + (index % CHANNEL_POOL.length));
  const shareLink = status === 'failed' ? null : buildShareLink(exportId, createdDate, 'system@snowva.com');
  const archiveReference =
    index > 370
      ? baseArchiveReference(exportId, createdDate)
      : undefined;

  return {
    id: exportId,
    documentType,
    title: `${documentType} export #${index.toString().padStart(4, '0')}`,
    customerBranchId: `branch_${index % 12}`,
    customerBranchName: `Branch ${index % 12}`,
    createdAt: toIso(createdDate),
    deliveredChannels: channels,
    status,
    lastDownloadedAt: status === 'queued' ? null : toIso(new Date(createdDate.getTime() + ONE_DAY_MS)),
    fileSizeBytes: 120_000 + index * 750,
    preview: {
      assetUrl: `/mock/documents/${exportId}.pdf`,
      mimeType: 'application/pdf',
      fileSizeBytes: 120_000 + index * 750,
    },
    shareLinkTokenId: shareLink ? shareLink.id : null,
    shareLink,
    archiveReference: archiveReference ?? null,
    auditTrail: [
      buildAuditEvent(exportId, 'sent', createdDate, {
        channels,
        recipient: `branch${index % 12}@snowva.com`,
      }),
    ],
  } satisfies DocumentExportRecord;
});

export const DOCUMENT_EXPORT_FIXTURES: DocumentExportRecord[] = [
  ...curatedExports,
  ...generatedExports,
];

export const DOCUMENT_EXPORT_VIRTUALIZATION_THRESHOLD = 100;

export const DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS = [25, 50, 100];
