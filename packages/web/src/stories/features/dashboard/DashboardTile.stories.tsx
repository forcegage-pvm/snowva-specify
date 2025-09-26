'use client';

import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { Meta, StoryObj } from '@storybook/react';

import { DashboardTile } from '@/features/dashboard/components/DashboardTile';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

type DashboardTileStoryProps = React.ComponentProps<typeof DashboardTile> & BreakpointArgs;

const meta = {
  title: 'Features/Dashboard/DashboardTile',
  component: DashboardTile,
  args: {
    breakpoint: 'desktop',
    title: 'Outstanding balance',
    metricValue: 4_820_000,
    format: 'currency',
    currency: 'ZAR',
    deltaPct: 4.6,
    trendDirection: 'up',
    target: 4_500_000,
    criticalThreshold: 6_000_000,
    icon: CurrencyDollarIcon,
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
  },
  render: ({ breakpoint, ...tileProps }) => (
    <BreakpointContainer breakpoint={breakpoint}>
      <DashboardTile {...tileProps} />
    </BreakpointContainer>
  ),
} satisfies Meta<DashboardTileStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Critical: Story = {
  args: {
    metricValue: 6_480_000,
    deltaPct: 8.3,
    trendDirection: 'up',
  },
};
