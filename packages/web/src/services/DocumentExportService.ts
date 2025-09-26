import type {
    AuditEvent,
    DocumentArchiveReference,
    DocumentExportChannel,
    DocumentExportRecord,
    DocumentExportStatus,
    DocumentExportType,
} from '@/features/documents/types';

import {
    recordDocumentExportInteractionMetric,
    recordDocumentFilterResponseMetric
} from '@/lib/metrics/performanceMetrics';
import { appendDocumentEvent } from './AuditTrailService';
import {
    DOCUMENT_EXPORT_FIXTURES,
    DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS,
    DOCUMENT_EXPORT_VIRTUALIZATION_THRESHOLD,
} from './mocks/documentExportFixtures';

export type DocumentExportFilters = {
  documentTypes?: DocumentExportType[];
  statuses?: DocumentExportStatus[];
  channels?: DocumentExportChannel[];
};

export type DocumentExportListParams = {
  page?: number;
  pageSize?: number;
  sort?: 'createdAt' | 'title' | 'status' | 'lastDownloadedAt';
  search?: string;
  filters?: DocumentExportFilters;
};

export type DocumentExportListItem = {
  id: string;
  title: string;
  documentType: DocumentExportType;
  customerBranch: {
    id: string;
    name: string;
  };
  createdAt: string;
  deliveredChannels: DocumentExportChannel[];
  status: DocumentExportStatus;
  lastDownloadedAt: string | null;
  fileSizeBytes: number;
  shareLink: {
    active: boolean;
    expiresAt: string | null;
  } | null;
  archiveReference?: DocumentArchiveReference | null;
};

export type DocumentExportListResult = {
  items: DocumentExportListItem[];
  total: number;
  page: number;
  pageSize: number;
  virtualization?: {
    threshold: number;
    overscan: number;
  };
};

type ShareLinkSummary = {
  token: string;
  expiresAt: string;
};

type AuditTrailPage = {
  items: AuditEvent[];
  nextCursor: string | null;
};

const OVERSCAN_ROWS = 12;
const SHARE_LINK_BASE_URL = 'https://app.snowva.com/share';
const AUDIT_PAGE_SIZE = 20;

let exportStore: DocumentExportRecord[] = DOCUMENT_EXPORT_FIXTURES.map(cloneRecord);

function cloneRecord(record: DocumentExportRecord): DocumentExportRecord {
  return {
    ...record,
    deliveredChannels: [...record.deliveredChannels],
    auditTrail: record.auditTrail.map((event) => ({
      ...event,
      context: event.context ? { ...event.context } : undefined,
    })),
    shareLink: record.shareLink
      ? {
          ...record.shareLink,
          accessLog: record.shareLink.accessLog.map((entry) => ({ ...entry })),
        }
      : null,
    archiveReference: record.archiveReference ? { ...record.archiveReference } : null,
  };
}

function normalizePageSize(pageSize?: number): number {
  if (!pageSize) {
    return DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS[0];
  }

  if (DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS.includes(pageSize)) {
    return pageSize;
  }

  return DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS.reduce((closest, option) =>
    Math.abs(option - pageSize) < Math.abs(closest - pageSize) ? option : closest
  , DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS[0]);
}

function listShareLinkSummary(record: DocumentExportRecord): DocumentExportListItem['shareLink'] {
  if (!record.shareLink) {
    return null;
  }

  const expiresAt = new Date(record.shareLink.expiresAt);
  const active = expiresAt.getTime() > Date.now();

  return {
    active,
    expiresAt: record.shareLink.expiresAt,
  };
}

function toListItem(record: DocumentExportRecord): DocumentExportListItem {
  return {
    id: record.id,
    title: record.title,
    documentType: record.documentType,
    customerBranch: {
      id: record.customerBranchId,
      name: record.customerBranchName,
    },
    createdAt: record.createdAt,
    deliveredChannels: [...record.deliveredChannels],
    status: record.status,
    lastDownloadedAt: record.lastDownloadedAt,
    fileSizeBytes: record.fileSizeBytes,
    shareLink: listShareLinkSummary(record),
    archiveReference: record.archiveReference ?? null,
  };
}

