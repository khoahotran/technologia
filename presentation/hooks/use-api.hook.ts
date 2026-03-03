"use client";

/**
 * Presentation Hook Utilities
 *
 * Contains genuinely presentational utilities:
 *   - usePagination  → re-exported from shared/hooks (cross-layer)
 *   - useDebounce    → re-exported from shared/hooks (cross-layer)
 *
 * Note: useApiQuery / useApiMutation have been removed.
 * They were thin wrappers over TanStack Query with no added value.
 * Use useQuery / useMutation from @tanstack/react-query directly.
 */

// Re-export shared hooks for convenience from the presentation layer
export { usePagination } from "@/shared/hooks/use-pagination";
export type { PaginationState, UsePaginationOptions } from "@/shared/hooks/use-pagination";
export { useDebounce } from "@/shared/hooks/use-debounce";
