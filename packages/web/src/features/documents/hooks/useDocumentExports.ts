import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
    AuditEvent,
    DocumentExportChannel,
    DocumentExportStatus,
    DocumentExportType,
} from '@/features/documents/types';
import type {
    DocumentExportListItem,
    DocumentExportListParams,
    DocumentExportListResult,
} from '@/services/DocumentExportService';

export type DocumentExportListQueryParams = DocumentExportListParams;

type NormalizedDocumentExportFilters = {
  documentTypes: DocumentExportType[];
  statuses: DocumentExportStatus[];
  channels: DocumentExportChannel[];
};

type NormalizedDocumentExportListQuery = {
  search: string | null;
  page: number;
  pageSize: number;
  sort: NonNullable<DocumentExportListParams['sort']>;
  filters: NormalizedDocumentExportFilters;
};

type DocumentExportListQueryKey = [
  'documents',
  'exports',
  'list',
  NormalizedDocumentExportListQuery,
];

type UseDocumentExportListQueryOptions = Omit<
  UseQueryOptions<
    DocumentExportListResult,
    Error,
    DocumentExportListResult,
    DocumentExportListQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export type DocumentExportAuditLogEvent = {
  id: string;
  timestamp: string;
  actor: string;
  action: AuditEvent['action'];
  context?: AuditEvent['context'];
};

export type DocumentExportDetail = {
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
  failureReason?: string;
  preview: {
    assetUrl: string;
    mimeType: string;
    fileSizeBytes: number;
  };
  shareLink: {
    token: string;
    expiresAt: string;
    public: boolean;
  } | null;
  auditTrail: DocumentExportAuditLogEvent[];
};

type DocumentExportDetailQueryKey = [
  'documents',
  'exports',
  'detail',
  { exportId: string },
];

type UseDocumentExportDetailQueryOptions = Omit<
  UseQueryOptions<
    DocumentExportDetail,
    Error,
    DocumentExportDetail,
    DocumentExportDetailQueryKey
  >,
  'queryKey' | 'queryFn'
>;

const DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
type DocumentExportPageSize = (typeof DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS)[number];

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE: DocumentExportPageSize = DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS[0];
const DEFAULT_SORT: NonNullable<DocumentExportListParams['sort']> = 'createdAt';

const SORT_FIELDS = new Set<NonNullable<DocumentExportListParams['sort']>>([
  'createdAt',
  'title',
  'status',
  'lastDownloadedAt',
]);

const toTrimmedOrNull = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const clampPage = (value?: number) => {
  if (!value || Number.isNaN(value) || value < 1) {
    return DEFAULT_PAGE;
  }

  return Math.floor(value);
};

const normalizePageSize = (value?: number): DocumentExportPageSize => {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_PAGE_SIZE;
  }

  if (DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS.includes(value as DocumentExportPageSize)) {
    return value as DocumentExportPageSize;
  }

  return DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS.reduce<DocumentExportPageSize>((closest, option) => {
    const difference = Math.abs(option - value);
    const closestDifference = Math.abs(closest - value);
    return difference < closestDifference ? option : closest;
  }, DOCUMENT_EXPORT_PAGE_SIZE_OPTIONS[0]);
};

const normalizeSort = (
  value?: DocumentExportListParams['sort'],
): NonNullable<DocumentExportListParams['sort']> => {
  if (!value || !SORT_FIELDS.has(value)) {
    return DEFAULT_SORT;
  }

  return value;
};

const normalizeFilterValues = <T extends string>(values?: T[] | null): T[] => {
  if (!values || !values.length) {
    return [];
  }

  const deduped = Array.from(new Set(values));
  return deduped.sort();
};

const normalizeFilters = (
  filters?: DocumentExportListParams['filters'],
): NormalizedDocumentExportFilters => ({
  documentTypes: normalizeFilterValues(filters?.documentTypes),
  statuses: normalizeFilterValues(filters?.statuses),
  channels: normalizeFilterValues(filters?.channels),
});

