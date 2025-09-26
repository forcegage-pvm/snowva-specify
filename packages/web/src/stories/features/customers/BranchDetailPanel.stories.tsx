'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { BranchDetailPanel } from '@/features/customers/components/BranchDetailPanel';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const SAMPLE_BRANCH: React.ComponentProps<typeof BranchDetailPanel>['branch'] = {
  branchId: 'branch_tokai',
  parentCustomerId: 'cust_sportsmans',
  displayName: 'Sportsmans Warehouse Tokai',
  address: 'Cnr Main & Tokai Road, Tokai, Cape Town, 7965',
  vatNumber: '4080304928',
  paymentTerms: 'Net 30',
  contactEmail: 'tokai.ops@sportsmans.co.za',
  auditTrail: [
    {
      eventId: 'evt-01',
      timestamp: '2025-03-04T07:45:00Z',
      eventType: 'details-update',
      actor: 'Lerato Nkosi',
      summary: 'Updated branch contact email',
    },
    {
      eventId: 'evt-02',
      timestamp: '2025-03-05T09:12:00Z',
      eventType: 'pricing-override',
      actor: 'Finance Automation',
      summary: 'Applied seasonal pricing override'
    },
    {
      eventId: 'evt-03',
      timestamp: '2025-03-07T13:25:00Z',
      eventType: 'note',
      actor: 'Thabo Molefe',
      summary: 'Confirmed Net 30 payment terms with head office',
    },
  ],
};

type BranchDetailStoryProps = React.ComponentProps<typeof BranchDetailPanel> & BreakpointArgs;

const meta = {
  title: 'Features/Customers/BranchDetailPanel',
  component: BranchDetailPanel,
  args: {
    breakpoint: 'desktop',
    branch: SAMPLE_BRANCH,
    onCommitChanges: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: ({ breakpoint, ...props }) => (
    <BreakpointContainer breakpoint={breakpoint} align="start">
      <BranchDetailPanel {...props} />
    </BreakpointContainer>
  ),
} satisfies Meta<BranchDetailStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

export const Editing: Story = {
  args: {
    branch: {
      ...SAMPLE_BRANCH,
      auditTrail: SAMPLE_BRANCH.auditTrail,
    },
  },
};
