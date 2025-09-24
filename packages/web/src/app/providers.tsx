"use client";

import { PropsWithChildren, useState } from 'react';
import {
  HydrationBoundary,
  QueryClientProvider,
  type DehydratedState,
} from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { SessionProvider } from '@/features/session/providers/SessionProvider';
import { getQueryClient } from '@/lib/queryClient';

type ProvidersProps = PropsWithChildren<{
  dehydratedState?: DehydratedState;
}>;

export const Providers = ({ children, dehydratedState }: ProvidersProps) => {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
        <Toaster position="top-right" theme="system" richColors closeButton />
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Providers;
