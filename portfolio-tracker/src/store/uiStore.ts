import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, ViewMode } from '@/types';

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // View
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;

  // Rebalancing Settings
  driftThreshold: number;
  setDriftThreshold: (threshold: number) => void;

  // UI States
  isRebalancingExpanded: boolean;
  toggleRebalancingExpanded: () => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme: Theme) => set({ theme }),

      currentView: 'dashboard',
      setCurrentView: (view: ViewMode) => set({ currentView: view }),

      driftThreshold: 5, // Default 5%
      setDriftThreshold: (threshold: number) => {
        // Validate: threshold must be between 1 and 20
        const validThreshold = Math.min(Math.max(threshold, 1), 20);
        set({ driftThreshold: validThreshold });
      },

      isRebalancingExpanded: false,
      toggleRebalancingExpanded: () =>
        set((state) => ({
          isRebalancingExpanded: !state.isRebalancingExpanded,
        })),

      isSidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
    }),
    {
      name: 'portfolio-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        currentView: state.currentView,
        driftThreshold: state.driftThreshold,
      }),
    }
  )
);
