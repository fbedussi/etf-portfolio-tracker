// UI State and View Models

export type Theme = 'light' | 'dark';

export type ViewMode = 'dashboard' | 'holdings' | 'rebalancing' | 'settings';

export interface UIState {
  theme: Theme;
  currentView: ViewMode;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
