import { QuoteFilters } from '@/components/quotes/QuoteFilters';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof QuoteFilters> = {
  title: 'Features/Quotes/QuoteFilters',
  component: QuoteFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive filtering component for quotes with status, date range, customer, and search filters.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state
export const Default: Story = {
  args: {
    className: 'w-full',
  },
};

// Interactive demo
export const Interactive: Story = {
  args: {
    className: 'w-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo of the filter component with all filter types available.',
      },
    },
  },
};