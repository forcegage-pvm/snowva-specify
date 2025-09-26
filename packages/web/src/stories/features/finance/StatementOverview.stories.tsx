'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import {
    StatementOverviewTable,
    type StatementOverview,
} from '@/features/finance/components/StatementOverview';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const SAMPLE_STATEMENT: StatementOverview = {
  statementId: 'STAT-2025-03',
  customerId: 'cust_stonehaven',
  customerName: 'Stonehaven Builders',
  period: {
    start: '2025-02-01',
    end: '2025-02-28',
  },
  totalDue: 3_420_000,
  currency: 'ZAR',
  branches: [
    {
      branchId: 'branch_cpt',
      branchName: 'Cape Town Plant',
      subtotalDue: 1_280_000,
      invoices: [
        {
          invoiceId: 'INV-2025-0302',
          invoiceNumber: 'INV-2025-0302',
          dueDate: '2025-03-05',
          amountDue: 420_000,
          status: 'Open',
        },
        {
          invoiceId: 'INV-2025-0298',
          invoiceNumber: 'INV-2025-0298',
          dueDate: '2025-03-01',
          amountDue: 420_000,
          status: 'Overdue',
        },
        {
          invoiceId: 'INV-2025-0291',
          invoiceNumber: 'INV-2025-0291',
          dueDate: '2025-02-20',
          amountDue: 440_000,
          status: 'Overdue',
        },
      ],
    },
    {
      branchId: 'branch_dbn',
      branchName: 'Durban Fabrication',
      subtotalDue: 1_040_000,
      invoices: [
        {
          invoiceId: 'INV-2025-0287',
          invoiceNumber: 'INV-2025-0287',
          dueDate: '2025-02-26',
          amountDue: 320_000,
          status: 'Open',
        },
        {
          invoiceId: 'INV-2025-0282',
          invoiceNumber: 'INV-2025-0282',
          dueDate: '2025-02-19',
          amountDue: 360_000,
          status: 'Overdue',
        },
        {
          invoiceId: 'INV-2025-0275',
          invoiceNumber: 'INV-2025-0275',
          dueDate: '2025-02-10',
          amountDue: 360_000,
          status: 'Overdue',
        },
      ],
    },
    {
      branchId: 'branch_plk',
      branchName: 'Polokwane Site',
      subtotalDue: 1_100_000,
      invoices: [
        {
          invoiceId: 'INV-2025-0269',
          invoiceNumber: 'INV-2025-0269',
          dueDate: '2025-02-05',
          amountDue: 550_000,
          status: 'Overdue',
        },
        {
          invoiceId: 'INV-2025-0265',
          invoiceNumber: 'INV-2025-0265',
          dueDate: '2025-01-28',
          amountDue: 550_000,
          status: 'Overdue',
        },
      ],
    },
  ],
  exportOptions: {
    canDownload: true,
    canEmail: true,
  },
  lastSentAt: '2025-02-28T14:25:00Z',
};

type StatementOverviewStoryProps = React.ComponentProps<typeof StatementOverviewTable> & BreakpointArgs;

const meta = {
  title: 'Features/Finance/StatementOverviewTable',
  component: StatementOverviewTable,
  args: {
    breakpoint: 'desktop',
    statement: SAMPLE_STATEMENT,
    filters: {
      branchIds: [],
      showOverdueOnly: false,
    },
    onFilterChange: fn(),
    onExport: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: ({ breakpoint, ...props }) => (
    <BreakpointContainer breakpoint={breakpoint}>
      <StatementOverviewTable {...props} />
    </BreakpointContainer>
  ),
} satisfies Meta<StatementOverviewStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
