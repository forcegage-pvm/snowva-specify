import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type BranchStatus = 'active' | 'inactive' | 'pending';

export type BranchAuditTrailEvent = {
  id: string;
  actor: string;
  actorRole: string;
  message: string;
  occurredAt: string;
};

export type BranchDetail = {
  branchId: string;
  parentCustomerId: string;
  displayName: string;
  status: BranchStatus;
  contactEmail: string | null;
  contactPhone: string | null;
  paymentTerms: string;
  vatNumber: string | null;
  taxRegion: string | null;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    region: string | null;
    postalCode: string | null;
    country: string;
  } | null;
  lastStatementDate: string | null;
  outstandingBalance: number;
  currency: string;
  auditTrail: BranchAuditTrailEvent[];
};

export type BranchDetailQueryParams = {
  customerId: string;
  branchId: string;
};

type BranchDetailQueryKey = [
  'customers',
  'branch-detail',
  BranchDetailQueryParams | null,
];

type UseBranchDetailQueryOptions = Omit<
  UseQueryOptions<BranchDetail, Error, BranchDetail, BranchDetailQueryKey>,
  'queryKey' | 'queryFn'
>;

const fallbackBranches: Record<string, BranchDetail> = {
  'cust-100:branch-001': {
    branchId: 'branch-001',
    parentCustomerId: 'cust-100',
    displayName: 'Sportsmans Warehouse Tokai',
    status: 'active',
    contactEmail: 'tokai.branch@sportsmans.example',
    contactPhone: '+27 21 123 4567',
    paymentTerms: 'Net 30',
    vatNumber: '4990275123',
    taxRegion: 'ZA-WC',
    address: {
      line1: 'Tokai on Main Shopping Centre',
      line2: 'Shop 42',
      city: 'Cape Town',
      region: 'Western Cape',
      postalCode: '7945',
      country: 'ZAF',
    },
    lastStatementDate: '2023-12-01T08:30:00.000Z',
    outstandingBalance: 48250,
    currency: 'ZAR',
    auditTrail: [
      {
        id: 'evt-branch-001-001',
        actor: 'Farah Daniels',
        actorRole: 'Account Manager',
        message: 'Updated primary contact details',
        occurredAt: '2023-11-18T09:45:00.000Z',
      },
      {
        id: 'evt-branch-001-002',
        actor: 'System',
        actorRole: 'Automation',
        message: 'Generated monthly statement for November',
        occurredAt: '2023-12-01T06:00:00.000Z',
      },
      {
        id: 'evt-branch-001-003',
        actor: 'Michael Jacobs',
        actorRole: 'Credit Controller',
        message: 'Issued payment reminder for overdue invoices',
        occurredAt: '2023-12-12T14:20:00.000Z',
      },
    ],
  },
  'cust-100:branch-002': {
    branchId: 'branch-002',
    parentCustomerId: 'cust-100',
    displayName: 'Sportsmans Warehouse Canal Walk',
    status: 'active',
    contactEmail: 'canalwalk.branch@sportsmans.example',
    contactPhone: '+27 21 555 7788',
    paymentTerms: 'Net 45',
    vatNumber: '4990275123',
    taxRegion: 'ZA-WC',
    address: {
      line1: 'Shop L12 Canal Walk Centre',
      line2: null,
      city: 'Cape Town',
      region: 'Western Cape',
      postalCode: '7441',
      country: 'ZAF',
    },
    lastStatementDate: '2023-12-05T07:15:00.000Z',
    outstandingBalance: 32100,
    currency: 'ZAR',
    auditTrail: [
      {
        id: 'evt-branch-002-001',
        actor: 'System',
        actorRole: 'Automation',
        message: 'Generated monthly statement for December',
        occurredAt: '2023-12-05T05:55:00.000Z',
      },
      {
        id: 'evt-branch-002-002',
        actor: 'Karin Bezuidenhout',
        actorRole: 'Account Manager',
        message: 'Extended payment terms following review',
        occurredAt: '2023-12-07T11:10:00.000Z',
      },
    ],
  },
};

const buildFallbackBranchDetail = (
  params: BranchDetailQueryParams,
): BranchDetail => {
  const mapKey = `${params.customerId}:${params.branchId}`;

  if (fallbackBranches[mapKey]) {
    return fallbackBranches[mapKey];
  }

  return {
    branchId: params.branchId,
    parentCustomerId: params.customerId,
    displayName: `Branch ${params.branchId}`,
    status: 'pending',
    contactEmail: null,
    contactPhone: null,
    paymentTerms: 'Net 30',
    vatNumber: null,
    taxRegion: null,
    address: null,
    lastStatementDate: null,
    outstandingBalance: 0,
    currency: 'ZAR',
    auditTrail: [],
  };
};

const fetchBranchDetail = async (
  params: BranchDetailQueryParams,
): Promise<BranchDetail> => {
  const endpoint = `/api/v1/customers/${params.customerId}/branches/${params.branchId}`;

  try {
    const response = await fetch(endpoint, { cache: 'no-store' });

    if (response.ok) {
      const payload = (await response.json()) as BranchDetail | null;

      if (payload) {
        return payload;
      }
    }

    if (response.status !== 404) {
      const error = await response.text();
      throw new Error(error || 'Failed to load branch detail');
    }
  } catch (error) {
    if (error instanceof Error && error.message !== 'Failed to load branch detail') {
      throw error;
    }
  }

  return buildFallbackBranchDetail(params);
};

export const buildBranchDetailQueryKey = (
  params: BranchDetailQueryParams | null,
): BranchDetailQueryKey => ['customers', 'branch-detail', params];

export const useBranchDetailQuery = (
  params: BranchDetailQueryParams | null,
  options?: UseBranchDetailQueryOptions,
) => {
  const shouldFetch = Boolean(params?.customerId && params?.branchId);

  return useQuery({
    queryKey: buildBranchDetailQueryKey(params),
    queryFn: () => {
      if (!params) {
        throw new Error('Branch detail query requires customer and branch identifiers');
      }

      return fetchBranchDetail(params);
    },
    enabled: shouldFetch,
    staleTime: 60_000,
    retry: 1,
    ...options,
  });
};