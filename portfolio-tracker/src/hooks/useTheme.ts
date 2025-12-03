import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import type { Theme } from '@/types';

export interface UseThemeReturn {
  /** Current theme setting ('light' | 'dark' | 'auto') */
  theme: Theme;
  /** Resolved theme ('light' | 'dark') - resolves 'auto' to system preference */
  resolvedTheme: 'light' | 'dark';
  /** Set theme preference */
  setTheme: (theme: Theme) => void;
  /** Check if system prefers dark mode */
  systemPrefersDark: boolean;
}

/**
 * Custom hook for managing theme with system preference detection
 * 
 * Supports three modes:
 * - 'light': Force light theme
 * - 'dark': Force dark theme
 * - 'auto': Follow system preference
 * 
 * Automatically updates document class and CSS variables.
 * Persists preference in localStorage via uiStore.
 * 
 * @returns Theme state and controls
 * 
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, resolvedTheme, setTheme } = useTheme();
 *   
 *   return (
 *     <button onClick={() => {
 *       const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
 *       setTheme(next);
 *     }}>
 *       Current: {theme} (Resolved: {resolvedTheme})
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): UseThemeReturn {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  // Detect system preference
  const systemPrefersDark = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;

  // Resolve 'auto' to actual theme
  const resolvedTheme = theme === 'auto' 
    ? (systemPrefersDark ? 'dark' : 'light')
    : theme;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add resolved theme class
    root.classList.add(resolvedTheme);
    
    // Also set data attribute for CSS targeting
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes when in 'auto' mode
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      const newTheme = e.matches ? 'dark' : 'light';
      
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      root.setAttribute('data-theme', newTheme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    systemPrefersDark,
  };
}
