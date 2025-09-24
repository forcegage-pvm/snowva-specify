'use client';

import type { ChangeEvent, FC } from 'react';

export type StatementInvoice = {
  invoiceId: string;
  invoiceNumber: string;
  dueDate: string;
  amountDue: number;
  status: 'Open' | 'Overdue' | 'Paid';
};

export type StatementBranchGroup = {
  branchId: string;
  branchName: string;
  subtotalDue: number;
  invoices: StatementInvoice[];
};

export type StatementOverview = {
  statementId: string;
  customerId: string;
  customerName: string;
  period: { start: string; end: string };
  totalDue: number;
  currency: string;
  branches: StatementBranchGroup[];
  exportOptions?: {
    canDownload?: boolean;
    canEmail?: boolean;
  };
  lastSentAt?: string;
};

export type StatementOverviewFilters = {
  branchIds: string[];
  showOverdueOnly: boolean;
};

type StatementOverviewTableProps = {
  statement: StatementOverview;
  filters?: StatementOverviewFilters;
  onFilterChange?: (filters: StatementOverviewFilters) => void;
  onExport?: (mode: 'download' | 'email') => void;
};

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));

const formatPeriod = (start: string, end: string) => `${formatDate(start)} to ${formatDate(end)}`;

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const StatementOverviewTable: FC<StatementOverviewTableProps> = ({
  statement,
  filters,
  onFilterChange,
  onExport,
}) => {
  const appliedFilters: StatementOverviewFilters = {
    branchIds: filters?.branchIds ?? [],
    showOverdueOnly: filters?.showOverdueOnly ?? false,
  };

  const branchSelection = new Set(appliedFilters.branchIds);
  const visibleBranches = branchSelection.size
    ? statement.branches.filter((branch) => branchSelection.has(branch.branchId))
    : statement.branches;

  const filteredBranchEntries = visibleBranches
    .map((branch) => {
      const invoices = appliedFilters.showOverdueOnly
        ? branch.invoices.filter((invoice) => invoice.status === 'Overdue')
        : branch.invoices;

      const subtotal = appliedFilters.showOverdueOnly
        ? invoices.reduce((total, invoice) => total + invoice.amountDue, 0)
        : branch.subtotalDue;

      return {
        branch,
        invoices,
        subtotal,
      };
    })
    .filter((entry) => !appliedFilters.showOverdueOnly || entry.invoices.length > 0);

  const handleBranchFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!onFilterChange) {
      return;
    }

    const { value } = event.target;
    const nextFilters: StatementOverviewFilters = {
      ...appliedFilters,
      branchIds: value === 'all' ? [] : [value],
    };

    onFilterChange(nextFilters);
  };

  const handleOverdueToggle = (event: ChangeEvent<HTMLInputElement>) => {
    if (!onFilterChange) {
      return;
    }

    onFilterChange({
      ...appliedFilters,
      showOverdueOnly: event.target.checked,
    });
  };

  const handleExport = (mode: 'download' | 'email') => {
    if (!onExport) {
      return;
    }

    onExport(mode);
  };

  const branchFilterValue = appliedFilters.branchIds.length === 1 ? appliedFilters.branchIds[0] : 'all';

  return (
    <section
      data-testid="statement-overview-table"
      className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">
            {statement.customerName} Statement
          </h2>
          <p className="text-sm text-slate-500">
            Period {formatPeriod(statement.period.start, statement.period.end)}
          </p>
          <p className="text-xs text-slate-400">Statement ID: {statement.statementId}</p>
          {statement.lastSentAt ? (
            <p className="text-xs text-slate-400">
              Last sent {formatDateTime(statement.lastSentAt)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <p className="text-sm text-slate-500">Total due</p>
          <p
            data-testid="statement-total-due"
            className="text-2xl font-semibold text-slate-900"
          >
            {formatCurrency(statement.totalDue, statement.currency)}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="statement-branch-filter" className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Filter branches
            </label>
            <select
              id="statement-branch-filter"
              value={branchFilterValue}
              onChange={handleBranchFilterChange}
              className="w-52 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
            >
              <option value="all">All branches</option>
              {statement.branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={appliedFilters.showOverdueOnly}
              onChange={handleOverdueToggle}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            Show overdue only
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          {statement.exportOptions?.canDownload ? (
            <button
              type="button"
              onClick={() => handleExport('download')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Download PDF
            </button>
          ) : null}
          {statement.exportOptions?.canEmail ? (
            <button
              type="button"
              onClick={() => handleExport('email')}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Send via email
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {filteredBranchEntries.length ? (
          filteredBranchEntries.map(({ branch, invoices, subtotal }) => (
            <div
              key={branch.branchId}
              data-testid="statement-branch-group"
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{branch.branchName}</h3>
                  <p className="text-xs text-slate-500">Branch ID: {branch.branchId}</p>
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {formatCurrency(subtotal, statement.currency)}
                </p>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left">Invoice</th>
                      <th scope="col" className="px-3 py-2 text-left">Due date</th>
                      <th scope="col" className="px-3 py-2 text-left">Status</th>
                      <th scope="col" className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {invoices.map((invoice) => (
                      <tr key={invoice.invoiceId} className="text-slate-700">
                        <td className="px-3 py-2">
                          <div className="font-medium text-slate-800">{invoice.invoiceNumber}</div>
                          <div className="text-xs text-slate-500">ID {invoice.invoiceId}</div>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(invoice.dueDate)}</td>
                        <td className="px-3 py-2">
                          <span
                            className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                            data-status={invoice.status.toLowerCase()}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">
                          {formatCurrency(invoice.amountDue, statement.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No branches match the selected filters.
          </div>
        )}
      </div>
    </section>
  );
};