function sortRecords(
  records: DocumentExportRecord[],
  sortKey: NonNullable<DocumentExportListParams['sort']>
): DocumentExportRecord[] {
  const comparator = (a: DocumentExportRecord, b: DocumentExportRecord) => {
    switch (sortKey) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'lastDownloadedAt': {
        const aTime = a.lastDownloadedAt ? new Date(a.lastDownloadedAt).getTime() : 0;
        const bTime = b.lastDownloadedAt ? new Date(b.lastDownloadedAt).getTime() : 0;
        return bTime - aTime;
      }
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  };

  return [...records].sort(comparator);
}

function matchesSearch(record: DocumentExportRecord, search?: string): boolean {
  if (!search) {
    return true;
  }

  const needle = search.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  const haystack = [record.title, record.id, record.customerBranchName];
  return haystack.some((value) => value?.toLowerCase().includes(needle) ?? false);
}

function matchesFilters(record: DocumentExportRecord, filters?: DocumentExportFilters): boolean {
  if (!filters) {
    return true;
  }

  if (filters.documentTypes?.length && !filters.documentTypes.includes(record.documentType)) {
    return false;
  }

  if (filters.statuses?.length && !filters.statuses.includes(record.status)) {
    return false;
  }

  if (filters.channels?.length) {
    const hasChannel = record.deliveredChannels.some((channel) =>
      filters.channels!.includes(channel)
    );
    if (!hasChannel) {
      return false;
    }
  }

  return true;
}

export async function listDocumentExports(
  params: DocumentExportListParams = {}
): Promise<DocumentExportListResult> {
  const startTime = performance.now();
  
  const {
    page = 1,
    pageSize: requestedPageSize,
    sort = 'createdAt',
    search,
    filters,
  } = params;

  const pageSize = normalizePageSize(requestedPageSize);

  const filtered = exportStore.filter(
    (record) => matchesSearch(record, search) && matchesFilters(record, filters)
  );

  const sorted = sortRecords(filtered, sort);
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = sorted.slice(start, end).map(toListItem);

  const virtualization =
    total >= DOCUMENT_EXPORT_VIRTUALIZATION_THRESHOLD
      ? {
          threshold: DOCUMENT_EXPORT_VIRTUALIZATION_THRESHOLD,
          overscan: OVERSCAN_ROWS,
        }
      : undefined;

  // Record filter response metrics
  const filterTypes: string[] = [];
  if (filters?.documentTypes?.length) filterTypes.push('documentTypes');
  if (filters?.statuses?.length) filterTypes.push('statuses');
  if (filters?.channels?.length) filterTypes.push('channels');
  if (search?.trim()) filterTypes.push('search');
  if (sort !== 'createdAt') filterTypes.push('sort');

  if (filterTypes.length > 0 || search?.trim()) {
    const durationMs = performance.now() - startTime;
    recordDocumentFilterResponseMetric({
      filterTypes,
      durationMs,
      resultCount: total,
      searchLength: search?.trim()?.length,
      metadata: {
        page,
        pageSize,
        sort,
        hasVirtualization: !!virtualization
      }
    });
  }

  return {
    items: pageItems,
    total,
    page,
    pageSize,
    virtualization,
  };
}

export async function getDocumentExport(exportId: string): Promise<DocumentExportRecord> {
  const startTime = performance.now();
  
  const record = exportStore.find((item) => item.id === exportId);

  if (!record) {
    throw new Error(`Document export ${exportId} not found`);
  }

  if (record.shareLink) {
    const expired = new Date(record.shareLink.expiresAt).getTime() <= Date.now();
    if (expired && record.status === 'sent') {
      record.status = 'expired';
    }
  }

  // Record preview interaction metric
  const durationMs = performance.now() - startTime;
  recordDocumentExportInteractionMetric({
    action: 'preview',
    durationMs,
    exportId,
    metadata: {
      status: record.status,
      documentType: record.documentType,
      hasShareLink: !!record.shareLink
    }
  });

  return cloneRecord(record);
}

