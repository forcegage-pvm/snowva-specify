import { QuoteActionsMenu } from '@/components/quotes/QuoteActionsMenu';
import { Quote } from '@/types/quotes/Quote';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock quote data for testing
const mockQuote: Quote = {
  id: 'quote-001',
  quoteNumber: 'QUO-2024-001',
  customerId: 'customer-001',
  customerName: 'Test Customer Ltd',
  status: QuoteStatus.Draft,
  validUntil: new Date('2024-12-31'),
  expiryDate: new Date('2024-12-31'),
  subtotal: 100000, // R1000.00 in cents
  taxRate: 0.15, // 15% VAT
  taxAmount: 15000, // R150.00 in cents
  totalAmount: 115000, // R1150.00 in cents
  currency: 'ZAR',
  statusHistory: [],
  terms: 'Net 30 days',
  notes: 'Test quote for development',
  lineItems: [],
  createdBy: 'user-001',
  lastModifiedBy: 'user-001',
  createdAt: new Date('2024-09-01'),
  updatedAt: new Date('2024-09-15'),
  version: 1,
  isArchived: false
};

describe('QuoteActionsMenu Component (TDD)', () => {
  const mockOnEdit = jest.fn();
  const mockOnDuplicate = jest.fn();
  const mockOnConvert = jest.fn();
  const mockOnArchive = jest.fn();
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render menu trigger button', () => {
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      const triggerButton = screen.getByRole('button', { name: /more actions/i });
      expect(triggerButton).toBeInTheDocument();
      expect(triggerButton).toHaveAttribute('aria-haspopup', 'menu');
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not show menu initially', () => {
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should show menu when trigger button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      const triggerButton = screen.getByRole('button', { name: /more actions/i });
      await user.click(triggerButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should display all action menu items when open', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));

      expect(screen.getByRole('menuitem', { name: /edit quote/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /duplicate quote/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /convert to invoice/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /archive quote/i })).toBeInTheDocument();
    });
  });

  describe('Menu Interactions', () => {
    it('should call onEdit when Edit Quote is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));
      await user.click(screen.getByRole('menuitem', { name: /edit quote/i }));

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockQuote);
    });

    it('should call onDuplicate when Duplicate Quote is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));
      await user.click(screen.getByRole('menuitem', { name: /duplicate quote/i }));

      expect(mockOnDuplicate).toHaveBeenCalledTimes(1);
      expect(mockOnDuplicate).toHaveBeenCalledWith(mockQuote);
    });

    it('should call onConvert when Convert to Invoice is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));
      await user.click(screen.getByRole('menuitem', { name: /convert to invoice/i }));

      expect(mockOnConvert).toHaveBeenCalledTimes(1);
      expect(mockOnConvert).toHaveBeenCalledWith(mockQuote);
    });

    it('should call onArchive when Archive Quote is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));
      await user.click(screen.getByRole('menuitem', { name: /archive quote/i }));

      expect(mockOnArchive).toHaveBeenCalledTimes(1);
      expect(mockOnArchive).toHaveBeenCalledWith(mockQuote);
    });

    it('should close menu when clicking outside', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <QuoteActionsMenu 
            quote={mockQuote}
            onEdit={mockOnEdit}
            onDuplicate={mockOnDuplicate}
            onConvert={mockOnConvert}
            onArchive={mockOnArchive}
            onStatusChange={mockOnStatusChange}
          />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      // Open menu
      await user.click(screen.getByRole('button', { name: /more actions/i }));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Click outside
      await user.click(screen.getByTestId('outside'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should close menu when ESC key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      // Open menu
      await user.click(screen.getByRole('button', { name: /more actions/i }));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Press ESC
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      const triggerButton = screen.getByRole('button', { name: /more actions/i });
      expect(triggerButton).toHaveAttribute('aria-haspopup', 'menu');

      await user.click(triggerButton);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);
    });

    it('should support keyboard navigation through menu items', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));

      const editItem = screen.getByRole('menuitem', { name: /edit quote/i });
      const duplicateItem = screen.getByRole('menuitem', { name: /duplicate quote/i });

      // Should be able to tab through menu items
      editItem.focus();
      expect(document.activeElement).toBe(editItem);
      
      fireEvent.keyDown(editItem, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(duplicateItem);
    });

    it('should activate menu item when Enter key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));
      
      const editItem = screen.getByRole('menuitem', { name: /edit quote/i });
      editItem.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional Menu Items', () => {
    it('should disable Convert action for already converted quotes', async () => {
      const convertedQuote = { ...mockQuote, status: QuoteStatus.Converted };
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={convertedQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));

      const convertItem = screen.getByRole('menuitem', { name: /convert to invoice/i });
      expect(convertItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('should disable Archive action for already archived quotes', async () => {
      const archivedQuote = { ...mockQuote, status: QuoteStatus.Archived };
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={archivedQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));

      const archiveItem = screen.getByRole('menuitem', { name: /archive quote/i });
      expect(archiveItem).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Status Change Menu', () => {
    it('should display status change submenu for applicable quotes', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
          showStatusActions={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));

      expect(screen.getByRole('menuitem', { name: /change status/i })).toBeInTheDocument();
    });

    it('should call onStatusChange when status change is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteActionsMenu 
          quote={mockQuote}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onConvert={mockOnConvert}
          onArchive={mockOnArchive}
          onStatusChange={mockOnStatusChange}
          showStatusActions={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /more actions/i }));
      await user.click(screen.getByRole('menuitem', { name: /change status/i }));

      expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
      expect(mockOnStatusChange).toHaveBeenCalledWith(mockQuote);
    });
  });
});