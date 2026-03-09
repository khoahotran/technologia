/**
 * Auth Store — re-exports the session-based auth store from the auth feature.
 * Import from here for consistent access across the app.
 */

export { useAuthStore } from '@/features/auth/store';
export type { AuthSession, AuthUser } from '@/features/auth/types';
