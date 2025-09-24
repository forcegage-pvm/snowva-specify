'use client';

import {
    HydrationBoundary,
    QueryClientProvider,
    type DehydratedState,
} from '@tanstack/react-query';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

import { SessionProvider } from '@/features/session/providers/SessionProvider';
import { SessionTimeoutModal } from '@/features/session/components/SessionTimeoutModal';
import { useSessionTimeout } from '@/features/session/useSessionTimeout';
import { getQueryClient } from '@/lib/queryClient';

type ProvidersProps = PropsWithChildren<{
  dehydratedState?: DehydratedState;
}>;

const SessionTimeoutBoundary = () => {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);

  const { isWarningVisible, remainingMs, acknowledgeWarning, registerActivity } =
    useSessionTimeout({
      onWarning: (remaining) => {
        setModalOpen(true);
        toast.warning('Looks like you\'ve been away. Your session will expire soon.', {
          description: `We\'ll sign you out in ${Math.ceil(remaining / 60000)} minutes if there\'s no more activity.`,
        });
      },
      onTimeout: () => {
        setModalOpen(false);
        toast.error('Session expired. Reloading for a fresh sign-in.');
        window.setTimeout(() => {
          window.location.reload();
        }, 600);
      },
      onAutoSaveDraft: () => {
        toast.info('Auto-saved your work before signing out.');
      },
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

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
        <SessionTimeoutBoundary />
        <Toaster position="top-right" theme="system" richColors closeButton />
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Providers;
