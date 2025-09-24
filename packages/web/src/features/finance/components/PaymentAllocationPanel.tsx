'use client';

import type { FC } from 'react';

export type AllocationRecommendation = {
  invoiceId: string;
  invoiceNumber: string;
  dueDate: string;
  outstandingAmount: number;
  suggestedAmount: number;
};

export type AllocationAuditEvent = {
  eventId: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
};

export type ManualAllocation = {
  invoiceId: string;
  amount: number;
};

export type PaymentAllocation = {
  paymentId: string;
  customerId: string;
  amount: number;
  currency: string;
  allocationStrategy: 'FIFO' | 'Manual';
  recommendedAllocations: AllocationRecommendation[];
  manualAllocations: ManualAllocation[];
  remainingBalance: number;
  auditEvents: AllocationAuditEvent[];
};

type PaymentAllocationPanelProps = {
  payment: PaymentAllocation;
  onApplyOverride: (allocation: ManualAllocation) => void;
  onCommitAllocation: (paymentId: string) => void;
};

export const PaymentAllocationPanel: FC<PaymentAllocationPanelProps> = () => {
  return null;
};
