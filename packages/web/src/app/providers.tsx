'use client';

import {
    HydrationBoundary,
    QueryClientProvider,
    type DehydratedState,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

import {
    DraftAutosaveProvider,
    useDraftAutosaveManager,
} from '@/features/sales/hooks/useDraftAutosave';
import { SessionTimeoutModal } from '@/features/session/components/SessionTimeoutModal';
import { SessionProvider } from '@/features/session/providers/SessionProvider';
import { useSessionTimeout } from '@/features/session/useSessionTimeout';
import { initializeNavigationPerformance } from '@/lib/metrics/performanceMetrics';
import { getQueryClient } from '@/lib/queryClient';

type ProvidersProps = PropsWithChildren<{
  dehydratedState?: DehydratedState;
}>;

const SessionTimeoutBoundary = () => {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const { triggerAutosave, getDraftSummaries } = useDraftAutosaveManager();

  const handleAutoSaveBeforeTimeout = useCallback(async () => {
    const results = await triggerAutosave('timeout');

    if (results.length === 0) {
      toast.info('Nothing to auto-save before signing out.');
      return;
    }

    const successes = results.filter((result) => result.success && !result.skipped);
    const failures = results.filter((result) => !result.success && !result.skipped);

    if (successes.length > 0) {
      const label = successes.length === 1
        ? successes[0].label ?? `${successes[0].draftType} draft`
        : `${successes.length} drafts`;

      toast.success(`Auto-saved ${label} before signing out.`);
    }

    if (failures.length > 0) {
      toast.error('We had trouble auto-saving some drafts before timeout.', {
        description: failures
          .map((failure) => failure.label ?? `${failure.draftType} ${failure.draftId}`)
          .join(', '),
      });
    }
  }, [triggerAutosave]);

  const { isWarningVisible, remainingMs, acknowledgeWarning, registerActivity } =
    useSessionTimeout({
      onWarning: (remaining) => {
        setModalOpen(true);
        const dirtyDrafts = getDraftSummaries().filter((draft) => draft.isDirty);
        const description = dirtyDrafts.length > 0
          ? `We'll sign you out soon. ${dirtyDrafts.length} draft${
              dirtyDrafts.length > 1 ? 's are' : ' is'
            } queued to auto-save if you stay inactive.`
          : "We'll sign you out soon if there's no more activity.";

        toast.warning('Looks like you\'ve been away. Your session will expire soon.', {
          description: `${description} About ${Math.ceil(remaining / 60000)} minute${
            Math.ceil(remaining / 60000) === 1 ? '' : 's'
          } remaining.`,
        });
      },
      onTimeout: () => {
        setModalOpen(false);
        toast.error('Session expired. Reloading for a fresh sign-in.');
        window.setTimeout(() => {
          window.location.reload();
        }, 600);
      },
      onAutoSaveDraft: handleAutoSaveBeforeTimeout,
    });

  useEffect(() => {
    setModalOpen(isWarningVisible);
  }, [isWarningVisible]);

  useEffect(() => {
    const handleInteraction = () => registerActivity();
    const handleVisibility = () => {
      if (!document.hidden) {
        registerActivity();
      }
    };

    window.addEventListener('pointerdown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [registerActivity]);

  const handleStaySignedIn = useCallback(() => {
    acknowledgeWarning();
    setModalOpen(false);
    toast.success('Session extended for another 30 minutes.');
  }, [acknowledgeWarning]);

  const handleSignOut = useCallback(() => {
    setModalOpen(false);
    toast.warning('Signing out now. You can sign back in anytime.');
    window.setTimeout(() => {
      router.refresh();
    }, 300);
  }, [router]);

  return (
    <SessionTimeoutModal
      isOpen={isModalOpen}
      remainingMs={remainingMs}
      onStaySignedIn={handleStaySignedIn}
      onSignOut={handleSignOut}
    />
  );
};

export const Providers = ({ children, dehydratedState }: ProvidersProps) => {
  const [queryClient] = useState(() => getQueryClient());

  useEffect(() => initializeNavigationPerformance(), []);

  return (
    <SessionProvider>
      <DraftAutosaveProvider>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
          <SessionTimeoutBoundary />
          <Toaster position="top-right" theme="system" richColors closeButton />
        </QueryClientProvider>
      </DraftAutosaveProvider>
    </SessionProvider>
  );
};

export default Providers;
