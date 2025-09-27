import QuotesPage from '@/app/(dashboard)/quotes/page';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Integration: Apply status filters', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

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

  it('should filter quotes by status', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/filter by status/i)).toBeDefined();
    });

    // Select "Pending" status filter (FR-003)
    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.click(statusFilter);
    
    const pendingOption = screen.getByText('Pending');
    await user.click(pendingOption);
    
    // Should filter results within 500ms (performance requirement)
    await waitFor(
      () => {
        expect(screen.getAllByText(/pending/i)).toBeTruthy();
      },
      { timeout: 500 }
    );
  });

  it('should support multiple status selection', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/filter by status/i)).toBeDefined();
    });

    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.click(statusFilter);
    
    // Select multiple statuses
    await user.click(screen.getByText('Pending'));
    await user.click(screen.getByText('Draft'));
    
    await waitFor(() => {
      const quotes = screen.getAllByTestId('quote-row');
      expect(quotes.length).toBeGreaterThan(0);
    });
  });

  it('should clear status filters', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeDefined();
    });

    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    await user.click(clearButton);
    
    await waitFor(() => {
      // Should show all quotes when filters are cleared
      expect(screen.getAllByTestId('quote-row')).toBeTruthy();
    });
  });

  it('should show quote totals for current filter selection (FR-017)', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/total quotes:/i)).toBeDefined();
      expect(screen.getByText(/total amount:/i)).toBeDefined();
    });
  });
});