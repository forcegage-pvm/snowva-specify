'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { VirtualizedTableContainer } from '@/features/shared/components/VirtualizedTableContainer';
import { startListLoadTimer } from '@/lib/metrics/performanceMetrics';

type CustomerSummary = {
  customerId: string;
  displayName: string;
  parentCompany: string;
  branchCount: number;
  outstandingBalance: number;
  paymentTerms: string;
  vatNumber: string;
};

type CustomerDirectoryFilters = {
  search?: string;
};

type CustomerDirectoryTableProps = {
  customers: CustomerSummary[];
  isLoading?: boolean;
  onRowSelect?: (customerId: string) => void;
  onFiltersChange?: (filters: CustomerDirectoryFilters) => void;
  searchValue?: string;
};

const matchesSearch = (customer: CustomerSummary, search: string) => {
  const term = search.trim().toLowerCase();

  if (!term) {
    return true;
  }

  return (
    customer.displayName.toLowerCase().includes(term) ||
    customer.parentCompany.toLowerCase().includes(term) ||
    customer.vatNumber.toLowerCase().includes(term)
  );
};

export const CustomerDirectoryTable = ({
  customers,
  isLoading = false,
  onRowSelect,
  onFiltersChange,
  searchValue,
}: CustomerDirectoryTableProps) => {
  const listLoadTimerRef = useRef<ReturnType<typeof startListLoadTimer> | null>(null);
  const [internalSearch, setInternalSearch] = useState(searchValue ?? '');

  const search = searchValue ?? internalSearch;

  useEffect(() => {
    if (isLoading) {
      if (!listLoadTimerRef.current) {
        listLoadTimerRef.current = startListLoadTimer('customer-directory', {
          metadata: { source: 'CustomerDirectoryTable' },
        });
      }

      return;
    }

    if (listLoadTimerRef.current) {
      listLoadTimerRef.current.end({
        itemCount: customers.length,
        metadata: { source: 'CustomerDirectoryTable' },
      });
      listLoadTimerRef.current = null;
    }
  }, [customers.length, isLoading]);

  useEffect(
    () => () => {
      listLoadTimerRef.current?.cancel();
      listLoadTimerRef.current = null;
    },
    [],
  );

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => matchesSearch(customer, search));
  }, [customers, search]);

  const paymentTermsMeta = useMemo(() => {
    const meta: Array<{ span: number; isFirst: boolean }> = [];

    let index = 0;
    while (index < filteredCustomers.length) {
      let span = 1;

      while (
        index + span < filteredCustomers.length &&
        filteredCustomers[index + span].paymentTerms === filteredCustomers[index].paymentTerms
      ) {
        span += 1;
      }

      meta[index] = { span, isFirst: true };

      for (let offset = 1; offset < span; offset += 1) {
        meta[index + offset] = { span: 0, isFirst: false };
      }

      index += span;
    }

    return meta;
  }, [filteredCustomers]);

  if (isLoading) {
    return (
      <div
        data-testid="customer-directory-skeleton"
        className="flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-96 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  const handleSearchChange = (value: string) => {
    if (searchValue === undefined) {
      setInternalSearch(value);
    }

    onFiltersChange?.({ search: value });
  };

  const handleRowActivate = (customerId: string) => {
    onRowSelect?.(customerId);
  };

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [],
  );

  const renderHeader = () => (
    <thead className="bg-slate-50" role="rowgroup">
      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
        <th scope="col" className="px-4 py-3">
          Customer
        </th>
        <th scope="col" className="px-4 py-3">
          Parent company
        </th>
        <th scope="col" className="px-4 py-3">
          Branches
        </th>
        <th scope="col" className="px-4 py-3">
          Balance
        </th>
        <th scope="col" className="px-4 py-3">
          Payment terms
        </th>
      </tr>
    </thead>
  );

  const renderRow = (customer: CustomerSummary, index: number) => {
    const paymentMeta = paymentTermsMeta[index] ?? { span: 1, isFirst: true };

    return (
    <tr
      key={customer.customerId}
      role="row"
      tabIndex={0}
      onClick={() => handleRowActivate(customer.customerId)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleRowActivate(customer.customerId);
        }
      }}
      className="cursor-pointer bg-white transition hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
    >
      <td className="px-4 py-3 text-sm font-medium text-slate-900">{customer.displayName}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{customer.parentCompany}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{customer.branchCount}</td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {currencyFormatter.format(customer.outstandingBalance)}
      </td>
      {paymentMeta.isFirst ? (
        <td className="px-4 py-3 text-sm text-slate-600" rowSpan={paymentMeta.span || 1}>
          {customer.paymentTerms}
        </td>
      ) : null}
    </tr>
  );
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <p className="text-sm font-medium text-slate-600">No customers found</p>
      <p className="text-xs text-slate-400">
        {search
          ? 'Adjust your search or filters to see matching customers.'
          : 'Add customer records to begin managing your directory.'}
      </p>
    </div>
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-directory-search" className="text-sm font-medium text-slate-600">
          Search customers
        </label>
        <input
          id="customer-directory-search"
          aria-label="Search customers"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search by name, parent company, or VAT"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <VirtualizedTableContainer
        items={filteredCustomers}
        renderHeader={renderHeader}
        renderRow={renderRow}
        getRowKey={(customer) => customer.customerId}
        columnCount={5}
        maxHeight={480}
        tableClassName="min-w-full divide-y divide-slate-100"
        emptyState={emptyState}
        aria-label="Customer directory"
      />
    </section>
  );
};
