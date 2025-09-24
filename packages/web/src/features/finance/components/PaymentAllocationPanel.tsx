'use client';

import { useMemo, useState } from 'react';
import type { FC } from 'react';

export type AllocationRecommendation = {
  invoiceId: string;
  invoiceNumber: string;
  dueDate: string;
  outstandingAmount: number;
  suggestedAmount: number;
};

export type AllocationAuditEvent = {
  eventId: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
};

export type ManualAllocation = {
  invoiceId: string;
  amount: number;
};

export type PaymentAllocation = {
  paymentId: string;
  customerId: string;
  amount: number;
  currency: string;
  allocationStrategy: 'FIFO' | 'Manual';
  recommendedAllocations: AllocationRecommendation[];
  manualAllocations: ManualAllocation[];
  remainingBalance: number;
  auditEvents: AllocationAuditEvent[];
};

type PaymentAllocationPanelProps = {
  payment: PaymentAllocation;
  onApplyOverride: (allocation: ManualAllocation) => void;
  onCommitAllocation: (paymentId: string) => void;
};

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));

const sortAuditEvents = (events: AllocationAuditEvent[]) =>
  [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

export const PaymentAllocationPanel: FC<PaymentAllocationPanelProps> = ({
  payment,
  onApplyOverride,
  onCommitAllocation,
}) => {
  const [overrideInputs, setOverrideInputs] = useState<Record<string, string>>({});

  const totalSuggested = useMemo(
    () => payment.recommendedAllocations.reduce((total, rec) => total + rec.suggestedAmount, 0),
    [payment.recommendedAllocations],
  );

  const sortedAuditEvents = useMemo(() => sortAuditEvents(payment.auditEvents), [payment.auditEvents]);

  const handleOverrideChange = (invoiceId: string, value: string) => {
    setOverrideInputs((prev) => ({ ...prev, [invoiceId]: value }));
  };

  const handleOverrideApply = (invoiceId: string) => {
    const rawValue = overrideInputs[invoiceId];
    const amount = Number.parseFloat(rawValue ?? '');

    if (Number.isNaN(amount)) {
      return;
    }

    onApplyOverride({ invoiceId, amount });
  };

  const handleCommit = () => {
    onCommitAllocation(payment.paymentId);
  };

  return (
    <section
      data-testid="payment-allocation-panel"
      className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Payment {payment.paymentId}</h2>
          <p className="text-sm text-slate-500">Customer {payment.customerId}</p>
        </div>

        <div
          data-testid="allocation-strategy"
          className="rounded-full bg-slate-100 px-4 py-1 text-sm font-medium text-slate-700"
        >
          Strategy: {payment.allocationStrategy}
        </div>
      </header>

      <article className="space-y-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Recommended allocations</h3>
          <span className="text-sm text-slate-500">
            Total suggested: {formatCurrency(totalSuggested, payment.currency)}
          </span>
        </div>

        <div className="space-y-3">
          {payment.recommendedAllocations.map((recommendation) => {
            const overrideValue = overrideInputs[recommendation.invoiceId] ?? '';

            return (
              <div
                key={recommendation.invoiceId}
                data-testid="allocation-row"
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">{recommendation.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">Due {formatDate(recommendation.dueDate)}</p>
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
                  <div className="text-sm">
                    <span className="text-slate-500">Outstanding:</span>{' '}
                    <span className="font-medium text-slate-800">
                      {formatCurrency(recommendation.outstandingAmount, payment.currency)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Suggested:</span>{' '}
                    <span className="font-medium text-slate-800">
                      {formatCurrency(recommendation.suggestedAmount, payment.currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`override-${recommendation.invoiceId}`}
                      className="sr-only"
                    >
                      Override amount for {recommendation.invoiceNumber}
                    </label>
                    <input
                      id={`override-${recommendation.invoiceId}`}
                      aria-label={`Override amount for ${recommendation.invoiceNumber}`}
                      type="number"
                      min={0}
                      step="0.01"
                      value={overrideValue}
                      onChange={(event) => handleOverrideChange(recommendation.invoiceId, event.target.value)}
                      className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label={overrideValue ? undefined : `Set override for ${recommendation.invoiceNumber}`}
                      onClick={() => handleOverrideApply(recommendation.invoiceId)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Apply override
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p
          data-testid="remaining-balance"
          className="text-sm font-medium text-slate-700"
        >
          Remaining balance: {formatCurrency(payment.remainingBalance, payment.currency)}
        </p>
      </article>

      {payment.manualAllocations.length > 0 ? (
        <article className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          <h3 className="text-sm font-semibold text-slate-700">Manual overrides</h3>
          <ul className="mt-2 space-y-2">
            {payment.manualAllocations.map((allocation) => (
              <li key={`${allocation.invoiceId}-${allocation.amount}`} className="flex justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                <span className="text-slate-500">{allocation.invoiceId}</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(allocation.amount, payment.currency)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <article className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-700">Allocation audit log</h3>
        <ul className="space-y-2">
          {sortedAuditEvents.map((event) => (
            <li
              key={event.eventId}
              data-testid="payment-allocation-event"
              data-timestamp={event.timestamp}
              className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{event.actor}</span>
                <time dateTime={event.timestamp}>{formatDate(event.timestamp)}</time>
              </div>
              <p className="mt-1 font-medium text-slate-800">{event.action}</p>
              {event.details ? <p className="text-sm text-slate-600">{event.details}</p> : null}
            </li>
          ))}
        </ul>
      </article>

      <footer className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={handleCommit}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Commit allocation
        </button>
      </footer>
    </section>
  );
};
