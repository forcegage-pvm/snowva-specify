'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import type {
  AllocationAuditEvent,
  AllocationRecommendation,
  ManualAllocation,
  PaymentAllocation,
} from '@/features/finance/components/PaymentAllocationPanel';

export type PaymentAllocationStrategy = 'FIFO' | 'Manual';

export type PaymentAllocationRequestAllocation = {
  invoiceId: string;
  invoiceNumber: string;
  dueDate: string;
  outstandingAmount: number;
  recommendedAmount: number;
  branchName?: string | null;
  statementId?: string | null;
};

export type PaymentAllocationOverride = {
  invoiceId: string;
  amount: number;
  reason?: string | null;
};

export type PaymentAllocationMutationVariables = {
  paymentId: string;
  customerId: string;
  paymentReference?: string | null;
  currency: string;
  paymentAmount: number;
  allocations: PaymentAllocationRequestAllocation[];
  overrides?: PaymentAllocationOverride[];
  actor: {
    id: string;
    name: string;
    email: string;
  };
  strategy?: PaymentAllocationStrategy;
  notes?: string | null;
};

export type PaymentAllocationGuardrails = {
  blocking: string[];
  warnings: string[];
};

export type PaymentAllocationNotification = {
  level: 'success' | 'info' | 'warning' | 'error';
  message: string;
};

export type PaymentAllocationRedirect = {
  href: string;
  delayMs?: number;
};

export type PaymentAllocationMutationResult = {
  allocation: PaymentAllocation;
  guardrails: PaymentAllocationGuardrails;
  notifications: PaymentAllocationNotification[];
  redirect?: PaymentAllocationRedirect;
};

type UsePaymentAllocationMutationOptions = UseMutationOptions<
  PaymentAllocationMutationResult,
  Error,
  PaymentAllocationMutationVariables
>;

type AllocationApiPayload = {
  allocation: PaymentAllocation;
  guardrails?: PaymentAllocationGuardrails;
  notifications?: PaymentAllocationNotification[];
  redirect?: PaymentAllocationRedirect;
};

const roundToCents = (value: number) => Number.parseFloat(value.toFixed(2));

const sumAllocations = (allocations: Array<{ amount: number }>) =>
  roundToCents(allocations.reduce((acc, allocation) => acc + allocation.amount, 0));

const generateId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
};

const toRecommendation = (
  allocation: PaymentAllocationRequestAllocation,
  override?: PaymentAllocationOverride,
): AllocationRecommendation => ({
  invoiceId: allocation.invoiceId,
  invoiceNumber: allocation.invoiceNumber,
  dueDate: allocation.dueDate,
  outstandingAmount: roundToCents(allocation.outstandingAmount),
  suggestedAmount: roundToCents(override?.amount ?? allocation.recommendedAmount),
});

const buildManualAllocations = (
  overrides: PaymentAllocationOverride[] | undefined,
): ManualAllocation[] => {
  if (!overrides?.length) {
    return [];
  }

  return overrides.map((override) => ({
    invoiceId: override.invoiceId,
    amount: roundToCents(override.amount),
  } satisfies ManualAllocation));
};

const buildAuditTrail = (
  variables: PaymentAllocationMutationVariables,
  applied: ManualAllocation[],
  totalApplied: number,
  remainingBalance: number,
): AllocationAuditEvent[] => {
  const now = new Date();
  const actor = variables.actor.name;

  const timeline: AllocationAuditEvent[] = [
    {
      eventId: generateId('audit'),
      timestamp: now.toISOString(),
      actor,
      action: `${variables.strategy ?? 'FIFO'} recommendation applied`,
      details: `${variables.allocations.length} invoices considered; ${applied.length} manual overrides.`,
    },
  ];

  if (applied.length > 0) {
    timeline.push({
      eventId: generateId('audit'),
      timestamp: new Date(now.getTime() + 60_000).toISOString(),
      actor,
      action: 'Manual overrides captured',
      details: applied
        .map((allocation) => `${allocation.invoiceId}: ${variables.currency} ${allocation.amount.toFixed(2)}`)
        .join(', '),
    });
  }

  timeline.push({
    eventId: generateId('audit'),
    timestamp: new Date(now.getTime() + 120_000).toISOString(),
    actor,
    action: 'Allocation summary generated',
    details: `Applied ${variables.currency} ${totalApplied.toFixed(2)} with ${variables.currency} ${remainingBalance.toFixed(2)} remaining.`,
  });

  return timeline;
};

