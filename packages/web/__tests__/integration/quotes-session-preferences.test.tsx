import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Integration: Filter/sort preferences persistence (FR-015)', () => {
  it('should maintain filter preferences during user session', async () => {
    const user = userEvent.setup();
    
    // Set localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
    
    render(<QuotesPage />);
    
    // Apply a filter
    const statusFilter = screen.getByLabelText(/filter by status/i);
    await user.click(statusFilter);
    await user.click(screen.getByText('Pending'));
    
    // Should save to localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'quotes-filters',
      expect.stringContaining('Pending')
    );
  });

  it('should restore filter preferences on page load', async () => {
    // Mock localStorage with saved preferences
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify({ status: ['Pending'] })),
        setItem: jest.fn(),
      },
      writable: true,
    });
    
    render(<QuotesPage />);
    
    // Should restore filters
    expect(screen.getByDisplayValue('Pending')).toBeDefined();
  });
});