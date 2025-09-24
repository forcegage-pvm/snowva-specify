import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { BranchDetailPanel } from '@/features/customers/components/BranchDetailPanel';

type TimelineEvent = {
  eventId: string;
  timestamp: string;
  eventType: string;
  actor: string;
  summary: string;
};

type BranchDetail = {
  branchId: string;
  parentCustomerId: string;
  displayName: string;
  address: string;
  vatNumber: string;
  paymentTerms: string;
  contactEmail: string;
  auditTrail: TimelineEvent[];
};

const buildBranch = (overrides: Partial<BranchDetail> = {}): BranchDetail => ({
  branchId: 'branch-001',
  parentCustomerId: 'cust-100',
  displayName: 'Sportsmans Warehouse Tokai',
  address: 'Cnr Main Rd & Tokai Rd, Tokai',
  vatNumber: 'VAT123456789',
  paymentTerms: 'Net 30',
  contactEmail: 'tokai@sportsmans.co.za',
  auditTrail: [
    {
      eventId: 'evt-1',
      timestamp: '2025-09-10T08:15:00Z',
      eventType: 'PaymentTermsUpdated',
      actor: 'Jodie Michaels',
      summary: 'Updated payment terms from Net 45 to Net 30',
    },
    {
      eventId: 'evt-2',
      timestamp: '2025-09-04T12:05:00Z',
      eventType: 'AddressEdited',
      actor: 'Marcus Lee',
      summary: 'Corrected delivery suburb spelling',
    },
  ],
  ...overrides,
});

describe('BranchDetailPanel', () => {
  it('renders branch profile information and audit timeline entries', () => {
    const branch = buildBranch();

    render(<BranchDetailPanel branch={branch} />);

    expect(
      screen.getByRole('heading', { name: /Sportsmans Warehouse Tokai/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(branch.address)).toBeInTheDocument();
    expect(screen.getByText(branch.vatNumber)).toBeInTheDocument();
    branch.auditTrail.forEach((event) => {
      expect(screen.getByText(event.summary)).toBeInTheDocument();
      expect(screen.getByText(event.actor)).toBeInTheDocument();
    });
  });

  it('opens inline edit mode and calls onCommit with changed fields', () => {
    const branch = buildBranch();
    const handleCommit = jest.fn();

    render(
      <BranchDetailPanel branch={branch} onCommitChanges={handleCommit} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Edit branch details/i }));
    fireEvent.change(screen.getByLabelText(/Payment terms/i), {
      target: { value: 'Net 45' },
    });
    fireEvent.change(screen.getByLabelText(/Contact email/i), {
      target: { value: 'tokai.billing@sportsmans.co.za' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(handleCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentTerms: 'Net 45',
        contactEmail: 'tokai.billing@sportsmans.co.za',
      }),
    );
  });

  it('disables saving when no edits are made', () => {
    const branch = buildBranch();

    render(<BranchDetailPanel branch={branch} />);

    fireEvent.click(screen.getByRole('button', { name: /Edit branch details/i }));
    expect(screen.getByRole('button', { name: /Save changes/i })).toBeDisabled();
  });

  it('exposes audit log filter controls for event types', () => {
    const branch = buildBranch();

    render(<BranchDetailPanel branch={branch} />);

    expect(screen.getByLabelText(/Filter audit events/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Apply filter/i }));
    expect(screen.getByTestId('audit-filter-applied')).toBeInTheDocument();
  });
});
