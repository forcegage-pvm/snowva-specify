import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  InvoiceWorkspace,
  type InvoiceWorkspaceState,
} from '@/features/sales/components/InvoiceWorkspace';

const buildInvoice = (overrides: Partial<InvoiceWorkspaceState> = {}): InvoiceWorkspaceState => ({
  invoiceId: 'INV-2024-0001',
  customerName: 'Holdsport Retail',
  status: 'Draft',
  totals: {
    subtotal: 2998,
    vat: 449.7,
    total: 3447.7,
    balanceDue: 3447.7,
  },
  paymentStatus: 'Unpaid',
  vatNumber: 'ZA123456789',
  orderReference: 'PO-9981',
  canFinalize: true,
  canEdit: true,
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
  timeline: [
    {
      eventId: 'evt-1',
      timestamp: '2024-09-01T08:00:00Z',
      type: 'created',
      actor: 'Melissa Jacobs',
      summary: 'Invoice created from quote INV-2024-0001',
    },
    {
      eventId: 'evt-2',
      timestamp: '2024-09-02T10:30:00Z',
      type: 'note',
      actor: 'David Singh',
      summary: 'Updated delivery instructions for Woodstock branch',
    },
  ],
  ...overrides,
});

describe('InvoiceWorkspace', () => {
  it('renders draft invoice timeline and invokes finalize callback', () => {
    const invoice = buildInvoice();
    const handleFinalize = jest.fn();

    render(
      <InvoiceWorkspace
        invoice={invoice}
        onFinalize={handleFinalize}
        onSendEmail={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /Invoice INV-2024-0001/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('invoice-status-badge')).toHaveTextContent(/Draft/i);

    const events = screen.getAllByTestId('invoice-timeline-event');
    expect(events).toHaveLength(2);
    expect(events[0]).toHaveTextContent('Invoice created from quote');

    const finalizeButton = screen.getByRole('button', {
      name: /Finalize invoice/i,
    });
    expect(finalizeButton).toBeEnabled();

    fireEvent.click(finalizeButton);

    expect(handleFinalize).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'INV-2024-0001' }),
    );
  });

  it('surfaces mutation guard if VAT or order reference missing before finalize', () => {
    const invoice = buildInvoice({ vatNumber: '', orderReference: '' });
    const handleFinalize = jest.fn();

    render(<InvoiceWorkspace invoice={invoice} onFinalize={handleFinalize} />);

    fireEvent.click(
      screen.getByRole('button', { name: /Finalize invoice/i }),
    );

    expect(handleFinalize).not.toHaveBeenCalled();
    expect(screen.getByTestId('invoice-finalize-guard')).toHaveTextContent(
      /Add VAT number and customer order reference before finalizing/i,
    );
  });

  it('locks editing when invoice is finalized and supports reopen action', () => {
    const invoice = buildInvoice({
      status: 'Finalized',
      canFinalize: false,
      canEdit: false,
      paymentStatus: 'Partial',
      timeline: [
        {
          eventId: 'evt-1',
          timestamp: '2024-09-01T08:00:00Z',
          type: 'created',
          actor: 'Melissa Jacobs',
          summary: 'Invoice created from quote INV-2024-0001',
        },
        {
          eventId: 'evt-3',
          timestamp: '2024-09-03T09:00:00Z',
          type: 'finalized',
          actor: 'Melissa Jacobs',
          summary: 'Invoice finalized and locked for edits',
        },
      ],
    });
    const handleReopen = jest.fn();

    render(<InvoiceWorkspace invoice={invoice} onReopen={handleReopen} />);

    const finalizeButton = screen.getByRole('button', {
      name: /Finalize invoice/i,
    });
    expect(finalizeButton).toBeDisabled();

    expect(screen.getByTestId('invoice-status-badge')).toHaveAttribute(
      'data-state',
      'Finalized',
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Reopen invoice/i }),
    );

    expect(handleReopen).toHaveBeenCalledWith('INV-2024-0001');
  });
});
