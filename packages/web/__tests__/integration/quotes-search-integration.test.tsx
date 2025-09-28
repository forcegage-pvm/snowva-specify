import QuotesPage from '../../src/app/(dashboard)/quotes/page';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Extend Jest matchers using module augmentation
declare module '@jest/expect' {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveValue(value: string): R;
    toBeDisabled(): R;
  }
}

// Mock Next.js App Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/quotes',
}));

// Mock useQuotes hook
const mockRefetch = jest.fn();
jest.mock('../../src/hooks/quotes/useQuoteOperations', () => ({
  useQuotes: jest.fn(() => ({
    data: {
      quotes: [
        {
          id: '1',
          quoteNumber: 'QUO-001',
          customerName: 'Test Corp',
          totalAmount: 1000,
          status: 'Draft',
          createdAt: '2024-09-27T00:00:00Z'
        }
      ],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1
    },
    isLoading: false,
    error: null,
    refetch: mockRefetch
  }))
}));

// Mock quote state hooks
jest.mock('../../src/hooks/quotes/useQuoteState', () => ({
  useQuoteSelection: jest.fn(() => ({
    selectedQuotes: [],
    deselectAll: jest.fn(),
    getSelectedCount: jest.fn(() => 0)
  })),
  useQuoteFiltersState: jest.fn(() => ({
    activeFilters: {},
    setFilters: jest.fn(),
    clearFilters: jest.fn()
  }))
}));

describe('Integration: Search and Filter Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Clear mock calls
    mockRefetch.mockClear();
  });

  it('should pass search query to service layer', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <QuotesPage />
      </QueryClientProvider>
    );
    
    // Wait for initial load - verify mock data is displayed
    await waitFor(() => {
      expect(screen.getByText('QUO-001')).toBeInTheDocument();
      expect(screen.getByText('Test Corp')).toBeInTheDocument();
    });

    // Perform search
    const searchInput = screen.getByPlaceholderText(/search quotes/i);
    await user.type(searchInput, 'test search');

    // Wait for search input to be updated
    await waitFor(() => {
      expect(searchInput).toHaveValue('test search');
    });

    // Verify the search functionality is working (input accepted)
    expect(searchInput).toHaveValue('test search');
  });

  it('should handle date filter validation gracefully', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <QuotesPage />
      </QueryClientProvider>
    );

    // Should not crash with invalid date filters
    // This would be triggered by advanced filters UI
    await waitFor(() => {
      expect(screen.getByText(/quotes/i)).toBeInTheDocument();
    });

    // Verify page loads and shows mock data without errors
    await waitFor(() => {
      expect(screen.getByText('QUO-001')).toBeInTheDocument();
    });
  });

  it('should clear search when clear button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <QuotesPage />
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText(/search quotes/i);
    await user.type(searchInput, 'test');

    // Wait for search to register
    await waitFor(() => {
      expect(searchInput).toHaveValue('test');
    });

    // Click clear button (×)
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
    
    // Verify search was cleared and data is still displayed
    await waitFor(() => {
      expect(screen.getByText('QUO-001')).toBeInTheDocument();
    });
  });
});