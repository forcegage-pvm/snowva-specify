'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type DashboardShortcutTone = 'default' | 'warning' | 'critical';

export type DashboardShortcut = {
  id: string;
  label: string;
  description?: string;
  href: string;
  tone?: DashboardShortcutTone;
};

export type DashboardShortcutsResponse = {
  shortcuts: DashboardShortcut[];
  generatedAt?: string | null;
};

type DashboardShortcutsQueryKey = ['dashboard', 'shortcuts'];

type UseDashboardShortcutsQueryOptions = Omit<
  UseQueryOptions<
    DashboardShortcutsResponse,
    Error,
    DashboardShortcutsResponse,
    DashboardShortcutsQueryKey
  >,
  'queryKey' | 'queryFn'
>;

const FALLBACK_DASHBOARD_SHORTCUTS: DashboardShortcutsResponse = {
  generatedAt: '2024-12-20T08:10:00Z',
  shortcuts: [
    {
      id: 'view-overdue',
      label: 'Overdue invoices',
      description: '12 invoices waiting for follow-up',
      href: '/invoices?status=overdue',
      tone: 'critical',
    },
    {
      id: 'allocate-payments',
      label: 'Allocate incoming payments',
      description: 'Match 6 unapplied payments',
      href: '/payments?tab=allocation',
      tone: 'warning',
    },
    {
      id: 'renew-quotes',
      label: 'Quotes expiring soon',
      description: '9 quotes expiring in 7 days',
      href: '/quotes?filter=expiring',
    },
    {
      id: 'branch-statements',
      label: 'Branch statements',
      description: 'Generate consolidated PDFs',
      href: '/statements',
    },
  ],
};

const toTone = (value: unknown): DashboardShortcutTone | undefined => {
  if (value === 'default' || value === 'warning' || value === 'critical') {
    return value;
  }

  return undefined;
};

const toShortcut = (value: unknown): DashboardShortcut | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const id = typeof candidate.id === 'string' ? candidate.id.trim() : null;
  const label = typeof candidate.label === 'string' ? candidate.label.trim() : null;
  const href = typeof candidate.href === 'string' ? candidate.href.trim() : null;

  if (!id || !label || !href) {
    return null;
  }

  const description =
    typeof candidate.description === 'string' && candidate.description.trim().length > 0
      ? candidate.description.trim()
      : undefined;

  return {
    id,
    label,
    description,
    href,
    tone: toTone(candidate.tone),
  } satisfies DashboardShortcut;
};

const normalizeDashboardShortcuts = (value: unknown): DashboardShortcutsResponse => {
  if (!value || typeof value !== 'object') {
    return FALLBACK_DASHBOARD_SHORTCUTS;
  }

  const candidate = value as Record<string, unknown>;
  const shortcutsValue = candidate.shortcuts;

  const shortcuts = Array.isArray(shortcutsValue)
    ? shortcutsValue
        .map(toShortcut)
        .filter((shortcut): shortcut is DashboardShortcut => Boolean(shortcut))
    : [];

  if (!shortcuts.length) {
    return FALLBACK_DASHBOARD_SHORTCUTS;
  }

  const generatedAt =
    typeof candidate.generatedAt === 'string' && candidate.generatedAt.trim().length > 0
      ? candidate.generatedAt
      : null;

  return {
    shortcuts,
    generatedAt,
  } satisfies DashboardShortcutsResponse;
};

const fetchDashboardShortcuts = async (): Promise<DashboardShortcutsResponse> => {
  try {
    const response = await fetch('/api/dashboard/shortcuts', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to load shortcuts: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    return normalizeDashboardShortcuts(payload);
  } catch (error) {
    console.warn('Falling back to cached dashboard shortcuts', error);
    return FALLBACK_DASHBOARD_SHORTCUTS;
  }
};

export const useDashboardShortcutsQuery = (options?: UseDashboardShortcutsQueryOptions) =>
  useQuery({
    queryKey: ['dashboard', 'shortcuts'],
    queryFn: fetchDashboardShortcuts,
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
