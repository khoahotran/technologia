/**
 * Shared Providers — Thư mục tập trung các Context Providers (Barrel Export)
 *
 * Cung cấp các wrapper thiết yếu cho toàn ứng dụng như: Theme (Dark/Light),
 * Language (i18n), QueryClient (React Query), và Dependency Injection (Repository).
 */

export * from "./auth.provider";
export * from "./language.provider";
export * from "./query.provider";
export * from "./theme.provider";
export * from "./repository.provider";
