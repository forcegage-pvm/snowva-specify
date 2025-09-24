'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { AllocationAuditEvent } from '@/features/finance/components/PaymentAllocationPanel';

export type PaymentAllocationAuditLog = {
  events: AllocationAuditEvent[];
  generatedAt: string;
  notes?: string | null;
};

type PaymentAllocationAuditLogQueryKey = [
  'payments',
  'audit-log',
  string | null,
];

type UsePaymentAllocationAuditLogQueryOptions = Omit<
  UseQueryOptions<
    PaymentAllocationAuditLog,
    Error,
    PaymentAllocationAuditLog,
    PaymentAllocationAuditLogQueryKey
  >,
  'queryKey' | 'queryFn'
>;

const FALLBACK_EVENTS: Record<string, AllocationAuditEvent[]> = {
  'pay_2025_01_020': [
    {
      eventId: 'audit_alloc_01',
      timestamp: '2025-01-08T09:30:00Z',
      actor: 'Lerato Nkosi',
      action: 'FIFO recommendation generated',
      details: 'Invoices inv_tokai_101, inv_nelspruit_044 prioritised by age.',
    },
    {
      eventId: 'audit_alloc_02',
      timestamp: '2025-01-08T09:37:00Z',
      actor: 'Lerato Nkosi',
      action: 'Manual override captured',
      details: 'Pending allocation for TOKAI-102 flagged for follow-up.',
    },
    {
      eventId: 'audit_alloc_03',
      timestamp: '2025-01-08T09:45:00Z',
      actor: 'Finance Automation',
      action: 'Allocation committed',
      details: 'R1,540,000 applied across Sportsmans branches with R460,000 remaining.',
    },
  ],
};

const buildFallbackAuditLog = (paymentId: string | null): PaymentAllocationAuditLog => {
  const events = FALLBACK_EVENTS[paymentId ?? ''] ?? [
    {
      eventId: `${paymentId ?? 'payment'}-audit-001`,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      actor: 'Finance Automation',
      action: 'Allocation recommendation generated',
      details: 'Initial FIFO recommendation available for review.',
    },
    {
      eventId: `${paymentId ?? 'payment'}-audit-002`,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      actor: 'Finance Automation',
      action: 'Awaiting operator confirmation',
      details: 'Pending manual confirmation before applying payment.',
    },
  ];

  return {
    events,
    generatedAt: new Date().toISOString(),
    notes: 'Fallback audit log generated locally pending backend integration.',
  } satisfies PaymentAllocationAuditLog;
};

const isAllocationAuditLog = (value: unknown): value is PaymentAllocationAuditLog => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.events);
};

const adaptAuditLogPayload = (raw: unknown): PaymentAllocationAuditLog | null => {
  if (isAllocationAuditLog(raw)) {
    return {
      events: raw.events,
      generatedAt: 'generatedAt' in raw && typeof raw.generatedAt === 'string'
        ? raw.generatedAt
        : new Date().toISOString(),
      notes: 'notes' in raw && typeof raw.notes === 'string' ? raw.notes : null,
    } satisfies PaymentAllocationAuditLog;
  }

  if (Array.isArray(raw)) {
    return {
      events: raw as AllocationAuditEvent[],
      generatedAt: new Date().toISOString(),
      notes: null,
    } satisfies PaymentAllocationAuditLog;
  }

  if (raw && typeof raw === 'object' && Array.isArray((raw as Record<string, unknown>).events)) {
    const payload = raw as { events: AllocationAuditEvent[]; generatedAt?: string; notes?: string };
    return {
      events: payload.events,
      generatedAt: payload.generatedAt ?? new Date().toISOString(),
      notes: payload.notes ?? null,
    } satisfies PaymentAllocationAuditLog;
  }

  return null;
};

const fetchPaymentAllocationAuditLog = async (
  paymentId: string,
): Promise<PaymentAllocationAuditLog> => {
  const response = await fetch(`/api/v1/payments/${paymentId}/audit-log`, {
    cache: 'no-store',
  });

  if (response.ok) {
    const payload = await response.json();
    const auditLog = adaptAuditLogPayload(payload);

    if (auditLog) {
      return auditLog;
    }
  }

  if (response.status !== 404) {
    const message = await response.text();
    throw new Error(message || 'Failed to load payment allocation audit log');
  }

  return buildFallbackAuditLog(paymentId);
};

export const buildPaymentAllocationAuditLogQueryKey = (
  paymentId: string | null,
): PaymentAllocationAuditLogQueryKey => ['payments', 'audit-log', paymentId];

export const usePaymentAllocationAuditLogQuery = (
  paymentId: string | null,
  options?: UsePaymentAllocationAuditLogQueryOptions,
) =>
  useQuery({
    queryKey: buildPaymentAllocationAuditLogQueryKey(paymentId),
    queryFn: () => {
      if (!paymentId) {
        throw new Error('Payment allocation audit log requires a payment identifier');
      }

      return fetchPaymentAllocationAuditLog(paymentId);
    },
    enabled: Boolean(paymentId),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
    ...options,
  });