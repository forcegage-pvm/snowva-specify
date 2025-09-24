'use client';

import { useMemo, useState } from 'react';

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

const VIRTUALIZED_ROW_LIMIT = 25;

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
  const [internalSearch, setInternalSearch] = useState(searchValue ?? '');

  const search = searchValue ?? internalSearch;

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => matchesSearch(customer, search));
  }, [customers, search]);

  const visibleCustomers = filteredCustomers.slice(0, VIRTUALIZED_ROW_LIMIT);

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

  const paymentTermsRowSpan = useMemo(() => {
    const spans = new Map<number, number>();

    let index = 0;
    while (index < visibleCustomers.length) {
      let span = 1;

      while (
        index + span < visibleCustomers.length &&
        visibleCustomers[index + span].paymentTerms === visibleCustomers[index].paymentTerms
      ) {
        span += 1;
      }

      spans.set(index, span);

      for (let offset = 1; offset < span; offset += 1) {
        spans.set(index + offset, 0);
      }

      index += span;
    }

    return spans;
  }, [visibleCustomers]);

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

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full divide-y divide-slate-100" role="table">
            <thead className="bg-slate-50">
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
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleCustomers.map((customer, index) => {
                const rowSpan = paymentTermsRowSpan.get(index) ?? 1;

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
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format(customer.outstandingBalance)}
                    </td>
                    {rowSpan > 0 ? (
                      <td className="px-4 py-3 text-sm text-slate-600" rowSpan={rowSpan}>
                        {customer.paymentTerms}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
