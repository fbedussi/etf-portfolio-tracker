import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  // Store original navigator.onLine
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    // Reset to online state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    // Restore original value
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine,
    });
  });

  describe('initialization', () => {
    it('should return true when browser is online', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(true);
    });

    it('should return false when browser is offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(false);
    });

    it('should return true if navigator is undefined (SSR)', () => {
      const originalNavigator = global.navigator;
      // @ts-ignore - simulating SSR environment
      delete global.navigator;

      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(true);

      // Restore navigator
      global.navigator = originalNavigator;
    });
  });

  describe('online/offline transitions', () => {
    it('should update to false when going offline', () => {
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(true);

      act(() => {
        // Simulate going offline
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current).toBe(false);
    });

    it('should update to true when going online', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(false);

      act(() => {
        // Simulate going online
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true,
        });
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current).toBe(true);
    });

    it('should handle multiple transitions', () => {
      const { result } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(true);

      // Go offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current).toBe(false);

      // Go back online
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true,
        });
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current).toBe(true);

      // Go offline again
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current).toBe(false);
    });
  });

  describe('event listener cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useOnlineStatus());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should not respond to events after unmount', () => {
      const { result, unmount } = renderHook(() => useOnlineStatus());

      expect(result.current).toBe(true);

      unmount();

      // Try to trigger events after unmount
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        window.dispatchEvent(new Event('offline'));
      });

      // Result should not change after unmount
      expect(result.current).toBe(true);
    });
  });

  describe('console logging', () => {
    it('should log when going online', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      renderHook(() => useOnlineStatus());

      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true,
        });
        window.dispatchEvent(new Event('online'));
      });

      expect(consoleSpy).toHaveBeenCalledWith('Browser is online');

      consoleSpy.mockRestore();
    });

    it('should log when going offline', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderHook(() => useOnlineStatus());

      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        window.dispatchEvent(new Event('offline'));
      });

      expect(consoleSpy).toHaveBeenCalledWith('Browser is offline');

      consoleSpy.mockRestore();
    });
  });
});
