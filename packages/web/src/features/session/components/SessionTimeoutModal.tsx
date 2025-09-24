'use client';

import type { FC } from 'react';

const formatCountdown = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

type SessionTimeoutModalProps = {
  isOpen: boolean;
  remainingMs: number;
  onStaySignedIn: () => void;
  onSignOut: () => void;
};

export const SessionTimeoutModal: FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingMs,
  onStaySignedIn,
  onSignOut,
}) => {
  if (!isOpen) {
    return null;
  }

  const formattedCountdown = formatCountdown(remainingMs);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
        className="w-full max-w-lg transform rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="space-y-3">
          <h2
            id="session-timeout-title"
            className="text-xl font-semibold text-slate-900"
          >
            Your session is about to expire
          </h2>
          <p className="text-sm text-slate-600">
            No activity has been detected for a while. We'll automatically sign you out soon
            to keep your information secure.
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
          <p className="text-sm font-medium text-slate-500">Time remaining</p>
          <p className="mt-2 text-4xl font-semibold tracking-wide text-slate-900">
            {formattedCountdown}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <button
            type="button"
            onClick={onStaySignedIn}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Stay signed in
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
