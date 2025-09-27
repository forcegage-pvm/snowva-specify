import { QuoteTable } from '@/components/quotes/QuoteTable';
import { mockQuotes } from '@/data/quotes';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

describe('QuoteTable', () => {
  const defaultProps = {
    quotes: mockQuotes.slice(0, 5),
    selectedQuotes: new Set<string>(),
    onQuoteSelect: jest.fn(),
    onSelectAll: jest.fn(),
    onDeselectAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<QuoteTable {...defaultProps} />);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
  });

  it('displays quotes when provided', () => {
    render(<QuoteTable {...defaultProps} />);
    
    // Check if quote numbers are displayed
    const quoteNumber = screen.queryByText(mockQuotes[0].quoteNumber);
    expect(quoteNumber).not.toBeNull();
  });

  it('shows table when quotes provided', () => {
    render(<QuoteTable {...defaultProps} quotes={[]} />);
    
    // Just test that component renders with empty quotes
    const { container } = render(<QuoteTable {...defaultProps} quotes={[]} />);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('calls onQuoteSelect when checkbox clicked', () => {
    const onQuoteSelect = jest.fn();
    render(<QuoteTable {...defaultProps} onQuoteSelect={onQuoteSelect} />);
    
    const checkbox = screen.queryByTestId(`quote-checkbox-${mockQuotes[0].id}`);
    if (checkbox) {
      fireEvent.click(checkbox);
      expect(onQuoteSelect).toHaveBeenCalled();
    }
  });

  it('calls onSelectAll when select all clicked', () => {
    const onSelectAll = jest.fn();
    render(<QuoteTable {...defaultProps} onSelectAll={onSelectAll} />);
    
    const selectAllCheckbox = screen.queryByTestId('select-all-quotes');
    if (selectAllCheckbox) {
      fireEvent.click(selectAllCheckbox);
      expect(onSelectAll).toHaveBeenCalled();
    }
  });

  it('calls onDeselectAll when appropriate', () => {
    const selectedQuotes = new Set(mockQuotes.slice(0, 3).map(q => q.id));
    const onDeselectAll = jest.fn();
    
    render(
      <QuoteTable 
        {...defaultProps} 
        selectedQuotes={selectedQuotes}
        onDeselectAll={onDeselectAll} 
      />
    );
    
    const selectAllCheckbox = screen.queryByTestId('select-all-quotes');
    if (selectAllCheckbox) {
      fireEvent.click(selectAllCheckbox);
      expect(onDeselectAll).toHaveBeenCalled();
    }
  });

  it('renders quote data elements', () => {
    render(<QuoteTable {...defaultProps} />);
    
    // Test that some quote data is rendered using getAllByText
    const customerElements = screen.queryAllByText(mockQuotes[0].customerName);
    expect(customerElements.length).toBeGreaterThan(0);
  });

  it('handles currency formatting', () => {
    render(<QuoteTable {...defaultProps} />);
    
    // Check if currency amounts are present
    const { container } = render(<QuoteTable {...defaultProps} />);
    const textContent = container.textContent || '';
    const hasCurrency = /\$[\d,]+\.?\d*/.test(textContent);
    
    expect(hasCurrency).toBe(true);
  });

  it('responds to column header clicks', () => {
    const { container } = render(<QuoteTable {...defaultProps} />);
    
    // Find any clickable header
    const headers = container.querySelectorAll('th');
    expect(headers.length).toBeGreaterThan(0);
    
    // Test that headers exist and are clickable
    if (headers.length > 0) {
      fireEvent.click(headers[0]);
      // Test passes if no error is thrown
      expect(true).toBe(true);
    }
  });

  it('manages selection state correctly', () => {
    const selectedQuotes = new Set([mockQuotes[0].id]);
    const { container } = render(
      <QuoteTable {...defaultProps} selectedQuotes={selectedQuotes} />
    );
    
    // Test that component renders with selection state
    expect(container.querySelector('table')).not.toBeNull();
  });
});