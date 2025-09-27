import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Integration: Search by customer name', () => {
  it('should search quotes by customer name (FR-005)', async () => {
    const queryClient = new QueryClient();
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <QuotesPage />
      </QueryClientProvider>
    );
    
    const searchInput = screen.getByPlaceholderText(/search quotes/i);
    await user.type(searchInput, 'ACME Corp');
    
    await waitFor(() => {
      expect(screen.getAllByText(/acme corp/i)).toBeTruthy();
    }, { timeout: 500 });
  });
});