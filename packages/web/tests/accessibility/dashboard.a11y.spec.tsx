import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import DashboardPage from '@/app/(dashboard)/dashboard/page';
import {
    type DashboardMetricsResponse,
    useDashboardMetricsQuery,
} from '@/features/dashboard/api/useDashboardMetricsQuery';
import {
    type DashboardShortcutsResponse,
    useDashboardShortcutsQuery,
} from '@/features/dashboard/api/useDashboardShortcutsQuery';
import {
    type StatementHistoryResult,
    useStatementHistoryQuery,
} from '@/features/finance/api/useStatementHistoryQuery';

expect.extend(toHaveNoViolations);

jest.mock('@/features/dashboard/api/useDashboardMetricsQuery');
jest.mock('@/features/dashboard/api/useDashboardShortcutsQuery');
jest.mock('@/features/finance/api/useStatementHistoryQuery');
jest.mock('next/link', () => {
  return React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(function MockNextLink(
    props,
    ref,
  ) {
    const { href, children, ...rest } = props;
    return React.createElement('a', { href, ref, ...rest }, children);
  });
});

const mockedUseDashboardMetricsQuery = jest.mocked(useDashboardMetricsQuery);
const mockedUseDashboardShortcutsQuery = jest.mocked(useDashboardShortcutsQuery);
const mockedUseStatementHistoryQuery = jest.mocked(useStatementHistoryQuery);

const createSuccessfulQueryResult = <T,>(data: T) => ({
  data,
  isPending: false,
  isError: false,
});

const originalIntersectionObserver = global.IntersectionObserver;

beforeAll(() => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;

    readonly rootMargin = '0px';

    readonly thresholds = [] as number[];

    observe(): void {}

    unobserve(): void {}

    disconnect(): void {}

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: MockIntersectionObserver,
  });
});

afterAll(() => {
  if (originalIntersectionObserver) {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: originalIntersectionObserver,
    });
  } else {
    delete (window as Partial<typeof window>).IntersectionObserver;
  }
});

describe('Accessibility: Dashboard overview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard page without accessibility violations', async () => {
    const metricsData: DashboardMetricsResponse = {
      generatedAt: '2025-03-15T09:15:00Z',
      tiles: [
        {
          id: 'outstanding-balance',
          title: 'Outstanding balance',
          metricValue: 4_200_000,
          format: 'currency',
          currency: 'ZAR',
          deltaPct: 4.2,
          trendDirection: 'up',
          target: 3_800_000,
          criticalThreshold: 5_000_000,
        },
        {
          id: 'pending-quotes',
          title: 'Pending quotes',
          metricValue: 41,
          format: 'number',
          deltaPct: -2.5,
          trendDirection: 'down',
          target: 35,
          criticalThreshold: 60,
        },
        {
          id: 'overdue-invoices',
          title: 'Overdue invoices',
          metricValue: 28,
          format: 'number',
          deltaPct: 1.2,
          trendDirection: 'up',
          target: 25,
          criticalThreshold: 40,
        },
        {
          id: 'collections-rate',
          title: 'Collections rate',
          metricValue: 92.4,
          format: 'percentage',
          deltaPct: 0.8,
          trendDirection: 'up',
          target: 93,
          criticalThreshold: 88,
        },
      ],
    };

    const shortcutsData: DashboardShortcutsResponse = {
      generatedAt: '2025-03-15T09:10:00Z',
      shortcuts: [
        {
          id: 'open-invoices',
          label: 'Review overdue invoices',
          description: '12 invoices queued for follow-up',
          href: '/invoices?status=overdue',
          tone: 'critical',
        },
        {
          id: 'allocate-payments',
          label: 'Allocate payments',
          description: 'Match 5 unapplied payments',
          href: '/payments?tab=allocation',
          tone: 'warning',
        },
        {
          id: 'quotes-expiring',
          label: 'Quotes expiring soon',
          description: '7 quotes expiring this week',
          href: '/quotes?filter=expiring',
        },
        {
          id: 'branch-statements',
          label: 'Branch statements',
          description: 'Generate consolidated PDFs',
          href: '/statements',
        },
      ],
    };

    const statementHistory: StatementHistoryResult = {
      summary: {
        totalStatements: 4,
        totalBalance: 6_200_000,
        currency: 'ZAR',
        lastGeneratedAt: '2025-03-15T08:45:00Z',
      },
      statements: [],
      branchAggregations: [
        {
          branchId: 'branch_tokai',
          branchName: 'Tokai',
          totalBalance: 2_400_000,
          overdueBalance: 1_250_000,
          statementCount: 3,
          latestStatementDate: '2025-03-01',
        },
        {
          branchId: 'branch_sandton',
          branchName: 'Sandton',
          totalBalance: 1_980_000,
          overdueBalance: 520_000,
          statementCount: 2,
          latestStatementDate: '2025-02-28',
        },
        {
          branchId: 'branch_claremont',
          branchName: 'Claremont',
          totalBalance: 1_280_000,
          overdueBalance: 0,
          statementCount: 2,
          latestStatementDate: '2025-03-02',
        },
      ],
    };

    mockedUseDashboardMetricsQuery.mockReturnValue(
      createSuccessfulQueryResult(metricsData) as unknown as ReturnType<typeof useDashboardMetricsQuery>,
    );

    mockedUseDashboardShortcutsQuery.mockReturnValue(
      createSuccessfulQueryResult(shortcutsData) as unknown as ReturnType<typeof useDashboardShortcutsQuery>,
    );

    mockedUseStatementHistoryQuery.mockReturnValue(
      createSuccessfulQueryResult(statementHistory) as unknown as ReturnType<typeof useStatementHistoryQuery>,
    );

    const { container } = render(<DashboardPage />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
