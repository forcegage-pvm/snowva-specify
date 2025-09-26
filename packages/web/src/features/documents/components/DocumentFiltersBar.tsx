'use client';

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
} from 'react';

import type {
    DocumentExportChannel,
    DocumentExportStatus,
    DocumentExportType,
    FilterState,
} from '@/features/documents/types';

const STORAGE_KEY_DEFAULT = 'snowva/documents/filters';

const DOCUMENT_TYPE_OPTIONS: Array<{ value: DocumentExportType; label: string }> = [
  { value: 'statement', label: 'Statements' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'quote', label: 'Quotes' },
  { value: 'compliance', label: 'Compliance packs' },
];

const STATUS_OPTIONS: Array<{ value: DocumentExportStatus; label: string }> = [
  { value: 'sent', label: 'Sent' },
  { value: 'queued', label: 'Queued' },
  { value: 'failed', label: 'Failed' },
  { value: 'expired', label: 'Expired' },
];

const CHANNEL_OPTIONS: Array<{ value: DocumentExportChannel; label: string }> = [
  { value: 'email', label: 'Email' },
  { value: 'portal', label: 'Portal' },
  { value: 'manual', label: 'Manual download' },
];

const DEFAULT_FILTERS: Pick<FilterState, 'search' | 'documentTypes' | 'statuses' | 'channels'> = {
  search: '',
  documentTypes: [],
  statuses: [],
  channels: [],
};

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const sanitizeArray = <T extends string>(values: unknown, allowed: readonly T[]): T[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  const set = new Set(allowed);
  const result = values.filter((value): value is T => set.has(value as T));
  return Array.from(new Set(result)).sort();
};

const sanitizeStoredFilters = (
  raw: unknown,
): Pick<FilterState, 'search' | 'documentTypes' | 'statuses' | 'channels'> | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const payload = raw as Partial<FilterState> & { search?: unknown };
  const search = typeof payload.search === 'string' ? payload.search : '';
  const documentTypes = sanitizeArray(payload.documentTypes, DOCUMENT_TYPE_OPTIONS.map((option) => option.value));
  const statuses = sanitizeArray(payload.statuses, STATUS_OPTIONS.map((option) => option.value));
  const channels = sanitizeArray(payload.channels, CHANNEL_OPTIONS.map((option) => option.value));

  return {
    search,
    documentTypes,
    statuses,
    channels,
  };
};

const serializeFilters = (
  filters: Pick<FilterState, 'search' | 'documentTypes' | 'statuses' | 'channels'>,
) =>
  JSON.stringify({
    search: filters.search,
    documentTypes: filters.documentTypes,
    statuses: filters.statuses,
    channels: filters.channels,
  });

const hasActiveFilters = (
  filters: Pick<FilterState, 'search' | 'documentTypes' | 'statuses' | 'channels'>,
) =>
  Boolean(
    filters.search.trim().length ||
      filters.documentTypes.length ||
      filters.statuses.length ||
      filters.channels.length,
  );

const equalFilters = (
  a: Pick<FilterState, 'search' | 'documentTypes' | 'statuses' | 'channels'>,
  b: Pick<FilterState, 'search' | 'documentTypes' | 'statuses' | 'channels'>,
) =>
  a.search === b.search &&
  a.documentTypes.length === b.documentTypes.length &&
  a.documentTypes.every((value, index) => value === b.documentTypes[index]) &&
  a.statuses.length === b.statuses.length &&
  a.statuses.every((value, index) => value === b.statuses[index]) &&
  a.channels.length === b.channels.length &&
  a.channels.every((value, index) => value === b.channels[index]);

export type DocumentFiltersValue = Pick<FilterState, 'search' | 'documentTypes' | 'statuses' | 'channels'>;

export type DocumentFiltersChangeMeta = {
  source?: 'search' | 'filter' | 'reset';
  restored?: boolean;
};

export type DocumentFiltersBarChangeHandler = (
  filters: DocumentFiltersValue,
  meta?: DocumentFiltersChangeMeta,
) => void;

export type DocumentFiltersBarProps = {
  filters: DocumentFiltersValue;
  onFiltersChange: DocumentFiltersBarChangeHandler;
  isDisabled?: boolean;
  storageKey?: string;
  className?: string;
};

