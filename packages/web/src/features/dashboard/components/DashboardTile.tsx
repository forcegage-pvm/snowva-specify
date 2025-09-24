'use client';

import type { ComponentType, SVGProps } from 'react';

type TrendDirection = 'up' | 'down' | 'flat';

type DashboardTileProps = {
  title: string;
  metricValue: number;
  format?: 'currency' | 'number' | 'percentage';
  currency?: string;
  deltaPct?: number;
  trendDirection?: TrendDirection;
  target?: number;
  criticalThreshold?: number;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  isLoading?: boolean;
};

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

const currencyFormatter = (currency?: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'USD',
    maximumFractionDigits: 0,
  });

const formatMetricValue = (value: number, format: DashboardTileProps['format'], currency?: string) => {
  switch (format) {
    case 'currency':
      return currencyFormatter(currency).format(value);
    case 'percentage':
      return `${percentageFormatter.format(value)}%`;
    case 'number':
    default:
      return numberFormatter.format(value);
  }
};

const computeState = (metricValue: number, target?: number, criticalThreshold?: number) => {
  if (typeof criticalThreshold === 'number' && metricValue >= criticalThreshold) {
    return 'critical' as const;
  }

  if (typeof target === 'number' && metricValue >= target) {
    return 'warning' as const;
  }

  return 'normal' as const;
};

const resolveTrendCopy = (deltaPct?: number, trendDirection?: TrendDirection) => {
  if (typeof deltaPct !== 'number' || !trendDirection) {
    return null;
  }

  const magnitude = percentageFormatter.format(Math.abs(deltaPct));

  switch (trendDirection) {
    case 'up':
      return `${magnitude}% increase`;
    case 'down':
      return `${magnitude}% decrease`;
    case 'flat':
      return 'No change';
    default:
      return null;
  }
};

export const DashboardTile = ({
  title,
  metricValue,
  format = 'number',
  currency,
  deltaPct,
  trendDirection,
  target,
  criticalThreshold,
  icon: Icon,
  isLoading = false,
}: DashboardTileProps) => {
  if (isLoading) {
    return (
      <div
        data-testid="dashboard-tile-skeleton"
        className="flex h-36 w-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-5"
      >
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-auto h-10 w-2/3 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  const state = computeState(metricValue, target, criticalThreshold);
  const formattedValue = formatMetricValue(metricValue, format, currency);
  const trendCopy = resolveTrendCopy(deltaPct, trendDirection);

  const tileClassName = [
    'group flex h-full flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-colors',
    state === 'normal' ? 'border-slate-200' : null,
    state === 'warning' ? 'border-amber-400 bg-amber-50' : null,
    state === 'critical' ? 'border-rose-500 bg-rose-50' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const trendClassName = [
    'text-sm font-medium',
    trendDirection === 'up' ? 'text-rose-600' : null,
    trendDirection === 'down' ? 'text-emerald-600' : null,
    trendDirection === 'flat' ? 'text-slate-500' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article data-testid="dashboard-tile" data-state={state} className={tileClassName}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        {Icon ? <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" /> : null}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <p data-testid="dashboard-tile-value" className="text-3xl font-semibold tracking-tight text-slate-900">
          {formattedValue}
        </p>

        {trendCopy ? <span className={trendClassName}>{trendCopy}</span> : null}

        {typeof target === 'number' ? (
          <p className="text-xs text-slate-500">Target: {numberFormatter.format(target)}</p>
        ) : null}
      </div>
    </article>
  );
};
