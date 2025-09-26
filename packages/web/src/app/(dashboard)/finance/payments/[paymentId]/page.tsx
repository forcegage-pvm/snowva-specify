"use client";

import { useEffect, useMemo, useState } from "react";

type AllocationInvoice = {
  id: string;
  number: string;
  branch: string;
  issuedOn: string;
  dueOn: string;
  status: string;
  amountDue: number;
  recommendedAllocation: number;
};

type PaymentAllocationResponse = {
  payment: {
    id: string;
    reference: string;
    receivedOn: string;
    amount: number;
    currency: string;
    source?: string;
    memo?: string;
  };
  customer: {
    id: string;
    displayName: string;
    branchCount: number;
    creditLimit?: number;
    outstandingBalance?: number;
  };
  invoices: AllocationInvoice[];
  recommendation?: {
    strategy: string;
    totalAllocated: number;
    remainingBalance: number;
    notes?: string;
  };
  manualOverrideOptions?: {
    allowPartial?: boolean;
    allowBranchTransfer?: boolean;
    requireReason?: boolean;
    reasonPresets?: string[];
  };
};

type PaymentAuditResponse = {
  events: Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details?: Record<string, unknown>;
  }>;
};

type AllocationWarning = {
  code: string;
  message: string;
};

type ManualOverrideDraft = {
  invoiceId: string;
  amount: number;
  reason: string;
  notes: string;
};

