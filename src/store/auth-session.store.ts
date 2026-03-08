import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthSession } from "@/src/domain/entities/auth-session";

interface AuthSessionState {
  session: AuthSession | null;
  hydrated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  markHydrated: () => void;
}

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "auth-session-store",
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
