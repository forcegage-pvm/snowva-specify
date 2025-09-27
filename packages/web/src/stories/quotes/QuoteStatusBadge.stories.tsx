import { QuoteCard } from '@/components/quotes/QuoteCard';
import { mockQuotes } from '@/data/quotes';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof QuoteCard> = {
  title: 'Features/Quotes/QuoteCard',
  component: QuoteCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    quote: mockQuotes[0],
    isSelected: false,
    onSelect: () => console.log('Quote selected'),
    showActions: true,
  },
};

export const Selected: Story = {
  args: {
    quote: mockQuotes[1],
    isSelected: true,
    onSelect: () => console.log('Quote selected'),
    showActions: true,
  },
};

export const DifferentStatuses: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
      {mockQuotes.slice(0, 4).map(quote => (
        <QuoteCard
          key={quote.id}
          quote={quote}
          isSelected={false}
          onSelect={() => console.log('Selected:', quote.id)}
          showActions={true}
        />
      ))}
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Shows quote cards with different statuses and amounts.',
      },
    },
  },
};