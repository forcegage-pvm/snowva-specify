'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { SessionTimeoutModal } from '@/features/session/components/SessionTimeoutModal';
import {
    BreakpointContainer,
    type BreakpointArgs,
} from '../../utils/BreakpointWrapper';

type SessionTimeoutStoryProps = React.ComponentProps<typeof SessionTimeoutModal> & BreakpointArgs;

const meta = {
  title: 'Features/Session/SessionTimeoutModal',
  component: SessionTimeoutModal,
  args: {
    breakpoint: 'desktop',
    isOpen: true,
    remainingMs: 120_000,
    onStaySignedIn: fn(),
    onSignOut: fn(),
  },
  argTypes: {
    breakpoint: {
      options: ['mobile', 'tablet', 'desktop'],
      control: { type: 'radio' },
    },
    remainingMs: {
      control: { type: 'range', min: 0, max: 300_000, step: 15_000 },
    },
  },
  render: ({ breakpoint, ...props }) => (
    <BreakpointContainer breakpoint={breakpoint}>
      <SessionTimeoutModal {...props} />
    </BreakpointContainer>
  ),
} satisfies Meta<SessionTimeoutStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ActiveModal: Story = {};
