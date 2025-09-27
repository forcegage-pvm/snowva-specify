"use client";

import { useEffect, useMemo, useState } from "react";

type QuoteComposerBootstrap = {
  customers: Array<{
    id: string;
    displayName: string;
    customerType: string;
    creditLimit: number;
    outstandingBalance: number;
    branches: Array<{
      id: string;
      displayName: string;
      default?: boolean;
      vatNumber?: string;
    }>;
    recentDocuments?: Record<string, unknown>;
  }>;
  catalog: Array<{
    id: string;
    title: string;
    sku: string;
    retailPrice: number;
    consumerPrice: number;
    vatRate: number;
  }>;
  defaultVatRate: number;
  maxLineItems: number;
};

type DraftQuoteResponse = {
  success: boolean;
  quote: {
    id: string;
    customerId: string;
    branchId: string;
    lineItems: Array<any>;
    totals: {
      subtotalExVat: number;
      vatAmount: number;
      total: number;
    };
    vatRate: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    notes: string;
    validUntil: string;
  };
  message: string;
};

type QuotePreviewResponse = {
  url: string;
  expiresAt: string;
};

type QuoteTimelineResponse = {
  events: Array<{
    id: string;
    type: string;
    timestamp: string;
    actor: string;
    summary: string;
  }>;
};

type QuoteLineItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceExVat: number;
};

type WorkflowStep = "details" | "lines" | "summary";

const formatCurrency = (value: number | undefined) => {
  if (typeof value !== "number") {
    return "R0";
  }

  return `R${value.toLocaleString("en-US")}`;
};

