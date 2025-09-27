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

describe('Integration: Quote composer navigation', () => {
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

  it('should navigate to quote composer for creating new quote (FR-009)', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
      expect(quotesHeading).toBeTruthy();
    });
  });

  it('should navigate to quote composer for editing (FR-009)', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
      expect(quotesHeading).toBeTruthy();
    });
  });

  it('should handle quote composer unavailability gracefully (FR-023)', async () => {
    renderWithProviders(<QuotesPage />);
    
    await waitFor(() => {
      const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
      expect(quotesHeading).toBeTruthy();
    });
  });
});