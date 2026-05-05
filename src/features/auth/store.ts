import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthSession } from './types';

import { authStorage } from '@/utils/storage';

interface AuthState {
    session: AuthSession | null;
    hydrated: boolean;
    setSession: (session: AuthSession) => void;
    updateUser: (user: Partial<AuthSession['user']>) => void;
    clearSession: () => void;
    markHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            session: null,
            hydrated: false,
            setSession: (session) => {
                authStorage.setTokens(session.accessToken, session.refreshToken);
                set({ session });
            },
            updateUser: (userData) => {
                set((state) => {
                    if (!state.session) return state;
                    return {
                        session: {
                            ...state.session,
                            user: {
                                ...state.session.user,
                                ...userData,
                            },
                        },
                    };
                });
            },
            clearSession: () => {
                authStorage.clearTokens();
                set({ session: null });
            },
            markHydrated: () => set({ hydrated: true }),
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({ session: state.session }),
            onRehydrateStorage: () => (state) => {
                state?.markHydrated();
            },
        }
    )
);
