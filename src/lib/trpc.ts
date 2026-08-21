import { QueryClient } from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AnyRouter } from '@trpc/server';

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export function getApiBaseUrl() {
  if (configuredApiUrl) return configuredApiUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.hostname === 'learnport-h3kw3ebv.manus.space') return window.location.origin;
  return 'https://learnport-h3kw3ebv.manus.space';
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const trpc: any = createTRPCReact<AnyRouter>() as any;

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getApiBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        });
      },
    }),
  ],
});