const formatCurrency = (value: number | undefined) => {
  if (typeof value !== "number") {
    return "R0";
  }

  return `R${value.toLocaleString("en-US")}`;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PaymentAllocationWorkspace({
  params,
}: {
  params: { paymentId: string };
}) {
  const { paymentId } = params;
  const [allocation, setAllocation] = useState<PaymentAllocationResponse | null>(null);
  const [auditLog, setAuditLog] = useState<PaymentAuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<AllocationWarning[]>([]);
  const [manualAmounts, setManualAmounts] = useState<Record<string, number>>({});
  const [manualModal, setManualModal] = useState<ManualOverrideDraft | null>(null);
  const [remainingBalance, setRemainingBalance] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/payments/${paymentId}/allocation-view`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load allocation");
        }

        const payload = (await response.json()) as PaymentAllocationResponse;
        if (!isActive) {
          return;
        }

        setAllocation(payload);
        setRemainingBalance(payload.recommendation?.remainingBalance ?? null);
        const presetAmounts = Object.fromEntries(
          payload.invoices.map((invoice) => [invoice.id, invoice.recommendedAllocation]),
        );
        setManualAmounts(presetAmounts);
  } catch {
        if (!controller.signal.aborted && isActive) {
          setAllocation(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [paymentId]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const load = async () => {
      setIsAuditLoading(true);
      try {
        const response = await fetch(`/api/v1/payments/${paymentId}/audit-log`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load audit log");
        }

        const payload = (await response.json()) as PaymentAuditResponse;
        if (!isActive) {
          return;
        }

        setAuditLog(payload);
  } catch {
        if (!controller.signal.aborted && isActive) {
          setAuditLog(null);
        }
      } finally {
        if (isActive) {
          setIsAuditLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [paymentId]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 3200);
    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  const payment = allocation?.payment;
  const customer = allocation?.customer;
  const invoices = allocation?.invoices ?? [];
  const recommendation = allocation?.recommendation;
  const manualReasonOptions = allocation?.manualOverrideOptions?.reasonPresets ?? [];

  const allocationSummary = useMemo(() => {
    if (!payment) {
      return null;
    }

    return {
      receivedOn: formatDate(payment.receivedOn),
      amount: formatCurrency(payment.amount),
    };
  }, [payment]);

  const handleApplyRecommendation = async () => {
    if (!allocation || !payment) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/payments/${payment.id}/apply-allocation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          allocations: invoices.map((invoice) => ({
            invoiceId: invoice.id,
            amount: invoice.recommendedAllocation,
            overrideReason: null,
          })),
          remainingBalanceAction: {
            type: "retain",
            notes: recommendation?.notes ?? "Awaiting finalization of outstanding invoices",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply recommendation");
      }

      const payload = (await response.json()) as {
        success?: boolean;
        remainingBalance?: number;
        warnings?: AllocationWarning[];
      };

      setWarnings(payload.warnings ?? []);
      setToast("Payment allocation saved");
      if (typeof payload.remainingBalance === "number") {
        setRemainingBalance(payload.remainingBalance);
      }
  } catch {
      setToast("Could not apply allocation. Try again.");
    }
  };

  const openManualOverride = (invoiceId: string) => {
    const amount = manualAmounts[invoiceId] ?? 0;
    setManualModal({
      invoiceId,
      amount,
      reason: manualReasonOptions[0] ?? "",
      notes: "",
    });
  };

  const handleConfirmManualOverride = async () => {
    if (!manualModal || !payment) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/payments/${payment.id}/manual-override`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: manualModal.invoiceId,
          amount: manualModal.amount,
          strategy: "manual",
          reason: manualModal.reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Manual override failed");
      }

      const payload = (await response.json()) as {
        success?: boolean;
        remainingBalance?: number;
      };

      if (typeof payload.remainingBalance === "number") {
        setRemainingBalance(payload.remainingBalance);
      }

      setToast("Manual override captured");
      setManualModal(null);
  } catch {
      setToast("Unable to capture manual override. Try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Payment allocation workspace</h1>
        <p className="text-sm text-slate-500">
          Review recommended allocations, surface warnings, and capture manual overrides with full audit history.
        </p>
      </header>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      ) : payment && customer ? (
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 data-testid="payment-header" className="text-xl font-semibold text-slate-900">
                {payment.reference}
              </h2>
              <p className="text-sm text-slate-600">{customer.displayName}</p>
            </div>
            <div data-testid="payment-summary" className="space-y-1 text-right text-sm text-slate-600">
              <p>Payment received on {allocationSummary?.receivedOn}</p>
              <p className="text-base font-semibold text-slate-900">{allocationSummary?.amount}</p>
              <p data-testid="remaining-balance" className="text-sm text-slate-500">
                Remaining balance: {formatCurrency(remainingBalance ?? recommendation?.remainingBalance ?? 0)}
              </p>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recommended allocation
              </h3>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                {recommendation?.strategy?.toUpperCase() ?? "Strategy"}
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table data-testid="allocation-table" className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Invoice</th>
                    <th className="px-4 py-3 text-left">Branch</th>
                    <th className="px-4 py-3 text-left">Due</th>
                    <th className="px-4 py-3 text-left">Amount due</th>
                    <th className="px-4 py-3 text-left">Recommended</th>
                    <th className="px-4 py-3 text-left">Manual amount</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="bg-white">
                      <td className="px-4 py-3 font-semibold text-slate-900">{invoice.number}</td>
                      <td className="px-4 py-3 text-slate-600">{invoice.branch}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(invoice.dueOn)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(invoice.amountDue)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(invoice.recommendedAllocation)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <input
                          type="number"
                          data-testid="manual-allocation-input"
                          className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                          value={manualAmounts[invoice.id] ?? invoice.recommendedAllocation}
                          onChange={(event) =>
                            setManualAmounts((prev) => ({
                              ...prev,
                              [invoice.id]: Number(event.target.value),
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
                          onClick={() => openManualOverride(invoice.id)}
                        >
                          Manual override
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                FIFO recommendation total: {formatCurrency(recommendation?.totalAllocated ?? 0)}
              </div>
              <button
                type="button"
                onClick={handleApplyRecommendation}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Apply allocation
              </button>
            </div>
          </section>

          {warnings.length ? (
            <div
              data-testid="allocation-alerts"
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              {warnings.map((warning) => (
                <p key={warning.code}>{warning.message}</p>
              ))}
            </div>
          ) : null}

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Audit timeline</h3>
            {isAuditLoading ? (
              <div className="mt-3 h-32 animate-pulse rounded-lg bg-slate-100" />
            ) : (
              <ul
                data-testid="payment-audit-timeline"
                className="mt-3 space-y-3 text-sm text-slate-700"
              >
                {auditLog?.events?.map((event) => (
                  <li key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">{event.action}</p>
                    <p className="text-xs text-slate-500">{event.actor}</p>
                    <p className="text-xs text-slate-400">{formatTimestamp(event.timestamp)}</p>
                    {event.details ? (
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-white p-2 text-xs text-slate-500">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    ) : null}
                  </li>
                ))}
                {auditLog?.events?.length ? null : (
                  <li className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                    Audit events will appear here as allocations are captured.
                  </li>
                )}
              </ul>
            )}
          </section>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Payment allocation workspace unavailable. Verify the payment identifier and try again.
        </div>
      )}

      {manualModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            data-testid="manual-override-modal"
          >
            <h2 className="text-lg font-semibold text-slate-900">Manual override</h2>
            <p className="mt-1 text-sm text-slate-500">
              Capture a custom allocation amount and provide operational notes.
            </p>

            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Amount (ZAR)
                <input
                  type="number"
                  value={manualModal.amount}
                  onChange={(event) =>
                    setManualModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            amount: Number(event.target.value),
                          }
                        : prev,
                    )
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Override reason
                <select
                  value={manualModal.reason}
                  onChange={(event) =>
                    setManualModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            reason: event.target.value,
                          }
                        : prev,
                    )
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {manualReasonOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Notes
                <textarea
                  value={manualModal.notes}
                  onChange={(event) =>
                    setManualModal((prev) =>
                      prev
                        ? {
                            ...prev,
                            notes: event.target.value,
                          }
                        : prev,
                    )
                  }
                  rows={3}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => setManualModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                onClick={handleConfirmManualOverride}
              >
                Confirm override
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
