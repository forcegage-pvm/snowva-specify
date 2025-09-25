'use client';

import {
    ArrowRightIcon,
    BanknotesIcon,
    ChartBarIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentDuplicateIcon,
    DocumentTextIcon,
    QueueListIcon,
    SparklesIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import { useMemo } from 'react';

import { useDashboardMetricsQuery } from '@/features/dashboard/api/useDashboardMetricsQuery';
import { useDashboardShortcutsQuery } from '@/features/dashboard/api/useDashboardShortcutsQuery';
import { DashboardTile } from '@/features/dashboard/components/DashboardTile';
import { useStatementHistoryQuery } from '@/features/finance/api/useStatementHistoryQuery';

const TILE_ICON_LOOKUP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'outstanding-balance': CurrencyDollarIcon,
  'pending-quotes': DocumentDuplicateIcon,
  'overdue-invoices': DocumentTextIcon,
  'collections-rate': BanknotesIcon,
};

const SHORTCUT_TONE_CLASSES: Record<'default' | 'warning' | 'critical', string> = {
  default:
    'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-slate-400',
  warning:
    'border border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100 focus-visible:outline-amber-400',
  critical:
    'border border-rose-300 bg-rose-50 text-rose-700 hover:border-rose-400 hover:bg-rose-100 focus-visible:outline-rose-400',
};

const skeletonArray = <T,>(count: number): Array<T | null> => Array.from({ length: count }, () => null);

export default function DashboardPage() {
  const {
    data: metricsData,
    isPending: isMetricsPending,
    isError: isMetricsError,
  } = useDashboardMetricsQuery();
  const {
    data: shortcutsData,
    isPending: isShortcutsPending,
    isError: isShortcutsError,
  } = useDashboardShortcutsQuery();
  const { data: statementsData } = useStatementHistoryQuery(undefined, {
    staleTime: 120_000,
  });

  const tiles = metricsData?.tiles ?? [];
  const shortcuts = shortcutsData?.shortcuts ?? [];

  const tileSkeletonsNeeded = tiles.length === 0 ? 4 : tiles.length;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: statementsData?.summary.currency ?? 'ZAR',
        maximumFractionDigits: 0,
      }),
    [statementsData?.summary.currency],
  );

  const topBranches = useMemo(() => {
    const branches = statementsData?.branchAggregations ?? [];

    return [...branches]
      .sort((left, right) => right.overdueBalance - left.overdueBalance || right.totalBalance - left.totalBalance)
      .slice(0, 3);
  }, [statementsData?.branchAggregations]);

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Welcome back</span>
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Operations command center</h1>
          {metricsData?.generatedAt ? (
            <span className="text-xs text-slate-500">
              Refreshed {new Date(metricsData.generatedAt).toLocaleString('en-ZA', { hour12: false })}
            </span>
          ) : null}
        </div>
        <p className="max-w-3xl text-sm text-slate-600">
          Track finance and customer health at a glance. Use the shortcuts to jump directly into the workspaces that
          need your attention.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ChartBarIcon aria-hidden className="h-5 w-5 text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Key metrics</h2>
          </div>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            View detailed reports
            <ArrowRightIcon aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(isMetricsPending && tiles.length === 0 ? skeletonArray<typeof tiles[number]>(tileSkeletonsNeeded) : tiles).map(
            (tile, index) => {
              if (!tile) {
                return <DashboardTile key={`dashboard-tile-skeleton-${index}`} title="" metricValue={0} isLoading />;
              }

              const Icon = TILE_ICON_LOOKUP[tile.id] ?? SparklesIcon;

              return (
                <DashboardTile
                  key={tile.id}
                  title={tile.title}
                  metricValue={tile.metricValue}
                  format={tile.format}
                  currency={tile.currency}
                  deltaPct={tile.deltaPct}
                  trendDirection={tile.trendDirection}
                  target={tile.target}
                  criticalThreshold={tile.criticalThreshold}
                  icon={Icon}
                />
              );
            },
          )}
        </div>
        {isMetricsError ? (
          <p className="text-xs text-rose-600">We couldn&apos;t refresh the metrics feed. Showing cached values instead.</p>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SparklesIcon aria-hidden className="h-5 w-5 text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Quick shortcuts</h2>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            All workspaces
            <ArrowRightIcon aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {isShortcutsPending && shortcuts.length === 0
            ? skeletonArray<typeof shortcuts[number]>(4).map((_, index) => (
                <div
                  key={`shortcut-skeleton-${index}`}
                  className="flex h-12 min-w-[12rem] items-center rounded-full border border-slate-200 bg-slate-100/70 px-5 text-sm text-slate-500"
                >
                  <span className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              ))
            : shortcuts.map((shortcut) => {
                const tone = shortcut.tone ?? 'default';
                const toneClasses = SHORTCUT_TONE_CLASSES[tone];

                return (
                  <Link
                    key={shortcut.id}
                    href={shortcut.href}
                    className={`group inline-flex min-w-[12rem] items-center justify-between gap-3 rounded-full px-5 py-3 text-sm font-semibold transition ${toneClasses}`}
                    data-testid="dashboard-shortcut"
                  >
                    <span className="flex flex-col text-left">
                      <span>{shortcut.label}</span>
                      {shortcut.description ? (
                        <span className="text-xs font-normal text-slate-500 group-hover:text-slate-600">
                          {shortcut.description}
                        </span>
                      ) : null}
                    </span>
                    <ArrowRightIcon aria-hidden className="h-4 w-4" />
                  </Link>
                );
              })}
        </div>
        {isShortcutsError ? (
          <p className="text-xs text-rose-600">Shortcuts are offline right now. Try again shortly.</p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <QueueListIcon aria-hidden className="h-5 w-5 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">Branch statement spotlight</h2>
            </div>
            <Link
              href="/statements"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Open workspace
              <ArrowRightIcon aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Focus branches are ordered by overdue balance so you can resolve the riskiest statements first.
          </p>

          <ul className="mt-6 space-y-4">
            {topBranches.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No statements require follow-up. Keep an eye on the monthly schedule and export PDFs before month end.
              </li>
            ) : (
              topBranches.map((branch) => (
                <li
                  key={branch.branchId}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <UsersIcon aria-hidden className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900">{branch.branchName}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {branch.statementCount} open statement{branch.statementCount === 1 ? '' : 's'} ·
                      Last issued {branch.latestStatementDate ? new Date(branch.latestStatementDate).toLocaleDateString('en-ZA') : 'n/a'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {currencyFormatter.format(branch.totalBalance)}
                    </p>
                    {branch.overdueBalance > 0 ? (
                      <p className="text-xs font-medium text-rose-600">
                        {currencyFormatter.format(branch.overdueBalance)} overdue
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-600">On track</p>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <div className="flex items-start gap-3">
            <ClockIcon aria-hidden className="h-5 w-5 text-slate-400" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Upcoming deadlines</p>
              <p className="text-xs text-slate-500">
                Batch statement delivery runs at 17:00 SAST today. Queue supporting documents before then to avoid
                customer delays.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CurrencyDollarIcon aria-hidden className="h-5 w-5 text-slate-400" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Finance checklist</p>
              <ul className="list-inside list-disc text-xs text-slate-500">
                <li>Reconcile incoming EFT allocations</li>
                <li>Convert expiring quotes into invoices</li>
                <li>Email branch statements post audit</li>
              </ul>
            </div>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Document center
            <SparklesIcon aria-hidden className="h-4 w-4" />
          </Link>
        </aside>
      </section>
    </div>
  );
}
