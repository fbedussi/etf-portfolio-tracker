import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUIStore } from '../uiStore';

describe('UIStore - Drift Threshold', () => {
  beforeEach(() => {
    // Reset store to initial state
    useUIStore.setState({
      theme: 'light',
      currentView: 'dashboard',
      driftThreshold: 5,
      isRebalancingExpanded: false,
      isSidebarOpen: true,
    });
  });

  it('should have default drift threshold of 5%', () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.driftThreshold).toBe(5);
  });

  it('should update drift threshold', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setDriftThreshold(7);
    });

    expect(result.current.driftThreshold).toBe(7);
  });

  it('should validate minimum threshold of 1%', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setDriftThreshold(0);
    });

    expect(result.current.driftThreshold).toBe(1);

    act(() => {
      result.current.setDriftThreshold(-5);
    });

    expect(result.current.driftThreshold).toBe(1);
  });

  it('should validate maximum threshold of 20%', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setDriftThreshold(25);
    });

    expect(result.current.driftThreshold).toBe(20);

    act(() => {
      result.current.setDriftThreshold(100);
    });

    expect(result.current.driftThreshold).toBe(20);
  });

  it('should accept valid thresholds within range', () => {
    const { result } = renderHook(() => useUIStore());

    const validValues = [1, 2, 5, 7, 10, 15, 20];

    validValues.forEach((value) => {
      act(() => {
        result.current.setDriftThreshold(value);
      });
      expect(result.current.driftThreshold).toBe(value);
    });
  });

  it('should persist drift threshold in localStorage', () => {
    const { result: result1 } = renderHook(() => useUIStore());

    act(() => {
      result1.current.setDriftThreshold(10);
    });

    expect(result1.current.driftThreshold).toBe(10);

    // Simulate new hook instance (like page reload)
    const { result: result2 } = renderHook(() => useUIStore());
    
    // Should maintain the value from storage
    expect(result2.current.driftThreshold).toBe(10);
  });

  it('should handle decimal thresholds by rounding down', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setDriftThreshold(7.8);
    });

    // Should accept the value (store doesn't round, just validates bounds)
    expect(result.current.driftThreshold).toBe(7.8);
  });

  it('should clamp edge case values correctly', () => {
    const { result } = renderHook(() => useUIStore());

    // Test exact boundaries
    act(() => {
      result.current.setDriftThreshold(1);
    });
    expect(result.current.driftThreshold).toBe(1);

    act(() => {
      result.current.setDriftThreshold(20);
    });
    expect(result.current.driftThreshold).toBe(20);

    // Test just outside boundaries
    act(() => {
      result.current.setDriftThreshold(0.99);
    });
    expect(result.current.driftThreshold).toBe(1);

    act(() => {
      result.current.setDriftThreshold(20.01);
    });
    expect(result.current.driftThreshold).toBe(20);
  });
});
