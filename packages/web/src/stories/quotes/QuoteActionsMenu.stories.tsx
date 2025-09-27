import type { Meta, StoryObj } from '@storybook/react';

// Placeholder story for QuoteActionsMenu
const QuoteActionsMenuPlaceholder = () => (
  <div className="p-4 border rounded">
    <h3>QuoteActionsMenu Component</h3>
    <p>Component story will be completed when the component is implemented.</p>
  </div>
);

const meta: Meta<typeof QuoteActionsMenuPlaceholder> = {
  title: 'Features/Quotes/QuoteActionsMenu',
  component: QuoteActionsMenuPlaceholder,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {};