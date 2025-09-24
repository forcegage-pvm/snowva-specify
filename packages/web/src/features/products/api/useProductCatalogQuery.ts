import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

export type ProductCatalogVersionStatus = 'Draft' | 'Scheduled' | 'Active' | 'Archived';

export type ProductCatalogVersion = {
  versionId: string;
  status: ProductCatalogVersionStatus;
  effectiveDate: string;
  notes?: string;
};

export type ProductCatalogOverride = {
  customerId: string;
  price: number;
  expiresAt?: string;
};

export type ProductCatalogItem = {
  productId: string;
  name: string;
  category: string;
  sku: string;
  retailPrice: number;
  consumerPrice: number;
  currentPricelistVersion: string;
  versionHistory: ProductCatalogVersion[];
  customOverrides?: ProductCatalogOverride[];
};

export type ProductCatalogResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: ProductCatalogItem[];
  availableVersions: ProductCatalogVersion[];
  activeVersionId: string | null;
  snapshotVersionId: string | null;
};

export type ProductCatalogQueryParams = {
  search?: string | null;
  category?: string | null;
  snapshotVersionId?: string | null;
  customerId?: string | null;
  page?: number;
  pageSize?: number;
};

type NormalizedProductCatalogQuery = {
  search: string | null;
  category: string | null;
  snapshotVersionId: string | null;
  customerId: string | null;
  page: number;
  pageSize: number;
};

type ProductCatalogQueryKey = [
  'products',
  'catalog',
  NormalizedProductCatalogQuery,
];

type UseProductCatalogQueryOptions = Omit<
  UseQueryOptions<
    ProductCatalogResponse,
    Error,
    ProductCatalogResponse,
    ProductCatalogQueryKey
  >,
  'queryKey' | 'queryFn'
>;

type CatalogSourceVersion = ProductCatalogVersion & {
  retailPrice: number;
  consumerPrice: number;
};

type CatalogSourceProduct = {
  productId: string;
  name: string;
  category: string;
  sku: string;
  versions: CatalogSourceVersion[];
  customOverrides?: ProductCatalogOverride[];
};

const fallbackCatalogSource: CatalogSourceProduct[] = [
  {
    productId: 'prod-1001',
    name: 'Snowva Retail Bundle',
    category: 'Bundles',
    sku: 'SNW-RTL-001',
    versions: [
      {
        versionId: 'v5',
        status: 'Active',
        effectiveDate: '2024-09-01T00:00:00.000Z',
        retailPrice: 1299,
        consumerPrice: 1499,
        notes: 'Seasonal uplift for holiday demand',
      },
      {
        versionId: 'v4',
        status: 'Archived',
        effectiveDate: '2024-05-01T00:00:00.000Z',
        retailPrice: 1199,
        consumerPrice: 1399,
      },
      {
        versionId: 'v3',
        status: 'Archived',
        effectiveDate: '2024-01-01T00:00:00.000Z',
        retailPrice: 1099,
        consumerPrice: 1299,
      },
    ],
    customOverrides: [
      {
        customerId: 'cust-200',
        price: 899,
        expiresAt: '2024-12-31T23:59:59.000Z',
      },
    ],
  },
  {
    productId: 'prod-1002',
    name: 'Snowva Pro Services Bundle',
    category: 'Services',
    sku: 'SNW-SVC-010',
    versions: [
      {
        versionId: 'v3',
        status: 'Active',
        effectiveDate: '2024-08-15T00:00:00.000Z',
        retailPrice: 1899,
        consumerPrice: 2099,
      },
      {
        versionId: 'v2',
        status: 'Archived',
        effectiveDate: '2024-04-01T00:00:00.000Z',
        retailPrice: 1799,
        consumerPrice: 1999,
      },
    ],
  },
  {
    productId: 'prod-1003',
    name: 'Snowva Analytics Add-on',
    category: 'Add-ons',
    sku: 'SNW-ANA-003',
    versions: [
      {
        versionId: 'v2',
        status: 'Scheduled',
        effectiveDate: '2024-12-01T00:00:00.000Z',
        retailPrice: 499,
        consumerPrice: 549,
        notes: 'Upcoming release with enhanced dashboards',
      },
      {
        versionId: 'v1',
        status: 'Active',
        effectiveDate: '2024-06-01T00:00:00.000Z',
        retailPrice: 459,
        consumerPrice: 509,
      },
    ],
  },
  {
    productId: 'prod-1004',
    name: 'Snowva POS Hardware Kit',
    category: 'Hardware',
    sku: 'SNW-HDW-007',
    versions: [
      {
        versionId: 'v6',
        status: 'Active',
        effectiveDate: '2024-07-01T00:00:00.000Z',
        retailPrice: 859,
        consumerPrice: 959,
      },
      {
        versionId: 'v5',
        status: 'Archived',
        effectiveDate: '2024-03-01T00:00:00.000Z',
        retailPrice: 829,
        consumerPrice: 929,
      },
      {
        versionId: 'v4',
        status: 'Archived',
        effectiveDate: '2023-11-01T00:00:00.000Z',
        retailPrice: 799,
        consumerPrice: 899,
      },
    ],
  },
];

const clampPage = (value?: number) => {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
};

const clampPageSize = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return 24;
  }

  return Math.max(6, Math.min(60, Math.floor(value)));
};

