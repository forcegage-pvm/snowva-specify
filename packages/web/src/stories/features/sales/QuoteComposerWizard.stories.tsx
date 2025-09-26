'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { QuoteComposerWizard } from '@/features/sales/components/QuoteComposerWizard';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const SAMPLE_QUOTE: React.ComponentProps<typeof QuoteComposerWizard>['initialQuote'] = {
  quoteId: 'quote_2025_0041',
  customerId: 'cust_sportsmans',
  customerName: 'Sportsmans Warehouse',
  orderNumber: 'PO-4521',
  vatNumber: '4080304928',
  currency: 'ZAR',
  status: 'Draft',
  steps: ['details', 'items', 'review'],
  activeStep: 'details',
  lineItems: [
    {
      lineId: 'line-ice-machines',
      productId: 'prod_ice_machine_ultra',
      description: 'Snowva Ultra Ice Machine',
      quantity: 4,
      unitPrice: 78_500,
      vatRate: 0.15,
    },
    {
      lineId: 'line-braai',
      productId: 'prod_braai_grid',
      description: 'Snowva Stainless Braai Grid',
      quantity: 12,
      unitPrice: 1_950,
      vatRate: 0.15,
    },
  ],
  discounts: [
    {
      discountId: 'disc-loyalty',
      label: 'Loyalty rebate',
      amount: 5,
      type: 'percentage',
    },
  ],
  deliveryFee: 4_500,
  notes: 'Include optional maintenance addendum.',
};

type QuoteComposerStoryProps = React.ComponentProps<typeof QuoteComposerWizard> & BreakpointArgs;

const meta = {
  title: 'Features/Sales/QuoteComposerWizard',
  component: QuoteComposerWizard,
  args: {
    breakpoint: 'desktop',
    initialQuote: SAMPLE_QUOTE,
    onStepChange: fn(),
    onSubmit: fn(),
    onPreview: fn(),
    onCancel: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: ({ breakpoint, ...props }) => (
    <BreakpointContainer breakpoint={breakpoint}>
      <QuoteComposerWizard {...props} />
    </BreakpointContainer>
  ),
} satisfies Meta<QuoteComposerStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DraftFlow: Story = {};

export const ReviewStep: Story = {
  args: {
    initialQuote: {
      ...SAMPLE_QUOTE,
      activeStep: 'review',
      lineItems: SAMPLE_QUOTE.lineItems,
    },
  },
};
