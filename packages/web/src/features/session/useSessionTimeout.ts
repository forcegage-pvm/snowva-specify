'use client';

import type { Dispatch, SetStateAction } from 'react';

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
  setWarningVisible?: Dispatch<SetStateAction<boolean>>;
};

export const useSessionTimeout = (_options: UseSessionTimeoutOptions): UseSessionTimeoutResult => {
  return {
    isWarningVisible: false,
    remainingMs: 0,
    registerActivity: () => undefined,
    acknowledgeWarning: () => undefined,
  };
};
