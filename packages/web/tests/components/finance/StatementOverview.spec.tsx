import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    StatementOverviewTable,
    type StatementOverview,
    type StatementOverviewFilters,
} from '@/features/finance/components/StatementOverview';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(
    value,
  );

const buildStatement = (
  overrides: Partial<StatementOverview> = {},
): StatementOverview => ({
  statementId: 'stmt-2024-09',
  customerId: 'cust-500',
  customerName: 'Holdsport Retail',
  period: { start: '2024-08-01', end: '2024-08-31' },
  totalDue: 18750,
  currency: 'ZAR',
  branches: [
    {
      branchId: 'branch-ct',
      branchName: 'Cape Town Central',
      subtotalDue: 11250,
      invoices: [
        {
          invoiceId: 'INV-2001',
          invoiceNumber: 'INV-2001',
          dueDate: '2024-08-15',
          amountDue: 4500,
          status: 'Overdue',
        },
        {
          invoiceId: 'INV-2002',
          invoiceNumber: 'INV-2002',
          dueDate: '2024-08-28',
          amountDue: 6750,
          status: 'Open',
        },
      ],
    },
    {
      branchId: 'branch-stb',
      branchName: 'Stellenbosch',
      subtotalDue: 7500,
      invoices: [
        {
          invoiceId: 'INV-2003',
          invoiceNumber: 'INV-2003',
          dueDate: '2024-08-25',
          amountDue: 7500,
          status: 'Open',
        },
      ],
    },
  ],
  exportOptions: {
    canDownload: true,
    canEmail: true,
  },
  lastSentAt: '2024-08-31T15:30:00Z',
  ...overrides,
});

describe('StatementOverviewTable', () => {
  it('renders branch groupings with invoice totals and overall summary', () => {
    const statement = buildStatement();

    render(<StatementOverviewTable statement={statement} />);

    expect(screen.getByTestId('statement-overview-table')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Holdsport Retail Statement/i }),
    ).toBeInTheDocument();

    const branchGroups = screen.getAllByTestId('statement-branch-group');
    expect(branchGroups).toHaveLength(2);
    expect(branchGroups[0]).toHaveTextContent('Cape Town Central');
    expect(branchGroups[0]).toHaveTextContent(formatCurrency(11250));

    expect(screen.getByTestId('statement-total-due')).toHaveTextContent(
      formatCurrency(statement.totalDue),
    );
  });

  it('emits export actions for download and email triggers', () => {
    const statement = buildStatement();
    const handleExport = jest.fn();

    render(
      <StatementOverviewTable
        statement={statement}
        onExport={handleExport}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Download PDF/i }));
    fireEvent.click(screen.getByRole('button', { name: /Send via email/i }));

    expect(handleExport).toHaveBeenNthCalledWith(1, 'download');
    expect(handleExport).toHaveBeenNthCalledWith(2, 'email');
  });

  it('propagates branch filter changes to parent handler', () => {
    const statement = buildStatement();
    const handleFilterChange = jest.fn();
    const filters: StatementOverviewFilters = {
      branchIds: ['branch-ct', 'branch-stb'],
      showOverdueOnly: false,
    };

    render(
      <StatementOverviewTable
        statement={statement}
        filters={filters}
        onFilterChange={handleFilterChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Filter branches/i), {
      target: { value: 'branch-ct' },
    });

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ branchIds: ['branch-ct'] }),
    );
  });
});
