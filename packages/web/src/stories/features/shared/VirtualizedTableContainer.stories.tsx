'use client';

import type { Meta, StoryObj } from '@storybook/react';

import { VirtualizedTableContainer } from '@/features/shared/components/VirtualizedTableContainer';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const BRANCHES = ['Cape Town', 'Durban', 'Polokwane', 'Gqeberha', 'Bloemfontein'];
const PRODUCT_FAMILIES = ['Cement', 'Steel', 'Lumber', 'Aggregate', 'Glass'];

type InventoryRow = {
  id: string;
  branch: string;
  sku: string;
  family: string;
  description: string;
  onHand: number;
  committed: number;
  replenishmentEta: string | null;
};

const INVENTORY_ITEMS = Array.from({ length: 120 }).map((_, index) => {
  const branch = BRANCHES[index % BRANCHES.length];
  const family = PRODUCT_FAMILIES[index % PRODUCT_FAMILIES.length];
  const sku = `SKU-${family.slice(0, 3).toUpperCase()}-${(index + 1).toString().padStart(4, '0')}`;

  return {
    id: `inventory-${index + 1}`,
    branch,
    sku,
    family,
    description: `${family} bundle ${(index % 5) + 1}`,
    onHand: 500 - (index % 17) * 12,
    committed: (index % 9) * 8,
    replenishmentEta: index % 4 === 0 ? '2025-03-12' : null,
  } satisfies InventoryRow;
});
type VirtualizedTableStoryArgs = BreakpointArgs & {
  rows: number;
  isLoading: boolean;
  showEmptyState: boolean;
  maxHeight: number;
  overscan: number;
};

const formatQuantity = (value: number) => new Intl.NumberFormat('en-ZA').format(value);

const meta = {
  title: 'Features/Shared/VirtualizedTableContainer',
  args: {
    breakpoint: 'desktop',
    rows: 40,
    isLoading: false,
    showEmptyState: false,
    maxHeight: 420,
    overscan: 8,
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
    rows: {
      control: { type: 'range', min: 0, max: 120, step: 10 },
    },
  },
  render: ({ breakpoint, rows, isLoading, showEmptyState, maxHeight, overscan }) => {
    const resolvedItems = showEmptyState ? [] : INVENTORY_ITEMS.slice(0, rows || 0);

    return (
      <BreakpointContainer breakpoint={breakpoint}>
        <VirtualizedTableContainer<InventoryRow>
          items={resolvedItems}
          isLoading={isLoading}
          overscan={overscan}
          maxHeight={maxHeight}
          estimatedRowHeight={64}
          columnCount={5}
          testId="inventory-virtualized-table"
          aria-label="Inventory availability"
          renderHeader={() => (
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Branch</th>
                <th scope="col" className="px-4 py-3">SKU</th>
                <th scope="col" className="px-4 py-3">Description</th>
                <th scope="col" className="px-4 py-3 text-right">On hand</th>
                <th scope="col" className="px-4 py-3 text-right">Committed</th>
              </tr>
            </thead>
          )}
          renderRow={(item) => (
            <tr key={item.id} role="row" className="even:bg-slate-50/60">
              <td className="px-4 py-3 text-sm text-slate-700">{item.branch}</td>
              <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.sku}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{item.description}</td>
              <td className="px-4 py-3 text-sm text-right text-slate-700">
                {formatQuantity(item.onHand)}
              </td>
              <td className="px-4 py-3 text-sm text-right text-slate-700">
                {formatQuantity(item.committed)}
              </td>
            </tr>
          )}
          emptyState={(
            <div className="space-y-2 text-center text-sm text-slate-500">
              <p>No inventory records available.</p>
              <p className="text-xs">Adjust filters or sync with the ERP to refresh data.</p>
            </div>
          )}
          skeletonRowCount={8}
          skeletonRowRenderer={(index) => (
            <div key={`inventory-skeleton-${index}`} className="h-14 w-full animate-pulse rounded bg-slate-200/80" />
          )}
          getRowKey={(item) => item.id}
        />
      </BreakpointContainer>
    );
  },
} satisfies Meta<VirtualizedTableStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InventoryTable: Story = {};
