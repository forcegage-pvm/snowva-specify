import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    QuoteComposerWizard,
    type QuoteDraft
} from '@/features/sales/components/QuoteComposerWizard';

const buildQuoteDraft = (overrides: Partial<QuoteDraft> = {}): QuoteDraft => ({
  quoteId: 'quote-1001',
  customerId: 'cust-300',
  customerName: 'Holdsport Retail',
  orderNumber: 'PO-7891',
  vatNumber: 'ZA123456789',
  currency: 'ZAR',
  status: 'Draft',
  steps: ['details', 'items', 'review'],
  activeStep: 'details',
  lineItems: [
    {
      lineId: 'line-1',
      productId: 'prod-1001',
      description: 'Snowva Retail Bundle',
      quantity: 2,
      unitPrice: 1499,
      vatRate: 0.15,
    },
  ],
  discounts: [],
  deliveryFee: 250,
  notes: 'Include extended warranty pricing.',
  ...overrides,
});

describe('QuoteComposerWizard', () => {
  beforeEach(() => {
    window.localStorage?.clear();
  });

  it('progresses through wizard steps and surfaces review summary', () => {
    const quote = buildQuoteDraft();
    const handleStepChange = jest.fn();

    render(
      <QuoteComposerWizard
        initialQuote={quote}
        onStepChange={handleStepChange}
        onSubmit={jest.fn()}
        onPreview={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByTestId('quote-step-indicator')).toHaveTextContent(
      /Step 1 of 3/i,
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(handleStepChange).toHaveBeenCalledWith('items');
    expect(screen.getByTestId('quote-step-indicator')).toHaveAttribute(
      'data-active-step',
      'items',
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(handleStepChange).toHaveBeenCalledWith('review');
    expect(screen.getByTestId('quote-review-summary')).toBeInTheDocument();
      expect(screen.getByTestId('quote-total-summary')).toHaveTextContent(
        /Total quote value/i,
      );
  });

  it('validates VAT and order number before submission for retail customers', () => {
    const quote = buildQuoteDraft({ orderNumber: '', vatNumber: '' });
    const handleSubmit = jest.fn();

    render(
      <QuoteComposerWizard
        initialQuote={quote}
        onSubmit={handleSubmit}
        onPreview={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit quote/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/VAT number is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Customer order reference is required/i),
    ).toBeInTheDocument();
  });

  it('emits preview snapshot when preview button is activated', () => {
    const quote = buildQuoteDraft();
    const handlePreview = jest.fn();

    render(
      <QuoteComposerWizard
        initialQuote={quote}
        onSubmit={jest.fn()}
        onPreview={handlePreview}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /preview quote/i }));

    expect(handlePreview).toHaveBeenCalledWith(
      expect.objectContaining({
        quoteId: 'quote-1001',
        lineItems: expect.arrayContaining([
          expect.objectContaining({ productId: 'prod-1001', quantity: 2 }),
        ]),
      }),
    );
  });
});
