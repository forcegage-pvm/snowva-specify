'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

export type QuoteToInvoiceDraftDiscount = {
  discountId: string;
  label: string;
  amount: number;
  type: 'percentage' | 'fixed';
};

export type QuoteToInvoiceDraftLineItem = {
  lineId: string;
  productId: string;
  description: string;
  quantity: number;
  unitPriceExVat: number;
  vatRate: number;
};

export type QuoteToInvoiceDraft = {
  quoteId: string;
  quoteNumber?: string | null;
  customerId: string;
  customerName: string;
  branchId?: string | null;
  branchName?: string | null;
  vatNumber?: string | null;
  orderReference?: string | null;
  currency: string;
  deliveryFee?: number | null;
  discounts?: QuoteToInvoiceDraftDiscount[];
  lineItems: QuoteToInvoiceDraftLineItem[];
};

export type QuoteToInvoiceMutationVariables = {
  draft: QuoteToInvoiceDraft;
  actor?: {
    id: string;
    name: string;
    email: string;
  };
  finalizeImmediately?: boolean;
};

export type InvoiceMutationLineItem = {
  lineId: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type InvoiceMutationTimelineEvent = {
  eventId: string;
  timestamp: string;
  type: 'created' | 'note' | 'finalized' | 'email';
  actor: string;
  summary: string;
};

export type InvoiceMutationTotals = {
  subtotal: number;
  vat: number;
  total: number;
  balanceDue: number;
};

export type InvoiceMutationWorkspace = {
  invoiceId: string;
  invoiceNumber: string;
  status: 'Draft' | 'Finalized' | 'Cancelled';
  issuedOn: string;
  dueOn: string;
  customerId: string;
  customerName: string;
  branchId?: string | null;
  branchName?: string | null;
  vatNumber?: string | null;
  orderReference?: string | null;
  totals: InvoiceMutationTotals;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  canFinalize: boolean;
  canEdit: boolean;
  lineItems: InvoiceMutationLineItem[];
  timeline: InvoiceMutationTimelineEvent[];
};

export type QuoteToInvoiceSummary = {
  quoteId: string;
  quoteNumber?: string | null;
  status: 'Accepted' | 'Sent' | 'Draft';
  totalExVat: number;
  vatAmount: number;
  totalIncVat: number;
  currency: string;
};

export type QuoteToInvoiceGuardrails = {
  warnings: string[];
  blocking: string[];
};

export type QuoteToInvoiceNotification = {
  level: 'success' | 'info' | 'warning';
  message: string;
};

export type QuoteToInvoiceMutationResult = {
  invoice: InvoiceMutationWorkspace;
  quote: QuoteToInvoiceSummary;
  guardrails: QuoteToInvoiceGuardrails;
  notifications: QuoteToInvoiceNotification[];
};

type QuoteToInvoiceApiInvoice = {
  id: string;
  quoteId: string;
  customerId: string;
  lineItems: Array<{
    product: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
};

type UseQuoteToInvoiceMutationOptions = UseMutationOptions<
  QuoteToInvoiceMutationResult,
  Error,
  QuoteToInvoiceMutationVariables
>;

const generateId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(value);

const roundToCents = (value: number) => Number.parseFloat(value.toFixed(2));

const computeDraftTotals = (draft: QuoteToInvoiceDraft) => {
  const lineSubtotal = draft.lineItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPriceExVat,
    0,
  );

  const lineVat = draft.lineItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPriceExVat * item.vatRate,
    0,
  );

  const deliveryFee = draft.deliveryFee ?? 0;

  const discountValue = (draft.discounts ?? []).reduce((acc, discount) => {
    if (discount.type === 'percentage') {
      return acc + ((lineSubtotal + deliveryFee) * discount.amount) / 100;
    }

    return acc + discount.amount;
  }, 0);

  const subtotal = Math.max(lineSubtotal + deliveryFee - discountValue, 0);
  const total = subtotal + lineVat;

  return {
    lineSubtotal: roundToCents(lineSubtotal),
    lineVat: roundToCents(lineVat),
    deliveryFee: roundToCents(deliveryFee),
    discountValue: roundToCents(discountValue),
    subtotal: roundToCents(subtotal),
    total: roundToCents(total),
  };
};

