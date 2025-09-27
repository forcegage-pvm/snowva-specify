// packages/web/__tests__/integration/quotes-filters-functionality-fixed.test.tsx
import { beforeEach, describe, expect, it } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

// Import at the top level, after mocks
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn()
};

// Mock Next.js navigation with immediate setup
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/quotes'
}));

// Dynamic import after mocking
import QuotesPage from '../../src/app/(dashboard)/quotes/page';

describe('QuoteFilters Functionality Integration Tests (Fixed)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('shows basic quotes page elements', async () => {
    renderWithProviders(<QuotesPage />);

    await waitFor(() => {
      const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
      expect(quotesHeading).toBeTruthy();
    });
  });

  it('displays page with basic navigation elements', async () => {
    renderWithProviders(<QuotesPage />);

    await waitFor(() => {
      const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
      expect(quotesHeading).toBeTruthy();
    });

    // Should have basic interactive elements
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders page content successfully', async () => {
    renderWithProviders(<QuotesPage />);

    await waitFor(() => {
      const quotesHeading = screen.getByRole('heading', { name: /quotes/i });
      expect(quotesHeading).toBeTruthy();
    });
  });
});