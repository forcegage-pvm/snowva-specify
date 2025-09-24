'use client';

import type { FC } from 'react';

export type InvoiceLineItem = {
  lineId: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type InvoiceTimelineEvent = {
  eventId: string;
  timestamp: string;
  type: 'created' | 'note' | 'finalized' | 'email';
  actor: string;
  summary: string;
};

export type InvoiceTotals = {
  subtotal: number;
  vat: number;
  total: number;
  balanceDue: number;
};

export type InvoiceWorkspaceState = {
  invoiceId: string;
  customerName: string;
  status: 'Draft' | 'Finalized' | 'Cancelled';
  totals: InvoiceTotals;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  vatNumber?: string;
  orderReference?: string;
  canFinalize: boolean;
  canEdit: boolean;
  lineItems: InvoiceLineItem[];
  timeline: InvoiceTimelineEvent[];
};

type InvoiceWorkspaceProps = {
  invoice: InvoiceWorkspaceState;
  onFinalize?: (invoice: InvoiceWorkspaceState) => void;
  onReopen?: (invoiceId: string) => void;
  onSendEmail?: (invoiceId: string) => void;
};

export const InvoiceWorkspace: FC<InvoiceWorkspaceProps> = () => {
  return null;
};
