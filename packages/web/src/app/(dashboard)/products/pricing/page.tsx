"use client";

import { useEffect, useState } from "react";

type ProductPricing = {
  id: string;
  name: string;
  sku: string;
  category: string;
  retailPrice: number;
  consumerPrice: number;
  pendingUpdate: null | {
    effectiveFrom: string;
    proposedRetailPrice: number;
    proposedConsumerPrice: number;
    reason?: string;
  };
  priceListVersion?: {
    id: string;
    label: string;
    status: string;
  };
};

type ProductCatalogResponse = {
  filters?: {
    catalogTypes?: string[];
  };
  products?: ProductPricing[];
};

type PriceListDiffResponse = {
  version: {
    id: string;
    label: string;
    effectiveFrom: string;
  };
  changes: Array<{
    productId: string;
    from: number;
    to: number;
    percentageChange?: number;
  }>;
};

type EditingState = {
  productId: string;
  retail: string;
  consumer: string;
  notes: string;
};

const formatPrice = (value?: number | null) => {
  if (typeof value !== "number") {
    return "R0.00";
  }

  return `R${(value / 100).toFixed(2)}`;
};

const formatEffectiveDate = (date: string) => {
  const candidate = new Date(date);
  if (Number.isNaN(candidate.getTime())) {
    return date;
  }

  return candidate.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ProductPricingWorkspace() {
  const [catalogType, setCatalogType] = useState<string>("All");
  const [catalogOptions, setCatalogOptions] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductPricing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [diffModal, setDiffModal] = useState<null | {
    productId: string;
    payload: PriceListDiffResponse;
  }>(null);

  const loadCatalog = async (type: string) => {
    setIsLoading(true);
    try {
      const query = type && type !== "All" ? `?catalogType=${encodeURIComponent(type)}` : "";
      const response = await fetch(`/api/v1/products${query}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const payload = (await response.json()) as ProductCatalogResponse;
      setCatalogOptions(payload.filters?.catalogTypes ?? []);
      setProducts(payload.products ?? []);
  } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalog(catalogType);
  }, [catalogType]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  const beginEditing = (product: ProductPricing) => {
    setEditing({
      productId: product.id,
      retail: (product.retailPrice / 100).toString(),
      consumer: (product.consumerPrice / 100).toString(),
      notes: "",
    });
  };

  const commitPricing = async () => {
    if (!editing) {
      return;
    }

    const retailPrice = Math.round(Number(editing.retail) * 100);
    const consumerPrice = Math.round(Number(editing.consumer) * 100);

    try {
      const response = await fetch(`/api/v1/products/${editing.productId}/pricing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          retailPrice,
          consumerPrice,
          notes: editing.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Pricing update failed");
      }

      const payload = (await response.json()) as {
        product?: Partial<ProductPricing>;
        success?: boolean;
      };

      setProducts((previous) =>
        previous.map((product) =>
          product.id === editing.productId
            ? {
                ...product,
                ...payload.product,
                retailPrice,
                consumerPrice,
              }
            : product,
        ),
      );

      setToast("Pricing updated");
      setEditing(null);
  } catch {
      setToast("Could not update pricing. Try again.");
    }
  };

  const openDiffModal = async (product: ProductPricing) => {
    if (!product.priceListVersion) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/price-lists/${product.priceListVersion.id}/diff`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load price list diff");
      }

      const payload = (await response.json()) as PriceListDiffResponse;
      setDiffModal({
        productId: product.id,
        payload,
      });
  } catch {
      setToast("Could not load price list diff");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Seasonal pricing workspace</h1>
        <p className="text-sm text-slate-500">
          Filter catalog segments, review pending updates, and commit pricing adjustments before rollout.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <label htmlFor="catalog-type" className="text-sm font-medium text-slate-700">
            Catalog type
          </label>
          <select
            id="catalog-type"
            value={catalogType}
            onChange={(event) => setCatalogType(event.target.value)}
            className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="All">All</option>
            {catalogOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">No products match the selected filters yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const pending = product.pendingUpdate;
              const isEditing = editing?.productId === product.id;

              return (
                <article
                  key={product.id}
                  data-testid="product-card"
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                >
                  <header className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{product.category}</p>
                    <p className="text-sm text-slate-500">SKU {product.sku}</p>
                  </header>

                  {!isEditing ? (
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>
                        Retail {formatPrice(product.retailPrice)} • Consumer {formatPrice(product.consumerPrice)}
                      </p>
                      {pending ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          <div data-testid="pending-update-badge" className="text-xs font-semibold uppercase tracking-wide">
                            Pending change
                          </div>
                          <p data-testid="pending-update-effective" className="text-xs text-amber-700">
                            Effective {formatEffectiveDate(pending.effectiveFrom)}
                          </p>
                          <p className="text-xs text-amber-700">Reason: {pending.reason ?? "Operational adjustment"}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-4">
                      <label className="flex flex-col gap-1 text-sm text-slate-600">
                        Retail price (ZAR)
                        <input
                          data-testid="retail-price-input"
                          value={editing.retail}
                          onChange={(event) => setEditing((prev) => (prev ? { ...prev, retail: event.target.value } : prev))}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm text-slate-600">
                        Consumer price (ZAR)
                        <input
                          data-testid="consumer-price-input"
                          value={editing.consumer}
                          onChange={(event) =>
                            setEditing((prev) => (prev ? { ...prev, consumer: event.target.value } : prev))
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm text-slate-600">
                        Notes
                        <textarea
                          data-testid="price-change-notes"
                          value={editing.notes}
                          onChange={(event) => setEditing((prev) => (prev ? { ...prev, notes: event.target.value } : prev))}
                          rows={3}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          data-testid="price-save-button"
                          onClick={commitPricing}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                          Save pricing
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <footer className="flex flex-wrap gap-2">
                    {!isEditing ? (
                      <button
                        type="button"
                        data-testid="price-edit-button"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
                        onClick={() => beginEditing(product)}
                      >
                        Edit pricing
                      </button>
                    ) : null}
                    {product.priceListVersion ? (
                      <button
                        type="button"
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        onClick={() => openDiffModal(product)}
                      >
                        View version diff
                      </button>
                    ) : null}
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {diffModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <div
            role="dialog"
            aria-modal="true"
            data-testid="price-list-diff-modal"
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">{diffModal.payload.version.label}</h2>
            <p className="text-sm text-slate-500">
              Effective {formatEffectiveDate(diffModal.payload.version.effectiveFrom)}
            </p>

            <table className="mt-4 w-full table-fixed divide-y divide-slate-200 text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">From</th>
                  <th className="px-3 py-2 text-left">To</th>
                  <th className="px-3 py-2 text-left">Change</th>
                </tr>
              </thead>
              <tbody>
                {diffModal.payload.changes.map((change) => {
                  const productName = products.find((product) => product.id === change.productId)?.name ?? change.productId;
                  return (
                    <tr key={change.productId} data-testid="diff-row" className="border-b border-slate-100">
                      <td className="px-3 py-2">{productName}</td>
                      <td className="px-3 py-2">{formatPrice(change.from)}</td>
                      <td className="px-3 py-2">{formatPrice(change.to)}</td>
                      <td className="px-3 py-2">
                        {change.percentageChange ? `${(change.percentageChange * 100).toFixed(2)}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => setDiffModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                onClick={() => {
                  setToast("Price list rollout queued");
                  setDiffModal(null);
                }}
              >
                Confirm rollout
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