const formatQuantityPrice = (productPrice: number, quantity: number) =>
  `R${(productPrice * quantity).toLocaleString("en-US")}`;

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function QuoteComposerPage() {
  const [bootstrap, setBootstrap] = useState<QuoteComposerBootstrap | null>(null);
  const [isLoadingBootstrap, setIsLoadingBootstrap] = useState(false);
  const [step, setStep] = useState<WorkflowStep>("details");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState<string>("");
  const [reference, setReference] = useState<string>("TA-QUOTE-2024-12");
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, number>>({});
  const [draftQuote, setDraftQuote] = useState<DraftQuoteResponse['quote'] | null>(null);
  const [timeline, setTimeline] = useState<QuoteTimelineResponse | null>(null);
  const [preview, setPreview] = useState<QuotePreviewResponse | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [emailRecipients, setEmailRecipients] = useState<string>("");
  const [notes, setNotes] = useState<string>("Site equipment refresh");

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadBootstrap = async () => {
      setIsLoadingBootstrap(true);
      try {
        const response = await fetch("/api/v1/quotes/wizard/bootstrap", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load quote composer data");
        }

        const payload = (await response.json()) as QuoteComposerBootstrap;
        if (!isActive) {
          return;
        }

        setBootstrap(payload);
        if (payload.customers.length) {
          setSelectedCustomerId(payload.customers[0].id);
          setSelectedBranchId(payload.customers[0].branches[0]?.id ?? "");
        }

        const initialQuantities = Object.fromEntries(payload.catalog.map((product) => [product.id, 1]));
        setQuantityDrafts(initialQuantities);
      } catch {
        if (!controller.signal.aborted && isActive) {
          setBootstrap(null);
        }
      } finally {
        if (isActive) {
          setIsLoadingBootstrap(false);
        }
      }
    };

    void loadBootstrap();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  const selectedCustomer = useMemo(
    () => bootstrap?.customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [bootstrap, selectedCustomerId],
  );

  const branchOptions = selectedCustomer?.branches ?? [];

  const addLineItem = (productId: string) => {
    if (!bootstrap) {
      return;
    }

    const product = bootstrap.catalog.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    const quantity = quantityDrafts[productId] ?? 1;
    setLineItems((previous) => {
      const existingIndex = previous.findIndex((item) => item.productId === productId);
      if (existingIndex >= 0) {
        const cloned = [...previous];
        cloned[existingIndex] = {
          ...cloned[existingIndex],
          quantity,
        };
        return cloned;
      }

      return [
        ...previous,
        {
          productId,
          name: product.title,
          quantity,
          unitPriceExVat: product.retailPrice,
        },
      ];
    });
  };

  const removeLineItem = (productId: string) => {
    setLineItems((previous) => previous.filter((item) => item.productId !== productId));
  };

  const proceedToSummary = async () => {
    if (!selectedCustomerId || !selectedBranchId || !lineItems.length) {
      setToast("Add at least one line item before reviewing the quote");
      return;
    }

    try {
      const response = await fetch("/api/v1/quotes/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          branchId: selectedBranchId,
          reference,
          lineItems: lineItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceExVat: item.unitPriceExVat,
          })),
          notes,
          purchaseOrderNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create draft quote");
      }

      const payload = (await response.json()) as DraftQuoteResponse;
      setDraftQuote(payload.quote);
      setStep("summary");

      const timelineResponse = await fetch(`/api/v1/quotes/${payload.quote.id}/timeline`, {
        cache: "no-store",
      });

      if (timelineResponse.ok) {
        const timelinePayload = (await timelineResponse.json()) as QuoteTimelineResponse;
        setTimeline(timelinePayload);
      } else {
        setTimeline(null);
      }
    } catch {
      setToast("Unable to save draft quote. Try again.");
    }
  };

  const loadPreview = async () => {
    if (!draftQuote) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/quotes/${draftQuote.id}/preview`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load preview");
      }

      const payload = (await response.json()) as QuotePreviewResponse;
      setPreview(payload);
      setPreviewOpen(true);
    } catch {
      setToast("Preview unavailable. Try again.");
    }
  };

  const handleConvertToInvoice = async () => {
    if (!draftQuote) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/quotes/${draftQuote.id}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sendEmail,
          emailRecipients: emailRecipients
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Quote conversion failed");
      }

      const payload = (await response.json()) as {
        invoiceId: string;
        invoiceNumber: string;
        redirectUrl?: string;
      };

      setToast(`Invoice ${payload.invoiceNumber} created`);
    } catch {
      setToast("Unable to convert quote. Try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Quote composer</h1>
        <p className="text-sm text-slate-500">
          Build seasonal quotes across catalog segments, capture draft approvals, and prepare for invoicing.
        </p>
      </header>

      {isLoadingBootstrap ? (
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      ) : !bootstrap ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Quote composer unavailable. Try again later.
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {step === "details" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Select customer
                <select
                  value={selectedCustomerId}
                  onChange={(event) => {
                    setSelectedCustomerId(event.target.value);
                    const nextCustomer = bootstrap.customers.find((customer) => customer.id === event.target.value);
                    setSelectedBranchId(nextCustomer?.branches[0]?.id ?? "");
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {bootstrap.customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.displayName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Branch
                <select
                  value={selectedBranchId}
                  onChange={(event) => setSelectedBranchId(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.displayName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Purchase order number
                <input
                  value={purchaseOrderNumber}
                  onChange={(event) => setPurchaseOrderNumber(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Internal reference
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-600 md:col-span-2">
                Notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <div className="md:col-span-2 flex items-center justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  onClick={() => setStep("lines")}
                >
                  Continue to line items
                </button>
              </div>
            </div>
          ) : null}

          {step === "lines" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {bootstrap.catalog.map((product) => (
                  <div
                    key={product.id}
                    data-testid="catalog-product"
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div>
                      <p className="text-base font-semibold text-slate-900">{product.title}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">SKU {product.sku}</p>
                      <p className="text-sm text-slate-600">
                        Retail {formatCurrency(product.retailPrice)} • Consumer {formatCurrency(product.consumerPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex flex-col gap-1 text-xs text-slate-500">
                        Qty
                        <input
                          type="number"
                          min={1}
                          data-testid="line-quantity-input"
                          value={quantityDrafts[product.id] ?? 1}
                          onChange={(event) =>
                            setQuantityDrafts((prev) => ({
                              ...prev,
                              [product.id]: Number(event.target.value) || 1,
                            }))
                          }
                          className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </label>
                      <button
                        type="button"
                        data-testid="add-line-button"
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800"
                        onClick={() => addLineItem(product.id)}
                      >
                        Add line
                      </button>
                    </div>
                    {lineItems.find((item) => item.productId === product.id) ? (
                      <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                        Added to quote
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Draft line items</h3>
                {lineItems.length === 0 ? (
                  <p className="text-sm text-slate-500">Add items from the catalog to build your quote.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left">Product</th>
                          <th className="px-4 py-3 text-left">Quantity</th>
                          <th className="px-4 py-3 text-left">Unit price</th>
                          <th className="px-4 py-3 text-left">Line total</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lineItems.map((item) => (
                          <tr key={item.productId} className="bg-white">
                            <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                            <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-slate-600">{formatCurrency(item.unitPriceExVat)}</td>
                            <td className="px-4 py-3 text-slate-600">{formatQuantityPrice(item.unitPriceExVat, item.quantity)}</td>
                            <td className="px-4 py-3 text-slate-600">
                              <button
                                type="button"
                                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
                                onClick={() => removeLineItem(item.productId)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                  onClick={() => setStep("details")}
                >
                  Back to details
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  onClick={proceedToSummary}
                >
                  Review quote
                </button>
              </div>
            </div>
          ) : null}

          {step === "summary" && draftQuote ? (
            <div className="space-y-6">
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h3>
                <div data-testid="quote-summary" className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Subtotal</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(draftQuote.totals.subtotalExVat)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">VAT (15%)</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(draftQuote.totals.vatAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(draftQuote.totals.total)}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  {lineItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <span>{item.name}</span>
                      <span>
                        {item.quantity} × {formatCurrency(item.unitPriceExVat)} = {formatQuantityPrice(item.unitPriceExVat, item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Timeline</h3>
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    onClick={loadPreview}
                  >
                    Preview document
                  </button>
                </div>

                <div className="mt-4">
                  {timeline?.events?.length ? (
                    <ul data-testid="quote-timeline" className="space-y-3 text-sm text-slate-700">
                      {timeline.events.map((event) => (
                        <li key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="font-semibold text-slate-900">{event.summary}</p>
                          <p className="text-xs text-slate-500">{event.actor}</p>
                          <p className="text-xs text-slate-400">{formatTimestamp(event.timestamp)}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Timeline events will appear here as collaboration progresses.</p>
                  )}
                </div>
              </section>

              <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Dispatch options</h3>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(event) => setSendEmail(event.target.checked)}
                  />
                  Send email notification
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-600">
                  Send PDF to
                  <input
                    value={emailRecipients}
                    onChange={(event) => setEmailRecipients(event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </label>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                    onClick={() => setStep("lines")}
                  >
                    Back to catalog
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    onClick={handleConvertToInvoice}
                  >
                    Convert to invoice
                  </button>
                </div>
              </section>
            </div>
          ) : null}
        </section>
      )}

      {previewOpen && preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <div
            role="dialog"
            aria-modal="true"
            data-testid="quote-preview-modal"
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">Quote preview</h2>
            <p className="text-sm text-slate-500">Valid until {new Date(preview.expiresAt).toLocaleString("en-ZA")}</p>
            <a
              href={preview.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Download preview
            </a>
            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                onClick={() => setPreviewOpen(false)}
              >
                Close preview
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