const normalizeQuery = (
  params?: ProductCatalogQueryParams,
): NormalizedProductCatalogQuery => {
  const page = clampPage(params?.page);
  const pageSize = clampPageSize(params?.pageSize);

  return {
    search: params?.search?.trim() ? params.search.trim() : null,
    category: params?.category?.trim() ? params.category.trim() : null,
    snapshotVersionId: params?.snapshotVersionId?.trim()
      ? params.snapshotVersionId.trim()
      : null,
    customerId: params?.customerId?.trim() ? params.customerId.trim() : null,
    page,
    pageSize,
  };
};

const buildSearchParams = (query: NormalizedProductCatalogQuery) => {
  const params = new URLSearchParams();

  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));

  if (query.search) {
    params.set('search', query.search);
  }

  if (query.category) {
    params.set('category', query.category);
  }

  if (query.snapshotVersionId) {
    params.set('snapshotVersionId', query.snapshotVersionId);
  }

  if (query.customerId) {
    params.set('customerId', query.customerId);
  }

  return params;
};

const sortVersionsDesc = (versions: CatalogSourceVersion[]) =>
  [...versions].sort(
    (left, right) =>
      new Date(right.effectiveDate).getTime() - new Date(left.effectiveDate).getTime(),
  );

const computeCatalogItem = (
  product: CatalogSourceProduct,
  snapshotVersionId: string | null,
): ProductCatalogItem => {
  const orderedVersions = sortVersionsDesc(product.versions);
  const activeVersion =
    orderedVersions.find((version) => version.status === 'Active') ?? orderedVersions[0];
  const appliedVersion = snapshotVersionId
    ? orderedVersions.find((version) => version.versionId === snapshotVersionId) ?? activeVersion
    : activeVersion;

  return {
    productId: product.productId,
    name: product.name,
    category: product.category,
    sku: product.sku,
    retailPrice: appliedVersion.retailPrice,
    consumerPrice: appliedVersion.consumerPrice,
    currentPricelistVersion: activeVersion.versionId,
    versionHistory: orderedVersions.map(({ versionId, status, effectiveDate, notes }) => ({
      versionId,
      status,
      effectiveDate,
      notes,
    })),
    customOverrides: product.customOverrides,
  };
};

const aggregateAvailableVersions = (source: CatalogSourceProduct[]): ProductCatalogVersion[] => {
  const versionMap = new Map<string, CatalogSourceVersion>();

  source.forEach((product) => {
    product.versions.forEach((version) => {
      const existing = versionMap.get(version.versionId);

      if (!existing) {
        versionMap.set(version.versionId, version);
        return;
      }

      const existingDate = new Date(existing.effectiveDate).getTime();
      const candidateDate = new Date(version.effectiveDate).getTime();

      if (candidateDate > existingDate) {
        versionMap.set(version.versionId, version);
      } else if (candidateDate === existingDate) {
        const statusPriority: Record<ProductCatalogVersionStatus, number> = {
          Active: 3,
          Scheduled: 2,
          Draft: 1,
          Archived: 0,
        };

        if (statusPriority[version.status] > statusPriority[existing.status]) {
          versionMap.set(version.versionId, version);
        }
      }
    });
  });

  const versions = Array.from(versionMap.values()).map(({ versionId, status, effectiveDate, notes }) => ({
    versionId,
    status,
    effectiveDate,
    notes,
  }));

  return versions.sort(
    (left, right) => new Date(right.effectiveDate).getTime() - new Date(left.effectiveDate).getTime(),
  );
};

const buildFallbackCatalog = (
  query: NormalizedProductCatalogQuery,
): ProductCatalogResponse => {
  const normalizedSearch = query.search?.toLowerCase() ?? null;

  const filteredSource = fallbackCatalogSource.filter((product) => {
    const matchesSearch = normalizedSearch
      ? product.name.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch)
      : true;

    const matchesCategory = query.category ? product.category === query.category : true;

    return matchesSearch && matchesCategory;
  });

  const availableVersions = aggregateAvailableVersions(filteredSource);
  const activeVersionId =
    availableVersions.find((version) => version.status === 'Active')?.versionId ??
    availableVersions[0]?.versionId ??
    null;

  const mappedItems = filteredSource.map((product) =>
    computeCatalogItem(product, query.snapshotVersionId ?? activeVersionId ?? null),
  );

  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;
  const pagedItems = mappedItems.slice(start, end);

  return {
    total: mappedItems.length,
    page: query.page,
    pageSize: query.pageSize,
    items: pagedItems,
    availableVersions,
    activeVersionId,
    snapshotVersionId: query.snapshotVersionId ?? activeVersionId ?? null,
  };
};

const fetchProductCatalog = async (
  query: NormalizedProductCatalogQuery,
): Promise<ProductCatalogResponse> => {
  const params = buildSearchParams(query);
  const endpoint = `/api/v1/products/catalog?${params.toString()}`;

  try {
    const response = await fetch(endpoint, { cache: 'no-store' });

    if (response.ok) {
      const payload = (await response.json()) as ProductCatalogResponse | null;

      if (payload) {
        return payload;
      }
    }

    if (response.status !== 404) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Failed to load product catalog');
    }
  } catch (error) {
    if (error instanceof Error && error.message !== 'Failed to load product catalog') {
      throw error;
    }
  }

  return buildFallbackCatalog(query);
};

export const buildProductCatalogQueryKey = (
  query: NormalizedProductCatalogQuery,
): ProductCatalogQueryKey => ['products', 'catalog', query];

export const useProductCatalogQuery = (
  params?: ProductCatalogQueryParams,
  options?: UseProductCatalogQueryOptions,
) => {
  const query = normalizeQuery(params);

  return useQuery({
    queryKey: buildProductCatalogQueryKey(query),
    queryFn: () => fetchProductCatalog(query),
    staleTime: 45_000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};