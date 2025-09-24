'use client';

export type ProductOverride = {
  customerId: string;
  price: number;
  expiresAt?: string;
};

export type ProductVersion = {
  versionId: string;
  status: 'Draft' | 'Scheduled' | 'Active' | 'Archived';
  effectiveDate: string;
};

export type ProductCatalogEntry = {
  productId: string;
  name: string;
  category: string;
  sku: string;
  retailPrice: number;
  consumerPrice: number;
  versionHistory: ProductVersion[];
  currentPricelistVersion: string;
  customOverrides?: ProductOverride[];
};

type ProductCatalogEntryCardProps = {
  product: ProductCatalogEntry;
  activeCustomerId?: string;
  onOverrideSelect?: (override: ProductOverride) => void;
};

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const versionStatusStyles: Record<ProductVersion['status'], string> = {
  Draft: 'bg-slate-100 text-slate-600',
  Scheduled: 'bg-sky-100 text-sky-700',
  Active: 'bg-emerald-100 text-emerald-700',
  Archived: 'bg-slate-200 text-slate-500',
};

export const ProductCatalogEntryCard = ({
  product,
  activeCustomerId,
  onOverrideSelect,
}: ProductCatalogEntryCardProps) => {
  const activeOverride = activeCustomerId
    ? product.customOverrides?.find((override) => override.customerId === activeCustomerId)
    : undefined;

  const sortedVersions = [...product.versionHistory].sort(
    (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime(),
  );

  const handleOverrideClick = () => {
    if (activeOverride && onOverrideSelect) {
      onOverrideSelect(activeOverride);
    }
  };

  return (
    <article
      data-testid="product-entry-card"
      data-current-version={product.currentPricelistVersion}
      className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
          <p className="text-sm text-slate-500">{product.category}</p>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          SKU: {product.sku}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Retail price</p>
          <p
            data-testid="product-retail-price"
            className="mt-2 text-2xl font-semibold text-slate-900"
          >
            {formatCurrency(product.retailPrice)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Consumer price</p>
          <p
            data-testid="product-consumer-price"
            className="mt-2 text-2xl font-semibold text-slate-900"
          >
            {formatCurrency(product.consumerPrice)}
          </p>
        </div>
      </section>

      {activeOverride ? (
        <button
          type="button"
          data-testid="product-override-badge"
          onClick={handleOverrideClick}
          className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-medium text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
        >
          <span className="text-sm">Override active</span>
          <span className="text-base font-semibold">
            {formatCurrency(activeOverride.price)}
          </span>
        </button>
      ) : null}

      <section aria-label="Version history" className="space-y-2">
        <h4 className="text-xs uppercase tracking-wide text-slate-500">Version history</h4>
        <div className="flex flex-wrap gap-2">
          {sortedVersions.map((version) => (
            <span
              key={version.versionId}
              data-testid="product-version-chip"
              data-status={version.status.toLowerCase()}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${versionStatusStyles[version.status]}`}
            >
              <span>{version.versionId}</span>
              <span className="text-[11px] text-slate-500">
                {new Intl.DateTimeFormat('en-ZA', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                }).format(new Date(version.effectiveDate))}
              </span>
            </span>
          ))}
        </div>
      </section>
    </article>
  );
};
