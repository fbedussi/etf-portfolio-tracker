import { describe, it, expect } from 'vitest';
import { 
  calculateHoldings, 
  calculatePortfolioValue,
  calculateProfitLoss,
  calculateETFProfitLoss,
  calculateAllocation
} from '../portfolioService';
import type { ETF, Holdings } from '../../types/portfolio.types';
import type { PriceData } from '../../types/api.types';

describe('portfolioService', () => {
  describe('calculateHoldings', () => {
    it('should calculate holdings for a single ETF with one transaction', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings).toEqual({
        VTI: {
          quantity: 10,
          costBasis: 220.50,
          totalCost: 2205,
        },
      });
    });

    it('should calculate holdings for a single ETF with multiple buy transactions', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
            { date: '2024-06-15', quantity: 5, price: 235.20 },
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings.VTI.quantity).toBe(15);
      expect(holdings.VTI.totalCost).toBe(3381); // (10 * 220.50) + (5 * 235.20)
      expect(holdings.VTI.costBasis).toBeCloseTo(225.4, 2); // 3381 / 15
    });

    it('should calculate weighted average cost basis correctly', () => {
      const etfs: Record<string, ETF> = {
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 20, price: 72.30 },
            { date: '2024-06-15', quantity: 10, price: 71.80 },
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings.BND.quantity).toBe(30);
      expect(holdings.BND.totalCost).toBe(2164); // (20 * 72.30) + (10 * 71.80)
      expect(holdings.BND.costBasis).toBeCloseTo(72.133, 3); // 2164 / 30
    });

    it('should handle multiple ETFs in portfolio', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
          ],
        },
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 20, price: 72.30 },
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(Object.keys(holdings)).toHaveLength(2);
      expect(holdings.VTI.quantity).toBe(10);
      expect(holdings.BND.quantity).toBe(20);
    });

    it('should handle sell transactions (negative quantity)', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
            { date: '2024-06-15', quantity: -3, price: 240.00 }, // Sell 3 shares
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings.VTI.quantity).toBe(7); // 10 - 3
      expect(holdings.VTI.totalCost).toBe(1485); // (10 * 220.50) + (-3 * 240.00)
      expect(holdings.VTI.costBasis).toBeCloseTo(212.14, 2); // 1485 / 7
    });

    it('should handle complete selloff (zero quantity)', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
            { date: '2024-06-15', quantity: -10, price: 240.00 }, // Sell all
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings.VTI.quantity).toBe(0);
      expect(holdings.VTI.costBasis).toBe(0);
      expect(holdings.VTI.totalCost).toBe(-195); // (10 * 220.50) + (-10 * 240.00)
    });

    it('should handle negative total quantity (oversell)', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 10, price: 220.50 },
            { date: '2024-06-15', quantity: -15, price: 240.00 }, // Sell more than owned
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings.VTI.quantity).toBe(-5); // 10 - 15
      expect(holdings.VTI.costBasis).toBe(0); // No cost basis for negative quantity
      expect(holdings.VTI.totalCost).toBe(-1395); // (10 * 220.50) + (-15 * 240.00)
    });

    it('should handle ETF with no transactions', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings.VTI.quantity).toBe(0);
      expect(holdings.VTI.costBasis).toBe(0);
      expect(holdings.VTI.totalCost).toBe(0);
    });

    it('should handle empty portfolio', () => {
      const etfs: Record<string, ETF> = {};

      const holdings = calculateHoldings(etfs);

      expect(holdings).toEqual({});
    });

    it('should handle fractional shares', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 10.5, price: 220.50 },
            { date: '2024-06-15', quantity: 5.25, price: 235.20 },
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings.VTI.quantity).toBeCloseTo(15.75, 2);
      expect(holdings.VTI.totalCost).toBeCloseTo(3550.05, 2); // (10.5 * 220.50) + (5.25 * 235.20)
      expect(holdings.VTI.costBasis).toBeCloseTo(225.4, 3); // 3550.05 / 15.75
    });

    it('should handle very small quantities and prices', () => {
      const etfs: Record<string, ETF> = {
        TEST: {
          ticker: 'TEST',
          name: 'Test ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 0.001, price: 0.50 },
            { date: '2024-06-15', quantity: 0.002, price: 0.75 },
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings.TEST.quantity).toBeCloseTo(0.003, 10);
      expect(holdings.TEST.totalCost).toBeCloseTo(0.002, 10); // (0.001 * 0.50) + (0.002 * 0.75)
      expect(holdings.TEST.costBasis).toBeCloseTo(0.6667, 4); // 0.002 / 0.003
    });

    it('should handle large quantities and prices', () => {
      const etfs: Record<string, ETF> = {
        EXPENSIVE: {
          ticker: 'EXPENSIVE',
          name: 'Expensive ETF',
          assetClasses: [],
          transactions: [
            { date: '2024-01-15', quantity: 1000000, price: 5000.00 },
            { date: '2024-06-15', quantity: 500000, price: 5500.00 },
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      expect(holdings.EXPENSIVE.quantity).toBe(1500000);
      expect(holdings.EXPENSIVE.totalCost).toBe(7750000000); // (1000000 * 5000) + (500000 * 5500)
      expect(holdings.EXPENSIVE.costBasis).toBeCloseTo(5166.667, 2); // 7750000000 / 1500000
    });

    it('should calculate cost basis for complex transaction history', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [
            { date: '2023-01-15', quantity: 10, price: 200.00 },
            { date: '2023-06-15', quantity: 5, price: 210.00 },
            { date: '2023-12-15', quantity: -3, price: 220.00 }, // Sell
            { date: '2024-03-15', quantity: 8, price: 230.00 },
            { date: '2024-06-15', quantity: -5, price: 240.00 }, // Sell
          ],
        },
      };

      const holdings = calculateHoldings(etfs);

      // Total quantity: 10 + 5 - 3 + 8 - 5 = 15
      expect(holdings.VTI.quantity).toBe(15);
      
      // Total cost: (10*200) + (5*210) + (-3*220) + (8*230) + (-5*240)
      //           = 2000 + 1050 - 660 + 1840 - 1200 = 3030
      expect(holdings.VTI.totalCost).toBe(3030);
      
      // Cost basis: 3030 / 15 = 202
      expect(holdings.VTI.costBasis).toBeCloseTo(202, 2);
    });
  });

  describe('calculatePortfolioValue', () => {
    it('should calculate total portfolio value with single ETF', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const value = calculatePortfolioValue(holdings, prices);

      expect(value).toBeCloseTo(3532.50, 2); // 15 × 235.50
    });

    it('should calculate total portfolio value with multiple ETFs', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
        BND: {
          quantity: 30,
          costBasis: 72.133,
          totalCost: 2164,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
        BND: {
          ticker: 'BND',
          price: 73.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const value = calculatePortfolioValue(holdings, prices);

      // VTI: 15 × 235.50 = 3532.50
      // BND: 30 × 73.00 = 2190.00
      // Total: 5722.50
      expect(value).toBeCloseTo(5722.50, 2);
    });

    it('should exclude holdings with missing prices', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
        BND: {
          quantity: 30,
          costBasis: 72.133,
          totalCost: 2164,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
        // BND price missing
      };

      const value = calculatePortfolioValue(holdings, prices);

      expect(value).toBeCloseTo(3532.50, 2); // Only VTI counted
    });

    it('should return 0 for empty portfolio', () => {
      const holdings: Holdings = {};
      const prices: Record<string, PriceData> = {};

      const value = calculatePortfolioValue(holdings, prices);

      expect(value).toBe(0);
    });

    it('should return 0 when no prices available', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
      };

      const prices: Record<string, PriceData> = {};

      const value = calculatePortfolioValue(holdings, prices);

      expect(value).toBe(0);
    });

    it('should handle zero quantity holdings', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 0,
          costBasis: 0,
          totalCost: 0,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const value = calculatePortfolioValue(holdings, prices);

      expect(value).toBe(0);
    });

    it('should handle negative quantity holdings', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: -5,
          costBasis: 0,
          totalCost: -1100,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const value = calculatePortfolioValue(holdings, prices);

      expect(value).toBeCloseTo(-1177.50, 2); // -5 × 235.50
    });
  });

  describe('calculateProfitLoss', () => {
    it('should calculate profit for portfolio with gains', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const result = calculateProfitLoss(holdings, prices);

      expect(result).not.toBeNull();
      expect(result!.profitLoss).toBeCloseTo(151.50, 2); // 3532.50 - 3381
      expect(result!.profitLossPercent).toBeCloseTo(4.48, 2); // (151.50 / 3381) × 100
    });

    it('should calculate loss for portfolio with losses', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 215.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const result = calculateProfitLoss(holdings, prices);

      expect(result).not.toBeNull();
      expect(result!.profitLoss).toBeCloseTo(-156, 2); // 3225 - 3381
      expect(result!.profitLossPercent).toBeCloseTo(-4.61, 2); // (-156 / 3381) × 100
    });

    it('should calculate P&L for multiple ETFs', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
        BND: {
          quantity: 30,
          costBasis: 72.133,
          totalCost: 2164,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
        BND: {
          ticker: 'BND',
          price: 73.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const result = calculateProfitLoss(holdings, prices);

      expect(result).not.toBeNull();
      // VTI: 3532.50 - 3381 = 151.50
      // BND: 2190 - 2164 = 26
      // Total P&L: 177.50
      expect(result!.profitLoss).toBeCloseTo(177.50, 2);
      // Total cost: 5545
      // P&L%: (177.50 / 5545) × 100 = 3.20%
      expect(result!.profitLossPercent).toBeCloseTo(3.20, 2);
    });

    it('should return null when total cost is zero', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 0,
          costBasis: 0,
          totalCost: 0,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const result = calculateProfitLoss(holdings, prices);

      expect(result).toBeNull();
    });

    it('should return null when total cost is negative', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: -5,
          costBasis: 0,
          totalCost: -1100,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const result = calculateProfitLoss(holdings, prices);

      expect(result).toBeNull();
    });

    it('should handle missing prices by excluding those holdings', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
        BND: {
          quantity: 30,
          costBasis: 72.133,
          totalCost: 2164,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
        // BND price missing
      };

      const result = calculateProfitLoss(holdings, prices);

      expect(result).not.toBeNull();
      // Only VTI value counted: 3532.50
      // Total cost still includes both: 5545
      // P&L: 3532.50 - 5545 = -2012.50
      expect(result!.profitLoss).toBeCloseTo(-2012.50, 2);
      expect(result!.profitLossPercent).toBeCloseTo(-36.29, 2);
    });

    it('should calculate break-even scenario', () => {
      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 225.40,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const result = calculateProfitLoss(holdings, prices);

      expect(result).not.toBeNull();
      expect(result!.profitLoss).toBeCloseTo(0, 2);
      expect(result!.profitLossPercent).toBeCloseTo(0, 2);
    });
  });

  describe('calculateETFProfitLoss', () => {
    it('should calculate profit for single ETF with gains', () => {
      const holding = {
        quantity: 15,
        costBasis: 225.40,
        totalCost: 3381,
      };

      const price: PriceData = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: '2024-12-01T12:00:00Z',
      };

      const result = calculateETFProfitLoss('VTI', holding, price);

      expect(result).not.toBeNull();
      expect(result!.profitLoss).toBeCloseTo(151.50, 2); // 3532.50 - 3381
      expect(result!.profitLossPercent).toBeCloseTo(4.48, 2); // (151.50 / 3381) × 100
    });

    it('should calculate loss for single ETF with losses', () => {
      const holding = {
        quantity: 15,
        costBasis: 225.40,
        totalCost: 3381,
      };

      const price: PriceData = {
        ticker: 'VTI',
        price: 215.00,
        timestamp: '2024-12-01T12:00:00Z',
      };

      const result = calculateETFProfitLoss('VTI', holding, price);

      expect(result).not.toBeNull();
      expect(result!.profitLoss).toBeCloseTo(-156, 2); // 3225 - 3381
      expect(result!.profitLossPercent).toBeCloseTo(-4.61, 2);
    });

    it('should return null when price is missing', () => {
      const holding = {
        quantity: 15,
        costBasis: 225.40,
        totalCost: 3381,
      };

      const result = calculateETFProfitLoss('VTI', holding, undefined);

      expect(result).toBeNull();
    });

    it('should return null when total cost is zero', () => {
      const holding = {
        quantity: 0,
        costBasis: 0,
        totalCost: 0,
      };

      const price: PriceData = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: '2024-12-01T12:00:00Z',
      };

      const result = calculateETFProfitLoss('VTI', holding, price);

      expect(result).toBeNull();
    });

    it('should return null when total cost is negative', () => {
      const holding = {
        quantity: -5,
        costBasis: 0,
        totalCost: -1100,
      };

      const price: PriceData = {
        ticker: 'VTI',
        price: 235.50,
        timestamp: '2024-12-01T12:00:00Z',
      };

      const result = calculateETFProfitLoss('VTI', holding, price);

      expect(result).toBeNull();
    });

    it('should handle large profit percentages', () => {
      const holding = {
        quantity: 100,
        costBasis: 10.00,
        totalCost: 1000,
      };

      const price: PriceData = {
        ticker: 'MOON',
        price: 50.00,
        timestamp: '2024-12-01T12:00:00Z',
      };

      const result = calculateETFProfitLoss('MOON', holding, price);

      expect(result).not.toBeNull();
      expect(result!.profitLoss).toBeCloseTo(4000, 2); // 5000 - 1000
      expect(result!.profitLossPercent).toBeCloseTo(400, 2); // 400% gain
    });

    it('should handle large loss percentages', () => {
      const holding = {
        quantity: 100,
        costBasis: 50.00,
        totalCost: 5000,
      };

      const price: PriceData = {
        ticker: 'CRASH',
        price: 5.00,
        timestamp: '2024-12-01T12:00:00Z',
      };

      const result = calculateETFProfitLoss('CRASH', holding, price);

      expect(result).not.toBeNull();
      expect(result!.profitLoss).toBeCloseTo(-4500, 2); // 500 - 5000
      expect(result!.profitLossPercent).toBeCloseTo(-90, 2); // 90% loss
    });

    it('should calculate break-even scenario', () => {
      const holding = {
        quantity: 15,
        costBasis: 225.40,
        totalCost: 3381,
      };

      const price: PriceData = {
        ticker: 'VTI',
        price: 225.40,
        timestamp: '2024-12-01T12:00:00Z',
      };

      const result = calculateETFProfitLoss('VTI', holding, price);

      expect(result).not.toBeNull();
      expect(result!.profitLoss).toBeCloseTo(0, 2);
      expect(result!.profitLossPercent).toBeCloseTo(0, 2);
    });

    it('should handle fractional shares and prices', () => {
      const holding = {
        quantity: 15.5,
        costBasis: 225.45,
        totalCost: 3494.475,
      };

      const price: PriceData = {
        ticker: 'VTI',
        price: 235.75,
        timestamp: '2024-12-01T12:00:00Z',
      };

      const result = calculateETFProfitLoss('VTI', holding, price);

      expect(result).not.toBeNull();
      // Current value: 15.5 × 235.75 = 3654.125
      // P&L: 3654.125 - 3494.475 = 159.65
      expect(result!.profitLoss).toBeCloseTo(159.65, 2);
      // P&L%: (159.65 / 3494.475) × 100 = 4.57%
      expect(result!.profitLossPercent).toBeCloseTo(4.57, 2);
    });
  });

  describe('calculateAllocation', () => {
    it('should calculate allocation for single ETF with single asset class', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Total Market', category: 'Stocks', percentage: 100 },
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      expect(allocation).toEqual({
        Stocks: 100,
      });
    });

    it('should calculate allocation for multiple ETFs with single asset classes', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Total Market', category: 'Stocks', percentage: 100 },
          ],
          transactions: [],
        },
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [
            { name: 'US Aggregate Bonds', category: 'Bonds', percentage: 100 },
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
        BND: {
          quantity: 30,
          costBasis: 72.133,
          totalCost: 2164,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
        BND: {
          ticker: 'BND',
          price: 73.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      // VTI value: 15 × 235.50 = 3532.50
      // BND value: 30 × 73.00 = 2190.00
      // Total: 5722.50
      // Stocks: (3532.50 / 5722.50) × 100 = 61.73%
      // Bonds: (2190.00 / 5722.50) × 100 = 38.27%
      expect(allocation.Stocks).toBeCloseTo(61.73, 2);
      expect(allocation.Bonds).toBeCloseTo(38.27, 2);
      
      // Check that percentages sum to ~100%
      const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
      expect(total).toBeCloseTo(100, 1);
    });

    it('should handle ETF with multiple asset classes (weighted distribution)', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Large Cap', category: 'Stocks', percentage: 70 },
            { name: 'US Mid Cap', category: 'Stocks', percentage: 20 },
            { name: 'US Small Cap', category: 'Stocks', percentage: 10 },
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        VTI: {
          quantity: 10,
          costBasis: 220.00,
          totalCost: 2200,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 220.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      // VTI value: 10 × 220 = 2200
      // All goes to Stocks (70% + 20% + 10% = 100%)
      expect(allocation).toEqual({
        Stocks: 100,
      });
    });

    it('should handle complex portfolio with multiple categories', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Large Cap', category: 'Stocks', percentage: 70 },
            { name: 'US Mid Cap', category: 'Stocks', percentage: 20 },
            { name: 'US Small Cap', category: 'Stocks', percentage: 10 },
          ],
          transactions: [],
        },
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [
            { name: 'US Government Bonds', category: 'Bonds', percentage: 60 },
            { name: 'US Corporate Bonds', category: 'Bonds', percentage: 40 },
          ],
          transactions: [],
        },
        VNQ: {
          ticker: 'VNQ',
          name: 'Vanguard Real Estate ETF',
          assetClasses: [
            { name: 'US REITs', category: 'Real Estate', percentage: 100 },
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        VTI: {
          quantity: 10,
          costBasis: 220.00,
          totalCost: 2200,
        },
        BND: {
          quantity: 30,
          costBasis: 72.00,
          totalCost: 2160,
        },
        VNQ: {
          quantity: 5,
          costBasis: 80.00,
          totalCost: 400,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 220.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
        BND: {
          ticker: 'BND',
          price: 72.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
        VNQ: {
          ticker: 'VNQ',
          price: 80.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      // VTI value: 10 × 220 = 2200 (all Stocks)
      // BND value: 30 × 72 = 2160 (all Bonds)
      // VNQ value: 5 × 80 = 400 (all Real Estate)
      // Total: 4760
      // Stocks: 2200 / 4760 = 46.22%
      // Bonds: 2160 / 4760 = 45.38%
      // Real Estate: 400 / 4760 = 8.40%
      expect(allocation.Stocks).toBeCloseTo(46.22, 2);
      expect(allocation.Bonds).toBeCloseTo(45.38, 2);
      expect(allocation['Real Estate']).toBeCloseTo(8.40, 2);
      
      const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
      expect(total).toBeCloseTo(100, 1);
    });

    it('should distribute mixed asset class ETF correctly', () => {
      const etfs: Record<string, ETF> = {
        AOA: {
          ticker: 'AOA',
          name: 'iShares Core Aggressive Allocation ETF',
          assetClasses: [
            { name: 'Global Stocks', category: 'Stocks', percentage: 80 },
            { name: 'Global Bonds', category: 'Bonds', percentage: 20 },
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        AOA: {
          quantity: 100,
          costBasis: 50.00,
          totalCost: 5000,
        },
      };

      const prices: Record<string, PriceData> = {
        AOA: {
          ticker: 'AOA',
          price: 60.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      // AOA value: 100 × 60 = 6000
      // 80% to Stocks: 4800
      // 20% to Bonds: 1200
      expect(allocation.Stocks).toBeCloseTo(80, 2);
      expect(allocation.Bonds).toBeCloseTo(20, 2);
    });

    it('should handle missing prices by excluding those ETFs', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [],
        },
        BND: {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          assetClasses: [
            { name: 'US Bonds', category: 'Bonds', percentage: 100 },
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
        BND: {
          quantity: 30,
          costBasis: 72.133,
          totalCost: 2164,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
        // BND price missing
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      // Only VTI counted
      expect(allocation).toEqual({
        Stocks: 100,
      });
    });

    it('should return empty allocation for empty portfolio', () => {
      const etfs: Record<string, ETF> = {};
      const holdings: Holdings = {};
      const prices: Record<string, PriceData> = {};

      const allocation = calculateAllocation(etfs, holdings, prices);

      expect(allocation).toEqual({});
    });

    it('should return empty allocation when all values are zero', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        VTI: {
          quantity: 0,
          costBasis: 0,
          totalCost: 0,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      expect(allocation).toEqual({});
    });

    it('should handle ETF with no asset classes', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        VTI: {
          quantity: 15,
          costBasis: 225.40,
          totalCost: 3381,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      expect(allocation).toEqual({});
    });

    it('should handle negative quantity (should skip)', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        VTI: {
          quantity: -5,
          costBasis: 0,
          totalCost: -1100,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.50,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      // Negative value should be skipped
      expect(allocation).toEqual({});
    });

    it('should calculate allocation with fractional shares', () => {
      const etfs: Record<string, ETF> = {
        VTI: {
          ticker: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetClasses: [
            { name: 'US Stocks', category: 'Stocks', percentage: 100 },
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        VTI: {
          quantity: 15.5,
          costBasis: 225.45,
          totalCost: 3494.475,
        },
      };

      const prices: Record<string, PriceData> = {
        VTI: {
          ticker: 'VTI',
          price: 235.75,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      expect(allocation.Stocks).toBeCloseTo(100, 2);
    });

    it('should handle asset class percentages that dont sum to 100', () => {
      const etfs: Record<string, ETF> = {
        MIXED: {
          ticker: 'MIXED',
          name: 'Mixed Allocation ETF',
          assetClasses: [
            { name: 'Stocks', category: 'Stocks', percentage: 60 },
            { name: 'Bonds', category: 'Bonds', percentage: 30 },
            // Intentionally only sums to 90%
          ],
          transactions: [],
        },
      };

      const holdings: Holdings = {
        MIXED: {
          quantity: 100,
          costBasis: 50.00,
          totalCost: 5000,
        },
      };

      const prices: Record<string, PriceData> = {
        MIXED: {
          ticker: 'MIXED',
          price: 50.00,
          timestamp: '2024-12-01T12:00:00Z',
        },
      };

      const allocation = calculateAllocation(etfs, holdings, prices);

      // Value: 100 × 50 = 5000
      // Stocks: 60% of 5000 = 3000 → 60% of total
      // Bonds: 30% of 5000 = 1500 → 30% of total
      // Total allocation: 90% (missing 10%)
      expect(allocation.Stocks).toBeCloseTo(60, 2);
      expect(allocation.Bonds).toBeCloseTo(30, 2);
      
      const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
      expect(total).toBeCloseTo(90, 1);
    });
  });
});
