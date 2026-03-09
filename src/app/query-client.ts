import { QueryClient } from "@tanstack/react-query";

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const statusCode =
            typeof error === "object" &&
            error &&
            "statusCode" in error &&
            typeof (error as { statusCode?: unknown }).statusCode === "number"
              ? (error as { statusCode: number }).statusCode
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
