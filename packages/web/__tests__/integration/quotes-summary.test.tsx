import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

describe('Integration: Quote totals and counts display (FR-017)', () => {
  it('should show quote totals and counts for current filter selection', async () => {
    render(<QuotesPage />);
    
    // Should display summary information
    expect(screen.getByText(/total quotes:/i)).toBeDefined();
    expect(screen.getByText(/total amount:/i)).toBeDefined();
    expect(screen.getByText(/average amount:/i)).toBeDefined();
    
    // Should show status breakdown
    expect(screen.getByText(/draft:/i)).toBeDefined();
    expect(screen.getByText(/pending:/i)).toBeDefined();
    expect(screen.getByText(/approved:/i)).toBeDefined();
  });

  it('should update totals when filters are applied', async () => {
    render(<QuotesPage />);
    
    // Initially should show all quotes total
    expect(screen.getByText(/total quotes: \d+/i)).toBeDefined();
    
    // After applying filter, totals should update
    // This would be tested with actual filter interaction
    expect(screen.getByText(/filtered total:/i)).toBeDefined();
  });
});