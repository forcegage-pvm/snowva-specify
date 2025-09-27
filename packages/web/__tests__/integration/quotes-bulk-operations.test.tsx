import QuotesPage from '@/app/(dashboard)/quotes/page';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Integration: Bulk operations', () => {
  it('should perform bulk status update (FR-008)', async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    // Select multiple quotes
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    
    // Perform bulk action
    const bulkActionsButton = screen.getByText(/bulk actions/i);
    await user.click(bulkActionsButton);
    
    const updateStatusOption = screen.getByText(/update status/i);
    await user.click(updateStatusOption);
    
    expect(screen.getByText(/2 quotes updated/i)).toBeDefined();
  });

  it('should perform bulk export (FR-010)', async () => {
    const user = userEvent.setup();
    render(<QuotesPage />);
    
    const exportButton = screen.getByText(/export/i);
    await user.click(exportButton);
    
    const pdfOption = screen.getByText(/pdf/i);
    await user.click(pdfOption);
    
    expect(screen.getByText(/export started/i)).toBeDefined();
  });
});