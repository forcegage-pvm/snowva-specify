'use client';

import { useMemo, type ReactNode } from 'react';

import { VirtualizedTableContainer } from '@/features/shared/components/VirtualizedTableContainer';
import {
    type DocumentExportListItem,
    type DocumentExportListParams,
    type DocumentExportListResult,
} from '@/services/DocumentExportService';

const STATUS_STYLES: Record<DocumentExportListItem['status'], string> = {
  queued: 'border-amber-200 bg-amber-50 text-amber-700',
  sent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
  expired: 'border-slate-200 bg-slate-100 text-slate-600',
};

const CHANNEL_LABELS: Record<DocumentExportListItem['deliveredChannels'][number], string> = {
  email: 'Email',
  portal: 'Portal',
  manual: 'Manual',
};

const SORT_OPTIONS: Array<{
  value: NonNullable<DocumentExportListParams['sort']>;
  label: string;
}> = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
  { value: 'lastDownloadedAt', label: 'Last downloaded' },
];

const formatDate = (timestamp: string | null) => {
  if (!timestamp) {
    return '—';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[exponent]}`;
};

const highlightMatches = (value: string, searchTerm: string | null): ReactNode => {
  if (!searchTerm) {
    return value;
  }

  const trimmed = searchTerm.trim();
  if (!trimmed) {
    return value;
  }

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const segments = value.split(regex);

  return segments.map((segment, index) =>
    index % 2 === 1 ? (
      <mark
        key={`highlight-${index}-${segment}`}
        data-testid="documents-search-highlight"
        className="rounded bg-amber-100 px-0.5 text-amber-900"
      >
        {segment}
      </mark>
    ) : (
      <span key={`text-${index}-${segment}`}>{segment}</span>
    ),
  );
};

export type DocumentExportsTableProps = {
  items: DocumentExportListItem[];
  isLoading?: boolean;
  virtualization?: DocumentExportListResult['virtualization'];
  searchTerm?: string | null;
  onRowSelect?: (exportId: string) => void;
  activeSort?: NonNullable<DocumentExportListParams['sort']>;
  onSortChange?: (sort: NonNullable<DocumentExportListParams['sort']>) => void;
};

export const DocumentExportsTable = ({
  items,
  isLoading = false,
  virtualization,
  searchTerm,
  onRowSelect,
  activeSort = 'createdAt',
  onSortChange,
}: DocumentExportsTableProps) => {
  const normalizedSearch = useMemo(() => searchTerm?.trim().toLowerCase() ?? null, [searchTerm]);
  const highlightedSearch = useMemo(() => searchTerm?.trim() ?? null, [searchTerm]);

  const tableItems = useMemo(() => items, [items]);

  const virtualizationConfig = virtualization && tableItems.length >= virtualization.threshold;
  const overscan = virtualizationConfig ? virtualization.overscan ?? 12 : 8;
  const maxHeight = virtualizationConfig ? 560 : 480;
  const tableTestId = virtualizationConfig ? 'documents-virtualizer' : undefined;
  const scrollContainerClassName = virtualizationConfig ? 'max-h-[560px]' : 'max-h-[480px]';

  const handleRowActivate = (item: DocumentExportListItem) => {
    onRowSelect?.(item.id);
  };

  const renderHeader = () => (
    <thead className="bg-slate-50" role="rowgroup">
      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
        <th scope="col" className="px-4 py-3">
          Document
        </th>
        <th scope="col" className="px-4 py-3">
          Type &amp; branch
        </th>
        <th scope="col" className="px-4 py-3">
          Status
        </th>
        <th scope="col" className="px-4 py-3">
          Delivered via
        </th>
        <th scope="col" className="px-4 py-3">
          Created on
        </th>
        <th scope="col" className="px-4 py-3">
          Last downloaded
        </th>
        <th scope="col" className="px-4 py-3">
          Size
        </th>
      </tr>
    </thead>
  );

  const renderRow = (item: DocumentExportListItem, index: number) => {
    const composedLabel = [item.title, item.documentType, item.status, item.customerBranch.name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const highlightedTitle =
      normalizedSearch && item.title.toLowerCase().includes(normalizedSearch)
        ? highlightMatches(item.title, highlightedSearch)
        : item.title;

    return (
      <tr
        key={item.id}
        role="row"
        aria-label={composedLabel}
        tabIndex={0}
        className="cursor-pointer bg-white transition hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
        onClick={() => handleRowActivate(item)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleRowActivate(item);
          }
        }}
      >
        <td className="px-4 py-3 text-sm font-semibold text-slate-900" data-testid={`documents-title-${index}`}>
          {highlightedTitle}
        </td>
        <td className="px-4 py-3 text-sm text-slate-600">
          <div className="flex flex-col">
            <span className="capitalize">{item.documentType.replace(/_/g, ' ')}</span>
            <span className="text-xs text-slate-400">{item.customerBranch.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600">{renderStatusChip(item.status)}</td>
        <td className="px-4 py-3 text-sm text-slate-600">{renderChannelPills(item.deliveredChannels)}</td>
        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(item.createdAt)}</td>
        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(item.lastDownloadedAt)}</td>
        <td className="px-4 py-3 text-sm text-slate-600">{formatBytes(item.fileSizeBytes)}</td>
      </tr>
    );
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <h3 className="text-base font-semibold text-slate-700">No document exports found</h3>
      <p className="text-sm text-slate-500">Try adjusting search or filters to surface documents.</p>
    </div>
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 px-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort by</span>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Sort document exports">
          {SORT_OPTIONS.map((option) => {
            const isActive = option.value === activeSort;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSortChange?.(option.value)}
                aria-pressed={isActive}
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <VirtualizedTableContainer
        items={tableItems}
        renderHeader={renderHeader}
        renderRow={renderRow}
        getRowKey={(item) => item.id}
        columnCount={7}
        estimatedRowHeight={62}
        overscan={overscan}
        maxHeight={maxHeight}
        isLoading={isLoading}
        emptyState={emptyState}
        tableClassName="min-w-full divide-y divide-slate-100"
        scrollContainerClassName={scrollContainerClassName}
        aria-label="Export history"
        testId={tableTestId}
      />
    </section>
  );
};

const renderStatusChip = (status: DocumentExportListItem['status']) => {
  const classes = STATUS_STYLES[status] ?? 'border-slate-200 bg-slate-100 text-slate-600';

  return (
    <span
      data-testid={`documents-status-${status}`}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${classes}`}
    >
      {status}
    </span>
  );
};

const renderChannelPills = (channels: DocumentExportListItem['deliveredChannels']) => (
  <div className="flex flex-wrap gap-1">
    {channels.map((channel) => (
      <span
        key={channel}
        className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600"
      >
        {CHANNEL_LABELS[channel] ?? channel}
      </span>
    ))}
  </div>
);
