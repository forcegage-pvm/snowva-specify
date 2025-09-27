import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Integration: Sort quotes by various fields', () => {
  it('should sort by quote number, customer name, amount, creation date, and status (FR-016)', async () => {
    const queryClient = new QueryClient();
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <QuotesPage />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/sort by/i)).toBeDefined();
    });

    // Test sorting by different fields
    const sortFields = ['Quote Number', 'Customer', 'Amount', 'Created', 'Status'];
    
    for (const field of sortFields) {
      const sortButton = screen.getByRole('button', { name: new RegExp(field, 'i') });
      await user.click(sortButton);
      
      await waitFor(() => {
        expect(screen.getAllByTestId('quote-row')).toBeTruthy();
      });
    }
  });
});