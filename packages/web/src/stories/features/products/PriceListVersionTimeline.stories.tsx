'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { PriceListVersionTimeline } from '@/features/products/components/PriceListVersionTimeline';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

const SAMPLE_VERSIONS: React.ComponentProps<typeof PriceListVersionTimeline>['versions'] = [
  {
    versionId: '2025.2',
    status: 'Scheduled',
    effectiveDate: '2025-04-01',
    changedBy: 'Lerato Nkosi',
    notes: 'Includes winter promotional pricing for branch activation.',
  },
  {
    versionId: '2025.1',
    status: 'Active',
    effectiveDate: '2025-01-15',
    changedBy: 'Finance Automation',
    notes: 'Retail price uplift across cold chain range.',
  },
  {
    versionId: '2024.4',
    status: 'Archived',
    effectiveDate: '2024-10-01',
    changedBy: 'Finance Automation',
    archivedReason: 'Superseded by 2025.1 launch.',
  },
];

type PriceListTimelineStoryProps = React.ComponentProps<typeof PriceListVersionTimeline> & BreakpointArgs;

const meta = {
  title: 'Features/Products/PriceListVersionTimeline',
  component: PriceListVersionTimeline,
  args: {
    breakpoint: 'desktop',
    versions: SAMPLE_VERSIONS,
    currentVersionId: '2025.1',
    onVersionSelect: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: ({ breakpoint, ...props }) => (
    <BreakpointContainer breakpoint={breakpoint} align="start">
      <PriceListVersionTimeline {...props} />
    </BreakpointContainer>
  ),
} satisfies Meta<PriceListTimelineStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Timeline: Story = {};
