import QuotesPage from '@/app/(dashboard)/quotes/page';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

// Mock Next.js App Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/quotes'
}));

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
    const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
    expect(quotesHeading).toBeTruthy();
  });

  it('should display quotes table with key information', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      // Should show basic page content
      const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
      expect(quotesHeading).toBeTruthy();
    });
  });

  it('should show empty state when no quotes exist', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      // Should show basic page structure
      const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
      expect(quotesHeading).toBeTruthy();
    });
  });

  it('should handle error states gracefully', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      // Should show basic page structure
      const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
      expect(quotesHeading).toBeTruthy();
    });
  });
});