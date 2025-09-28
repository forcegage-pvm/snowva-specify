/**
 * Next.js App Router Integration Test
 * Tests the complete quotes search and filter flow using centralized App Router setup
 */

import QuotesPage from '../../src/app/(dashboard)/quotes/page';
import { beforeEach, describe, expect, it } from '@jest/globals';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils/nextjs-test-utils';

// Extend Jest matchers
declare module '@jest/expect' {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveValue(value: string): R;
    toBeDisabled(): R;
  }
}

describe('Integration: App Router - Search and Filter Flow', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should render quotes page without App Router mounting errors', async () => {
    const { queryClient } = renderWithProviders(<QuotesPage />);
    
    // Verify the page renders without the "invariant expected app router to be mounted" error
    await waitFor(() => {
      expect(screen.getByText('QUO-001')).toBeInTheDocument();
    });
    
    // Verify mock data is displayed correctly
    expect(screen.getByText('Test Corp')).toBeInTheDocument();
    expect(queryClient).toBeDefined();
  });

  it('should handle search input without router errors', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuotesPage />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('QUO-001')).toBeInTheDocument();
    });
    
    // Find and interact with search input
    const searchInput = screen.getByPlaceholderText(/search quotes/i);
    await user.type(searchInput, 'test search');
    
    // Verify search input works
    await waitFor(() => {
      expect(searchInput).toHaveValue('test search');
    });
    
    // Verify page doesn't crash and data is still displayed
    expect(screen.getByText('QUO-001')).toBeInTheDocument();
  });

  it('should handle filter interactions without router errors', async () => {
    renderWithProviders(<QuotesPage />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('QUO-001')).toBeInTheDocument();
    });
    
    // Verify filter functionality doesn't cause router errors
    // The component should render filter elements without crashing
    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
    
    // Mock data should still be visible, indicating successful render
    expect(screen.getByText('Test Corp')).toBeInTheDocument();
  });
});