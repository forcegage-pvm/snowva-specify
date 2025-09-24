'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type StatementStatus = 'open' | 'closed' | 'overdue';

export type StatementHistoryBranchBreakdown = {
  branchId: string;
  branchName: string;
  amount: number;
  overdue: boolean;
};

export type StatementHistoryEntry = {
  id: string;
  statementId: string;
  customerId: string;
  customerName: string;
  customerType: 'retail' | 'consumer';
  period: {
    label: string;
    start: string;
    end: string;
  };
  issuedOn: string;
  dueOn: string;
  status: StatementStatus;
  balance: number;
  currency: string;
  branchBreakdown: StatementHistoryBranchBreakdown[];
  exports?: {
    pdf?: {
      url: string;
      generatedAt: string;
    } | null;
    emailHistory?: Array<{
      id: string;
      sentAt: string;
      status: string;
      recipients?: string[];
    }>;
  };
};

export type StatementHistoryBranchAggregation = {
  branchId: string;
  branchName: string;
  totalBalance: number;
  overdueBalance: number;
  statementCount: number;
  latestStatementDate: string | null;
};

export type StatementHistorySummary = {
  totalStatements: number;
  totalBalance: number;
  currency: string;
  lastGeneratedAt: string | null;
};

export type StatementHistoryResult = {
  summary: StatementHistorySummary;
  statements: StatementHistoryEntry[];
  branchAggregations: StatementHistoryBranchAggregation[];
};

export type StatementHistoryQueryParams = {
  customerId?: string | null;
  branchId?: string | null;
  period?: {
    from?: string | null;
    to?: string | null;
  } | null;
  status?: StatementStatus | null;
  minimumBalance?: number | null;
  customerType?: 'retail' | 'consumer' | null;
};

type NormalizedStatementHistoryQuery = {
  customerId: string | null;
  branchId: string | null;
  period: {
    from: string | null;
    to: string | null;
  };
  status: StatementStatus | null;
  minimumBalance: number | null;
  customerType: 'retail' | 'consumer' | null;
};

type StatementHistoryQueryKey = [
  'statements',
  'history',
  NormalizedStatementHistoryQuery,
];

type UseStatementHistoryQueryOptions = Omit<
  UseQueryOptions<
    StatementHistoryResult,
    Error,
    StatementHistoryResult,
    StatementHistoryQueryKey
  >,
  'queryKey' | 'queryFn'
>;

const FALLBACK_STATEMENTS: StatementHistoryEntry[] = [
  {
    id: 'stmt_sportsmans_2024_12',
    statementId: 'stmt_sportsmans_2024_12',
    customerId: 'cust_sportsmans',
    customerName: 'Sportsmans Warehouse',
    customerType: 'retail',
    period: {
      label: 'Dec 2024',
      start: '2024-12-01',
      end: '2024-12-31',
    },
    issuedOn: '2024-12-20',
    dueOn: '2025-01-20',
    status: 'open',
    balance: 4_712_000,
    currency: 'ZAR',
    branchBreakdown: [
      {
        branchId: 'branch_tokai',
        branchName: 'Tokai',
        amount: 1_654_000,
        overdue: true,
      },
      {
        branchId: 'branch_northridge',
        branchName: 'Northridge',
        amount: 1_213_000,
        overdue: false,
      },
      {
        branchId: 'branch_nelspruit',
        branchName: 'Nelspruit',
        amount: 823_000,
        overdue: false,
      },
    ],
    exports: {
      pdf: {
        url: 'https://cdn.snowva.com/statements/stm_sportsmans_2024_12.pdf',
        generatedAt: '2024-12-20T08:00:00Z',
      },
      emailHistory: [
        {
          id: 'email_01',
          sentAt: '2024-12-20T08:05:00Z',
          status: 'delivered',
          recipients: ['finance@sportsmans.co.za'],
        },
      ],
    },
  },
  {
    id: 'stmt_holdsport_2024_10',
    statementId: 'stmt_holdsport_2024_10',
    customerId: 'cust_holdsport',
    customerName: 'Holdsport Group',
    customerType: 'retail',
    period: {
      label: 'Oct 2024',
      start: '2024-10-01',
      end: '2024-10-31',
    },
    issuedOn: '2024-10-20',
    dueOn: '2024-11-20',
    status: 'closed',
    balance: 3_482_500,
    currency: 'ZAR',
    branchBreakdown: [
      {
        branchId: 'branch_tokai',
        branchName: 'Tokai',
        amount: 1_212_500,
        overdue: false,
      },
      {
        branchId: 'branch_sandton',
        branchName: 'Sandton',
        amount: 1_025_000,
        overdue: false,
      },
      {
        branchId: 'branch_claremont',
        branchName: 'Claremont',
        amount: 620_000,
        overdue: false,
      },
      {
        branchId: 'branch_nelspruit',
        branchName: 'Nelspruit',
        amount: 625_000,
        overdue: true,
      },
    ],
    exports: {
      pdf: {
        url: 'https://cdn.snowva.com/statements/stm_holdsport_2024_10.pdf',
        generatedAt: '2024-10-20T07:30:00Z',
      },
      emailHistory: [
        {
          id: 'email_17',
          sentAt: '2024-10-20T08:00:00Z',
          status: 'delivered',
          recipients: ['accounts@holdsport.co.za'],
        },
        {
          id: 'email_18',
          sentAt: '2024-10-21T09:12:00Z',
          status: 'opened',
          recipients: ['lerato@snowva.com'],
        },
      ],
    },
  },
];

