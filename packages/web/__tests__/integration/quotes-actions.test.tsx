import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Integration: Quote actions menu interactions', () => {
  it('should show quote actions menu with edit, duplicate, convert, archive options (FR-007)', async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    await waitFor(() => {
      const actionsButton = screen.getAllByLabelText(/quote actions/i)[0];
      expect(actionsButton).toBeDefined();
    });

    const actionsButton = screen.getAllByLabelText(/quote actions/i)[0];
    await user.click(actionsButton);
    
    expect(screen.getByText(/edit/i)).toBeDefined();
    expect(screen.getByText(/duplicate/i)).toBeDefined();
    expect(screen.getByText(/convert to invoice/i)).toBeDefined();
    expect(screen.getByText(/archive/i)).toBeDefined();
  });
});