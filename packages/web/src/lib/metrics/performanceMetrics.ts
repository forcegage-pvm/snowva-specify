'use client';

const LIST_LOAD_SLA_MS = 2_000;
const NAVIGATION_SLA_MS = 500;
const DOCUMENT_INTERACTION_SLA_MS = 1_000;
const DOCUMENT_FILTER_SLA_MS = 300;

type MetricStatus = 'pass' | 'warn';

type MetricMetadata = Record<string, unknown>;

type BasePerformanceMetric = {
  timestamp: number;
  durationMs: number;
  thresholdMs: number;
  status: MetricStatus;
  metadata?: MetricMetadata;
};

export type ListLoadPerformanceMetric = BasePerformanceMetric & {
  kind: 'list-load';
  label: string;
  itemCount?: number;
};

export type NavigationPerformanceMetric = BasePerformanceMetric & {
  kind: 'navigation';
  name: string;
  url?: string;
  navigationType?: string;
};

export type DocumentExportInteractionMetric = BasePerformanceMetric & {
  kind: 'document-export-interaction';
  action: 'preview' | 'resend' | 'share-link-copy' | 'filter-apply';
  exportId?: string;
  resultCount?: number;
};

export type DocumentFilterResponseMetric = BasePerformanceMetric & {
  kind: 'document-filter-response';
  filterTypes: string[];
  searchLength?: number;
  resultCount: number;
};

export type PerformanceMetric = 
  | ListLoadPerformanceMetric 
  | NavigationPerformanceMetric 
  | DocumentExportInteractionMetric 
  | DocumentFilterResponseMetric;

export type PerformanceMetricListener = (metric: PerformanceMetric) => void;

type ListLoadTimer = {
  end: (options?: { itemCount?: number; metadata?: MetricMetadata }) => ListLoadPerformanceMetric | null;
  cancel: () => void;
};

const listeners = new Set<PerformanceMetricListener>();
const processedNavigationEntries = new Set<string>();

const createConsoleLabel = (metric: PerformanceMetric) => {
  if (metric.kind === 'list-load') {
    return metric.label;
  }
  
  if (metric.kind === 'navigation') {
    return metric.name;
  }
  
  if (metric.kind === 'document-export-interaction') {
    return `${metric.action}${metric.exportId ? ` (${metric.exportId})` : ''}`;
  }
  
  if (metric.kind === 'document-filter-response') {
    return `filter (${metric.filterTypes.join(', ')})`;
  }
  
  return 'unknown';
};

const emitMetric = (metric: PerformanceMetric) => {
  listeners.forEach((listener) => {
    try {
      listener(metric);
    } catch (error) {
      console.error('[performanceMetrics] listener failure', error);
    }
  });

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('snowva:performance', { detail: metric }));
    } catch (error) {
      console.error('[performanceMetrics] dispatch failure', error);
    }
  }

  if (metric.status === 'warn') {
    const label = createConsoleLabel(metric);
    console.warn(
      `[performance] ${metric.kind} "${label}" exceeded threshold: ${Math.round(metric.durationMs)}ms (limit ${metric.thresholdMs}ms)`,
      metric.metadata ?? {},
    );
  }
};

const mergeMetadata = (base?: MetricMetadata, override?: MetricMetadata) => {
  if (!base && !override) {
    return undefined;
  }

  if (!base) {
    return override;
  }

  if (!override) {
    return base;
  }

  return { ...base, ...override } as MetricMetadata;
};

export const registerPerformanceMetricListener = (listener: PerformanceMetricListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const buildListMetric = (
  label: string,
  durationMs: number,
  thresholdMs: number,
  metadata?: MetricMetadata,
  itemCount?: number,
): ListLoadPerformanceMetric => ({
  kind: 'list-load',
  label,
  durationMs,
  thresholdMs,
  status: durationMs <= thresholdMs ? 'pass' : 'warn',
  timestamp: Date.now(),
  metadata,
  itemCount,
});

export const startListLoadTimer = (
  label: string,
  options?: { thresholdMs?: number; metadata?: MetricMetadata },
): ListLoadTimer => {
  if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
    return {
      end: () => null,
      cancel: () => {},
    };
  }

  const thresholdMs = options?.thresholdMs ?? LIST_LOAD_SLA_MS;
  const baseMetadata = options?.metadata;
  const startedAt = performance.now();
  let stopped = false;

  const end: ListLoadTimer['end'] = (endOptions) => {
    if (stopped) {
      return null;
    }

    stopped = true;

    const durationMs = Math.max(0, performance.now() - startedAt);
    const metadata = mergeMetadata(baseMetadata, endOptions?.metadata);
    const metric = buildListMetric(label, durationMs, thresholdMs, metadata, endOptions?.itemCount);

    emitMetric(metric);

    return metric;
  };

  const cancel = () => {
    stopped = true;
  };

  return {
    end,
    cancel,
  };
};

const buildNavigationMetric = (
  name: string,
  durationMs: number,
  thresholdMs: number,
  metadata?: MetricMetadata,
  url?: string,
  navigationType?: string,
): NavigationPerformanceMetric => ({
  kind: 'navigation',
  name,
  url,
  durationMs,
  thresholdMs,
  status: durationMs <= thresholdMs ? 'pass' : 'warn',
  timestamp: Date.now(),
  metadata,
  navigationType,
});

