//src/store/use-ui-store.ts
import { create } from 'zustand';

interface UiState {
    isMobileMenuOpen: boolean;
    showSubHeader: boolean;
    toggleMobileMenu: () => void;
    setMobileMenuOpen: (open: boolean) => void;
    setShowSubHeader: (show: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
    isMobileMenuOpen: false,
    showSubHeader: true, // Default to true based on user request "navbar red place"
    toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    setShowSubHeader: (show) => set({ showSubHeader: show }),
}));
