import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  ProductCatalogEntryCard,
  type ProductCatalogEntry,
  type ProductOverride,
} from '@/features/products/components/ProductCatalogEntryCard';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);

const buildProduct = (overrides: Partial<ProductCatalogEntry> = {}): ProductCatalogEntry => ({
  productId: 'prod-1001',
  name: 'Snowva Retail Bundle',
  category: 'Bundles',
  sku: 'SNW-RTL-001',
  retailPrice: 1299,
  consumerPrice: 1499,
  versionHistory: [
    {
      versionId: 'v5',
      status: 'Active',
      effectiveDate: '2024-09-01',
    },
    {
      versionId: 'v4',
      status: 'Archived',
      effectiveDate: '2024-05-01',
    },
    {
      versionId: 'v3',
      status: 'Archived',
      effectiveDate: '2024-01-01',
    },
  ],
  currentPricelistVersion: 'v5',
  customOverrides: [],
  ...overrides,
});

describe('ProductCatalogEntryCard', () => {
  it('renders core product metadata and pricing tiers', () => {
    const product = buildProduct();

    render(<ProductCatalogEntryCard product={product} />);

    expect(
      screen.getByRole('heading', { name: /Snowva Retail Bundle/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Bundles/i)).toBeInTheDocument();

    expect(screen.getByTestId('product-retail-price')).toHaveTextContent(
      formatCurrency(product.retailPrice),
    );
    expect(screen.getByTestId('product-consumer-price')).toHaveTextContent(
      formatCurrency(product.consumerPrice),
    );
    expect(screen.getByTestId('product-entry-card')).toHaveAttribute(
      'data-current-version',
      'v5',
    );
  });

  it('highlights customer override badge when override exists for active customer', () => {
    const override: ProductOverride = {
      customerId: 'cust-200',
      price: 899,
      expiresAt: '2024-12-31',
    };
    const product = buildProduct({ customOverrides: [override] });
    const handleOverride = jest.fn();

    render(
      <ProductCatalogEntryCard
        product={product}
        activeCustomerId="cust-200"
        onOverrideSelect={handleOverride}
      />,
    );

    const badge = screen.getByTestId('product-override-badge');
    expect(badge).toHaveTextContent('Override active');
    expect(badge).toHaveTextContent(formatCurrency(override.price));

    fireEvent.click(badge);

    expect(handleOverride).toHaveBeenCalledWith(override);
  });

  it('renders version history chips from most recent to oldest', () => {
    const product = buildProduct({
      versionHistory: [
        { versionId: 'v7', status: 'Active', effectiveDate: '2024-11-01' },
        { versionId: 'v6', status: 'Archived', effectiveDate: '2024-08-01' },
        { versionId: 'v5', status: 'Archived', effectiveDate: '2024-05-01' },
      ],
      currentPricelistVersion: 'v7',
    });

    render(<ProductCatalogEntryCard product={product} />);

    const chips = screen.getAllByTestId('product-version-chip');

    expect(chips).toHaveLength(3);
    expect(chips[0]).toHaveTextContent('v7');
    expect(chips[0]).toHaveAttribute('data-status', 'active');
    expect(chips[1]).toHaveTextContent('v6');
    expect(chips[2]).toHaveTextContent('v5');
    expect(chips[2]).toHaveAttribute('data-status', 'archived');
  });
});