const clampMinimumBalance = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
};

const normalizeIdentifier = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizePeriod = (
  period?: StatementHistoryQueryParams['period'],
): NormalizedStatementHistoryQuery['period'] => ({
  from: normalizeIdentifier(period?.from ?? null),
  to: normalizeIdentifier(period?.to ?? null),
});

const normalizeStatus = (status?: StatementStatus | null): StatementStatus | null => {
  if (!status) {
    return null;
  }

  if (status === 'open' || status === 'closed' || status === 'overdue') {
    return status;
  }

  return null;
};

const normalizeCustomerType = (
  customerType?: 'retail' | 'consumer' | null,
): 'retail' | 'consumer' | null => {
  if (customerType === 'retail' || customerType === 'consumer') {
    return customerType;
  }

  return null;
};

const normalizeStatementHistoryQuery = (
  params?: StatementHistoryQueryParams,
): NormalizedStatementHistoryQuery => ({
  customerId: normalizeIdentifier(params?.customerId ?? null),
  branchId: normalizeIdentifier(params?.branchId ?? null),
  period: normalizePeriod(params?.period ?? null),
  status: normalizeStatus(params?.status ?? null),
  minimumBalance: clampMinimumBalance(params?.minimumBalance ?? null),
  customerType: normalizeCustomerType(params?.customerType ?? null),
});

const buildSearchParams = (query: NormalizedStatementHistoryQuery) => {
  const params = new URLSearchParams();

  if (query.customerId) {
    params.set('customerId', query.customerId);
  }

  if (query.branchId) {
    params.set('branchId', query.branchId);
  }

  if (query.period.from) {
    params.set('from', query.period.from);
  }

  if (query.period.to) {
    params.set('to', query.period.to);
  }

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.minimumBalance !== null) {
    params.set('minimumBalance', String(query.minimumBalance));
  }

  if (query.customerType) {
    params.set('customerType', query.customerType);
  }

  return params;
};

const toStatementStatus = (status: unknown): StatementStatus => {
  if (status === 'closed' || status === 'overdue') {
    return status;
  }

  return 'open';
};

const toBranchBreakdown = (value: unknown): StatementHistoryBranchBreakdown[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((branch) => {
      if (!branch || typeof branch !== 'object') {
        return null;
      }

      const candidate = branch as Record<string, unknown>;
      const branchId = typeof candidate.branchId === 'string'
        ? candidate.branchId
        : typeof candidate.id === 'string'
        ? candidate.id
        : null;

      if (!branchId) {
        return null;
      }

      const branchName = typeof candidate.branchName === 'string'
        ? candidate.branchName
        : typeof candidate.name === 'string'
        ? candidate.name
        : branchId;

      const amount = typeof candidate.amount === 'number'
        ? candidate.amount
        : typeof candidate.balance === 'number'
        ? candidate.balance
        : 0;

      const overdue = candidate.overdue === true || candidate.status === 'overdue';

      return {
        branchId,
        branchName,
        amount,
        overdue,
      } satisfies StatementHistoryBranchBreakdown;
    })
    .filter((branch): branch is StatementHistoryBranchBreakdown => Boolean(branch));
};

