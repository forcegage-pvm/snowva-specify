import { QuoteTable } from '@/components/quotes/QuoteTable';
import { mockQuotes } from '@/data/quotes';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const meta: Meta<typeof QuoteTable> = {
  title: 'Features/Quotes/QuoteTable',
  component: QuoteTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A virtualized table component for displaying quotes with sorting, selection, and filtering capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <div className="p-4 bg-gray-50 min-h-screen">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with mock data
export const Default: Story = {
  args: {
    quotes: mockQuotes.slice(0, 10),
    isLoading: false,
    selectedQuotes: new Set(),
    onQuoteSelect: (quoteId: string) => console.log('Selected quote:', quoteId),
    onQuotesSelectionChange: (quoteIds: Set<string>) => console.log('Selection changed:', quoteIds),
    onQuoteAction: (action: string, quoteId: string) => console.log('Action:', action, 'on quote:', quoteId),
    viewMode: 'table',
  },
};

// Loading state
export const Loading: Story = {
  args: {
    quotes: [],
    isLoading: true,
    selectedQuotes: new Set(),
    onQuoteSelect: () => {},
    onQuotesSelectionChange: () => {},
    onQuoteAction: () => {},
    viewMode: 'table',
  },
};

// Empty state
export const Empty: Story = {
  args: {
    quotes: [],
    isLoading: false,
    selectedQuotes: new Set(),
    onQuoteSelect: () => {},
    onQuotesSelectionChange: () => {},
    onQuoteAction: () => {},
    viewMode: 'table',
  },
};

// With selections
export const WithSelections: Story = {
  args: {
    quotes: mockQuotes.slice(0, 10),
    isLoading: false,
    selectedQuotes: new Set([mockQuotes[0].id, mockQuotes[2].id]),
    onQuoteSelect: (quoteId: string) => console.log('Selected quote:', quoteId),
    onQuotesSelectionChange: (quoteIds: Set<string>) => console.log('Selection changed:', quoteIds),
    onQuoteAction: (action: string, quoteId: string) => console.log('Action:', action, 'on quote:', quoteId),
    viewMode: 'table',
  },
};

// Large dataset (performance test)
export const LargeDataset: Story = {
  args: {
    quotes: Array.from({ length: 1000 }, (_, i) => ({
      ...mockQuotes[i % mockQuotes.length],
      id: `quote-${i}`,
      quoteNumber: `QTE-${(i + 1).toString().padStart(4, '0')}`,
    })),
    isLoading: false,
    selectedQuotes: new Set(),
    onQuoteSelect: (quoteId: string) => console.log('Selected quote:', quoteId),
    onQuotesSelectionChange: (quoteIds: Set<string>) => console.log('Selection changed:', quoteIds),
    onQuoteAction: (action: string, quoteId: string) => console.log('Action:', action, 'on quote:', quoteId),
    viewMode: 'table',
  },
  parameters: {
    docs: {
      description: {
        story: 'Test performance with 1000 quotes to ensure smooth scrolling and interaction.',
      },
    },
  },
};

// Card view mode
export const CardView: Story = {
  args: {
    quotes: mockQuotes.slice(0, 6),
    isLoading: false,
    selectedQuotes: new Set(),
    onQuoteSelect: (quoteId: string) => console.log('Selected quote:', quoteId),
    onQuotesSelectionChange: (quoteIds: Set<string>) => console.log('Selection changed:', quoteIds),
    onQuoteAction: (action: string, quoteId: string) => console.log('Action:', action, 'on quote:', quoteId),
    viewMode: 'card',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card view mode for a more visual representation of quotes.',
      },
    },
  },
};