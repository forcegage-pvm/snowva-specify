'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import {
    cloneElement,
    isValidElement,
    useEffect,
    useMemo,
    useRef,
    type ReactElement,
    type ReactNode,
} from 'react';

import { startListLoadTimer } from '@/lib/metrics/performanceMetrics';

type VirtualizedTableContainerProps<T> = {
  items: T[];
  renderRow: (item: T, index: number) => ReactElement;
  renderHeader?: () => ReactNode;
  emptyState?: ReactNode;
  isLoading?: boolean;
  estimatedRowHeight?: number;
  overscan?: number;
  className?: string;
  tableClassName?: string;
  scrollContainerClassName?: string;
  maxHeight?: number;
  getRowKey?: (item: T, index: number) => string | number;
  skeletonRowCount?: number;
  skeletonRowRenderer?: (index: number) => ReactNode;
  'aria-label'?: string;
  columnCount?: number;
  testId?: string;
};

const defaultSkeletonRow = (index: number) => (
  <div
    key={`virtualized-table-skeleton-${index}`}
    className="h-12 w-full animate-pulse rounded bg-slate-200/80"
  />
);

export const VirtualizedTableContainer = <T,>({
  items,
  renderRow,
  renderHeader,
  emptyState,
  isLoading = false,
  estimatedRowHeight = 56,
  overscan = 8,
  className,
  tableClassName,
  scrollContainerClassName,
  maxHeight = 480,
  getRowKey,
  skeletonRowCount = 6,
  skeletonRowRenderer = defaultSkeletonRow,
  'aria-label': ariaLabel,
  columnCount = 1,
  testId,
}: VirtualizedTableContainerProps<T>) => {
  const scrollParentRef = useRef<HTMLDivElement | null>(null);
  const listLoadTimerRef = useRef<ReturnType<typeof startListLoadTimer> | null>(null);
  const listMetricLabel = useMemo(
    () => ariaLabel ?? testId ?? 'virtualized-table',
    [ariaLabel, testId],
  );

  useEffect(() => {
    if (isLoading) {
      if (!listLoadTimerRef.current) {
        listLoadTimerRef.current = startListLoadTimer(listMetricLabel, {
          metadata: { columnCount },
        });
      }

      return;
    }

    if (listLoadTimerRef.current) {
      listLoadTimerRef.current.end({
        itemCount: items.length,
        metadata: { columnCount },
      });
      listLoadTimerRef.current = null;
    }
  }, [columnCount, isLoading, items.length, listMetricLabel]);

  useEffect(
    () => () => {
      listLoadTimerRef.current?.cancel();
      listLoadTimerRef.current = null;
    },
    [],
  );

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const fallbackCount = useMemo(() => Math.min(items.length, Math.max(overscan * 2, 16)), [items.length, overscan]);
  const fallbackItems = useMemo(
    () => Array.from({ length: fallbackCount }).map((_, index) => ({ index })),
    [fallbackCount],
  );

  const effectiveVirtualItems = virtualItems.length > 0 ? virtualItems : fallbackItems;

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  const containerClassName = useMemo(
    () =>
      [
        'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        className ?? null,
      ]
        .filter(Boolean)
        .join(' '),
    [className],
  );

  const resolvedTableClassName = useMemo(
  () => ['min-w-full text-left', tableClassName ?? null].filter(Boolean).join(' '),
    [tableClassName],
  );

  const resolvedScrollContainerClassName = useMemo(
    () =>
      [
        'overflow-y-auto',
        'scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300/80 hover:scrollbar-thumb-slate-400',
        scrollContainerClassName ?? 'max-h-[480px]',
      ]
        .filter(Boolean)
        .join(' '),
    [scrollContainerClassName],
  );

  const skeletonRows = useMemo(
    () => Array.from({ length: skeletonRowCount }).map((_, index) => skeletonRowRenderer(index)),
    [skeletonRowCount, skeletonRowRenderer],
  );

  const resolvedEmptyState =
    emptyState ?? (
      <div className="flex min-h-[160px] items-center justify-center text-sm text-slate-500">
        No records available yet.
      </div>
    );

  return (
    <div className={containerClassName} data-testid={testId}>
      <div
        ref={scrollParentRef}
        className={resolvedScrollContainerClassName}
        style={{ maxHeight }}
      >
        <table role="table" aria-label={ariaLabel} className={resolvedTableClassName}>
          {renderHeader?.()}
          <tbody className="divide-y divide-slate-100 bg-white" role="rowgroup">
            {isLoading ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-6">
                  <div className="flex flex-col gap-3" data-testid="virtualized-table-skeleton">
                    {skeletonRows}
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-6">
                  {resolvedEmptyState}
                </td>
              </tr>
            ) : (
              <>
                {paddingTop > 0 ? (
                  <tr aria-hidden>
                    <td
                      colSpan={columnCount}
                      style={{ height: paddingTop, padding: 0, border: 0 }}
                    />
                  </tr>
                ) : null}
                {effectiveVirtualItems.map((virtualRow) => {
                  const item = items[virtualRow.index];
                  const rawRow = renderRow(item, virtualRow.index);

                  if (!isValidElement(rawRow)) {
                    return null;
                  }

                  const key = getRowKey?.(item, virtualRow.index) ?? rawRow.key ?? virtualRow.index;

                  return cloneElement(rawRow, { key });
                })}
                {paddingBottom > 0 ? (
                  <tr aria-hidden>
                    <td
                      colSpan={columnCount}
                      style={{ height: paddingBottom, padding: 0, border: 0 }}
                    />
                  </tr>
                ) : null}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
