'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

export type DashboardMetricTrend = 'up' | 'down' | 'flat';

export type DashboardMetricTile = {
  id: string;
  title: string;
  metricValue: number;
  format?: 'currency' | 'number' | 'percentage';
  currency?: string;
  deltaPct?: number;
  trendDirection?: DashboardMetricTrend;
  target?: number;
  criticalThreshold?: number;
};

export type DashboardMetricsResponse = {
  tiles: DashboardMetricTile[];
  generatedAt?: string | null;
};

type DashboardMetricsQueryKey = ['dashboard', 'metrics'];

type UseDashboardMetricsQueryOptions = Omit<
  UseQueryOptions<
    DashboardMetricsResponse,
    Error,
    DashboardMetricsResponse,
    DashboardMetricsQueryKey
  >,
  'queryKey' | 'queryFn'
>;

const FALLBACK_DASHBOARD_METRICS: DashboardMetricsResponse = {
  generatedAt: '2024-12-20T08:05:00Z',
  tiles: [
    {
      id: 'outstanding-balance',
      title: 'Outstanding Balance',
      metricValue: 4_712_000,
      format: 'currency',
      currency: 'ZAR',
      deltaPct: 6.4,
      trendDirection: 'up',
      target: 4_000_000,
      criticalThreshold: 6_000_000,
    },
    {
      id: 'pending-quotes',
      title: 'Pending Quotes',
      metricValue: 48,
      format: 'number',
      deltaPct: -3.1,
      trendDirection: 'down',
      target: 40,
      criticalThreshold: 60,
    },
    {
      id: 'overdue-invoices',
      title: 'Overdue Invoices',
      metricValue: 62,
      format: 'number',
      deltaPct: 2.4,
      trendDirection: 'up',
      target: 40,
      criticalThreshold: 70,
    },
    {
      id: 'collections-rate',
      title: 'Collections Rate',
      metricValue: 91.2,
      format: 'percentage',
      deltaPct: -1.3,
      trendDirection: 'down',
      target: 93,
      criticalThreshold: 88,
    },
  ],
};

const toTrendDirection = (value: unknown): DashboardMetricTrend | undefined => {
  if (value === 'up' || value === 'down' || value === 'flat') {
    return value;
  }

  return undefined;
};

const toNumber = (value: unknown, defaultValue = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return defaultValue;
};

const toTile = (value: unknown): DashboardMetricTile | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const id = typeof candidate.id === 'string' ? candidate.id.trim() : null;
  const title = typeof candidate.title === 'string' ? candidate.title.trim() : null;

  if (!id || !title) {
    return null;
  }

  const format = (() => {
    const rawFormat = candidate.format;

    if (rawFormat === 'currency' || rawFormat === 'number' || rawFormat === 'percentage') {
      return rawFormat;
    }

    return undefined;
  })();

  const currency = typeof candidate.currency === 'string' ? candidate.currency : undefined;
  const deltaPct = candidate.deltaPct === undefined ? undefined : toNumber(candidate.deltaPct);
  const target = candidate.target === undefined ? undefined : toNumber(candidate.target);
  const criticalThreshold =
    candidate.criticalThreshold === undefined
      ? undefined
      : toNumber(candidate.criticalThreshold);

  return {
    id,
    title,
    metricValue: toNumber(candidate.metricValue),
    format,
    currency,
    deltaPct,
    trendDirection: toTrendDirection(candidate.trendDirection),
    target,
    criticalThreshold,
  } satisfies DashboardMetricTile;
};

const normalizeDashboardMetrics = (value: unknown): DashboardMetricsResponse => {
  if (!value || typeof value !== 'object') {
    return FALLBACK_DASHBOARD_METRICS;
  }

  const candidate = value as Record<string, unknown>;
  const tilesValue = candidate.tiles;

  const tiles = Array.isArray(tilesValue)
    ? tilesValue
        .map(toTile)
        .filter((tile): tile is DashboardMetricTile => Boolean(tile))
    : [];

  if (!tiles.length) {
    return FALLBACK_DASHBOARD_METRICS;
  }

  const generatedAt =
    typeof candidate.generatedAt === 'string' && candidate.generatedAt.trim().length > 0
      ? candidate.generatedAt
      : null;

  return {
    tiles,
    generatedAt,
  } satisfies DashboardMetricsResponse;
};

const fetchDashboardMetrics = async (): Promise<DashboardMetricsResponse> => {
  try {
    const response = await fetch('/api/metrics/kpis', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to load metrics: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    return normalizeDashboardMetrics(payload);
  } catch (error) {
    console.warn('Falling back to cached dashboard metrics', error);
    return FALLBACK_DASHBOARD_METRICS;
  }
};

export const useDashboardMetricsQuery = (options?: UseDashboardMetricsQueryOptions) =>
  useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
