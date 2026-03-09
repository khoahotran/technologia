/**
 * UI Store — lightweight global UI state (sidebar, modal, drawer toggles).
 * Not persisted; resets on every page load.
 */

import { create } from 'zustand';

interface UiState {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
    sidebarOpen: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
