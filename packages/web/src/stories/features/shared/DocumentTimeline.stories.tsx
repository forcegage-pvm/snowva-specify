'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { DocumentTimeline } from '@/features/shared/components/DocumentTimeline';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const SAMPLE_EVENTS: React.ComponentProps<typeof DocumentTimeline>['events'] = [
  {
    eventId: 'evt-010',
    timestamp: '2025-03-08T14:36:00Z',
    eventType: 'payment-posted',
    actor: 'Finance Automation',
    summary: 'Payment R450,000 applied to invoice INV-2025-0298.',
    details: 'Remaining balance on invoice is now R170,000.',
  },
  {
    eventId: 'evt-009',
    timestamp: '2025-03-08T13:05:00Z',
    eventType: 'allocation-override',
    actor: 'Lerato Nkosi',
    summary: 'Manual override applied for INV-branch_tokai-2025-01.',
    details: 'Redirected R120,000 to cover urgent branch request.',
  },
  {
    eventId: 'evt-008',
    timestamp: '2025-03-07T17:45:00Z',
    eventType: 'invoice-issued',
    actor: 'Sales Ops Bot',
    summary: 'Invoice INV-2025-0302 sent to Stonehaven Builders.',
    details: 'Due date set to 2025-03-21.',
  },
  {
    eventId: 'evt-007',
    timestamp: '2025-03-07T09:18:00Z',
    eventType: 'credit-note-created',
    actor: 'Nomusa Dlamini',
    summary: 'Credit note CRN-2025-004 issued for damaged goods.',
    details: 'Referenced purchase order PO-2025-011.',
  },
];

type DocumentTimelineStoryProps = React.ComponentProps<typeof DocumentTimeline> & BreakpointArgs;

const meta = {
  title: 'Features/Shared/DocumentTimeline',
  component: DocumentTimeline,
  args: {
    breakpoint: 'desktop',
    entityId: 'cust_stonehaven',
    entityType: 'Customer',
    events: SAMPLE_EVENTS,
    filters: {
      eventTypes: [],
      actors: [],
    },
    onFilterChange: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: ({ breakpoint, ...props }) => (
    <BreakpointContainer breakpoint={breakpoint}>
      <DocumentTimeline {...props} />
    </BreakpointContainer>
  ),
} satisfies Meta<DocumentTimelineStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Timeline: Story = {};