export const DocumentFiltersBar = ({
  filters,
  onFiltersChange,
  isDisabled = false,
  storageKey = STORAGE_KEY_DEFAULT,
  className,
}: DocumentFiltersBarProps) => {
  const [hasRestored, setHasRestored] = useState(false);
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  const updateFilters = useCallback(
    (next: DocumentFiltersValue, meta?: DocumentFiltersChangeMeta) => {
      onFiltersChange(next, meta);
    },
    [onFiltersChange],
  );

  useEffect(() => {
    if (!isBrowser() || hasRestored) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKeyRef.current);
      if (!raw) {
        setHasRestored(true);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      const sanitized = sanitizeStoredFilters(parsed);

      if (!sanitized) {
        setHasRestored(true);
        return;
      }

      const merged = {
        search: sanitized.search ?? DEFAULT_FILTERS.search,
        documentTypes: sanitized.documentTypes ?? DEFAULT_FILTERS.documentTypes,
        statuses: sanitized.statuses ?? DEFAULT_FILTERS.statuses,
        channels: sanitized.channels ?? DEFAULT_FILTERS.channels,
      } satisfies DocumentFiltersValue;

      if (!equalFilters(filters, merged)) {
        updateFilters(merged, { restored: true });
      }
    } catch {
      // ignore parse errors and fall back to defaults
    } finally {
      setHasRestored(true);
    }
  }, [filters, hasRestored, updateFilters]);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.setItem(storageKeyRef.current, serializeFilters(filters));
    } catch {
      // Swallow storage exceptions (private browsing, quota, etc.)
    }
  }, [filters]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateFilters({
        ...filters,
        search: event.target.value,
      }, { source: 'search' });
    },
    [filters, updateFilters],
  );

  const toggleOption = useCallback(
    <T extends DocumentExportType | DocumentExportStatus | DocumentExportChannel>(
      current: T[],
      value: T,
    ): T[] => {
      if (current.includes(value)) {
        return current.filter((entry) => entry !== value);
      }

      return [...current, value].sort();
    },
    [],
  );

  const handleDocumentTypeToggle = useCallback(
    (value: DocumentExportType) => {
      updateFilters({
        ...filters,
        documentTypes: toggleOption(filters.documentTypes, value),
      }, { source: 'filter' });
    },
    [filters, toggleOption, updateFilters],
  );

  const handleStatusToggle = useCallback(
    (value: DocumentExportStatus) => {
      updateFilters({
        ...filters,
        statuses: toggleOption(filters.statuses, value),
      }, { source: 'filter' });
    },
    [filters, toggleOption, updateFilters],
  );

  const handleChannelToggle = useCallback(
    (value: DocumentExportChannel) => {
      updateFilters({
        ...filters,
        channels: toggleOption(filters.channels, value),
      }, { source: 'filter' });
    },
    [filters, toggleOption, updateFilters],
  );

  const handleReset = useCallback(() => {
    updateFilters({ ...DEFAULT_FILTERS }, { source: 'reset' });
  }, [updateFilters]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    DOCUMENT_TYPE_OPTIONS.forEach((option) => {
      if (filters.documentTypes.includes(option.value)) {
        chips.push({
          key: `type-${option.value}`,
          label: option.label,
          onRemove: () => handleDocumentTypeToggle(option.value),
        });
      }
    });

    STATUS_OPTIONS.forEach((option) => {
      if (filters.statuses.includes(option.value)) {
        chips.push({
          key: `status-${option.value}`,
          label: option.label,
          onRemove: () => handleStatusToggle(option.value),
        });
      }
    });

    CHANNEL_OPTIONS.forEach((option) => {
      if (filters.channels.includes(option.value)) {
        chips.push({
          key: `channel-${option.value}`,
          label: option.label,
          onRemove: () => handleChannelToggle(option.value),
        });
      }
    });

    return chips;
  }, [filters.channels, filters.documentTypes, filters.statuses, handleChannelToggle, handleDocumentTypeToggle, handleStatusToggle]);

  const containerClassName = useMemo(
    () =>
      [
        'flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
        className ?? null,
      ]
        .filter(Boolean)
        .join(' '),
    [className],
  );

  return (
    <section className={containerClassName} aria-label="Document export filters">
      <div className="flex flex-col gap-2">
        <label htmlFor="documents-search" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Search
        </label>
        <input
          id="documents-search"
          type="search"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Search by document title, customer branch, or ID"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
          aria-label="Search document exports"
          data-testid="documents-filters-search"
          disabled={isDisabled}
        />
      </div>

      <FilterGroup
        title="Document types"
        description="Select one or more document categories"
        options={DOCUMENT_TYPE_OPTIONS}
        selected={filters.documentTypes}
        onToggle={handleDocumentTypeToggle}
        isDisabled={isDisabled}
        dataTestId="documents-filters-types"
      />

      <FilterGroup
        title="Delivery status"
        description="Combine statuses to refine the list"
        options={STATUS_OPTIONS}
        selected={filters.statuses}
        onToggle={handleStatusToggle}
        isDisabled={isDisabled}
        dataTestId="documents-filters-statuses"
      />

      <FilterGroup
        title="Delivered via"
        description="Highlight specific delivery channels"
        options={CHANNEL_OPTIONS}
        selected={filters.channels}
        onToggle={handleChannelToggle}
        isDisabled={isDisabled}
        dataTestId="documents-filters-channels"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {activeFilterChips.length ? (
          <div className="flex flex-wrap gap-2" aria-live="polite">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed"
                disabled={isDisabled}
                aria-label={`Remove filter ${chip.label}`}
              >
                <span>{chip.label}</span>
                <span aria-hidden>&times;</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No filters applied</p>
        )}

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 self-end rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isDisabled || !hasActiveFilters(filters)}
          data-testid="documents-filters-reset"
        >
          Clear filters
        </button>
      </div>
    </section>
  );
};

type FilterGroupOption<T extends string> = {
  value: T;
  label: string;
};

type FilterGroupProps<T extends string> = {
  title: string;
  description: string;
  options: Array<FilterGroupOption<T>>;
  selected: T[];
  onToggle: (value: T) => void;
  isDisabled?: boolean;
  dataTestId?: string;
};

const FilterGroup = <T extends string>({
  title,
  description,
  options,
  selected,
  onToggle,
  isDisabled = false,
  dataTestId,
}: FilterGroupProps<T>) => (
  <fieldset className="flex flex-col gap-2" data-testid={dataTestId}>
    <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</legend>
    <p className="text-xs text-slate-400">{description}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = selected.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed ${
              isActive
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
            aria-pressed={isActive}
            disabled={isDisabled}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </fieldset>
);
