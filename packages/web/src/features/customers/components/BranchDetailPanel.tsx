
'use client';

import { useEffect, useMemo, useState } from 'react';

type TimelineEvent = {
  eventId: string;
  timestamp: string;
  eventType: string;
  actor: string;
  summary: string;
};

type BranchDetail = {
  branchId: string;
  parentCustomerId: string;
  displayName: string;
  address: string;
  vatNumber: string;
  paymentTerms: string;
  contactEmail: string;
  auditTrail: TimelineEvent[];
};

type BranchDetailPanelProps = {
  branch: BranchDetail;
  onCommitChanges?: (updated: Partial<BranchDetail>) => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const BranchDetailPanel = ({ branch, onCommitChanges }: BranchDetailPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState(() => ({
    paymentTerms: branch.paymentTerms,
    contactEmail: branch.contactEmail,
    address: branch.address,
  }));
  const [filterSelection, setFilterSelection] = useState<string>('all');
  const [appliedFilter, setAppliedFilter] = useState<string>('all');
  const [filterApplied, setFilterApplied] = useState(false);

  useEffect(() => {
    setFormState({
      paymentTerms: branch.paymentTerms,
      contactEmail: branch.contactEmail,
      address: branch.address,
    });
    setIsEditing(false);
    setFilterSelection('all');
    setAppliedFilter('all');
    setFilterApplied(false);
  }, [branch]);

  const eventTypeOptions = useMemo(() => {
    const distinct = new Set<string>(branch.auditTrail.map((event) => event.eventType));
    return ['all', ...Array.from(distinct)];
  }, [branch.auditTrail]);

  const filteredEvents = useMemo(() => {
    if (appliedFilter === 'all') {
      return branch.auditTrail;
    }

    return branch.auditTrail.filter((event) => event.eventType === appliedFilter);
  }, [appliedFilter, branch.auditTrail]);

  const changes: Partial<BranchDetail> = useMemo(() => {
    const diff: Partial<BranchDetail> = {};

    if (formState.paymentTerms !== branch.paymentTerms) {
      diff.paymentTerms = formState.paymentTerms;
    }

    if (formState.contactEmail !== branch.contactEmail) {
      diff.contactEmail = formState.contactEmail;
    }

    if (formState.address !== branch.address) {
      diff.address = formState.address;
    }

    return diff;
  }, [branch.address, branch.contactEmail, branch.paymentTerms, formState.address, formState.contactEmail, formState.paymentTerms]);

  const hasChanges = Object.keys(changes).length > 0;

  const handleEditToggle = () => {
    setFormState({
      paymentTerms: branch.paymentTerms,
      contactEmail: branch.contactEmail,
      address: branch.address,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormState({
      paymentTerms: branch.paymentTerms,
      contactEmail: branch.contactEmail,
      address: branch.address,
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!hasChanges) {
      return;
    }

    onCommitChanges?.(changes);
    setIsEditing(false);
  };

  const handleApplyFilter = () => {
    setAppliedFilter(filterSelection);
    setFilterApplied(true);
  };

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">{branch.displayName}</h2>

          {!isEditing ? (
            <button
              type="button"
              onClick={handleEditToggle}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Edit branch details
            </button>
          ) : null}
        </div>
        <p className="text-sm text-slate-600">
          <span className="text-slate-500">VAT:</span> <span>{branch.vatNumber}</span>
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Address</h3>
            {!isEditing ? (
              <p className="mt-1 text-sm text-slate-600">{branch.address}</p>
            ) : (
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                rows={3}
                value={formState.address}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    address: event.target.value,
                  }))
                }
              />
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Billing summary</h3>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Payment terms</dt>
                {!isEditing ? (
                  <dd className="font-medium text-slate-700">{branch.paymentTerms}</dd>
                ) : (
                  <select
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    value={formState.paymentTerms}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        paymentTerms: event.target.value,
                      }))
                    }
                    aria-label="Payment terms"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Prepaid">Prepaid</option>
                  </select>
                )}
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Contact email</dt>
                {!isEditing ? (
                  <dd className="font-medium text-slate-700">{branch.contactEmail}</dd>
                ) : (
                  <input
                    aria-label="Contact email"
                    className="w-60 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    value={formState.contactEmail}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        contactEmail: event.target.value,
                      }))
                    }
                  />
                )}
              </div>
            </dl>
          </div>

          {isEditing ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <label htmlFor="audit-filter" className="text-sm font-semibold text-slate-700">
                  Filter audit events
                </label>
                <select
                  id="audit-filter"
                  value={filterSelection}
                  onChange={(event) => setFilterSelection(event.target.value)}
                  className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {eventTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'all' ? 'All events' : option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleApplyFilter}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Apply filter
              </button>
            </div>
            {filterApplied ? (
              <p
                data-testid="audit-filter-applied"
                className="mt-3 rounded bg-slate-100 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-600"
              >
                Filter applied
                {appliedFilter !== 'all' ? `: ${appliedFilter}` : ''}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Audit timeline</h3>
            <ul className="mt-4 space-y-3" data-testid="branch-audit-timeline">
              {filteredEvents.map((event) => (
                <li key={event.eventId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">{event.summary}</p>
                  <p className="text-xs text-slate-500">{event.actor}</p>
                  <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
                </li>
              ))}
              {filteredEvents.length === 0 ? (
                <li className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                  No events match this filter.
                </li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Outstanding balance</h3>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(0)}</p>
            <p className="text-xs text-slate-500">Live balance data coming soon.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
