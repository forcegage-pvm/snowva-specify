'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { InvoiceWorkspace } from '@/features/sales/components/InvoiceWorkspace';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const SAMPLE_INVOICE: React.ComponentProps<typeof InvoiceWorkspace>['invoice'] = {
  invoiceId: 'INV-2025-0312',
  customerName: 'Sportsmans Warehouse',
  status: 'Draft',
  totals: {
    subtotal: 312_000,
    vat: 46_800,
    total: 358_800,
    balanceDue: 358_800,
  },
  paymentStatus: 'Unpaid',
  vatNumber: '4080304928',
  orderReference: 'PO-4521',
  canFinalize: true,
  canEdit: true,
  lineItems: [
    {
      lineId: 'line-01',
      productId: 'prod_ice_machine_ultra',
      description: 'Snowva Ultra Ice Machine',
      quantity: 4,
      unitPrice: 78_000,
      vatRate: 0.15,
    },
    {
      lineId: 'line-02',
      productId: 'prod_installation',
      description: 'On-site installation & calibration',
      quantity: 1,
      unitPrice: 10_000,
      vatRate: 0.15,
    },
  ],
  timeline: [
    {
      eventId: 'timeline-01',
      timestamp: '2025-03-08T09:30:00Z',
      type: 'created',
      actor: 'Lerato Nkosi',
      summary: 'Invoice drafted for winter campaign equipment.',
    },
    {
      eventId: 'timeline-02',
      timestamp: '2025-03-08T11:05:00Z',
      type: 'note',
      actor: 'Finance Automation',
      summary: 'Draft autosave captured delivery fee update.',
    },
  ],
};

type InvoiceWorkspaceStoryProps = React.ComponentProps<typeof InvoiceWorkspace> & BreakpointArgs;

const meta = {
  title: 'Features/Sales/InvoiceWorkspace',
  component: InvoiceWorkspace,
  args: {
    breakpoint: 'desktop',
    invoice: SAMPLE_INVOICE,
    onFinalize: fn(),
    onReopen: fn(),
    onSendEmail: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: ({ breakpoint, ...props }) => (
    <BreakpointContainer breakpoint={breakpoint}>
      <InvoiceWorkspace {...props} />
    </BreakpointContainer>
  ),
} satisfies Meta<InvoiceWorkspaceStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DraftInvoice: Story = {};

export const FinalizedInvoice: Story = {
  args: {
    invoice: {
      ...SAMPLE_INVOICE,
      status: 'Finalized',
      canFinalize: false,
      canEdit: false,
      paymentStatus: 'Partial',
      timeline: [
        ...SAMPLE_INVOICE.timeline,
        {
          eventId: 'timeline-03',
          timestamp: '2025-03-09T08:12:00Z',
          type: 'finalized',
          actor: 'Finance Automation',
          summary: 'Invoice finalized and distributed to customer.',
        },
      ],
    },
  },
};
