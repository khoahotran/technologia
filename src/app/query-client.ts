import { QueryClient } from "@tanstack/react-query";

const DEFAULT_STALE_TIME_MS = 60_000;
const DEFAULT_GC_TIME_MS = 5 * 60_000;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        gcTime: DEFAULT_GC_TIME_MS,
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          const statusCode =
            typeof error === "object" &&
            error &&
            "statusCode" in error &&
            typeof (error as { statusCode?: unknown }).statusCode === "number"
              ? ((error as { statusCode: number }).statusCode ?? 0)
              : 0;

          if (statusCode >= 400 && statusCode < 500) {
            return false;
          }

          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
