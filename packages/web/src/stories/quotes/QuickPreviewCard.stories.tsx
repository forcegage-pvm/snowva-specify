import type { Meta, StoryObj } from '@storybook/react';

// Placeholder story for QuickPreviewCard
const QuickPreviewCardPlaceholder = () => (
  <div className="p-4 border rounded">
    <h3>QuickPreviewCard Component</h3>
    <p>Component story will be completed when the component is implemented.</p>
  </div>
);

const meta: Meta<typeof QuickPreviewCardPlaceholder> = {
  title: 'Features/Quotes/QuickPreviewCard',
  component: QuickPreviewCardPlaceholder,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {};