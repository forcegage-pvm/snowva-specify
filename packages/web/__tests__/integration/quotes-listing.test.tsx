import QuotesPage from '@/app/(dashboard)/quotes/page';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

describe('Integration: Load quotes workspace page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('should load quotes workspace page successfully', async () => {
    renderWithProviders(<QuotesPage />);
    
    // Should show page title
    expect(screen.getByText(/quotes/i)).toBeInTheDocument();
    
    // Should show loading state initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Should load quotes data within 1 second (FR-021)
    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('should display quotes table with key information', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      // Should show table headers (FR-002)
      expect(screen.getByText(/quote number/i)).toBeInTheDocument();
      expect(screen.getByText(/customer/i)).toBeInTheDocument();
      expect(screen.getByText(/amount/i)).toBeInTheDocument();
      expect(screen.getByText(/status/i)).toBeInTheDocument();
      expect(screen.getByText(/created/i)).toBeInTheDocument();
    });
  });

  it('should show empty state when no quotes exist', async () => {
    // Mock empty quotes response
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/no quotes found/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create new quote/i })).toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    // Mock API error
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading quotes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});