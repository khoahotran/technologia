/**
 * Auth Store
 *
 * Manages authentication state:
 * - Current user profile
 * - Authentication status
 * - Login/logout actions
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { logger } from "@/lib/logger";
import type { AuthStore, UserProfile } from "./store.types";

// ===========================================
// Store Implementation
// ===========================================

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            // State
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            setUser: (user: UserProfile) => {
                set({ currentUser: user, isAuthenticated: true, isLoading: false });
                logger.action("LOGIN", { userId: user.userId });
                logger.info("User authenticated", { userId: user.userId });
            },

            clearUser: () => {
                set({ currentUser: null, isAuthenticated: false, isLoading: false });
                logger.action("LOGOUT", {});
                logger.info("User logged out");
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                currentUser: state.currentUser,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// ===========================================
// Selectors
// ===========================================

export const selectCurrentUser = (state: AuthStore) => state.currentUser;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;

// ===========================================
// Hooks
// ===========================================

export function useAuth() {
    const currentUser = useAuthStore(selectCurrentUser);
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isLoading = useAuthStore(selectIsLoading);
    const setUser = useAuthStore((state) => state.setUser);
    const clearUser = useAuthStore((state) => state.clearUser);
    const setLoading = useAuthStore((state) => state.setLoading);

    return {
        currentUser,
        isAuthenticated,
        isLoading,
        setUser,
        clearUser,
        setLoading,
    };
}
