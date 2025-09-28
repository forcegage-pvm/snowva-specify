/**
 * Next.js Testing Utilities
 * Addresses systematic Next.js App Router testing issues
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import React from 'react';

// Create a custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  {
    // Create a new QueryClient for each test to ensure isolation
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    ...renderOptions
  }: { queryClient?: QueryClient } & Omit<RenderOptions, 'wrapper'> = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
}

// Standard Next.js App Router mocks that should be applied to all tests
export const mockNextRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

// Mock functions for quote-related hooks
export const mockQuoteHooks = {
  refetch: jest.fn(),
  deselectAll: jest.fn(),
  getSelectedCount: jest.fn(() => 0),
  setFilters: jest.fn(),
  clearFilters: jest.fn(),
};

// Standard mock data for quotes
export const mockQuoteData = {
  quotes: [
    {
      id: '1',
      quoteNumber: 'QUO-001',
      customerName: 'Test Corp',
      totalAmount: 1000,
      status: 'Draft',
      createdAt: '2024-09-27T00:00:00Z'
    }
  ],
  totalCount: 1,
  totalPages: 1,
  currentPage: 1
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
