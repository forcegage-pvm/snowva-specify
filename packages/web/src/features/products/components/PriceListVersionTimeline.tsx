'use client';

import type { FC } from 'react';

export type PriceListVersion = {
  versionId: string;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Archived';
  effectiveDate: string;
  changedBy?: string;
  notes?: string;
  archivedReason?: string;
};

type PriceListVersionTimelineProps = {
  versions: PriceListVersion[];
  currentVersionId?: string;
  onVersionSelect?: (versionId: string) => void;
};

const statusStyles: Record<PriceListVersion['status'], string> = {
  Draft: 'bg-slate-100 text-slate-600 border-slate-200',
  Scheduled: 'bg-sky-100 text-sky-700 border-sky-200',
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Archived: 'bg-slate-200 text-slate-600 border-slate-300',
};

const formatEffectiveDate = (value: string) => {
  const date = new Date(value);
  const month = date.toLocaleString('en-ZA', { month: 'short' });
  const year = date.getFullYear();
  return `Effective ${date.getDate()} ${month} ${year}`;
};

export const PriceListVersionTimeline: FC<PriceListVersionTimelineProps> = ({
  versions,
  currentVersionId,
  onVersionSelect,
}) => {
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime(),
  );

  return (
    <section aria-label="Price list version timeline" className="space-y-4">
      <ol className="space-y-4">
        {sortedVersions.map((version, index) => {
          const isCurrent = currentVersionId === version.versionId;
          const statusStyle = statusStyles[version.status];

          return (
            <li
              key={version.versionId}
              data-testid="price-version-entry"
              data-status={version.status}
              data-current={isCurrent ? 'true' : 'false'}
              className="relative flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="relative flex w-4 flex-col items-center">
                <span
                  className={[
                    'flex h-3 w-3 items-center justify-center rounded-full border-2 border-slate-300 bg-white',
                    isCurrent ? 'border-emerald-500 bg-emerald-500' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
                {index !== sortedVersions.length - 1 ? (
                  <span className="mt-1 block h-full w-px flex-1 bg-slate-200" aria-hidden="true" />
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span>{version.versionId}</span>
                      {isCurrent ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Current version
                        </span>
                      ) : null}
                    </div>

                    <p className="text-sm text-slate-500">{formatEffectiveDate(version.effectiveDate)}</p>

                    {version.changedBy ? (
                      <p className="text-sm text-slate-500">Updated by {version.changedBy}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      data-testid="price-version-status"
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle}`}
                    >
                      {version.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => onVersionSelect?.(version.versionId)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      View {version.versionId}
                    </button>
                  </div>
                </div>

                {version.notes ? (
                  <p className="text-sm text-slate-600">{version.notes}</p>
                ) : null}

                {version.status === 'Archived' ? (
                  <div
                    data-testid="price-version-badge-archived"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    <span>Archived</span>
                    {version.archivedReason ? <span>{version.archivedReason}</span> : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
