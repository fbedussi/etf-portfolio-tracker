import { describe, it, expect } from 'vitest';
import {
  calculateWeightedAverage,
  sumByKey,
  percentageChange,
  roundToDecimals,
  calculatePercentage,
  clamp,
} from '../calculations';

describe('calculations utilities', () => {
  describe('calculateWeightedAverage', () => {
    it('should calculate weighted average correctly', () => {
      const result = calculateWeightedAverage([10, 20, 30], [1, 2, 3]);
      
      // (10*1 + 20*2 + 30*3) / (1+2+3) = (10 + 40 + 90) / 6 = 140 / 6 = 23.33
      expect(result).toBeCloseTo(23.33, 2);
    });

    it('should handle equal weights', () => {
      const result = calculateWeightedAverage([10, 20, 30], [1, 1, 1]);
      
      // Should be simple average: (10 + 20 + 30) / 3 = 20
      expect(result).toBe(20);
    });

    it('should return 0 for empty arrays', () => {
      const result = calculateWeightedAverage([], []);
      
      expect(result).toBe(0);
    });

    it('should return 0 when total weight is 0', () => {
      const result = calculateWeightedAverage([10, 20, 30], [0, 0, 0]);
      
      expect(result).toBe(0);
    });

    it('should handle single value', () => {
      const result = calculateWeightedAverage([42], [1]);
      
      expect(result).toBe(42);
    });

    it('should throw error for mismatched array lengths', () => {
      expect(() => {
        calculateWeightedAverage([10, 20], [1, 2, 3]);
      }).toThrow('Values and weights arrays must have the same length');
    });

    it('should handle fractional weights', () => {
      const result = calculateWeightedAverage([100, 200], [0.3, 0.7]);
      
      // (100*0.3 + 200*0.7) / (0.3+0.7) = (30 + 140) / 1 = 170
      expect(result).toBe(170);
    });

    it('should handle negative values', () => {
      const result = calculateWeightedAverage([-10, 20, -30], [1, 2, 1]);
      
      // (-10*1 + 20*2 + -30*1) / (1+2+1) = (-10 + 40 - 30) / 4 = 0
      expect(result).toBe(0);
    });
  });

  describe('sumByKey', () => {
    it('should sum values by key', () => {
      const items = [
        { amount: 10, name: 'a' },
        { amount: 20, name: 'b' },
        { amount: 30, name: 'c' },
      ];
      
      const result = sumByKey(items, 'amount');
      
      expect(result).toBe(60);
    });

    it('should return 0 for empty array', () => {
      const result = sumByKey([], 'amount');
      
      expect(result).toBe(0);
    });

    it('should handle non-numeric values as 0', () => {
      const items = [
        { amount: 10 },
        { amount: 'not a number' as any },
        { amount: 30 },
      ];
      
      const result = sumByKey(items, 'amount');
      
      expect(result).toBe(40); // Only 10 and 30 counted
    });

    it('should handle negative values', () => {
      const items = [
        { value: 100 },
        { value: -50 },
        { value: 25 },
      ];
      
      const result = sumByKey(items, 'value');
      
      expect(result).toBe(75);
    });

    it('should handle fractional values', () => {
      const items = [
        { price: 10.5 },
        { price: 20.25 },
        { price: 5.75 },
      ];
      
      const result = sumByKey(items, 'price');
      
      expect(result).toBeCloseTo(36.5, 2);
    });
  });

  describe('percentageChange', () => {
    it('should calculate positive percentage change', () => {
      const result = percentageChange(100, 120);
      
      expect(result).toBe(20);
    });

    it('should calculate negative percentage change', () => {
      const result = percentageChange(100, 80);
      
      expect(result).toBe(-20);
    });

    it('should return null for zero old value', () => {
      const result = percentageChange(0, 100);
      
      expect(result).toBeNull();
    });

    it('should handle no change', () => {
      const result = percentageChange(100, 100);
      
      expect(result).toBe(0);
    });

    it('should handle fractional changes', () => {
      const result = percentageChange(100, 105.5);
      
      expect(result).toBeCloseTo(5.5, 2);
    });

    it('should handle large percentage changes', () => {
      const result = percentageChange(10, 100);
      
      expect(result).toBe(900); // 900% increase
    });

    it('should handle complete loss', () => {
      const result = percentageChange(100, 0);
      
      expect(result).toBe(-100);
    });

    it('should handle negative values', () => {
      const result = percentageChange(-50, -25);
      
      // (-25 - (-50)) / -50 * 100 = 25 / -50 * 100 = -50%
      expect(result).toBe(-50);
    });
  });

  describe('roundToDecimals', () => {
    it('should round to 2 decimals by default', () => {
      const result = roundToDecimals(3.14159);
      
      expect(result).toBe(3.14);
    });

    it('should round to specified decimals', () => {
      const result = roundToDecimals(3.14159, 3);
      
      expect(result).toBe(3.142);
    });

    it('should handle 0 decimals', () => {
      const result = roundToDecimals(3.7, 0);
      
      expect(result).toBe(4);
    });

    it('should handle negative numbers', () => {
      const result = roundToDecimals(-3.14159, 2);
      
      expect(result).toBe(-3.14);
    });

    it('should handle numbers that dont need rounding', () => {
      const result = roundToDecimals(5, 2);
      
      expect(result).toBe(5);
    });

    it('should round 0.5 up (banker\'s rounding)', () => {
      const result1 = roundToDecimals(2.5, 0);
      const result2 = roundToDecimals(3.5, 0);
      
      expect(result1).toBe(3); // Rounds up
      expect(result2).toBe(4); // Rounds up
    });

    it('should handle very small numbers', () => {
      const result = roundToDecimals(0.00012345, 4);
      
      expect(result).toBeCloseTo(0.0001, 4);
    });

    it('should handle very large numbers', () => {
      const result = roundToDecimals(123456.789, 1);
      
      expect(result).toBe(123456.8);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      const result = calculatePercentage(25, 100);
      
      expect(result).toBe(25);
    });

    it('should return 0 when total is 0', () => {
      const result = calculatePercentage(50, 0);
      
      expect(result).toBe(0);
    });

    it('should handle fractional results', () => {
      const result = calculatePercentage(1, 3);
      
      expect(result).toBeCloseTo(33.333, 2);
    });

    it('should handle value greater than total', () => {
      const result = calculatePercentage(150, 100);
      
      expect(result).toBe(150);
    });

    it('should handle negative values', () => {
      const result = calculatePercentage(-25, 100);
      
      expect(result).toBe(-25);
    });

    it('should handle zero value', () => {
      const result = calculatePercentage(0, 100);
      
      expect(result).toBe(0);
    });

    it('should handle small fractions', () => {
      const result = calculatePercentage(0.5, 1000);
      
      expect(result).toBe(0.05);
    });
  });

  describe('clamp', () => {
    it('should clamp value above max', () => {
      const result = clamp(150, 0, 100);
      
      expect(result).toBe(100);
    });

    it('should clamp value below min', () => {
      const result = clamp(-10, 0, 100);
      
      expect(result).toBe(0);
    });

    it('should not clamp value within range', () => {
      const result = clamp(50, 0, 100);
      
      expect(result).toBe(50);
    });

    it('should handle value equal to min', () => {
      const result = clamp(0, 0, 100);
      
      expect(result).toBe(0);
    });

    it('should handle value equal to max', () => {
      const result = clamp(100, 0, 100);
      
      expect(result).toBe(100);
    });

    it('should handle negative ranges', () => {
      const result = clamp(-5, -10, -1);
      
      expect(result).toBe(-5);
    });

    it('should handle fractional values', () => {
      const result = clamp(5.5, 0, 10);
      
      expect(result).toBe(5.5);
    });

    it('should handle zero range', () => {
      const result = clamp(5, 3, 3);
      
      expect(result).toBe(3);
    });
  });
});
