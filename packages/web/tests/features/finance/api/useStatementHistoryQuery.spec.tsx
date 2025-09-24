import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useStatementHistoryQuery } from '@/features/finance/api/useStatementHistoryQuery';

const originalFetch = global.fetch;

type WrapperTuple = {
  Wrapper: ({ children }: PropsWithChildren) => ReactElement;
  client: QueryClient;
};

const createWrapper = (): WrapperTuple => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { Wrapper, client };
};

describe('useStatementHistoryQuery', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any) = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('falls back to bundled statement history when API responds with 404', async () => {
    const { Wrapper, client } = createWrapper();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
      text: async () => 'Not found',
    });

    const { result } = renderHook(
      () => useStatementHistoryQuery({ customerId: 'cust_sportsmans' }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data;
    expect(data).toBeDefined();
    expect(data?.summary.totalStatements).toBe(1);
    expect(data?.branchAggregations).toHaveLength(3);
    expect(data?.branchAggregations[0]).toMatchObject({
      branchId: 'branch_tokai',
      totalBalance: expect.any(Number),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/statements/history?customerId=cust_sportsmans'),
      { cache: 'no-store' },
    );

    client.clear();
  });

  it('adapts API response and aggregates branch balances', async () => {
    const { Wrapper, client } = createWrapper();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        summary: {
          totalStatements: 2,
          totalBalance: 880000,
          currency: 'ZAR',
          lastGeneratedAt: '2025-01-02T06:00:00Z',
        },
        statements: [
          {
            id: 'stmt_daily_001',
            customerId: 'cust_retail',
            customerName: 'Retail Outlet',
            customerType: 'retail',
            period: {
              label: 'Jan 2025',
              start: '2025-01-01',
              end: '2025-01-31',
            },
            issuedOn: '2025-01-31',
            dueOn: '2025-02-20',
            status: 'open',
            balance: 560000,
            currency: 'ZAR',
            branchBreakdown: [
              {
                branchId: 'branch_ct',
                branchName: 'Cape Town',
                amount: 320000,
                overdue: false,
              },
              {
                branchId: 'branch_dbn',
                branchName: 'Durban',
                amount: 240000,
                overdue: true,
              },
            ],
          },
          {
            id: 'stmt_daily_002',
            customerId: 'cust_retail',
            customerName: 'Retail Outlet',
            customerType: 'retail',
            period: {
              label: 'Feb 2025',
              start: '2025-02-01',
              end: '2025-02-28',
            },
            issuedOn: '2025-02-28',
            dueOn: '2025-03-20',
            status: 'open',
            balance: 320000,
            currency: 'ZAR',
            branchBreakdown: [
              {
                branchId: 'branch_ct',
                branchName: 'Cape Town',
                amount: 180000,
                overdue: false,
              },
              {
                branchId: 'branch_dbn',
                branchName: 'Durban',
                amount: 140000,
                overdue: false,
              },
            ],
          },
        ],
      }),
      text: async () => '',
    });

    const { result } = renderHook(
      () => useStatementHistoryQuery({ customerId: 'cust_retail' }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data;
    expect(data).toBeDefined();
    expect(data?.summary).toMatchObject({
      totalStatements: 2,
      totalBalance: 880000,
      currency: 'ZAR',
      lastGeneratedAt: '2025-01-02T06:00:00Z',
    });

    expect(data?.branchAggregations).toHaveLength(2);
    const [firstBranch, secondBranch] = data?.branchAggregations ?? [];

    expect(firstBranch).toMatchObject({
      branchId: 'branch_ct',
      totalBalance: 500000,
      overdueBalance: 0,
      statementCount: 2,
    });

    expect(secondBranch).toMatchObject({
      branchId: 'branch_dbn',
      totalBalance: 380000,
      overdueBalance: 240000,
      statementCount: 2,
    });

    client.clear();
  });
});
