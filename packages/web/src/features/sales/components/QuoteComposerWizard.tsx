'use client';

import type { FC } from 'react';

export type QuoteComposerStep = 'details' | 'items' | 'review';

export type QuoteLineItem = {
  lineId: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type QuoteDiscount = {
  discountId: string;
  label: string;
  amount: number;
  type: 'percentage' | 'fixed';
};

export type QuoteDraft = {
  quoteId: string;
  customerId: string;
  customerName?: string;
  orderNumber?: string;
  vatNumber?: string;
  currency: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  steps: QuoteComposerStep[];
  activeStep: QuoteComposerStep;
  lineItems: QuoteLineItem[];
  discounts: QuoteDiscount[];
  deliveryFee?: number;
  notes?: string;
};

type QuoteComposerWizardProps = {
  initialQuote: QuoteDraft;
  onStepChange?: (step: QuoteComposerStep) => void;
  onSubmit: (quote: QuoteDraft) => void;
  onPreview: (quote: QuoteDraft) => void;
  onCancel?: () => void;
};

export const QuoteComposerWizard: FC<QuoteComposerWizardProps> = () => {
  return null;
};
