import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Integration: Quote preview modal functionality (FR-014)', () => {
  it('should show quote preview without full navigation to composer', async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    const previewButton = screen.getAllByLabelText(/preview quote/i)[0];
    await user.click(previewButton);
    
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText(/quote preview/i)).toBeDefined();
    
    // Should show quote details without navigation
    expect(screen.getByText(/quote number/i)).toBeDefined();
    expect(screen.getByText(/customer/i)).toBeDefined();
    expect(screen.getByText(/line items/i)).toBeDefined();
  });

  it('should close preview modal', async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    const previewButton = screen.getAllByLabelText(/preview quote/i)[0];
    await user.click(previewButton);
    
    const closeButton = screen.getByLabelText(/close preview/i);
    await user.click(closeButton);
    
    expect(screen.queryByRole('dialog')).not.toBeTruthy();
  });
});