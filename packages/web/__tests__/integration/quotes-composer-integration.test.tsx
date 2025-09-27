import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Integration: Quote composer navigation', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('should navigate to quote composer for creating new quote (FR-009)', async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    const newQuoteButton = screen.getByRole('button', { name: /new quote/i });
    await user.click(newQuoteButton);
    
    expect(mockPush).toHaveBeenCalledWith('/quotes/compose');
  });

  it('should navigate to quote composer for editing (FR-009)', async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    const editButton = screen.getAllByText(/edit/i)[0];
    await user.click(editButton);
    
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/quotes\/compose\?quoteId=.+/));
  });

  it('should handle quote composer unavailability gracefully (FR-023)', async () => {
    // Mock composer unavailable
    mockPush.mockRejectedValue(new Error('Composer unavailable'));
    
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    const newQuoteButton = screen.getByRole('button', { name: /new quote/i });
    await user.click(newQuoteButton);
    
    expect(screen.getByText(/quote composer temporarily unavailable/i)).toBeDefined();
  });
});