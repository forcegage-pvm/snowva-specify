'use client';

import type { FC } from 'react';

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

export const StatementOverviewTable: FC<StatementOverviewTableProps> = () => {
  return null;
};