export const recordNavigationMetric = ({
  name,
  durationMs,
  thresholdMs = NAVIGATION_SLA_MS,
  metadata,
  url,
  navigationType,
}: {
  name: string;
  durationMs: number;
  thresholdMs?: number;
  metadata?: MetricMetadata;
  url?: string;
  navigationType?: string;
}) => {
  const metric = buildNavigationMetric(name, durationMs, thresholdMs, metadata, url, navigationType);
  emitMetric(metric);
  return metric;
};

const buildDocumentExportInteractionMetric = (
  action: DocumentExportInteractionMetric['action'],
  durationMs: number,
  thresholdMs: number,
  metadata?: MetricMetadata,
  exportId?: string,
  resultCount?: number,
): DocumentExportInteractionMetric => ({
  kind: 'document-export-interaction',
  action,
  exportId,
  resultCount,
  durationMs,
  thresholdMs,
  status: durationMs <= thresholdMs ? 'pass' : 'warn',
  timestamp: Date.now(),
  metadata,
});

const buildDocumentFilterResponseMetric = (
  filterTypes: string[],
  durationMs: number,
  thresholdMs: number,
  resultCount: number,
  metadata?: MetricMetadata,
  searchLength?: number,
): DocumentFilterResponseMetric => ({
  kind: 'document-filter-response',
  filterTypes,
  searchLength,
  resultCount,
  durationMs,
  thresholdMs,
  status: durationMs <= thresholdMs ? 'pass' : 'warn',
  timestamp: Date.now(),
  metadata,
});

export const recordDocumentExportInteractionMetric = ({
  action,
  durationMs,
  thresholdMs = DOCUMENT_INTERACTION_SLA_MS,
  metadata,
  exportId,
  resultCount,
}: {
  action: DocumentExportInteractionMetric['action'];
  durationMs: number;
  thresholdMs?: number;
  metadata?: MetricMetadata;
  exportId?: string;
  resultCount?: number;
}) => {
  const metric = buildDocumentExportInteractionMetric(action, durationMs, thresholdMs, metadata, exportId, resultCount);
  emitMetric(metric);
  return metric;
};

export const recordDocumentFilterResponseMetric = ({
  filterTypes,
  durationMs,
  resultCount,
  thresholdMs = DOCUMENT_FILTER_SLA_MS,
  metadata,
  searchLength,
}: {
  filterTypes: string[];
  durationMs: number;
  resultCount: number;
  thresholdMs?: number;
  metadata?: MetricMetadata;
  searchLength?: number;
}) => {
  const metric = buildDocumentFilterResponseMetric(filterTypes, durationMs, thresholdMs, resultCount, metadata, searchLength);
  emitMetric(metric);
  return metric;
};

const navigationEntryKey = (entry: PerformanceEntry) => {
  const key = `${entry.entryType}:${entry.name}:${entry.startTime?.toFixed?.(2) ?? entry.startTime ?? '0'}`;
  return key;
};

const shouldProcessEntry = (entry: PerformanceEntry) => {
  const key = navigationEntryKey(entry);

  if (processedNavigationEntries.has(key)) {
    return false;
  }

  processedNavigationEntries.add(key);
  return true;
};

const processNavigationEntry = (entry: PerformanceNavigationTiming) => {
  if (!shouldProcessEntry(entry)) {
    return;
  }

  const metadata: MetricMetadata = {
    domContentLoaded: entry.domContentLoadedEventEnd - entry.startTime,
    responseTime: entry.responseEnd - entry.requestStart,
    type: entry.type,
  };

  recordNavigationMetric({
    name: entry.name ?? window.location.pathname,
    url: entry.name,
    durationMs: entry.duration,
    metadata,
    navigationType: entry.type,
  });
};

const processMeasureEntry = (entry: PerformanceEntry) => {
  if (!/route[-\s]?change/i.test(entry.name)) {
    return;
  }

  if (!shouldProcessEntry(entry)) {
    return;
  }

  const metadata: MetricMetadata = {
    entryType: entry.entryType,
  };

  recordNavigationMetric({
    name: entry.name,
    durationMs: entry.duration,
    metadata,
  });
};

const setupObserver = (type: 'navigation' | 'measure', callback: PerformanceObserverCallback) => {
  if (typeof PerformanceObserver !== 'function') {
    return null;
  }

  try {
    const observer = new PerformanceObserver(callback);
    observer.observe({ type, buffered: true });
    return observer;
  } catch (error) {
    console.error(`[performanceMetrics] observer failed for ${type}`, error);
    return null;
  }
};

export const initializeNavigationPerformance = () => {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return () => {};
  }

  const existingNavigationEntries = (performance.getEntriesByType?.('navigation') ?? []) as PerformanceNavigationTiming[];
  existingNavigationEntries.forEach(processNavigationEntry);

  const navigationObserver = setupObserver('navigation', (list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'navigation') {
        processNavigationEntry(entry as PerformanceNavigationTiming);
      }
    });
  });

  const measureObserver = setupObserver('measure', (list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'measure') {
        processMeasureEntry(entry);
      }
    });
  });

  const handleVisibility = () => {
    if (document.visibilityState === 'hidden') {
      const navEntries = (performance.getEntriesByType?.('navigation') ?? []) as PerformanceNavigationTiming[];
      navEntries.forEach(processNavigationEntry);
    }
  };

  window.addEventListener('visibilitychange', handleVisibility, { passive: true });

  return () => {
    window.removeEventListener('visibilitychange', handleVisibility);
    navigationObserver?.disconnect();
    measureObserver?.disconnect();
  };
};

export { LIST_LOAD_SLA_MS, NAVIGATION_SLA_MS };
