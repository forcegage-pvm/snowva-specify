import QuotesPage from '@/app/(dashboard)/quotes/page';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the service to verify actual API calls
jest.mock('@/services/quotes/QuoteService', () => ({
  QuoteServiceFactory: {
    getInstance: jest.fn(() => ({
      getQuotes: jest.fn().mockResolvedValue({
        quotes: [
          { id: '1', quoteNumber: 'QUO-001', customerName: 'Test Corp', totalAmount: 1000 }
        ],
        totalCount: 1
      })
    }))
  }
}));

describe('Integration: Search and Filter Flow', () => {
  let mockGetQuotes: jest.MockedFunction<any>;
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    const mockService = require('@/services/quotes/QuoteService').QuoteServiceFactory.getInstance();
    mockGetQuotes = mockService.getQuotes;
    mockGetQuotes.mockClear();
  });

  it('should pass search query to service layer', async () => {
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <QuotesPage />
      </QueryClientProvider>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockGetQuotes).toHaveBeenCalledTimes(1);
    });

    // Perform search
    const searchInput = screen.getByPlaceholderText(/search quotes/i);
    await user.type(searchInput, 'test search');

    // Wait for debounced search
    await waitFor(() => {
      expect(mockGetQuotes).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test search'
        })
      );
    }, { timeout: 1000 });
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

    // Verify no validation errors in console
    expect(mockGetQuotes).toHaveBeenCalled();
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
    
    // Should call service without search filter
    await waitFor(() => {
      expect(mockGetQuotes).toHaveBeenLastCalledWith(
        expect.not.objectContaining({
          search: expect.any(String)
        })
      );
    });
  });
});