import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { PropsWithChildren, useEffect } from 'react';

import { SessionProvider } from '@/features/session/providers/SessionProvider';
import {
    useSessionTimeout,
    type UseSessionTimeoutOptions,
    type UseSessionTimeoutResult,
} from '@/features/session/useSessionTimeout';

type HarnessProps = PropsWithChildren<{
  options: UseSessionTimeoutOptions;
  expose: (api: UseSessionTimeoutResult) => void;
}>;

const SessionTimeoutHarness = ({ options, expose }: HarnessProps) => {
  const api = useSessionTimeout(options);

  useEffect(() => {
    expose(api);
  }, [api, expose]);

  return (
    <div data-testid="session-timeout-state">
      <span data-testid="warning-visible">{api.isWarningVisible ? 'true' : 'false'}</span>
      <span data-testid="remaining-ms">{api.remainingMs}</span>
    </div>
  );
};

describe('useSessionTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-09-01T08:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderHookWithProvider = (options: UseSessionTimeoutOptions) => {
    let currentApi: UseSessionTimeoutResult | undefined;

    render(
      <SessionProvider>
        <SessionTimeoutHarness
          options={options}
          expose={(api) => {
            currentApi = api;
          }}
        />
      </SessionProvider>,
    );

    if (!currentApi) {
      throw new Error('useSessionTimeout test harness did not expose API');
    }

    return currentApi;
  };

  it('emits warning at 25 minutes and exposes warning state', () => {
    const handleWarning = jest.fn();
    const handleTimeout = jest.fn();

    const api = renderHookWithProvider({
      onWarning: handleWarning,
      onTimeout: handleTimeout,
      onAutoSaveDraft: jest.fn(),
    });

    act(() => {
      jest.advanceTimersByTime(24 * 60 * 1000);
    });

    expect(handleWarning).not.toHaveBeenCalled();
    expect(api.isWarningVisible).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1 * 60 * 1000);
    });

    expect(handleWarning).toHaveBeenCalledTimes(1);
    expect(handleTimeout).not.toHaveBeenCalled();
    expect(api.isWarningVisible).toBe(true);
    expect(screen.getByTestId('warning-visible')).toHaveTextContent('true');
  });

  it('auto-saves drafts before logging out at 30 minutes', () => {
    const handleWarning = jest.fn();
    const handleTimeout = jest.fn();
    const handleAutoSave = jest.fn();

    renderHookWithProvider({
      onWarning: handleWarning,
      onTimeout: handleTimeout,
      onAutoSaveDraft: handleAutoSave,
    });

    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    expect(handleWarning).toHaveBeenCalledTimes(1);
    expect(handleAutoSave).not.toHaveBeenCalled();
    expect(handleTimeout).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(handleAutoSave).toHaveBeenCalledTimes(1);
    expect(handleTimeout).toHaveBeenCalledTimes(1);
    expect(handleAutoSave.mock.invocationCallOrder[0]).toBeLessThan(
      handleTimeout.mock.invocationCallOrder[0],
    );
  });

  it('resets timers when user activity is registered', () => {
    const handleWarning = jest.fn();
    const handleTimeout = jest.fn();

    const api = renderHookWithProvider({
      onWarning: handleWarning,
      onTimeout: handleTimeout,
      onAutoSaveDraft: jest.fn(),
    });

    act(() => {
      jest.advanceTimersByTime(20 * 60 * 1000);
    });

    expect(handleWarning).not.toHaveBeenCalled();

    act(() => {
      api.registerActivity();
      jest.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(handleWarning).not.toHaveBeenCalled();
    expect(handleTimeout).not.toHaveBeenCalled();
    expect(api.isWarningVisible).toBe(false);
    expect(screen.getByTestId('warning-visible')).toHaveTextContent('false');

    const remainingMs = Number(screen.getByTestId('remaining-ms').textContent);
    expect(Number.isNaN(remainingMs)).toBe(false);
    expect(remainingMs).toBeGreaterThan(15 * 60 * 1000);
  });
});
