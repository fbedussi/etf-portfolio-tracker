import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { useUIStore } from '@/store/uiStore';

describe('useTheme', () => {
  let matchMediaMock: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset store
    useUIStore.setState({ theme: 'auto' });

    // Reset document classes
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => matchMediaMock),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Theme Resolution', () => {
    it('should resolve auto theme to light when system prefers light', () => {
      matchMediaMock.matches = false;
      useUIStore.setState({ theme: 'auto' });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('light');
      expect(result.current.systemPrefersDark).toBe(false);
    });

    it('should resolve auto theme to dark when system prefers dark', () => {
      matchMediaMock.matches = true;
      useUIStore.setState({ theme: 'auto' });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.systemPrefersDark).toBe(true);
    });

    it('should use explicit light theme regardless of system preference', () => {
      matchMediaMock.matches = true; // System prefers dark
      useUIStore.setState({ theme: 'light' });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should use explicit dark theme regardless of system preference', () => {
      matchMediaMock.matches = false; // System prefers light
      useUIStore.setState({ theme: 'dark' });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });
  });

  describe('DOM Updates', () => {
    it('should add light class to document root when theme is light', () => {
      useUIStore.setState({ theme: 'light' });

      renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should add dark class to document root when theme is dark', () => {
      useUIStore.setState({ theme: 'dark' });

      renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update DOM when theme changes', () => {
      useUIStore.setState({ theme: 'light' });

      const { result } = renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('light')).toBe(true);

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('should remove old theme class before adding new one', () => {
      document.documentElement.classList.add('dark');
      useUIStore.setState({ theme: 'light' });

      renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('System Preference Listener', () => {
    it('should register change listener when theme is auto', () => {
      useUIStore.setState({ theme: 'auto' });

      const { unmount } = renderHook(() => useTheme());

      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      unmount();

      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should not register change listener when theme is explicit', () => {
      useUIStore.setState({ theme: 'light' });

      renderHook(() => useTheme());

      expect(matchMediaMock.addEventListener).not.toHaveBeenCalled();
    });

    it('should update DOM when system preference changes in auto mode', () => {
      matchMediaMock.matches = false;
      useUIStore.setState({ theme: 'auto' });

      renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('light')).toBe(true);

      // Simulate system preference change
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1] as (e: MediaQueryListEvent) => void;
      act(() => {
        changeHandler({ matches: true } as MediaQueryListEvent);
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should handle legacy addListener/removeListener API', () => {
      // Mock legacy API
      matchMediaMock.addEventListener = undefined as any;
      matchMediaMock.removeEventListener = undefined as any;

      useUIStore.setState({ theme: 'auto' });

      const { unmount } = renderHook(() => useTheme());

      expect(matchMediaMock.addListener).toHaveBeenCalledWith(expect.any(Function));

      unmount();

      expect(matchMediaMock.removeListener).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('setTheme Function', () => {
    it('should update theme to light', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should update theme to dark', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    it('should update theme to auto', () => {
      matchMediaMock.matches = true;

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.theme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    it('should persist theme changes to localStorage via uiStore', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      // Verify store was updated
      expect(useUIStore.getState().theme).toBe('dark');
    });
  });
});
