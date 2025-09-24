import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { DashboardTile } from '@/features/dashboard/components/DashboardTile';

const MockIcon = () => <svg aria-hidden="true" data-testid="mock-icon" />;

describe('DashboardTile', () => {
  it('renders skeleton when loading', () => {
    render(
      <DashboardTile
        title="Outstanding Balance"
        metricValue={0}
        target={100000}
        criticalThreshold={150000}
        isLoading
      />,
    );

    expect(screen.getByTestId('dashboard-tile-skeleton')).toBeInTheDocument();
  });

  it('displays formatted metric value and title', () => {
    render(
      <DashboardTile
        title="Outstanding Balance"
        metricValue={120000}
        format="currency"
        currency="ZAR"
        target={100000}
        criticalThreshold={150000}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Outstanding Balance' })).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-tile-value')).toHaveTextContent(/120,000/);
  });

  it('indicates trend percentage with direction', () => {
    render(
      <DashboardTile
        title="Pending Quotes"
        metricValue={48}
        deltaPct={6.5}
        trendDirection="up"
        target={40}
        criticalThreshold={60}
      />,
    );

    expect(screen.getByText('6.5% increase')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-tile')).toHaveAttribute('data-state', 'warning');
  });

  it('marks tile critical when exceeding criticalThreshold', () => {
    render(
      <DashboardTile
        title="Overdue Invoices"
        metricValue={62}
        deltaPct={2.1}
        trendDirection="up"
        target={40}
        criticalThreshold={60}
      />,
    );

    expect(screen.getByTestId('dashboard-tile')).toHaveAttribute('data-state', 'critical');
  });

  it('renders provided icon within the tile', () => {
    render(
      <DashboardTile
        title="Payments Received"
        metricValue={20500}
        format="currency"
        currency="ZAR"
        target={20000}
        criticalThreshold={40000}
        icon={MockIcon}
      />,
    );

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });
});