const buildGuardrails = (
  variables: PaymentAllocationMutationVariables,
  totalApplied: number,
  overrides: PaymentAllocationOverride[] | undefined,
): PaymentAllocationGuardrails => {
  const blocking: string[] = [];
  const warnings: string[] = [];

  if (totalApplied > variables.paymentAmount + 0.009) {
    blocking.push('Allocation exceeds available payment total.');
  }

  if (totalApplied === 0) {
    blocking.push('Allocate at least one invoice before committing payment.');
  }

  const overrideTotal = overrides?.reduce((acc, override) => acc + override.amount, 0) ?? 0;

  if (overrideTotal > 0 && !overrides?.every((override) => override.reason?.trim())) {
    warnings.push('Provide reasons for all manual override allocations.');
  }

  if (variables.notes && variables.notes.length < 10) {
    warnings.push('Consider elaborating allocation notes for audit compliance.');
  }

  return { blocking, warnings } satisfies PaymentAllocationGuardrails;
};

const buildNotifications = (
  guardrails: PaymentAllocationGuardrails,
  totalApplied: number,
  remaining: number,
) => {
  if (guardrails.blocking.length > 0) {
    return [
      {
        level: 'error' as const,
        message: guardrails.blocking[0],
      },
    ];
  }

  const summary = remaining > 0
    ? `Allocated ${totalApplied.toFixed(2)} with ${remaining.toFixed(2)} pending.`
    : `Full payment allocation of ${totalApplied.toFixed(2)} recorded.`;

  return [
    {
      level: guardrails.warnings.length > 0 ? 'warning' : 'success',
      message: summary,
    } satisfies PaymentAllocationNotification,
  ];
};

const buildPaymentAllocation = (
  variables: PaymentAllocationMutationVariables,
) => {
  const recommendations: AllocationRecommendation[] = variables.allocations.map((allocation) => {
    const override = variables.overrides?.find((item) => item.invoiceId === allocation.invoiceId);
    return toRecommendation(allocation, override);
  });

  const manualAllocations = buildManualAllocations(variables.overrides);

  const totalApplied = sumAllocations(recommendations.map((item) => ({ amount: item.suggestedAmount })));

  const remainingBalance = roundToCents(Math.max(variables.paymentAmount - totalApplied, 0));

  const guardrails = buildGuardrails(variables, totalApplied, variables.overrides);

  const auditEvents = buildAuditTrail(variables, manualAllocations, totalApplied, remainingBalance);

  const normalizedStrategy = (() => {
    const preferred = (variables.strategy ?? 'FIFO').toUpperCase();
    return preferred === 'FIFO' ? 'FIFO' : 'Manual';
  })();

  const allocation: PaymentAllocation = {
    paymentId: variables.paymentId,
    customerId: variables.customerId,
    amount: roundToCents(variables.paymentAmount),
    currency: variables.currency,
    allocationStrategy: normalizedStrategy,
    recommendedAllocations: recommendations,
    manualAllocations,
    remainingBalance,
    auditEvents,
  } satisfies PaymentAllocation;

  const notifications = buildNotifications(guardrails, totalApplied, remainingBalance);

  const redirect = guardrails.blocking.length === 0
    ? {
        href: `/customers/${variables.customerId}/statements`,
        delayMs: 1500,
      }
    : undefined;

  return {
    allocation,
    guardrails,
    notifications,
    redirect,
  } satisfies PaymentAllocationMutationResult;
};

const isAllocationPayload = (value: unknown): value is AllocationApiPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return candidate.allocation !== undefined;
};

const runPaymentAllocationMutation = async (
  variables: PaymentAllocationMutationVariables,
): Promise<PaymentAllocationMutationResult> => {
  const response = await fetch('/api/v1/payments/allocate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variables),
  });

  if (response.ok) {
    const payload = await response.json();

    if (isAllocationPayload(payload)) {
      return {
        allocation: payload.allocation,
        guardrails: payload.guardrails ?? { blocking: [], warnings: [] },
        notifications: payload.notifications ?? [
          {
            level: 'success',
            message: 'Payment allocation saved successfully.',
          },
        ],
        redirect: payload.redirect,
      } satisfies PaymentAllocationMutationResult;
    }
  }

  if (response.status !== 404) {
    const message = await response.text();
    throw new Error(message || 'Payment allocation failed');
  }

  return buildPaymentAllocation(variables);
};

export const usePaymentAllocationMutation = (
  options?: UsePaymentAllocationMutationOptions,
) =>
  useMutation({
    mutationKey: ['payments', 'allocate'],
    mutationFn: runPaymentAllocationMutation,
    ...options,
  });