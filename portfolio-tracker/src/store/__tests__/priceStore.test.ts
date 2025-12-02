import { describe, it, expect, beforeEach } from 'vitest';
import { usePriceStore } from '../priceStore';
import type { PriceData } from '@/types';

describe('priceStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = usePriceStore.getState();
    store.clearAllPrices();
  });

  describe('clearAllPrices', () => {
    it('should clear all prices', () => {
      // Set some prices
      const mockPrices: Record<string, PriceData> = {
        VWCE: {
          ticker: 'VWCE',
          price: 100,
          timestamp: Date.now(),
          currency: 'USD',
          source: 'api',
        },
        AGGH: {
          ticker: 'AGGH',
          price: 50,
          timestamp: Date.now(),
          currency: 'USD',
          source: 'api',
        },
      };
      
      usePriceStore.getState().setPrices(mockPrices);
      
      // Verify prices are set
      expect(Object.keys(usePriceStore.getState().prices)).toHaveLength(2);
      expect(usePriceStore.getState().lastFetch).not.toBeNull();
      
      // Clear all prices
      usePriceStore.getState().clearAllPrices();
      
      // Verify all state is cleared
      const state = usePriceStore.getState();
      expect(state.prices).toEqual({});
      expect(state.cache).toEqual({});
      expect(state.isFetching).toBe(false);
      expect(state.lastFetch).toBeNull();
    });

    it('should reset isFetching flag', () => {
      // Manually set isFetching to true
      usePriceStore.setState({ isFetching: true });
      expect(usePriceStore.getState().isFetching).toBe(true);
      
      // Clear all prices
      usePriceStore.getState().clearAllPrices();
      
      // Verify isFetching is reset
      expect(usePriceStore.getState().isFetching).toBe(false);
    });

    it('should clear cache along with prices', () => {
      // Set cache data directly
      usePriceStore.setState({
        cache: {
          VWCE: {
            price: 100,
            timestamp: Date.now(),
            expiresAt: Date.now() + 300000,
          },
        },
      });
      
      // Verify cache is set
      expect(Object.keys(usePriceStore.getState().cache)).toHaveLength(1);
      
      // Clear all prices
      usePriceStore.getState().clearAllPrices();
      
      // Verify cache is cleared
      expect(usePriceStore.getState().cache).toEqual({});
    });

    it('should work when store is already empty', () => {
      // Verify store is empty
      const initialState = usePriceStore.getState();
      expect(initialState.prices).toEqual({});
      expect(initialState.cache).toEqual({});
      expect(initialState.isFetching).toBe(false);
      expect(initialState.lastFetch).toBeNull();
      
      // Clear should not throw
      expect(() => usePriceStore.getState().clearAllPrices()).not.toThrow();
      
      // Verify store is still empty
      const finalState = usePriceStore.getState();
      expect(finalState.prices).toEqual({});
      expect(finalState.cache).toEqual({});
      expect(finalState.isFetching).toBe(false);
      expect(finalState.lastFetch).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear cache and prices', () => {
      // Set prices and cache
      const mockPrices: Record<string, PriceData> = {
        VWCE: {
          ticker: 'VWCE',
          price: 100,
          timestamp: Date.now(),
          currency: 'USD',
          source: 'api',
        },
      };
      
      usePriceStore.getState().setPrices(mockPrices);
      usePriceStore.setState({
        cache: {
          VWCE: {
            price: 100,
            timestamp: Date.now(),
            expiresAt: Date.now() + 300000,
          },
        },
      });
      
      // Clear cache
      usePriceStore.getState().clearCache();
      
      // Verify cache and prices are cleared
      const state = usePriceStore.getState();
      expect(state.prices).toEqual({});
      expect(state.cache).toEqual({});
      // Note: clearCache does not reset lastFetch or isFetching
    });
  });
});