const buildTimeline = (
  variables: QuoteToInvoiceMutationVariables,
  invoiceId: string,
): InvoiceMutationTimelineEvent[] => {
  const now = new Date();
  const actor = variables.actor?.name ?? 'Automation';
  const quoteLabel = variables.draft.quoteNumber ?? variables.draft.quoteId;

  return [
    {
      eventId: generateId('evt'),
      timestamp: now.toISOString(),
      type: 'created',
      actor,
      summary: `Invoice draft ${invoiceId} created from quote ${quoteLabel}`,
    },
    {
      eventId: generateId('evt'),
      timestamp: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
      type: 'note',
      actor,
      summary: variables.finalizeImmediately
        ? 'Pending immediate finalization once guardrails pass'
        : 'Review draft before finalization',
    },
  ];
};

const buildGuardrails = (draft: QuoteToInvoiceDraft, totals: { subtotal: number; discountValue: number }) => {
  const blocking: string[] = [];
  const warnings: string[] = [];

  if (!draft.vatNumber?.trim()) {
    blocking.push('Add VAT number before finalizing invoice.');
  }

  if (!draft.orderReference?.trim()) {
    blocking.push('Capture customer order reference to proceed.');
  }

  if (totals.discountValue > 0) {
    warnings.push(
      `Discounts worth ${formatCurrency(totals.discountValue, draft.currency)} applied to draft.`,
    );
  }

  if (totals.subtotal > 250_000) {
    warnings.push('High value invoice – double-check credit limits before finalizing.');
  }

  return { blocking, warnings } satisfies QuoteToInvoiceGuardrails;
};

const buildInvoiceWorkspace = (
  variables: QuoteToInvoiceMutationVariables,
  totals = computeDraftTotals(variables.draft),
  existingId?: string,
) => {
  const invoiceId = existingId ?? generateId('inv');
  const invoiceNumber = `INV-${invoiceId.split('-').pop()?.toUpperCase() ?? invoiceId.toUpperCase()}`;

  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 30);

  const guardrails = buildGuardrails(variables.draft, {
    subtotal: totals.subtotal,
    discountValue: totals.discountValue,
  });

  const lineItems: InvoiceMutationLineItem[] = variables.draft.lineItems.map((item, index) => ({
    lineId: item.lineId || `line-${index + 1}`,
    productId: item.productId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: roundToCents(item.unitPriceExVat),
    vatRate: roundToCents(item.vatRate),
  }));

  return {
    invoice: {
      invoiceId,
      invoiceNumber,
      status: 'Draft' as const,
      issuedOn: now.toISOString(),
      dueOn: dueDate.toISOString(),
      customerId: variables.draft.customerId,
      customerName: variables.draft.customerName,
      branchId: variables.draft.branchId ?? null,
      branchName: variables.draft.branchName ?? null,
      vatNumber: variables.draft.vatNumber ?? null,
      orderReference: variables.draft.orderReference ?? null,
      totals: {
        subtotal: totals.subtotal,
        vat: totals.lineVat,
        total: totals.total,
        balanceDue: totals.total,
      },
      paymentStatus: 'Unpaid' as const,
      canFinalize: guardrails.blocking.length === 0,
      canEdit: true,
      lineItems,
      timeline: buildTimeline(variables, invoiceNumber),
    },
    quote: {
      quoteId: variables.draft.quoteId,
      quoteNumber: variables.draft.quoteNumber ?? null,
      status: 'Accepted' as const,
      totalExVat: totals.subtotal,
      vatAmount: totals.lineVat,
      totalIncVat: totals.total,
      currency: variables.draft.currency,
    },
    guardrails,
    notifications: [
      {
        level: guardrails.blocking.length === 0 ? 'success' : 'warning',
        message:
          guardrails.blocking.length === 0
            ? `Invoice draft ${invoiceNumber} is ready for review.`
            : 'Resolve guardrail notices before finalizing the invoice.',
      },
    ],
  } satisfies QuoteToInvoiceMutationResult;
};

