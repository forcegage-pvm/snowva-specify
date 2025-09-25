'use client';

import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { readDraftFromCache, useDraftAutosave } from '../hooks/useDraftAutosave';

export type InvoiceLineItem = {
  lineId: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type InvoiceTimelineEvent = {
  eventId: string;
  timestamp: string;
  type: 'created' | 'note' | 'finalized' | 'email';
  actor: string;
  summary: string;
};

export type InvoiceTotals = {
  subtotal: number;
  vat: number;
  total: number;
  balanceDue: number;
};

export type InvoiceWorkspaceState = {
  invoiceId: string;
  customerName: string;
  status: 'Draft' | 'Finalized' | 'Cancelled';
  totals: InvoiceTotals;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  vatNumber?: string;
  orderReference?: string;
  canFinalize: boolean;
  canEdit: boolean;
  lineItems: InvoiceLineItem[];
  timeline: InvoiceTimelineEvent[];
};

type InvoiceWorkspaceProps = {
  invoice: InvoiceWorkspaceState;
  onFinalize?: (invoice: InvoiceWorkspaceState) => void;
  onReopen?: (invoiceId: string) => void;
  onSendEmail?: (invoiceId: string) => void;
};

const statusStyles: Record<InvoiceWorkspaceState['status'], string> = {
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  Finalized: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(value);

export const InvoiceWorkspace: FC<InvoiceWorkspaceProps> = ({
  invoice,
  onFinalize,
  onReopen,
  onSendEmail,
}) => {
  const cachedDraft = useMemo(
    () => readDraftFromCache<{
      finalizeGuard: string | null;
      vatNumber?: string;
      orderReference?: string;
      status: InvoiceWorkspaceState['status'];
      paymentStatus: InvoiceWorkspaceState['paymentStatus'];
    }>('invoice', invoice.invoiceId),
    [invoice.invoiceId],
  );

  const [finalizeGuard, setFinalizeGuard] = useState<string | null>(
    cachedDraft?.draft.finalizeGuard ?? null,
  );

  const timeline = useMemo(
    () =>
      [...invoice.timeline].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
    [invoice.timeline],
  );

  const canFinalize = invoice.status === 'Draft' && invoice.canFinalize && invoice.canEdit;

  const autosaveEnabled = invoice.status === 'Draft' && invoice.canEdit;

  const autosaveSnapshot = useMemo(
    () => ({
      finalizeGuard,
      vatNumber: invoice.vatNumber ?? '',
      orderReference: invoice.orderReference ?? '',
      status: invoice.status,
      paymentStatus: invoice.paymentStatus,
    }),
    [finalizeGuard, invoice.orderReference, invoice.paymentStatus, invoice.status, invoice.vatNumber],
  );

  const { lastSavedAt, isSaving, status: autosaveStatus, clearDraft, saveNow } = useDraftAutosave({
    draft: autosaveSnapshot,
    draftId: invoice.invoiceId,
    draftType: 'invoice',
    label: `Invoice ${invoice.invoiceId}`,
    enabled: autosaveEnabled,
    initialSavedState: cachedDraft,
  });

  useEffect(() => {
    if (invoice.status !== 'Draft') {
      setFinalizeGuard(null);
      clearDraft();
      return;
    }

    if (cachedDraft?.draft) {
      setFinalizeGuard(cachedDraft.draft.finalizeGuard ?? null);
    }
  }, [cachedDraft, clearDraft, invoice.status]);

  const handleFinalize = () => {
    if (!invoice.vatNumber?.trim() || !invoice.orderReference?.trim()) {
      setFinalizeGuard('Add VAT number and customer order reference before finalizing.');
      return;
    }

    setFinalizeGuard(null);
    void saveNow('manual');
    onFinalize?.(invoice);
    clearDraft();
  };

  const handleReopen = () => {
    clearDraft();
    onReopen?.(invoice.invoiceId);
  };

  const handleSendEmail = () => {
    onSendEmail?.(invoice.invoiceId);
  };

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Invoice {invoice.invoiceId}
          </h1>
          <p className="text-sm text-slate-500">{invoice.customerName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            data-testid="invoice-status-badge"
            data-state={invoice.status}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[invoice.status]}`}
          >
            {invoice.status}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Payment: {invoice.paymentStatus}
          </span>
          <span className="text-[11px] font-medium text-slate-400" data-testid="invoice-autosave-indicator">
            {autosaveEnabled
              ? isSaving
                ? 'Saving…'
                : autosaveStatus === 'error'
                  ? 'Autosave needs attention'
                  : lastSavedAt
                    ? `Saved ${new Intl.DateTimeFormat('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(lastSavedAt))}`
                    : 'Autosave ready'
              : 'Autosave paused'}
          </span>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <article className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-700">Line items</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {invoice.lineItems.map((item) => (
                <li
                  key={item.lineId}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
                >
                  <span className="font-medium text-slate-800">{item.description}</span>
                  <span className="text-slate-500">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-700">Timeline</h2>
            <ul className="mt-3 space-y-3">
              {timeline.map((event) => (
                <li
                  key={event.eventId}
                  data-testid="invoice-timeline-event"
                  className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{event.actor}</span>
                    <time dateTime={event.timestamp}>{formatDateTime(event.timestamp)}</time>
                  </div>
                  <p className="mt-1 font-medium text-slate-800">{event.summary}</p>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <h2 className="text-sm font-semibold text-slate-700">Invoice summary</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(invoice.totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>VAT</dt>
                <dd>{formatCurrency(invoice.totals.vat)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Total</dt>
                <dd>{formatCurrency(invoice.totals.total)}</dd>
              </div>
              <div className="flex justify-between text-slate-500">
                <dt>Balance due</dt>
                <dd>{formatCurrency(invoice.totals.balanceDue)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <h3 className="font-semibold text-slate-700">Compliance</h3>
            <ul className="mt-2 space-y-1">
              <li>VAT: {invoice.vatNumber?.trim() ? invoice.vatNumber : 'Pending'}</li>
              <li>Order reference: {invoice.orderReference?.trim() ? invoice.orderReference : 'Pending'}</li>
            </ul>
          </div>

          {finalizeGuard ? (
            <div
              data-testid="invoice-finalize-guard"
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
            >
              {finalizeGuard}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleFinalize}
              disabled={!canFinalize}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Finalize invoice
            </button>

            {invoice.status === 'Finalized' && onReopen ? (
              <button
                type="button"
                onClick={handleReopen}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Reopen invoice
              </button>
            ) : null}

            {onSendEmail ? (
              <button
                type="button"
                onClick={handleSendEmail}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Send email to customer
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
};
