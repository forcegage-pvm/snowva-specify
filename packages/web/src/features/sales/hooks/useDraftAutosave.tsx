'use client';

import type { ReactNode } from 'react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

type DraftEntityType = 'quote' | 'invoice';

type DraftAutosaveReason = 'manual' | 'interval' | 'timeout' | 'unmount';

export type DraftAutosaveResult = {
  draftId: string;
  draftType: DraftEntityType;
  reason: DraftAutosaveReason;
  savedAt: number;
  success: boolean;
  label?: string;
  skipped?: boolean;
  error?: Error;
};

export type DraftAutosaveMetadata = {
  draftId: string;
  draftType: DraftEntityType;
  label?: string;
  lastSavedAt: number | null;
  isDirty: boolean;
};

type DraftAutosaveHandler = (reason: DraftAutosaveReason) => Promise<DraftAutosaveResult>;

type DraftAutosaveRegistration = {
  draftId: string;
  draftType: DraftEntityType;
  handler: DraftAutosaveHandler;
  getMetadata: () => DraftAutosaveMetadata;
};

type DraftAutosaveContextValue = {
  register: (registration: DraftAutosaveRegistration) => () => void;
  triggerAutosave: (reason?: DraftAutosaveReason) => Promise<DraftAutosaveResult[]>;
  getDraftSummaries: () => DraftAutosaveMetadata[];
};

const noopAsync = async () => [] as DraftAutosaveResult[];
const noopRegister = () => () => {};
const noopSummaries = () => [] as DraftAutosaveMetadata[];

const DraftAutosaveContext = createContext<DraftAutosaveContextValue | null>(null);

export const DraftAutosaveProvider = ({ children }: { children: ReactNode }) => {
  const registrationsRef = useRef(new Map<string, DraftAutosaveRegistration>());

  const register = useCallback((registration: DraftAutosaveRegistration) => {
    const key = `${registration.draftType}:${registration.draftId}`;
    registrationsRef.current.set(key, registration);

    return () => {
      const existing = registrationsRef.current.get(key);
      if (existing === registration) {
        registrationsRef.current.delete(key);
      }
    };
  }, []);

  const triggerAutosave = useCallback(async (reason: DraftAutosaveReason = 'manual') => {
    const entries = Array.from(registrationsRef.current.values());

    if (entries.length === 0) {
      return [] as DraftAutosaveResult[];
    }

    const results = await Promise.all(
      entries.map(async (entry) => {
        try {
          return await entry.handler(reason);
        } catch (error) {
          return {
            draftId: entry.draftId,
            draftType: entry.draftType,
            reason,
            savedAt: Date.now(),
            success: false,
            error: error instanceof Error ? error : new Error('Draft autosave failed'),
          } satisfies DraftAutosaveResult;
        }
      }),
    );

    return results;
  }, []);

  const getDraftSummaries = useCallback(() => {
    return Array.from(registrationsRef.current.values()).map((registration) => registration.getMetadata());
  }, []);

  const value = useMemo<DraftAutosaveContextValue>(
    () => ({ register, triggerAutosave, getDraftSummaries }),
    [getDraftSummaries, register, triggerAutosave],
  );

  return (
    <DraftAutosaveContext.Provider value={value}>{children}</DraftAutosaveContext.Provider>
  );
};

export const useDraftAutosaveManager = () =>
  useContext(DraftAutosaveContext) ?? {
    register: noopRegister,
    triggerAutosave: noopAsync,
    getDraftSummaries: noopSummaries,
  };

const DEFAULT_AUTOSAVE_INTERVAL_MS = 30_000;
const DEFAULT_SCHEMA_VERSION = '1';

const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const buildStorageKey = (draftType: DraftEntityType, draftId: string) =>
  `snowva:drafts:${draftType}:${draftId}`;

const stringifyDraft = (draft: unknown) => {
  try {
    return JSON.stringify(draft);
  } catch {
    return undefined;
  }
};

export type DraftCacheEntry<TDraft> = {
  draft: TDraft;
  savedAt: number;
  schemaVersion: string;
};

