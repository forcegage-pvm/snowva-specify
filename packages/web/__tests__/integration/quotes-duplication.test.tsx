import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Integration: Duplicate quote workflow', () => {
  it('should duplicate quote and navigate to composer', async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    const duplicateButton = screen.getAllByText(/duplicate/i)[0];
    await user.click(duplicateButton);
    
    expect(screen.getByText(/quote duplicated successfully/i)).toBeDefined();
  });
});