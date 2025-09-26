'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { buildPaymentAllocationAuditLogQueryKey } from '@/features/finance/api/usePaymentAllocationAuditLogQuery';
import { PaymentAllocationPanel } from '@/features/finance/components/PaymentAllocationPanel';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const SAMPLE_PAYMENT: React.ComponentProps<typeof PaymentAllocationPanel>['payment'] = {
  paymentId: 'PAY-2025-021',
  customerId: 'cust_sportsmans',
  amount: 1_740_000,
  currency: 'ZAR',
  allocationStrategy: 'FIFO',
  recommendedAllocations: [
    {
      invoiceId: 'INV-2025-0301',
      invoiceNumber: 'INV-2025-0301',
      dueDate: '2025-03-15',
      outstandingAmount: 620_000,
      suggestedAmount: 620_000,
    },
    {
      invoiceId: 'INV-2025-0298',
      invoiceNumber: 'INV-2025-0298',
      dueDate: '2025-03-10',
      outstandingAmount: 550_000,
      suggestedAmount: 450_000,
    },
    {
      invoiceId: 'INV-2025-0289',
      invoiceNumber: 'INV-2025-0289',
      dueDate: '2025-02-28',
      outstandingAmount: 260_000,
      suggestedAmount: 200_000,
    },
  ],
  manualAllocations: [
    {
      invoiceId: 'INV-branch_tokai-2025-01',
      amount: 120_000,
    },
  ],
  remainingBalance: 450_000,
  auditEvents: [
    {
      eventId: 'alloc-evt-01',
      timestamp: '2025-03-08T09:12:00Z',
      actor: 'Finance Automation',
      action: 'Generated FIFO recommendation',
      details: 'Suggested allocation across top three overdue invoices.',
    },
    {
      eventId: 'alloc-evt-02',
      timestamp: '2025-03-08T09:20:00Z',
      actor: 'Lerato Nkosi',
      action: 'Manual override applied',
      details: 'Shifted R120,000 to branch Tokai high-priority invoice.',
    },
  ],
};

type PaymentAllocationStoryProps = React.ComponentProps<typeof PaymentAllocationPanel> & BreakpointArgs;

const meta = {
  title: 'Features/Finance/PaymentAllocationPanel',
  component: PaymentAllocationPanel,
  args: {
    breakpoint: 'desktop',
    payment: SAMPLE_PAYMENT,
    onApplyOverride: fn(),
    onCommitAllocation: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: ({ breakpoint, payment, ...props }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
          staleTime: Infinity,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          refetchOnMount: false,
        },
      },
    });

    const auditLogKey = buildPaymentAllocationAuditLogQueryKey(payment?.paymentId ?? null);
    queryClient.setQueryData(auditLogKey, {
      events: payment?.auditEvents ?? [],
      generatedAt: new Date().toISOString(),
      notes: null,
    });

    return (
      <QueryClientProvider client={queryClient}>
        <BreakpointContainer breakpoint={breakpoint}>
          <PaymentAllocationPanel payment={payment} {...props} />
        </BreakpointContainer>
      </QueryClientProvider>
    );
  },
} satisfies Meta<PaymentAllocationStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Panel: Story = {};
