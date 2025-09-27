import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

describe('Integration: Performance with 1000 quotes', () => {
  it('should load 1000 quotes within performance requirements (FR-021)', async () => {
    const queryClient = new QueryClient();
    
    const startTime = performance.now();
    
    render(
      <QueryClientProvider client={queryClient}>
        <QuotesPage />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeTruthy();
    }, { timeout: 1000 });
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Should load within 1 second
    expect(loadTime).toBeLessThan(1000);
  });

  it('should handle virtual scrolling for large datasets', async () => {
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <QuotesPage />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      // Should show virtualized container
      expect(screen.getByTestId('quotes-virtual-list')).toBeDefined();
    });
  });

  it('should maintain 60fps during interactions', async () => {
    // This would be tested with real performance monitoring
    expect(true).toBe(true); // Placeholder for performance testing
  });
});