const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 11)}`;

const toStatementEntry = (value: unknown): StatementHistoryEntry | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  const statementId = typeof candidate.statementId === 'string'
    ? candidate.statementId
    : typeof candidate.id === 'string'
    ? candidate.id
    : null;

  if (!statementId) {
    return null;
  }

  const currency = typeof candidate.currency === 'string'
    ? candidate.currency
    : 'ZAR';

  const customerName = typeof candidate.customerName === 'string'
    ? candidate.customerName
    : 'Unknown customer';

  const customerId = typeof candidate.customerId === 'string' ? candidate.customerId : statementId;

  const period = (() => {
    const rawPeriod = candidate.period;

    if (rawPeriod && typeof rawPeriod === 'object') {
      const periodCandidate = rawPeriod as Record<string, unknown>;
      const label = typeof periodCandidate.label === 'string'
        ? periodCandidate.label
        : `${periodCandidate.start ?? ''} → ${periodCandidate.end ?? ''}`.trim();

      return {
        label: label || 'Statement period',
        start:
          typeof periodCandidate.start === 'string'
            ? periodCandidate.start
            : new Date().toISOString().slice(0, 10),
        end:
          typeof periodCandidate.end === 'string'
            ? periodCandidate.end
            : new Date().toISOString().slice(0, 10),
      };
    }

    const issuedOn = typeof candidate.issuedOn === 'string'
      ? candidate.issuedOn
      : new Date().toISOString().slice(0, 10);

    return {
      label: issuedOn,
      start: issuedOn,
      end: issuedOn,
    };
  })();

  const exportsValue = candidate.exports && typeof candidate.exports === 'object'
    ? (candidate.exports as Record<string, unknown>)
    : undefined;

  const emailHistory = Array.isArray(exportsValue?.emailHistory)
    ? (exportsValue?.emailHistory as Array<Record<string, unknown>>).map((email) => ({
        id: typeof email.id === 'string' ? email.id : randomId('email'),
        sentAt: typeof email.sentAt === 'string' ? email.sentAt : new Date().toISOString(),
        status: typeof email.status === 'string' ? email.status : 'unknown',
        recipients: Array.isArray(email.recipients)
          ? (email.recipients as string[])
          : undefined,
      }))
    : undefined;

  const pdfExport = exportsValue?.pdf && typeof exportsValue.pdf === 'object'
    ? (exportsValue.pdf as Record<string, unknown>)
    : undefined;

  const pdfMetadata = pdfExport
    ? {
        url: typeof pdfExport.url === 'string' ? pdfExport.url : '',
        generatedAt:
          typeof pdfExport.generatedAt === 'string'
            ? pdfExport.generatedAt
            : new Date().toISOString(),
      }
    : undefined;

  const balance = typeof candidate.balance === 'number'
    ? candidate.balance
    : typeof candidate.totalDue === 'number'
    ? candidate.totalDue
    : 0;

  return {
    id: statementId,
    statementId,
    customerId,
    customerName,
    customerType:
      candidate.customerType === 'consumer' ? 'consumer' : 'retail',
    period,
    issuedOn:
      typeof candidate.issuedOn === 'string'
        ? candidate.issuedOn
        : period.start,
    dueOn:
      typeof candidate.dueOn === 'string'
        ? candidate.dueOn
        : period.end,
    status: toStatementStatus(candidate.status),
    balance,
    currency,
    branchBreakdown: toBranchBreakdown(candidate.branchBreakdown),
    exports: pdfMetadata || emailHistory
      ? {
          pdf: pdfMetadata ?? null,
          emailHistory,
        }
      : undefined,
  } satisfies StatementHistoryEntry;
};

const aggregateBranches = (
  statements: StatementHistoryEntry[],
): StatementHistoryBranchAggregation[] => {
  const totals = new Map<string, StatementHistoryBranchAggregation>();

  statements.forEach((statement) => {
    statement.branchBreakdown.forEach((branch) => {
      const existing = totals.get(branch.branchId);
      const next: StatementHistoryBranchAggregation = existing
        ? {
            ...existing,
            totalBalance: existing.totalBalance + branch.amount,
            overdueBalance: existing.overdueBalance + (branch.overdue ? branch.amount : 0),
            statementCount: existing.statementCount + 1,
            latestStatementDate:
              existing.latestStatementDate && existing.latestStatementDate > statement.issuedOn
                ? existing.latestStatementDate
                : statement.issuedOn,
          }
        : {
            branchId: branch.branchId,
            branchName: branch.branchName,
            totalBalance: branch.amount,
            overdueBalance: branch.overdue ? branch.amount : 0,
            statementCount: 1,
            latestStatementDate: statement.issuedOn,
          };

      totals.set(branch.branchId, next);
    });
  });

  return Array.from(totals.values()).sort((left, right) => right.totalBalance - left.totalBalance);
};

const computeSummary = (statements: StatementHistoryEntry[]): StatementHistorySummary => {
  if (!statements.length) {
    return {
      totalStatements: 0,
      totalBalance: 0,
      currency: 'ZAR',
      lastGeneratedAt: null,
    } satisfies StatementHistorySummary;
  }

  const totalBalance = statements.reduce((total, statement) => total + statement.balance, 0);
  const currency = statements[0].currency ?? 'ZAR';

  const lastGeneratedAt = statements.reduce<string | null>((latest, statement) => {
    const candidate = statement.exports?.pdf?.generatedAt ?? statement.issuedOn;
    if (!candidate) {
      return latest;
    }

    if (!latest) {
      return candidate;
    }

    return candidate > latest ? candidate : latest;
  }, null);

  return {
    totalStatements: statements.length,
    totalBalance,
    currency,
    lastGeneratedAt,
  } satisfies StatementHistorySummary;
};

const adaptStatementHistoryPayload = (payload: unknown): StatementHistoryResult | null => {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    const statements = payload
      .map(toStatementEntry)
      .filter((entry): entry is StatementHistoryEntry => Boolean(entry));

    return {
      summary: computeSummary(statements),
      statements,
      branchAggregations: aggregateBranches(statements),
    } satisfies StatementHistoryResult;
  }

  if (typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Record<string, unknown>;

  if (Array.isArray(candidate.statements)) {
    const statements = candidate.statements
      .map(toStatementEntry)
      .filter((entry): entry is StatementHistoryEntry => Boolean(entry));

    const summary = candidate.summary && typeof candidate.summary === 'object'
      ? (() => {
          const rawSummary = candidate.summary as Record<string, unknown>;
          return {
            totalStatements:
              typeof rawSummary.totalStatements === 'number'
                ? rawSummary.totalStatements
                : statements.length,
            totalBalance:
              typeof rawSummary.totalBalance === 'number'
                ? rawSummary.totalBalance
                : statements.reduce((total, statement) => total + statement.balance, 0),
            currency:
              typeof rawSummary.currency === 'string'
                ? rawSummary.currency
                : statements[0]?.currency ?? 'ZAR',
            lastGeneratedAt:
              typeof rawSummary.lastGeneratedAt === 'string'
                ? rawSummary.lastGeneratedAt
                : statements[0]?.exports?.pdf?.generatedAt ?? null,
          } satisfies StatementHistorySummary;
        })()
      : computeSummary(statements);

    return {
      summary,
      statements,
      branchAggregations: aggregateBranches(statements),
    } satisfies StatementHistoryResult;
  }

  return null;
};

const matchesQuery = (
  statement: StatementHistoryEntry,
  query: NormalizedStatementHistoryQuery,
) => {
  if (query.customerId && statement.customerId !== query.customerId) {
    return false;
  }

  if (query.customerType && statement.customerType !== query.customerType) {
    return false;
  }

  if (query.branchId && !statement.branchBreakdown.some((branch) => branch.branchId === query.branchId)) {
    return false;
  }

  if (query.status && statement.status !== query.status) {
    return false;
  }

  if (query.minimumBalance !== null && statement.balance < query.minimumBalance) {
    return false;
  }

  const startsAfterFrom = (() => {
    if (!query.period.from) {
      return true;
    }

    return new Date(statement.period.end).getTime() >= new Date(query.period.from).getTime();
  })();

  if (!startsAfterFrom) {
    return false;
  }

  const endsBeforeTo = (() => {
    if (!query.period.to) {
      return true;
    }

    return new Date(statement.period.start).getTime() <= new Date(query.period.to).getTime();
  })();

  return endsBeforeTo;
};

const buildFallbackResult = (
  query: NormalizedStatementHistoryQuery,
): StatementHistoryResult => {
  const statements = FALLBACK_STATEMENTS.filter((statement) => matchesQuery(statement, query));
  const summary = computeSummary(statements);
  const branchAggregations = aggregateBranches(statements);

  return {
    summary,
    statements,
    branchAggregations,
  } satisfies StatementHistoryResult;
};

const fetchStatementHistory = async (
  query: NormalizedStatementHistoryQuery,
): Promise<StatementHistoryResult> => {
  const params = buildSearchParams(query);
  const endpoint = `/api/v1/statements/history?${params.toString()}`;

  try {
    const response = await fetch(endpoint, { cache: 'no-store' });

    if (response.ok) {
      const payload = await response.json();
      const adapted = adaptStatementHistoryPayload(payload);

      if (adapted) {
        return adapted;
      }
    }

    if (response.status !== 404) {
      const message = await response.text();
      throw new Error(message || 'Failed to load statement history');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to fetch') {
      return buildFallbackResult(query);
    }

    if (error instanceof TypeError) {
      return buildFallbackResult(query);
    }

    throw error;
  }

  return buildFallbackResult(query);
};

export const buildStatementHistoryQueryKey = (
  query: NormalizedStatementHistoryQuery,
): StatementHistoryQueryKey => ['statements', 'history', query];

export const useStatementHistoryQuery = (
  params?: StatementHistoryQueryParams,
  options?: UseStatementHistoryQueryOptions,
) => {
  const query = normalizeStatementHistoryQuery(params);

  return useQuery({
    queryKey: buildStatementHistoryQueryKey(query),
    queryFn: () => fetchStatementHistory(query),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
    ...options,
  });
};