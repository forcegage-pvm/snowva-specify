// packages/web/__tests__/integration/quotes-functionality-validation.test.tsx
/**
 * Integration test to validate all reported functionality issues are resolved
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuotesPage from '../../src/app/(dashboard)/quotes/page';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

// Mock the useQuotes hook with realistic data
jest.mock('../../src/hooks/quotes/useQuoteOperations', () => ({
  useQuotes: jest.fn(() => ({
    data: {
      quotes: [
        {
          id: 'QUO-2024-042',
          quoteNumber: 'QUO-2024-042',
          customerName: 'Mobile App Studios',
          totalAmount: 2575.54,
          status: 'Draft',
          createdAt: '2024-09-27T00:00:00Z',
          expiryDate: '2024-10-27T00:00:00Z'
        }
      ],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1
    },
    isLoading: false,
    error: null,
    refetch: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('Quotes Functionality Validation - All Issues Fixed', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  const renderQuotesPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <QuotesPage />
      </QueryClientProvider>
    );
  };

  it('should fix Issue 1: Quick Filters should work and show options when clicked', async () => {
    renderQuotesPage();
    
    // Find Quick Filters button
    const quickFiltersButton = screen.getByRole('button', { name: /quick filters/i });
    expect(quickFiltersButton).toBeInTheDocument();
    
    // Click Quick Filters button
    await user.click(quickFiltersButton);
    
    // Should show Quick Filters section with preset options
    await waitFor(() => {
      expect(screen.getByText('Quick Filters:')).toBeInTheDocument();
    });
    
    // Should show all quick filter options
    expect(screen.getByRole('button', { name: /active quotes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /needs attention/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recent/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /this month/i })).toBeInTheDocument();
  });

  it('should fix Issue 2: Search clearing should work properly', async () => {
    renderQuotesPage();
    
    // Find search input
    const searchInput = screen.getByPlaceholderText('Search quotes...');
    expect(searchInput).toBeInTheDocument();
    
    // Type in search input
    await user.type(searchInput, 'test search query');
    expect(searchInput).toHaveValue('test search query');
    
    // Should show clear button (X)
    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });
    
    // Click clear button
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    await user.click(clearButton);
    
    // Search input should be cleared
    expect(searchInput).toHaveValue('');
  });

  it('should fix Issue 3: Clear filters button should work', async () => {
    renderQuotesPage();
    
    // Add some search text to make filters active
    const searchInput = screen.getByPlaceholderText('Search quotes...');
    await user.type(searchInput, 'test');
    
    // Should show Clear button when filters are active
    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /^clear$/i });
      expect(clearButton).toBeInTheDocument();
    });
    
    // Click Clear button
    const clearButton = screen.getByRole('button', { name: /^clear$/i });
    await user.click(clearButton);
    
    // Search should be cleared
    expect(searchInput).toHaveValue('');
  });

  it('should fix Issue 4: Refresh button should work', async () => {
    const mockRefetch = jest.fn().mockResolvedValue(undefined);
    
    // Update the mock to return our controlled refetch function
    const useQuotesMock = jest.requireMock('../../src/hooks/quotes/useQuoteOperations').useQuotes;
    useQuotesMock.mockReturnValue({
      data: { quotes: [], totalCount: 0, totalPages: 0, currentPage: 1 },
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    
    renderQuotesPage();
    
    // Find Refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).not.toBeDisabled();
    
    // Click Refresh button
    await user.click(refreshButton);
    
    // Should call refetch function
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should fix Issue 5: New Quote button should navigate properly', async () => {
    renderQuotesPage();
    
    // Find New Quote button
    const newQuoteButton = screen.getByRole('button', { name: /new quote/i });
    expect(newQuoteButton).toBeInTheDocument();
    expect(newQuoteButton).not.toBeDisabled();
    
    // Click New Quote button
    await user.click(newQuoteButton);
    
    // Should navigate to quote composer
    expect(mockPush).toHaveBeenCalledWith('/sales/quote-composer');
  });

  it('should have working search with proper debouncing', async () => {
    renderQuotesPage();
    
    const searchInput = screen.getByPlaceholderText('Search quotes...');
    
    // Type in search - should debounce
    await user.type(searchInput, 'mobile app');
    expect(searchInput).toHaveValue('mobile app');
    
    // Clear by selecting all and deleting
    await user.clear(searchInput);
    expect(searchInput).toHaveValue('');
  });

  it('should show active filter state correctly', async () => {
    renderQuotesPage();
    
    // Initially no active filters, so Clear button should not be visible
    expect(screen.queryByRole('button', { name: /^clear$/i })).not.toBeInTheDocument();
    
    // Add search to make filters active
    const searchInput = screen.getByPlaceholderText('Search quotes...');
    await user.type(searchInput, 'test');
    
    // Now Clear button should be visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument();
    });
    
    // Save button should also be visible when filters are active
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });
});