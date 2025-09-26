export type DocumentExportStatus = 'queued' | 'sent' | 'failed' | 'expired';

export type DocumentExportChannel = 'email' | 'portal' | 'manual';

export type DocumentExportType = 'statement' | 'invoice' | 'quote' | 'compliance';

export interface ShareLinkAccessEvent {
  timestamp: string;
  ipAddress: string;
  userAgent?: string | null;
  success: boolean;
}

export interface ShareLinkToken {
  id: string;
  exportId: string;
  createdAt: string;
  expiresAt: string;
  lastAccessedAt: string | null;
  copiedBy: string;
  accessLog: ShareLinkAccessEvent[];
}

export interface AuditEvent {
  id: string;
  exportId: string;
  timestamp: string;
  actor: string;
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
  context?: Record<string, unknown>;
}

export interface DocumentArchiveReference {
  exportId: string;
  archiveLocation: string;
  requestedBy: string | null;
  requestedAt: string | null;
  status: 'pending' | 'fulfilled' | 'failed';
  deliveryEtaDays: number | null;
}

export interface DocumentExportRecord {
  id: string;
  documentType: DocumentExportType;
  title: string;
  customerBranchId: string;
  customerBranchName: string;
  createdAt: string;
  deliveredChannels: DocumentExportChannel[];
  status: DocumentExportStatus;
  lastDownloadedAt: string | null;
  fileSizeBytes: number;
  preview: {
    assetUrl: string;
    mimeType: string;
    fileSizeBytes: number;
  };
  shareLinkTokenId: string | null;
  auditTrail: AuditEvent[];
  failureReason?: string;
  shareLink?: ShareLinkToken | null;
  archiveReference?: DocumentArchiveReference | null;
}

export interface FilterState {
  search: string;
  documentTypes: DocumentExportType[];
  statuses: DocumentExportStatus[];
  channels: DocumentExportChannel[];
  sort: 'createdAt' | 'title' | 'status' | 'lastDownloadedAt';
  page: number;
  pageSize: number;
}
