import { NextResponse } from 'next/server';

import type {
    DocumentExportChannel,
    DocumentExportStatus,
    DocumentExportType,
} from '@/features/documents/types';
import type { DocumentExportListParams } from '@/services/DocumentExportService';
import { listDocumentExports } from '@/services/DocumentExportService';

function parseNumberParam(value: string | null, fallback: number, min = 1): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(parsed, min);
}

function parseMultiParam(searchParams: URLSearchParams, key: string): string[] | undefined {
  const values = searchParams.getAll(key);
  if (!values.length) {
    return undefined;
  }

  const tokens = values
    .flatMap((entry) => entry.split(','))
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens.length ? tokens : undefined;
}

function filterEnumValues<T extends string>(values: string[] | undefined, allowed: readonly T[]): T[] | undefined {
  if (!values?.length) {
    return undefined;
  }

  const filtered = values.filter((value): value is T => allowed.includes(value as T));
  return filtered.length ? filtered : undefined;
}

const SORT_FIELDS = ['createdAt', 'title', 'status', 'lastDownloadedAt'] as const;
type SortField = (typeof SORT_FIELDS)[number];

const DOCUMENT_TYPES: readonly DocumentExportType[] = ['statement', 'invoice', 'quote', 'compliance'];
const STATUSES: readonly DocumentExportStatus[] = ['queued', 'sent', 'failed', 'expired'];
const CHANNELS: readonly DocumentExportChannel[] = ['email', 'portal', 'manual'];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;

    const page = parseNumberParam(searchParams.get('page'), 1);
    const pageSize = parseNumberParam(searchParams.get('pageSize'), 25);
    const sortParam = searchParams.get('sort') ?? 'createdAt';
    const sort = (SORT_FIELDS.includes(sortParam as SortField) ? sortParam : 'createdAt') as NonNullable<DocumentExportListParams['sort']>;
    const search = searchParams.get('search') ?? undefined;

    const documentTypes = filterEnumValues<DocumentExportType>(
      parseMultiParam(searchParams, 'documentTypes'),
      DOCUMENT_TYPES
    );

    const statuses = filterEnumValues<DocumentExportStatus>(
      parseMultiParam(searchParams, 'statuses'),
      STATUSES
    );

    const channels = filterEnumValues<DocumentExportChannel>(
      parseMultiParam(searchParams, 'channels'),
      CHANNELS
    );

    const result = await listDocumentExports({
      page,
      pageSize,
      sort,
      search,
      filters: {
        documentTypes,
        statuses,
        channels,
      },
    });

    const payload = {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      items: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        documentType: item.documentType,
        customerBranch: item.customerBranch,
        createdAt: item.createdAt,
        deliveredChannels: item.deliveredChannels,
        status: item.status,
        lastDownloadedAt: item.lastDownloadedAt,
        fileSizeBytes: item.fileSizeBytes,
        shareLink: item.shareLink,
        archiveReference: item.archiveReference ?? null,
      })),
      ...(result.virtualization ? { virtualization: result.virtualization } : {}),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[document-exports][GET]', error);
    return NextResponse.json({ message: 'Unable to load document exports' }, { status: 500 });
  }
}
