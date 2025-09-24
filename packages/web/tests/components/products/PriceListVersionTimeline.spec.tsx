import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';

import {
  PriceListVersionTimeline,
  type PriceListVersion,
} from '@/features/products/components/PriceListVersionTimeline';

const buildVersions = (): PriceListVersion[] => [
  {
    versionId: 'v5',
    status: 'Scheduled',
    effectiveDate: '2024-12-01',
    changedBy: 'Melissa Jacobs',
    notes: 'Peak season pricing for December',
  },
  {
    versionId: 'v4',
    status: 'Active',
    effectiveDate: '2024-09-01',
    changedBy: 'David Singh',
    notes: 'Spring update with promotional bundles',
  },
  {
    versionId: 'v3',
    status: 'Archived',
    effectiveDate: '2024-05-01',
    changedBy: 'Melissa Jacobs',
    archivedReason: 'Superseded by spring promotion',
  },
];

describe('PriceListVersionTimeline', () => {
  it('renders versions sorted by effective date with status indicators', () => {
    const versions = buildVersions();

    render(
      <PriceListVersionTimeline versions={versions} currentVersionId="v4" />,
    );

    const entries = screen.getAllByTestId('price-version-entry');
    expect(entries).toHaveLength(3);

    const first = within(entries[0]);
    expect(first.getByText('v5')).toBeInTheDocument();
    expect(first.getByTestId('price-version-status')).toHaveTextContent(
      /Scheduled/i,
    );
    expect(first.getByText('Effective 1 Dec 2024')).toBeInTheDocument();

    const second = within(entries[1]);
    expect(second.getByText('v4')).toBeInTheDocument();
    expect(entries[1]).toHaveAttribute('data-status', 'Active');
    expect(entries[1]).toHaveAttribute('data-current', 'true');
  });

  it('displays archived badge with reason for archived versions', () => {
    const versions = buildVersions();

    render(<PriceListVersionTimeline versions={versions} />);

    const archivedBadge = screen.getByTestId('price-version-badge-archived');
    expect(archivedBadge).toHaveTextContent('Archived');
    expect(archivedBadge).toHaveTextContent(
      'Superseded by spring promotion',
    );
  });

  it('invokes onVersionSelect when a timeline entry is activated', () => {
    const versions = buildVersions();
    const handleSelect = jest.fn();

    render(
      <PriceListVersionTimeline
        versions={versions}
        onVersionSelect={handleSelect}
      />,
    );

    const actionButton = screen.getByRole('button', { name: /View v4/i });
    fireEvent.click(actionButton);

    expect(handleSelect).toHaveBeenCalledWith('v4');
  });
});
