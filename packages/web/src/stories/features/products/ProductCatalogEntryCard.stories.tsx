'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { ProductCatalogEntryCard } from '@/features/products/components/ProductCatalogEntryCard';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const SAMPLE_PRODUCT: React.ComponentProps<typeof ProductCatalogEntryCard>['product'] = {
  productId: 'prod_ice_machine_ultra',
  name: 'Snowva Ultra Ice Machine',
  category: 'Cold Chain Equipment',
  sku: 'SN-ICE-ULTRA-01',
  retailPrice: 315_000,
  consumerPrice: 412_000,
  currentPricelistVersion: '2025.1',
  versionHistory: [
    {
      versionId: '2025.1',
      status: 'Active',
      effectiveDate: '2025-01-15',
    },
    {
      versionId: '2024.4',
      status: 'Archived',
      effectiveDate: '2024-10-01',
    },
    {
      versionId: '2024.3',
      status: 'Archived',
      effectiveDate: '2024-07-01',
    },
  ],
  customOverrides: [
    {
      customerId: 'cust_sportsmans',
      price: 302_500,
      expiresAt: '2025-06-30',
    },
    {
      customerId: 'cust_outdoor',
      price: 298_000,
    },
  ],
};

type ProductCatalogEntryStoryProps = React.ComponentProps<typeof ProductCatalogEntryCard> & BreakpointArgs;

const meta = {
  title: 'Features/Products/ProductCatalogEntryCard',
  component: ProductCatalogEntryCard,
  args: {
    breakpoint: 'desktop',
    product: SAMPLE_PRODUCT,
    activeCustomerId: 'cust_sportsmans',
    onOverrideSelect: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: ({ breakpoint, ...props }) => (
    <BreakpointContainer breakpoint={breakpoint}>
      <ProductCatalogEntryCard {...props} />
    </BreakpointContainer>
  ),
} satisfies Meta<ProductCatalogEntryStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutOverride: Story = {
  args: {
    activeCustomerId: 'cust_new_retailer',
  },
};
