// packages/web/__tests__/smoke/quotes-functionality.test.tsx
import { beforeEach, describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import QuotesPage from '../../src/app/(dashboard)/quotes/page';

// Mock the hooks
jest.mock('../../src/hooks/quotes/useQuoteOperations', () => ({
  useQuotes: () => ({
    data: {
      quotes: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1
    },
    isLoading: false,
    error: null,
    refetch: jest.fn()
  })
}));

describe('Quotes Page Functionality Smoke Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders all main UI elements', async () => {
    renderWithProvider(<QuotesPage />);
    
    // Check main UI elements exist
    expect(screen.getByText('Quotes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new quote/i })).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('has functional search input', async () => {
    renderWithProvider(<QuotesPage />);
    
    const searchInput = screen.getByPlaceholderText('Search quotes...');
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput).toHaveValue('test search');
  });

  it('shows clear button when search has text', async () => {
    renderWithProvider(<QuotesPage />);
    
    const searchInput = screen.getByPlaceholderText('Search quotes...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Should show clear button
    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });
  });

  it('clears search when clear button clicked', async () => {
    renderWithProvider(<QuotesPage />);
    
    const searchInput = screen.getByPlaceholderText('Search quotes...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);
    });
    
    expect(searchInput).toHaveValue('');
  });

  it('has functional quick filters toggle', async () => {
    renderWithProvider(<QuotesPage />);
    
    const quickFiltersButton = screen.getByRole('button', { name: /quick filters/i });
    expect(quickFiltersButton).toBeInTheDocument();
    
    // Should be able to click
    fireEvent.click(quickFiltersButton);
    
    // Quick filters section should appear
    await waitFor(() => {
      expect(screen.getByText('Quick Filters:')).toBeInTheDocument();
    });
  });

  it('has functional refresh button', async () => {
    renderWithProvider(<QuotesPage />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
    
    // Should be clickable (not disabled)
    expect(refreshButton).not.toBeDisabled();
    fireEvent.click(refreshButton);
  });

  it('has functional new quote button', async () => {
    renderWithProvider(<QuotesPage />);
    
    const newQuoteButton = screen.getByRole('button', { name: /new quote/i });
    expect(newQuoteButton).toBeInTheDocument();
    
    // Should be clickable
    expect(newQuoteButton).not.toBeDisabled();
    fireEvent.click(newQuoteButton);
  });
});