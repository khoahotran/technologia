"use client";

/**
 * Các Hook dùng chung cho phía Giao diện (Presentation Hook Utilities)
 *
 * Chỉ bao gồm những API Hooks có bản chất là quản lý State hiển thị ở View Layer:
 *   - usePagination  → Lấy (re-export) từ shared/hooks (để dùng chung cross-layer)
 *   - useDebounce    → Lấy (re-export) từ shared/hooks
 *
 * GHI CHÚ: useApiQuery / useApiMutation đã bị gỡ bỏ theo Review Code lần trước.
 * Chúng ta sẽ chuyển sang dùng trực tiếp useQuery / useMutation từ @tanstack/react-query
 * nhằm tận dụng toàn bộ sức mạnh gốc của thư viện thay vì bọc lại một cách dư thừa thãi.
 */

export { usePagination } from "@/shared/hooks/use-pagination";
export type { PaginationState, UsePaginationOptions } from "@/shared/hooks/use-pagination";
export { useDebounce } from "@/shared/hooks/use-debounce";