const normalizeListQuery = (
  params?: DocumentExportListParams,
): NormalizedDocumentExportListQuery => ({
  search: toTrimmedOrNull(params?.search ?? null),
  page: clampPage(params?.page),
  pageSize: normalizePageSize(params?.pageSize),
  sort: normalizeSort(params?.sort),
  filters: normalizeFilters(params?.filters),
});

const buildListSearchParams = (
  query: NormalizedDocumentExportListQuery,
): URLSearchParams => {
  const params = new URLSearchParams();

  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  params.set('sort', query.sort);

  if (query.search) {
    params.set('search', query.search);
  }

  query.filters.documentTypes.forEach((type) => {
    params.append('documentTypes', type);
  });

  query.filters.statuses.forEach((status) => {
    params.append('statuses', status);
  });

  query.filters.channels.forEach((channel) => {
    params.append('channels', channel);
  });

  return params;
};

const createHttpError = (message: string, status: number) => {
  const error = new Error(message) as Error & { status: number };
  error.name = 'HttpError';
  error.status = status;
  return error;
};

const fetchDocumentExportsList = async (
  query: NormalizedDocumentExportListQuery,
): Promise<DocumentExportListResult> => {
  const searchParams = buildListSearchParams(query);
  const endpoint = `/api/v1/document-exports?${searchParams.toString()}`;
  const response = await fetch(endpoint, { cache: 'no-store' });

  if (!response.ok) {
    throw createHttpError('Unable to load document exports', response.status);
  }

  const result = (await response.json()) as DocumentExportListResult;
  const virtualization = 'virtualization' in result ? result.virtualization ?? undefined : undefined;

  return {
    ...result,
    ...(virtualization ? { virtualization } : {}),
  };
};

const fetchDocumentExportDetail = async (
  exportId: string,
): Promise<DocumentExportDetail> => {
  const response = await fetch(`/api/v1/document-exports/${exportId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw createHttpError('Document export not found', 404);
    }

    throw createHttpError('Unable to load document export', response.status);
  }

  return response.json() as Promise<DocumentExportDetail>;
};

export const documentExportKeys = {
  all: ['documents', 'exports'] as const,
  list: (query: NormalizedDocumentExportListQuery) =>
    ['documents', 'exports', 'list', query] as DocumentExportListQueryKey,
  detail: (exportId: string) =>
    ['documents', 'exports', 'detail', { exportId }] as DocumentExportDetailQueryKey,
};

export const useDocumentExportListQuery = (
  params?: DocumentExportListQueryParams,
  options?: UseDocumentExportListQueryOptions,
) => {
  const query = normalizeListQuery(params);

  return useQuery({
    queryKey: documentExportKeys.list(query),
    queryFn: () => fetchDocumentExportsList(query),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
    ...options,
  });
};

const DISABLED_EXPORT_ID = '__document_export_disabled__';

export const useDocumentExportDetailQuery = (
  exportId: string | null,
  options?: UseDocumentExportDetailQueryOptions,
) => {
  const { enabled: enabledOption, ...restOptions } = options ?? {};
  const isEnabled = Boolean(exportId) && (enabledOption ?? true);
  const queryKey = documentExportKeys.detail(exportId ?? DISABLED_EXPORT_ID);

  return useQuery({
    queryKey,
    queryFn: () => {
      if (!exportId) {
        throw createHttpError('Document export id is required', 400);
      }

      return fetchDocumentExportDetail(exportId);
    },
    enabled: isEnabled,
    staleTime: 60_000,
    ...restOptions,
  });
};

export const mapListItemToDetail = (
  item: DocumentExportListItem,
): Pick<
  DocumentExportDetail,
  | 'id'
  | 'title'
  | 'documentType'
  | 'customerBranch'
  | 'createdAt'
  | 'deliveredChannels'
  | 'status'
> => ({
  id: item.id,
  title: item.title,
  documentType: item.documentType,
  customerBranch: item.customerBranch,
  createdAt: item.createdAt,
  deliveredChannels: item.deliveredChannels,
  status: item.status,
});
