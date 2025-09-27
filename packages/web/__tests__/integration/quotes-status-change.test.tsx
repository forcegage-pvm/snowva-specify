import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Integration: Status change workflow', () => {
  it('should update quote status through actions menu', async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    const statusButton = screen.getAllByText(/change status/i)[0];
    await user.click(statusButton);
    
    const pendingOption = screen.getByText(/pending/i);
    await user.click(pendingOption);
    
    expect(screen.getByText(/status updated successfully/i)).toBeDefined();
  });
});