export async function resendDocumentExport(exportId: string): Promise<{
  status: DocumentExportStatus;
  resentAt: string;
  deliveredChannels: DocumentExportChannel[];
  auditEventId: string;
}> {
  const startTime = performance.now();
  
  const record = exportStore.find((item) => item.id === exportId);

  if (!record) {
    throw new Error(`Document export ${exportId} not found`);
  }

  const resentAt = new Date().toISOString();
  const previousStatus = record.status;

  record.status = 'sent';
  record.deliveredChannels = Array.from(new Set([...record.deliveredChannels, 'email']));
  record.failureReason = undefined;

  const auditEvent: AuditEvent = {
    id: `${exportId}_resent_${Date.now()}`,
    exportId,
    timestamp: resentAt,
    actor: 'nadiya@snowva.com',
    action: 'resent',
    context: {
      previousStatus,
      channels: [...record.deliveredChannels],
    },
  };

  record.auditTrail = [auditEvent, ...record.auditTrail];

  await appendDocumentEvent({
    exportId,
    action: 'resent',
    timestamp: resentAt,
    context: {
      previousStatus,
      channels: [...record.deliveredChannels],
    },
  });

  // Record resend interaction metric
  const durationMs = performance.now() - startTime;
  recordDocumentExportInteractionMetric({
    action: 'resend',
    durationMs,
    exportId,
    metadata: {
      previousStatus,
      newStatus: record.status,
      channelCount: record.deliveredChannels.length
    }
  });

  return {
    status: record.status,
    resentAt,
    deliveredChannels: [...record.deliveredChannels],
    auditEventId: auditEvent.id,
  };
}

export async function generateShareLink(exportId: string): Promise<ShareLinkSummary> {
  const startTime = performance.now();
  
  const record = exportStore.find((item) => item.id === exportId);

  if (!record) {
    throw new Error(`Document export ${exportId} not found`);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const token = `${SHARE_LINK_BASE_URL}/${exportId}-${now.getTime().toString(36)}`;

  record.shareLink = {
    id: `token_${exportId}`,
    exportId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastAccessedAt: null,
    copiedBy: 'nadiya@snowva.com',
    accessLog: [],
  };
  record.shareLinkTokenId = record.shareLink.id;

  const auditEvent: AuditEvent = {
    id: `${exportId}_share_link_${Date.now()}`,
    exportId,
    timestamp: now.toISOString(),
    actor: 'nadiya@snowva.com',
    action: 'share_link_copied',
    context: {
      expiresAt: record.shareLink.expiresAt,
    },
  };

  record.auditTrail = [auditEvent, ...record.auditTrail];

  await appendDocumentEvent({
    exportId,
    action: 'regenerated',
    timestamp: now.toISOString(),
    context: {
      expiresAt: record.shareLink.expiresAt,
    },
  });

  // Record share-link interaction metric
  const durationMs = performance.now() - startTime;
  recordDocumentExportInteractionMetric({
    action: 'share-link-copy',
    durationMs,
    exportId,
    metadata: {
      expiresAt: record.shareLink.expiresAt,
      tokenGenerated: true
    }
  });

  return {
    token,
    expiresAt: record.shareLink.expiresAt,
  };
}

export async function getDocumentAuditTrail(
  exportId: string,
  cursor?: string | null,
  limit = AUDIT_PAGE_SIZE
): Promise<AuditTrailPage> {
  const record = exportStore.find((item) => item.id === exportId);

  if (!record) {
    throw new Error(`Document export ${exportId} not found`);
  }

  const sorted = [...record.auditTrail].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let startIndex = 0;
  if (cursor) {
    const cursorIndex = sorted.findIndex((event) => event.id === cursor);
    if (cursorIndex >= 0) {
      startIndex = cursorIndex + 1;
    }
  }

  const slice = sorted.slice(startIndex, startIndex + limit);
  const nextItem = sorted[startIndex + limit];

  return {
    items: slice.map((event) => ({
      ...event,
      context: event.context ? { ...event.context } : undefined,
    })),
    nextCursor: nextItem ? nextItem.id : null,
  };
}

export function __resetDocumentExportStore(): void {
  exportStore = DOCUMENT_EXPORT_FIXTURES.map(cloneRecord);
}
