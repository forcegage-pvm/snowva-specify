import type { Meta, StoryObj } from '@storybook/react';

// Placeholder story for QuoteSummaryCard
const QuoteSummaryCardPlaceholder = () => (
  <div className="p-4 border rounded">
    <h3>QuoteSummaryCard Component</h3>
    <p>Component story will be completed when the component is implemented.</p>
  </div>
);

const meta: Meta<typeof QuoteSummaryCardPlaceholder> = {
  title: 'Features/Quotes/QuoteSummaryCard',
  component: QuoteSummaryCardPlaceholder,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {};