import { describe, it, expect } from 'vitest';
import {
  calculateDrift,
  determineRebalancingStatus,
  getStatusMessage,
  getStatusIcon,
  calculateRebalancingStatus,
} from '../rebalancingService';

describe('rebalancingService', () => {
  describe('calculateDrift', () => {
    it('should calculate drift for all categories', () => {
      const current = { stocks: 78.5, bonds: 13.8, 'real-estate': 7.7 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const drifts = calculateDrift(current, target);

      expect(drifts).toHaveLength(3);
      
      // Should be sorted by absolute drift (descending)
      expect(drifts[0].category).toBe('stocks');
      expect(drifts[0].currentPercent).toBe(78.5);
      expect(drifts[0].targetPercent).toBe(70);
      expect(drifts[0].drift).toBe(8.5);
      expect(drifts[0].absDrift).toBe(8.5);

      expect(drifts[1].category).toBe('bonds');
      expect(drifts[1].currentPercent).toBe(13.8);
      expect(drifts[1].targetPercent).toBe(20);
      expect(drifts[1].drift).toBeCloseTo(-6.2, 1);
      expect(drifts[1].absDrift).toBeCloseTo(6.2, 1);

      expect(drifts[2].category).toBe('real-estate');
      expect(drifts[2].currentPercent).toBe(7.7);
      expect(drifts[2].targetPercent).toBe(10);
      expect(drifts[2].drift).toBeCloseTo(-2.3, 1);
      expect(drifts[2].absDrift).toBeCloseTo(2.3, 1);
    });

    it('should handle missing categories in current allocation', () => {
      const current = { stocks: 90, bonds: 10 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const drifts = calculateDrift(current, target);

      expect(drifts).toHaveLength(3);
      
      const realEstateDrift = drifts.find((d) => d.category === 'real-estate');
      expect(realEstateDrift).toBeDefined();
      expect(realEstateDrift?.currentPercent).toBe(0);
      expect(realEstateDrift?.targetPercent).toBe(10);
      expect(realEstateDrift?.drift).toBe(-10);
      expect(realEstateDrift?.absDrift).toBe(10);
    });

    it('should handle missing categories in target allocation', () => {
      const current = { stocks: 70, bonds: 20, crypto: 10 };
      const target = { stocks: 80, bonds: 20 };

      const drifts = calculateDrift(current, target);

      expect(drifts).toHaveLength(3);
      
      const cryptoDrift = drifts.find((d) => d.category === 'crypto');
      expect(cryptoDrift).toBeDefined();
      expect(cryptoDrift?.currentPercent).toBe(10);
      expect(cryptoDrift?.targetPercent).toBe(0);
      expect(cryptoDrift?.drift).toBe(10);
      expect(cryptoDrift?.absDrift).toBe(10);
    });

    it('should handle zero drift (perfectly balanced)', () => {
      const current = { stocks: 70, bonds: 20, 'real-estate': 10 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const drifts = calculateDrift(current, target);

      expect(drifts).toHaveLength(3);
      drifts.forEach((drift) => {
        expect(drift.drift).toBe(0);
        expect(drift.absDrift).toBe(0);
      });
    });

    it('should handle empty allocations', () => {
      const current = {};
      const target = { stocks: 100 };

      const drifts = calculateDrift(current, target);

      expect(drifts).toHaveLength(1);
      expect(drifts[0].category).toBe('stocks');
      expect(drifts[0].currentPercent).toBe(0);
      expect(drifts[0].targetPercent).toBe(100);
      expect(drifts[0].drift).toBe(-100);
      expect(drifts[0].absDrift).toBe(100);
    });

    it('should sort by absolute drift descending', () => {
      const current = { stocks: 71, bonds: 22, 'real-estate': 7 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const drifts = calculateDrift(current, target);

      expect(drifts[0].absDrift).toBeGreaterThanOrEqual(drifts[1].absDrift);
      expect(drifts[1].absDrift).toBeGreaterThanOrEqual(drifts[2].absDrift);
    });

    it('should handle negative drifts correctly', () => {
      const current = { stocks: 60, bonds: 25, 'real-estate': 15 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const drifts = calculateDrift(current, target);

      const stocksDrift = drifts.find((d) => d.category === 'stocks');
      expect(stocksDrift?.drift).toBe(-10);
      expect(stocksDrift?.absDrift).toBe(10);
    });

    it('should handle small decimal drifts', () => {
      const current = { stocks: 70.1, bonds: 19.9, 'real-estate': 10.0 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const drifts = calculateDrift(current, target);

      expect(drifts[0].absDrift).toBeCloseTo(0.1, 2);
      expect(drifts[1].absDrift).toBeCloseTo(0.1, 2);
      expect(drifts[2].absDrift).toBeCloseTo(0, 2);
    });
  });

  describe('determineRebalancingStatus', () => {
    it('should return "in-balance" when drift is below threshold', () => {
      expect(determineRebalancingStatus(3.2, 5)).toBe('in-balance');
      expect(determineRebalancingStatus(4.9, 5)).toBe('in-balance');
      expect(determineRebalancingStatus(0, 5)).toBe('in-balance');
    });

    it('should return "monitor" when drift is at or above threshold but below 2x', () => {
      expect(determineRebalancingStatus(5.0, 5)).toBe('monitor');
      expect(determineRebalancingStatus(6.5, 5)).toBe('monitor');
      expect(determineRebalancingStatus(9.9, 5)).toBe('monitor');
    });

    it('should return "rebalance" when drift is at or above 2x threshold', () => {
      expect(determineRebalancingStatus(10.0, 5)).toBe('rebalance');
      expect(determineRebalancingStatus(11.5, 5)).toBe('rebalance');
      expect(determineRebalancingStatus(20.0, 5)).toBe('rebalance');
    });

    it('should use default threshold of 5% when not provided', () => {
      expect(determineRebalancingStatus(3.0)).toBe('in-balance');
      expect(determineRebalancingStatus(7.0)).toBe('monitor');
      expect(determineRebalancingStatus(12.0)).toBe('rebalance');
    });

    it('should work with custom thresholds', () => {
      expect(determineRebalancingStatus(1.5, 2)).toBe('in-balance');
      expect(determineRebalancingStatus(3.0, 2)).toBe('monitor');
      expect(determineRebalancingStatus(5.0, 2)).toBe('rebalance');

      expect(determineRebalancingStatus(7.0, 10)).toBe('in-balance');
      expect(determineRebalancingStatus(15.0, 10)).toBe('monitor');
      expect(determineRebalancingStatus(21.0, 10)).toBe('rebalance');
    });

    it('should handle edge case at exact threshold boundary', () => {
      expect(determineRebalancingStatus(5.0, 5)).toBe('monitor');
      expect(determineRebalancingStatus(10.0, 5)).toBe('rebalance');
    });

    it('should handle very small thresholds', () => {
      expect(determineRebalancingStatus(0.5, 1)).toBe('in-balance');
      expect(determineRebalancingStatus(1.0, 1)).toBe('monitor');
      expect(determineRebalancingStatus(2.0, 1)).toBe('rebalance');
    });

    it('should handle very large drifts', () => {
      expect(determineRebalancingStatus(50.0, 5)).toBe('rebalance');
      expect(determineRebalancingStatus(100.0, 5)).toBe('rebalance');
    });
  });

  describe('getStatusMessage', () => {
    it('should return correct message for in-balance', () => {
      expect(getStatusMessage('in-balance')).toBe('Your portfolio is balanced');
    });

    it('should return correct message for monitor', () => {
      expect(getStatusMessage('monitor')).toBe('Minor drift detected, keep monitoring');
    });

    it('should return correct message for rebalance', () => {
      expect(getStatusMessage('rebalance')).toBe('Rebalancing recommended');
    });
  });

  describe('getStatusIcon', () => {
    it('should return correct icon for in-balance', () => {
      expect(getStatusIcon('in-balance')).toBe('CheckCircle');
    });

    it('should return correct icon for monitor', () => {
      expect(getStatusIcon('monitor')).toBe('AlertTriangle');
    });

    it('should return correct icon for rebalance', () => {
      expect(getStatusIcon('rebalance')).toBe('AlertCircle');
    });
  });

  describe('calculateRebalancingStatus', () => {
    it('should calculate complete rebalancing status', () => {
      const current = { stocks: 78.5, bonds: 13.8, 'real-estate': 7.7 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const result = calculateRebalancingStatus(current, target, 5);

      expect(result.status).toBe('monitor');
      expect(result.maxDrift).toBe(8.5);
      expect(result.driftThreshold).toBe(5);
      expect(result.categoryDrifts).toHaveLength(3);
      expect(result.categoryDrifts[0].category).toBe('stocks');
      expect(result.categoryDrifts[0].absDrift).toBe(8.5);
    });

    it('should return in-balance status for balanced portfolio', () => {
      const current = { stocks: 71, bonds: 20, 'real-estate': 9 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const result = calculateRebalancingStatus(current, target, 5);

      expect(result.status).toBe('in-balance');
      expect(result.maxDrift).toBe(1);
    });

    it('should return rebalance status for heavily drifted portfolio', () => {
      const current = { stocks: 85, bonds: 10, 'real-estate': 5 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const result = calculateRebalancingStatus(current, target, 5);

      expect(result.status).toBe('rebalance');
      expect(result.maxDrift).toBe(15);
    });

    it('should use default threshold when not provided', () => {
      const current = { stocks: 76, bonds: 14, 'real-estate': 10 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const result = calculateRebalancingStatus(current, target);

      expect(result.driftThreshold).toBe(5);
      expect(result.status).toBe('monitor');
    });

    it('should work with custom thresholds', () => {
      const current = { stocks: 74, bonds: 16, 'real-estate': 10 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const result = calculateRebalancingStatus(current, target, 10);

      expect(result.status).toBe('in-balance');
      expect(result.driftThreshold).toBe(10);
    });

    it('should handle perfectly balanced portfolio', () => {
      const current = { stocks: 70, bonds: 20, 'real-estate': 10 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const result = calculateRebalancingStatus(current, target);

      expect(result.status).toBe('in-balance');
      expect(result.maxDrift).toBe(0);
      expect(result.categoryDrifts.every((d) => d.drift === 0)).toBe(true);
    });

    it('should handle missing categories gracefully', () => {
      const current = { stocks: 90, bonds: 10 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const result = calculateRebalancingStatus(current, target);

      expect(result.status).toBe('rebalance');
      expect(result.categoryDrifts).toHaveLength(3);
      
      const realEstateDrift = result.categoryDrifts.find((d) => d.category === 'real-estate');
      expect(realEstateDrift?.drift).toBe(-10);
    });

    it('should sort category drifts by absolute value', () => {
      const current = { stocks: 71, bonds: 22, 'real-estate': 7 };
      const target = { stocks: 70, bonds: 20, 'real-estate': 10 };

      const result = calculateRebalancingStatus(current, target);

      for (let i = 0; i < result.categoryDrifts.length - 1; i++) {
        expect(result.categoryDrifts[i].absDrift).toBeGreaterThanOrEqual(
          result.categoryDrifts[i + 1].absDrift
        );
      }
    });

    it('should handle empty allocations', () => {
      const current = {};
      const target = { stocks: 100 };

      const result = calculateRebalancingStatus(current, target);

      expect(result.status).toBe('rebalance');
      expect(result.maxDrift).toBe(100);
      expect(result.categoryDrifts).toHaveLength(1);
    });
  });
});
