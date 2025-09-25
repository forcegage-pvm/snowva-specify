import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import {
    DraftAutosaveProvider,
    readDraftFromCache,
    useDraftAutosave,
    type DraftAutosaveResult,
} from '../useDraftAutosave';

describe('useDraftAutosave', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <DraftAutosaveProvider>{children}</DraftAutosaveProvider>
  );

  it('persists draft changes after the interval elapses', async () => {
    const persist = jest.fn().mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ draft }) =>
        useDraftAutosave({
          draft,
          draftId: 'quote-123',
          draftType: 'quote',
          autosaveIntervalMs: 1_000,
          persist,
        }),
      {
        initialProps: { draft: { customer: 'Initial' } },
        wrapper,
      },
    );

    rerender({ draft: { customer: 'Updated' } });

    act(() => {
      jest.advanceTimersByTime(1_100);
    });

    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.lastSavedAt).not.toBeNull());

    const cachedDraft = readDraftFromCache<{ customer: string }>('quote', 'quote-123');
    expect(cachedDraft?.draft).toEqual({ customer: 'Updated' });
    expect(cachedDraft?.savedAt).toEqual(result.current.lastSavedAt);
  });

  it('skips manual save when draft is not dirty', async () => {
    const { result } = renderHook(
      () =>
        useDraftAutosave({
          draft: { customer: 'Initial' },
          draftId: 'quote-456',
          draftType: 'quote',
        }),
      { wrapper },
    );

    let manualResult: DraftAutosaveResult | null = null;

    await act(async () => {
      manualResult = await result.current.saveNow('manual');
    });

    expect(manualResult).not.toBeNull();
    if (!manualResult) {
      throw new Error('Expected manual autosave result');
    }

    expect(manualResult).toEqual(
      expect.objectContaining({
        skipped: true,
        success: true,
      }),
    );
    expect(result.current.lastSavedAt).toBeNull();
  });

  it('clears cached draft data when clearDraft is called', async () => {
    const { result, rerender } = renderHook(
      ({ draft }) =>
        useDraftAutosave({
          draft,
          draftId: 'invoice-001',
          draftType: 'invoice',
          autosaveIntervalMs: 1_000,
        }),
      {
        initialProps: { draft: { note: 'initial' } },
        wrapper,
      },
    );

    rerender({ draft: { note: 'updated' } });

    act(() => {
      jest.advanceTimersByTime(1_100);
    });

    await waitFor(() => expect(result.current.lastSavedAt).not.toBeNull());

    act(() => {
      result.current.clearDraft();
    });

    const cachedDraft = readDraftFromCache<{ note: string }>('invoice', 'invoice-001');
    expect(cachedDraft).toBeNull();
    expect(result.current.lastSavedAt).toBeNull();
  });
});
