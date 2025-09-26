"use client";

import { useEffect, useMemo, useState } from "react";

type InvoiceWorkspaceResponse = {
  invoice: {
    id: string;
    number: string;
    status: string;
    issuedOn?: string;
    dueOn?: string;
    currency?: string;
    totals?: {
      subtotalExVat?: number;
      vatAmount?: number;
      totalIncVat?: number;
      amountPaid?: number;
      balanceDue?: number;
    };
    guardrails?: {
      finalize?: {
        allowed: boolean;
        reason?: string;
      };
      email?: {
        allowed: boolean;
      };
    };
  };
  paymentProgress?: {
    allocations?: Array<{
      id: string;
      amount: number;
      appliedOn: string;
      reference: string;
    }>;
  };
};

type InvoiceTimelineResponse = {
  events: Array<{
    id: string;
    timestamp: string;
    actor: string;
    type: string;
    summary: string;
  }>;
};

type EmailFormState = {
  recipients: string;
  message: string;
  includeAttachments: boolean;
};

const formatCurrency = (value?: number | null, currencyPrefix = "R") => {
  if (typeof value !== "number") {
    return `${currencyPrefix}0`;
  }

  return `${currencyPrefix}${value.toLocaleString("en-US")}`;
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function InvoiceWorkspacePage({
  params,
}: {
  params: { invoiceId: string };
}) {
  const { invoiceId } = params;
  const [workspace, setWorkspace] = useState<InvoiceWorkspaceResponse | null>(null);
  const [timeline, setTimeline] = useState<InvoiceTimelineResponse | null>(null);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState<EmailFormState>({
    recipients: "",
    message: "",
    includeAttachments: true,
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadWorkspace = async () => {
      setIsWorkspaceLoading(true);
      try {
        const response = await fetch(`/api/v1/invoices/${invoiceId}/workspace`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load invoice workspace");
        }

        const payload = (await response.json()) as InvoiceWorkspaceResponse;
        if (!isActive) {
          return;
        }

        setWorkspace(payload);
  } catch {
        if (!controller.signal.aborted && isActive) {
          setWorkspace(null);
        }
      } finally {
        if (isActive) {
          setIsWorkspaceLoading(false);
        }
      }
    };

    void loadWorkspace();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [invoiceId]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadTimeline = async () => {
      setIsTimelineLoading(true);
      try {
        const response = await fetch(`/api/v1/invoices/${invoiceId}/timeline`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load invoice timeline");
        }

        const payload = (await response.json()) as InvoiceTimelineResponse;
        if (!isActive) {
          return;
        }

        setTimeline(payload);
  } catch {
        if (!controller.signal.aborted && isActive) {
          setTimeline(null);
        }
      } finally {
        if (isActive) {
          setIsTimelineLoading(false);
        }
      }
    };

    void loadTimeline();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [invoiceId]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  const invoice = workspace?.invoice;
  const allocations = workspace?.paymentProgress?.allocations ?? [];

  const guardrailMessage = useMemo(() => {
    if (invoice?.guardrails?.finalize?.allowed === false) {
      return invoice.guardrails.finalize.reason ?? "Finalize action disabled.";
    }

    return null;
  }, [invoice?.guardrails?.finalize]);

  const handleOpenEmailModal = () => {
    setEmailModalOpen(true);
    setEmailForm({
      recipients: "",
      message: "Please see the finalized invoice attached.",
      includeAttachments: true,
    });
  };

  const handleSendEmail = async () => {
    if (!invoice) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/invoices/${invoice.id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: emailForm.recipients.split(",").map((value) => value.trim()).filter(Boolean),
          includeAttachments: emailForm.includeAttachments,
          message: emailForm.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Email dispatch failed");
      }

      setToast("Invoice email sent");
      setEmailModalOpen(false);
  } catch {
      setToast("Could not send invoice email. Try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Invoice workspace</h1>
        <p className="text-sm text-slate-500">
          Inspect invoice status, payment allocations, and timeline events for customer follow-ups.
        </p>
      </header>

      {isWorkspaceLoading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      ) : invoice ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div data-testid="invoice-header" className="text-xl font-semibold text-slate-900">
                Invoice #{invoice.number}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>Status:</span>
                <span
                  data-testid="invoice-status-chip"
                  className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700"
                >
                  {invoice.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>Issued {invoice.issuedOn ? new Date(invoice.issuedOn).toLocaleDateString("en-ZA") : "—"}</span>
                <span>Due {invoice.dueOn ? new Date(invoice.dueOn).toLocaleDateString("en-ZA") : "—"}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              <p className="text-xs uppercase tracking-wide text-slate-400">Balance due</p>
              <p data-testid="invoice-balance" className="text-2xl font-semibold text-slate-900">
                {formatCurrency(invoice.totals?.balanceDue)}
              </p>
              <button
                type="button"
                aria-disabled={invoice.guardrails?.finalize?.allowed === false}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Finalize invoice
              </button>
              {guardrailMessage ? (
                <p data-testid="finalization-lock-reason" className="max-w-xs text-xs text-rose-600">
                  {guardrailMessage}
                </p>
              ) : null}
              <button
                type="button"
                onClick={handleOpenEmailModal}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Email invoice
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Payment progress</h2>
                <div data-testid="invoice-payment-progress" className="mt-3 space-y-2 text-sm text-slate-700">
                  {allocations.length === 0 ? (
                    <p>No allocations recorded yet.</p>
                  ) : (
                    allocations.map((allocation) => (
                      <div key={allocation.id} className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="font-semibold text-slate-900">{formatCurrency(allocation.amount)}</p>
                        <p className="text-xs text-slate-500">
                          Applied {formatTimestamp(allocation.appliedOn)} • Reference {allocation.reference}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Totals</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <dt>Subtotal (ex VAT)</dt>
                    <dd>{formatCurrency(invoice.totals?.subtotalExVat)}</dd>
                  </div>
                  <div>
                    <dt>VAT</dt>
                    <dd>{formatCurrency(invoice.totals?.vatAmount)}</dd>
                  </div>
                  <div>
                    <dt>Total incl. VAT</dt>
                    <dd>{formatCurrency(invoice.totals?.totalIncVat)}</dd>
                  </div>
                  <div>
                    <dt>Amount paid</dt>
                    <dd>{formatCurrency(invoice.totals?.amountPaid)}</dd>
                  </div>
                </dl>
              </section>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Timeline</h2>
              {isTimelineLoading ? (
                <div className="mt-4 h-40 animate-pulse rounded-lg bg-slate-100" />
              ) : (
                <ol
                  data-testid="invoice-timeline"
                  className="mt-4 space-y-3 text-sm text-slate-700"
                >
                  {timeline?.events?.map((event) => (
                    <li key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="font-semibold text-slate-900">{event.summary}</p>
                      <p className="text-xs text-slate-500">{event.actor}</p>
                      <p className="text-xs text-slate-400">{formatTimestamp(event.timestamp)}</p>
                    </li>
                  ))}
                  {timeline?.events?.length ? null : (
                    <li className="rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-500">
                      Timeline events will appear here once available.
                    </li>
                  )}
                </ol>
              )}
            </section>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Invoice workspace unavailable. Check the URL and try again.
        </div>
      )}

      {emailModalOpen && invoice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            data-testid="email-invoice-modal"
          >
            <h2 className="text-lg font-semibold text-slate-900">Email invoice</h2>
            <p className="mt-1 text-sm text-slate-500">
              Send the finalized document to customer stakeholders.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Recipients
                <input
                  data-testid="email-recipient-input"
                  value={emailForm.recipients}
                  onChange={(event) =>
                    setEmailForm((prev) => ({ ...prev, recipients: event.target.value }))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Message
                <textarea
                  data-testid="email-message-input"
                  value={emailForm.message}
                  onChange={(event) =>
                    setEmailForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                  rows={4}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  data-testid="email-attachments-toggle"
                  checked={emailForm.includeAttachments}
                  onChange={(event) =>
                    setEmailForm((prev) => ({ ...prev, includeAttachments: event.target.checked }))
                  }
                />
                Include attachments
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => setEmailModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                Send email
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          data-testid="toast"
          className="fixed bottom-6 right-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
