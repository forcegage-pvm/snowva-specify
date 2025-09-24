'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_OFFSET_MS = 5 * 60 * 1000; // 25 minute prompt requirement

type SessionContextValue = {
  lastActiveAt: number;
  warningAt: number;
  expiresAt: number;
  registerInteraction: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [lastActiveAt, setLastActiveAt] = useState(() => Date.now());

  const registerInteraction = useCallback(() => {
    setLastActiveAt(Date.now());
  }, []);

  const value = useMemo<SessionContextValue>(() => {
    const warningAt = lastActiveAt + SESSION_DURATION_MS - WARNING_OFFSET_MS;
    const expiresAt = lastActiveAt + SESSION_DURATION_MS;

    return {
      lastActiveAt,
      warningAt,
      expiresAt,
      registerInteraction,
    };
  }, [lastActiveAt, registerInteraction]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  return context;
};

export const SESSION_CONSTANTS = {
  durationMs: SESSION_DURATION_MS,
  warningOffsetMs: WARNING_OFFSET_MS,
};
