import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { CustomerDirectoryTable } from '@/features/customers/components/CustomerDirectoryTable';

type CustomerSummary = {
  customerId: string;
  displayName: string;
  parentCompany: string;
  branchCount: number;
  outstandingBalance: number;
  paymentTerms: string;
  vatNumber: string;
};

const buildCustomers = (count: number): CustomerSummary[] =>
  Array.from({ length: count }).map((_, index) => ({
    customerId: `cust-${index + 1}`,
    displayName: `Customer ${index + 1}`,
    parentCompany: index % 2 === 0 ? 'Holdsport Group' : 'Outdoor Warehouse',
    branchCount: Math.floor(Math.random() * 8) + 1,
    outstandingBalance: 5000 * (index + 1),
    paymentTerms: index % 3 === 0 ? 'Net 30' : 'Net 45',
    vatNumber: `VAT${1000 + index}`,
  }));

describe('CustomerDirectoryTable', () => {
  it('shows skeleton while loading', () => {
    render(<CustomerDirectoryTable customers={[]} isLoading />);

    expect(screen.getByTestId('customer-directory-skeleton')).toBeInTheDocument();
  });

  it('renders customer rows with key details', () => {
    const customers = buildCustomers(3);

    render(<CustomerDirectoryTable customers={customers} />);

    customers.slice(0, 3).forEach((customer) => {
      expect(screen.getByText(customer.displayName)).toBeInTheDocument();
      expect(screen.getByText(customer.paymentTerms)).toBeInTheDocument();
    });
  });

  it('emits onRowSelect when a row is clicked', () => {
    const customers = buildCustomers(5);
  const handleSelect = jest.fn();

    render(
      <CustomerDirectoryTable customers={customers} onRowSelect={handleSelect} />,
    );

    const firstRow = screen.getByRole('row', { name: /Customer 1/i });
    fireEvent.click(firstRow);

    expect(handleSelect).toHaveBeenCalledWith('cust-1');
  });

  it('restricts rendered rows to virtualization window for large datasets', () => {
    const customers = buildCustomers(150);

    render(<CustomerDirectoryTable customers={customers} />);

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');

    expect(rows.length).toBeLessThanOrEqual(30);
  });

  it('forwards search filter changes', () => {
    const customers = buildCustomers(10);
  const handleFiltersChange = jest.fn();

    render(
      <CustomerDirectoryTable
        customers={customers}
        onFiltersChange={handleFiltersChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Search customers/i), {
      target: { value: 'Sportsmans' },
    });

    expect(handleFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'Sportsmans' }),
    );
  });
});