const mapInvoiceStatus = (status: QuoteToInvoiceApiInvoice['status']): {
  uiStatus: 'Draft' | 'Finalized' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  balanceDue: number;
} => {
  switch (status) {
    case 'draft':
      return { uiStatus: 'Draft', paymentStatus: 'Unpaid', balanceDue: NaN };
    case 'paid':
      return { uiStatus: 'Finalized', paymentStatus: 'Paid', balanceDue: 0 };
    case 'overdue':
      return { uiStatus: 'Finalized', paymentStatus: 'Partial', balanceDue: NaN };
    case 'sent':
    default:
      return { uiStatus: 'Finalized', paymentStatus: 'Unpaid', balanceDue: NaN };
  }
};

const isQuoteToInvoiceResult = (value: unknown): value is QuoteToInvoiceMutationResult => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.invoice === 'object' &&
    typeof candidate.quote === 'object' &&
    typeof candidate.guardrails === 'object' &&
    Array.isArray(candidate.notifications)
  );
};

const isApiInvoice = (value: unknown): value is QuoteToInvoiceApiInvoice => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.quoteId === 'string' &&
    typeof candidate.customerId === 'string' &&
    Array.isArray(candidate.lineItems) &&
    typeof candidate.total === 'number'
  );
};

const adaptApiInvoice = (
  invoice: QuoteToInvoiceApiInvoice,
  variables: QuoteToInvoiceMutationVariables,
): QuoteToInvoiceMutationResult => {
  const fallback = buildInvoiceWorkspace(variables, undefined, invoice.id);
  const { uiStatus, paymentStatus, balanceDue } = mapInvoiceStatus(invoice.status);

  const derivedSubtotal = invoice.lineItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0,
  );

  const lineItems: InvoiceMutationLineItem[] = invoice.lineItems.map((item, index) => {
    const matchingDraft = variables.draft.lineItems.find((line) => line.productId === item.product.id);
    return {
      lineId: fallback.invoice.lineItems[index]?.lineId ?? `line-${index + 1}`,
      productId: item.product.id,
      description: item.product.name,
      quantity: item.quantity,
      unitPrice: roundToCents(item.price),
      vatRate: roundToCents(matchingDraft?.vatRate ?? 0.15),
    } satisfies InvoiceMutationLineItem;
  });

  const totals: InvoiceMutationTotals = {
    subtotal: roundToCents(derivedSubtotal),
    vat: fallback.invoice.totals.vat,
    total: roundToCents(invoice.total),
    balanceDue: Number.isNaN(balanceDue)
      ? roundToCents(invoice.total - (paymentStatus === 'Paid' ? invoice.total : 0))
      : roundToCents(balanceDue),
  };

  return {
    ...fallback,
    invoice: {
      ...fallback.invoice,
      invoiceId: invoice.id,
      invoiceNumber: `INV-${invoice.id.slice(0, 8).toUpperCase()}`,
      status: uiStatus,
      paymentStatus,
      lineItems,
      totals,
      canFinalize: uiStatus === 'Draft' ? fallback.invoice.canFinalize : false,
      canEdit: uiStatus === 'Draft',
    },
  } satisfies QuoteToInvoiceMutationResult;
};

const convertQuoteToInvoice = async (
  variables: QuoteToInvoiceMutationVariables,
): Promise<QuoteToInvoiceMutationResult> => {
  const response = await fetch('/api/v1/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quoteId: variables.draft.quoteId,
      draft: variables.draft,
      actor: variables.actor,
      finalizeImmediately: variables.finalizeImmediately ?? false,
    }),
  });

  if (response.ok) {
    const payload = await response.json();

    if (isQuoteToInvoiceResult(payload)) {
      return payload;
    }

    if (isApiInvoice(payload)) {
      return adaptApiInvoice(payload, variables);
    }
  }

  if (response.status !== 404) {
    throw new Error('Failed to convert quote to invoice');
  }

  return buildInvoiceWorkspace(variables);
};

export const useQuoteToInvoiceMutation = (
  options?: UseQuoteToInvoiceMutationOptions,
) =>
  useMutation({
    mutationKey: ['quotes', 'convert-to-invoice'],
    mutationFn: convertQuoteToInvoice,
    ...options,
  });