export const readDraftFromCache = <TDraft,>(
  draftType: DraftEntityType,
  draftId: string,
  schemaVersion: string = DEFAULT_SCHEMA_VERSION,
): DraftCacheEntry<TDraft> | null => {
  if (!hasStorage()) {
    return null;
  }

  const key = buildStorageKey(draftType, draftId);
  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DraftCacheEntry<TDraft>>;
    if (!parsed || typeof parsed.savedAt !== 'number' || !parsed.draft) {
      return null;
    }

    if (parsed.schemaVersion && parsed.schemaVersion !== schemaVersion) {
      return null;
    }

    return {
      draft: parsed.draft as TDraft,
      savedAt: parsed.savedAt,
      schemaVersion: parsed.schemaVersion ?? DEFAULT_SCHEMA_VERSION,
    } satisfies DraftCacheEntry<TDraft>;
  } catch {
    return null;
  }
};

export const clearDraftFromCache = (draftType: DraftEntityType, draftId: string) => {
  if (!hasStorage()) {
    return;
  }

  const key = buildStorageKey(draftType, draftId);
  window.localStorage.removeItem(key);
};

type PersistPayload<TDraft> = {
  draft: TDraft;
  draftId: string;
  draftType: DraftEntityType;
  savedAt: number;
  reason: DraftAutosaveReason;
  schemaVersion: string;
};

type UseDraftAutosaveOptions<TDraft> = {
  draft: TDraft;
  draftId: string;
  draftType: DraftEntityType;
  label?: string;
  enabled?: boolean;
  schemaVersion?: string;
  autosaveIntervalMs?: number;
  initialSavedState?: DraftCacheEntry<TDraft> | null;
  persist?: (payload: PersistPayload<TDraft>) => Promise<void> | void;
  onSaveSuccess?: (result: DraftAutosaveResult) => void;
  onSaveError?: (result: DraftAutosaveResult) => void;
};

type UseDraftAutosaveReturn = {
  lastSavedAt: number | null;
  isSaving: boolean;
  status: 'idle' | 'saving' | 'error';
  error: Error | null;
  saveNow: (reason?: DraftAutosaveReason) => Promise<DraftAutosaveResult>;
  clearDraft: () => void;
};

