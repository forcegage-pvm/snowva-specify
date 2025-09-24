import type { DehydratedState, QueryClientConfig } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

const DEFAULT_QUERY_OPTIONS: NonNullable<QueryClientConfig['defaultOptions']> = {
  queries: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  },
  mutations: {
    retry: 0,
  },
};

let browserQueryClient: QueryClient | null = null;

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: DEFAULT_QUERY_OPTIONS,
  });

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
};

export type HydrationState = DehydratedState | undefined;
