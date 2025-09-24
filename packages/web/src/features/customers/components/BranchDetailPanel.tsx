'use client';

import type { FC } from 'react';

type TimelineEvent = {
  eventId: string;
  timestamp: string;
  eventType: string;
  actor: string;
  summary: string;
};

type BranchDetail = {
  branchId: string;
  parentCustomerId: string;
  displayName: string;
  address: string;
  vatNumber: string;
  paymentTerms: string;
  contactEmail: string;
  auditTrail: TimelineEvent[];
};

type BranchDetailPanelProps = {
  branch: BranchDetail;
  onCommitChanges?: (updated: Partial<BranchDetail>) => void;
};

export const BranchDetailPanel: FC<BranchDetailPanelProps> = () => {
  return null;
};