export const useDraftAutosave = <TDraft,>(
  options: UseDraftAutosaveOptions<TDraft>,
): UseDraftAutosaveReturn => {
  const {
    draft,
    draftId,
    draftType,
    label,
    enabled = true,
    schemaVersion = DEFAULT_SCHEMA_VERSION,
    autosaveIntervalMs = DEFAULT_AUTOSAVE_INTERVAL_MS,
    initialSavedState,
    persist,
    onSaveSuccess,
    onSaveError,
  } = options;

  const manager = useDraftAutosaveManager();

  const storageKey = useMemo(() => buildStorageKey(draftType, draftId), [draftId, draftType]);

  const currentDraftRef = useRef(draft);
  const currentFingerprintRef = useRef<string | undefined>(stringifyDraft(draft));
  const lastSavedFingerprintRef = useRef<string | undefined>(
    initialSavedState ? stringifyDraft(initialSavedState.draft) : stringifyDraft(draft),
  );
  const dirtyRef = useRef<boolean>(
    initialSavedState ? stringifyDraft(initialSavedState.draft) !== stringifyDraft(draft) : false,
  );
  const pendingTimeoutRef = useRef<number | null>(null);
  const isSavingRef = useRef(false);
  const persistRef = useRef(persist);
  const lastSavedAtRef = useRef<number | null>(initialSavedState?.savedAt ?? null);
  const labelRef = useRef(label);

  persistRef.current = persist;
  labelRef.current = label;

  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(initialSavedState?.savedAt ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const clearPendingTimeout = useCallback(() => {
    if (pendingTimeoutRef.current) {
      window.clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
  }, []);

  const writeCache = useCallback(
    (snapshot: TDraft, savedAt: number) => {
      if (!hasStorage()) {
        return;
      }

      const payload = JSON.stringify({
        draft: snapshot,
        savedAt,
        schemaVersion,
      });

      window.localStorage.setItem(storageKey, payload);
    },
    [schemaVersion, storageKey],
  );

  const removeCache = useCallback(() => {
    if (!hasStorage()) {
      return;
    }

    window.localStorage.removeItem(storageKey);
  }, [storageKey]);

  useEffect(() => () => clearPendingTimeout(), [clearPendingTimeout]);

  const save = useCallback(
    async (reason: DraftAutosaveReason = 'manual'): Promise<DraftAutosaveResult> => {
      if (!enabled) {
        return {
          draftId,
          draftType,
          reason,
          savedAt: Date.now(),
          success: false,
          skipped: true,
          label: labelRef.current,
        } satisfies DraftAutosaveResult;
      }

      if (!dirtyRef.current) {
        return {
          draftId,
          draftType,
          reason,
          savedAt: Date.now(),
          success: true,
          skipped: true,
          label: labelRef.current,
        } satisfies DraftAutosaveResult;
      }

      if (isSavingRef.current) {
        return {
          draftId,
          draftType,
          reason,
          savedAt: Date.now(),
          success: false,
          skipped: true,
          label: labelRef.current,
        } satisfies DraftAutosaveResult;
      }

      isSavingRef.current = true;
      setIsSaving(true);
      setStatus('saving');
      setError(null);

      const snapshot = currentDraftRef.current;
      const savedAt = Date.now();

      try {
        if (persistRef.current) {
          await persistRef.current({
            draft: snapshot,
            draftId,
            draftType,
            savedAt,
            reason,
            schemaVersion,
          });
        }

        writeCache(snapshot, savedAt);

        const fingerprint = currentFingerprintRef.current;
        lastSavedFingerprintRef.current = fingerprint;
        dirtyRef.current = false;
        lastSavedAtRef.current = savedAt;
        setLastSavedAt(savedAt);
        setStatus('idle');

        const result: DraftAutosaveResult = {
          draftId,
          draftType,
          reason,
          savedAt,
          success: true,
          label: labelRef.current,
        };

        onSaveSuccess?.(result);

        return result;
      } catch (saveError) {
        const errorValue = saveError instanceof Error ? saveError : new Error('Failed to autosave draft');
        setError(errorValue);
        setStatus('error');

        const result: DraftAutosaveResult = {
          draftId,
          draftType,
          reason,
          savedAt,
          success: false,
          error: errorValue,
          label: labelRef.current,
        };

        onSaveError?.(result);

        return result;
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
        clearPendingTimeout();
      }
    },
    [clearPendingTimeout, draftId, draftType, enabled, onSaveError, onSaveSuccess, schemaVersion, writeCache],
  );

  useEffect(() => {
    currentDraftRef.current = draft;
    const fingerprint = stringifyDraft(draft);
    currentFingerprintRef.current = fingerprint;

    if (!enabled) {
      dirtyRef.current = false;
      clearPendingTimeout();
      return;
    }

    const lastSavedFingerprint = lastSavedFingerprintRef.current;
    const isDirty = fingerprint !== lastSavedFingerprint;

    if (isDirty) {
      dirtyRef.current = true;
      clearPendingTimeout();
      pendingTimeoutRef.current = window.setTimeout(() => {
        void save('interval');
      }, autosaveIntervalMs);
    }
  }, [autosaveIntervalMs, clearPendingTimeout, draft, enabled, save]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const registration: DraftAutosaveRegistration = {
      draftId,
      draftType,
      handler: save,
      getMetadata: () => ({
        draftId,
        draftType,
        label: labelRef.current,
        lastSavedAt: lastSavedAtRef.current,
        isDirty: dirtyRef.current,
      }),
    };

    return manager.register(registration);
  }, [draftId, draftType, enabled, manager, save]);

  useEffect(() => () => {
    void save('unmount');
  }, [save]);

  const clearDraft = useCallback(() => {
    removeCache();
    lastSavedFingerprintRef.current = stringifyDraft(currentDraftRef.current);
    dirtyRef.current = false;
    lastSavedAtRef.current = null;
    setLastSavedAt(null);
  }, [removeCache]);

  const api = useMemo<UseDraftAutosaveReturn>(
    () => ({
      lastSavedAt,
      isSaving,
      status,
      error,
      saveNow: save,
      clearDraft,
    }),
    [clearDraft, error, isSaving, lastSavedAt, save, status],
  );

  return api;
};
