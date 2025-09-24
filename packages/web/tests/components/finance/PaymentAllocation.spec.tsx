import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  PaymentAllocationPanel,
  type PaymentAllocation,
  type AllocationRecommendation,
  type AllocationAuditEvent,
} from '@/features/finance/components/PaymentAllocationPanel';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(
    value,
  );

const buildPayment = (
  overrides: Partial<PaymentAllocation> = {},
): PaymentAllocation => ({
  paymentId: 'pay-5001',
  customerId: 'cust-400',
  amount: 15000,
  currency: 'ZAR',
  allocationStrategy: 'FIFO',
  recommendedAllocations: [
    {
      invoiceId: 'INV-1001',
      invoiceNumber: 'INV-1001',
      dueDate: '2024-08-12',
      outstandingAmount: 4500,
      suggestedAmount: 4500,
    },
    {
      invoiceId: 'INV-1002',
      invoiceNumber: 'INV-1002',
      dueDate: '2024-08-25',
      outstandingAmount: 3200,
      suggestedAmount: 3200,
    },
    {
      invoiceId: 'INV-1003',
      invoiceNumber: 'INV-1003',
      dueDate: '2024-09-05',
      outstandingAmount: 7300,
      suggestedAmount: 7300,
    },
  ],
  manualAllocations: [],
  remainingBalance: 0,
  auditEvents: [
    {
      eventId: 'evt-1',
      timestamp: '2024-09-01T09:00:00Z',
      actor: 'Melissa Jacobs',
      action: 'Recommendation generated',
      details: 'FIFO recommendation created for unpaid invoices.',
    },
    {
      eventId: 'evt-2',
      timestamp: '2024-09-02T11:15:00Z',
      actor: 'David Singh',
      action: 'Allocation applied',
      details: 'Payment applied across three invoices with zero balance remaining.',
    },
  ],
  ...overrides,
});

describe('PaymentAllocationPanel', () => {
  it('renders FIFO recommendations, totals, and remaining balance summary', () => {
    const payment = buildPayment();

    render(
      <PaymentAllocationPanel
        payment={payment}
        onApplyOverride={jest.fn()}
        onCommitAllocation={jest.fn()}
      />,
    );

    expect(screen.getByTestId('payment-allocation-panel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Payment pay-5001/i })).toBeInTheDocument();
    expect(screen.getByTestId('allocation-strategy')).toHaveTextContent(/FIFO/i);

    const rows = screen.getAllByTestId('allocation-row');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('INV-1001');

    expect(screen.getByTestId('remaining-balance')).toHaveTextContent(
      `Remaining balance: ${formatCurrency(payment.remainingBalance)}`,
    );
  });

  it('supports manual override entry and emits onApplyOverride with details', () => {
    const payment = buildPayment({ remainingBalance: 1200 });
    const handleOverride = jest.fn();

    render(
      <PaymentAllocationPanel
        payment={payment}
        onApplyOverride={handleOverride}
        onCommitAllocation={jest.fn()}
      />,
    );

    const overrideInput = screen.getByLabelText(/Override amount for INV-1003/i);
    fireEvent.change(overrideInput, { target: { value: '1250' } });
    fireEvent.click(screen.getByRole('button', { name: /Apply override/i }));

    expect(handleOverride).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'INV-1003',
        amount: 1250,
      }),
    );
  });

  it('renders allocation audit log events in chronological order', () => {
    const payment = buildPayment();

    render(
      <PaymentAllocationPanel
        payment={payment}
        onApplyOverride={jest.fn()}
        onCommitAllocation={jest.fn()}
      />,
    );

    const events = screen.getAllByTestId('payment-allocation-event');
    expect(events).toHaveLength(2);
    expect(events[0]).toHaveTextContent('Recommendation generated');
    expect(events[1]).toHaveTextContent('Allocation applied');
    expect(events[0]).toHaveAttribute('data-timestamp', payment.auditEvents[0].timestamp);
  });
});
