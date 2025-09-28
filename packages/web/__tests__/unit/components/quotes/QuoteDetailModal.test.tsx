import { QuoteDetailModal } from '@/components/quotes/QuoteDetailModal';
import { Quote } from '@/types/quotes/Quote';
import { QuoteLineItem } from '@/types/quotes/QuoteLineItem';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock quote data for testing
const mockLineItem: QuoteLineItem = {
  id: 'line_001',
  description: 'Ice Maker - Professional Grade',
  productId: 'prod_001',
  category: 'Kitchen Equipment',
  quantity: 2,
  unitPrice: 50000, // R500.00 in cents
  totalPrice: 100000, // R1000.00 in cents
  taxable: true,
  sortOrder: 1
};

const mockQuote: Quote = {
  id: 'quote_001',
  quoteNumber: 'QUO-2024-001',
  customerId: 'customer_001',
  customerName: 'Test Customer Ltd',
  status: QuoteStatus.Approved,
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
  lineItems: [mockLineItem],
  createdBy: 'user_001',
  lastModifiedBy: 'user_001',
  createdAt: new Date('2024-09-01'),
  updatedAt: new Date('2024-09-15'),
  version: 1,
  isArchived: false
};

describe('QuoteDetailModal Component (TDD)', () => {
  const mockOnClose = jest.fn();
  const mockOnPrint = jest.fn();
  const mockOnEmail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render modal when open is true', () => {
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Quote Details')).toBeInTheDocument();
    });

    it('should not render modal when open is false', () => {
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={false}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display quote header information', () => {
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      expect(screen.getByText('QUO-2024-001')).toBeInTheDocument();
      expect(screen.getByText('Test Customer Ltd')).toBeInTheDocument();
      expect(screen.getAllByText('R 1,150.00')).toHaveLength(2); // Header total and footer total
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('should display quote line items', () => {
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      expect(screen.getByText('Ice Maker - Professional Grade')).toBeInTheDocument();
      expect(screen.getByText('Product ID: prod_001')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('R 500.00')).toBeInTheDocument();
      expect(screen.getAllByText('R 1,000.00')).toHaveLength(2); // Line item total and subtotal
    });

    it('should display quote totals breakdown', () => {
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getAllByText('R 1,000.00')).toHaveLength(2); // Line item and subtotal
      expect(screen.getByText('VAT (15%):')).toBeInTheDocument();
      expect(screen.getByText('R 150.00')).toBeInTheDocument();
      expect(screen.getByText('Total:')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when X button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when ESC key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onPrint when Print button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      const printButton = screen.getByRole('button', { name: /print quote/i });
      await user.click(printButton);

      expect(mockOnPrint).toHaveBeenCalledTimes(1);
      expect(mockOnPrint).toHaveBeenCalledWith(mockQuote);
    });

    it('should call onEmail when Email button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      const emailButton = screen.getByRole('button', { name: /email quote/i });
      await user.click(emailButton);

      expect(mockOnEmail).toHaveBeenCalledTimes(1);
      expect(mockOnEmail).toHaveBeenCalledWith(mockQuote);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('should trap focus within modal when open', () => {
      render(
        <QuoteDetailModal 
          quote={mockQuote}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      const emailButton = screen.getByRole('button', { name: /email quote/i });
      const printButton = screen.getByRole('button', { name: /print quote/i });
      
      expect(document.activeElement).toBe(closeButton);
      
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      expect(document.activeElement).toBe(emailButton);
      
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      expect(document.activeElement).toBe(printButton);
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when quote is undefined', () => {
      render(
        <QuoteDetailModal 
          quote={undefined}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
          loading={true}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading quote details...', { selector: '.sr-only' })).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should show error message when error prop is provided', () => {
      const errorMessage = 'Failed to load quote details';
      
      render(
        <QuoteDetailModal 
          quote={undefined}
          open={true}
          onClose={mockOnClose}
          onPrint={mockOnPrint}
          onEmail={mockOnEmail}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});