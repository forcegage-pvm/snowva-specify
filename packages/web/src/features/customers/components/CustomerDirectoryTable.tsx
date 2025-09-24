'use client';

import type { FC } from 'react';

type CustomerSummary = {
  customerId: string;
  displayName: string;
  parentCompany: string;
  branchCount: number;
  outstandingBalance: number;
  paymentTerms: string;
  vatNumber: string;
};

type CustomerDirectoryTableProps = {
  customers: CustomerSummary[];
  isLoading?: boolean;
  onRowSelect?: (customerId: string) => void;
  onFiltersChange?: (filters: { search?: string; status?: string }) => void;
};

export const CustomerDirectoryTable: FC<CustomerDirectoryTableProps> = () => {
  return null;
};
