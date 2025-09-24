'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSession } from './providers/SessionProvider';

export type UseSessionTimeoutOptions = {
  onWarning: (remainingMs: number) => void;
  onTimeout: () => void;
  onAutoSaveDraft: () => void;
};

export type UseSessionTimeoutResult = {
  isWarningVisible: boolean;
  remainingMs: number;
  registerActivity: () => void;
  acknowledgeWarning: () => void;
  setWarningVisible?: (next: boolean) => void;
};

const ONE_SECOND_MS = 1000;

export const useSessionTimeout = ({
  onWarning,
  onTimeout,
  onAutoSaveDraft,
}: UseSessionTimeoutOptions): UseSessionTimeoutResult => {
  const { warningAt, expiresAt, registerInteraction } = useSession();
  const warningTimeoutRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<number | undefined>(undefined);
  const tickerRef = useRef<number | undefined>(undefined);

  const [isWarningVisible, setWarningVisible] = useState(false);
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, expiresAt - Date.now()),
  );

  const clearTimers = useCallback(() => {
    if (warningTimeoutRef.current) {
      window.clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = undefined;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    if (tickerRef.current) {
      window.clearInterval(tickerRef.current);
      tickerRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    setRemainingMs(Math.max(0, expiresAt - Date.now()));

    if (tickerRef.current) {
      window.clearInterval(tickerRef.current);
      tickerRef.current = undefined;
    }

    tickerRef.current = window.setInterval(() => {
      setRemainingMs(Math.max(0, expiresAt - Date.now()));
    }, ONE_SECOND_MS);

    return () => {
      if (tickerRef.current) {
        window.clearInterval(tickerRef.current);
        tickerRef.current = undefined;
      }
    };
  }, [expiresAt]);

  useEffect(() => {
    clearTimers();

    const now = Date.now();
    const warningDelay = Math.max(0, warningAt - now);
    const timeoutDelay = Math.max(0, expiresAt - now);

    warningTimeoutRef.current = window.setTimeout(() => {
      setWarningVisible(true);
      onWarning(Math.max(0, expiresAt - Date.now()));
    }, warningDelay);

    timeoutRef.current = window.setTimeout(() => {
      setWarningVisible(false);
      onAutoSaveDraft();
      onTimeout();
    }, timeoutDelay);

    return () => {
      clearTimers();
    };
  }, [warningAt, expiresAt, onWarning, onAutoSaveDraft, onTimeout, clearTimers]);

  const registerActivity = useCallback(() => {
    clearTimers();
    setWarningVisible(false);
    registerInteraction();
  }, [clearTimers, registerInteraction]);

  const acknowledgeWarning = useCallback(() => {
    clearTimers();
    setWarningVisible(false);
    registerInteraction();
  }, [clearTimers, registerInteraction]);

  const applyWarningVisibility = useCallback((next: boolean) => {
    setWarningVisible(next);
  }, []);

  const apiRef = useRef<UseSessionTimeoutResult | null>(null);

  if (!apiRef.current) {
    apiRef.current = {
      isWarningVisible,
      remainingMs,
      registerActivity,
      acknowledgeWarning,
      setWarningVisible: applyWarningVisibility,
    };
  }

  apiRef.current.isWarningVisible = isWarningVisible;
  apiRef.current.remainingMs = remainingMs;
  apiRef.current.registerActivity = registerActivity;
  apiRef.current.acknowledgeWarning = acknowledgeWarning;
  apiRef.current.setWarningVisible = applyWarningVisibility;

  useEffect(() => () => clearTimers(), [clearTimers]);

  return apiRef.current;
};
