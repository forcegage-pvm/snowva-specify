import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { Customer } from '@/models/Customer';

type CustomerDirectorySort = 'name' | 'outstandingBalance' | 'creditTerms';

type CustomerDirectoryFilters = {
  customerType: 'retail' | 'consumer' | 'mixed' | null;
  status: 'active' | 'inactive' | null;
  overdueOnly: boolean;
};

type CustomerDirectoryQueryParams = {
  search?: string | null;
  page?: number;
  pageSize?: number;
  sort?: CustomerDirectorySort;
  filters?: Partial<CustomerDirectoryFilters>;
};

type CustomerDirectoryContact = {
  name: string;
  email: string;
  phone?: string;
};

type CustomerDirectoryListItem = {
  id: string;
  displayName: string;
  customerType: 'retail' | 'consumer' | 'mixed';
  vatNumber: string | null;
  creditTerms: string | null;
  outstandingBalance: number;
  dueSoonCount: number;
  overdueCount: number;
  branchCount: number;
  lastStatementDate: string | null;
  primaryContact: CustomerDirectoryContact | null;
};

type CustomerDirectoryResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: CustomerDirectoryListItem[];
};

type NormalizedCustomerDirectoryQuery = {
  search: string | null;
  page: number;
  pageSize: number;
  sort: CustomerDirectorySort;
  filters: CustomerDirectoryFilters;
};

type CustomerDirectoryQueryKey = [
  'customers',
  'directory',
  NormalizedCustomerDirectoryQuery,
];

type UseCustomerDirectoryQueryOptions = Omit<
  UseQueryOptions<
    CustomerDirectoryResponse,
    Error,
    CustomerDirectoryResponse,
    CustomerDirectoryQueryKey
  >,
  'queryKey' | 'queryFn'
>;

const DEFAULT_FILTERS: CustomerDirectoryFilters = {
  customerType: null,
  status: null,
  overdueOnly: false,
};

const DEFAULT_QUERY: NormalizedCustomerDirectoryQuery = {
  search: null,
  page: 1,
  pageSize: 25,
  sort: 'name',
  filters: DEFAULT_FILTERS,
};

const clampPage = (value?: number) => {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
};

const clampPageSize = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return 25;
  }

  return Math.max(5, Math.min(50, Math.floor(value)));
};

const normalizeQuery = (
  params?: CustomerDirectoryQueryParams,
): NormalizedCustomerDirectoryQuery => {
  const page = clampPage(params?.page);
  const pageSize = clampPageSize(params?.pageSize);
  const sort = params?.sort ?? 'name';
  const filters: CustomerDirectoryFilters = {
    ...DEFAULT_FILTERS,
    ...params?.filters,
    overdueOnly: params?.filters?.overdueOnly ?? DEFAULT_FILTERS.overdueOnly,
  };

  return {
    search: params?.search?.trim() ? params?.search.trim() : null,
    page,
    pageSize,
    sort,
    filters,
  };
};

const buildSearchParams = (query: NormalizedCustomerDirectoryQuery) => {
  const params = new URLSearchParams();

  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  params.set('sort', query.sort);

  if (query.search) {
    params.set('search', query.search);
  }

  if (query.filters.customerType) {
    params.set('customerType', query.filters.customerType);
  }

  if (query.filters.status) {
    params.set('status', query.filters.status);
  }

  if (query.filters.overdueOnly) {
    params.set('overdueOnly', 'true');
  }

  return params;
};

const mapCustomerToDirectoryItem = (customer: Customer): CustomerDirectoryListItem => {
  const defaultContact: CustomerDirectoryContact | null = customer.email
    ? {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      }
    : null;

  return {
    id: customer.id,
    displayName: customer.name,
    customerType: 'retail',
    vatNumber: null,
    creditTerms: 'Net 30',
    outstandingBalance: 0,
    dueSoonCount: 0,
    overdueCount: 0,
    branchCount: 0,
    lastStatementDate: null,
    primaryContact: defaultContact,
  };
};

const applyFallbackTransforms = (
  customers: Customer[],
  query: NormalizedCustomerDirectoryQuery,
): CustomerDirectoryResponse => {
  const normalizedSearch = query.search?.toLowerCase() ?? null;

  const filtered = customers.filter((customer) => {
    const matchesSearch = normalizedSearch
      ? customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch)
      : true;

    const matchesCustomerType =
      query.filters.customerType === null ||
      query.filters.customerType === 'retail';

    const matchesStatus =
      query.filters.status === null || query.filters.status === 'active';

    const matchesOverdue = query.filters.overdueOnly ? false : true;

    return matchesSearch && matchesCustomerType && matchesStatus && matchesOverdue;
  });

  const sorted = [...filtered].sort((left, right) => {
    switch (query.sort) {
      case 'creditTerms':
      case 'outstandingBalance':
        return 0;
      case 'name':
      default:
        return left.name.localeCompare(right.name);
    }
  });

  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;
  const pageItems = sorted.slice(start, end).map(mapCustomerToDirectoryItem);

  return {
    total: sorted.length,
    page: query.page,
    pageSize: query.pageSize,
    items: pageItems,
  };
};

const fetchCustomerDirectory = async (
  query: NormalizedCustomerDirectoryQuery,
): Promise<CustomerDirectoryResponse> => {
  const params = buildSearchParams(query);
  const endpoint = `/api/v1/customers/directory?${params.toString()}`;
  const response = await fetch(endpoint, { cache: 'no-store' });

  if (response.ok) {
    return response.json();
  }

  if (response.status !== 404) {
    throw new Error('Failed to load customer directory');
  }

  const fallbackResponse = await fetch('/api/v1/customers', {
    cache: 'no-store',
  });

  if (!fallbackResponse.ok) {
    throw new Error('Failed to load customer directory fallback payload');
  }

  const customers = (await fallbackResponse.json()) as Customer[];
  return applyFallbackTransforms(customers, query);
};

export const buildCustomerDirectoryQueryKey = (
  query: NormalizedCustomerDirectoryQuery,
): CustomerDirectoryQueryKey => ['customers', 'directory', query];

export const useCustomerDirectoryQuery = (
  params?: CustomerDirectoryQueryParams,
  options?: UseCustomerDirectoryQueryOptions,
) => {
  const query = normalizeQuery(params);

  return useQuery({
    queryKey: buildCustomerDirectoryQueryKey(query),
    queryFn: () => fetchCustomerDirectory(query),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};
