import { describe, it, expect, beforeEach } from 'vitest';
import { fileService } from '../fileService';

describe('FileService', () => {
  describe('parsePortfolioFile', () => {
    it('rejects non-YAML files', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await expect(fileService.parsePortfolioFile(file)).rejects.toThrow(
        'Invalid file type. Please upload a YAML file'
      );
    });

    it('rejects files larger than 5MB', async () => {
      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const file = new File([largeContent], 'large.yaml', { type: 'text/yaml' });

      await expect(fileService.parsePortfolioFile(file)).rejects.toThrow(
        'File is too large. Maximum size is 5MB'
      );
    });

    it('parses valid YAML portfolio file', async () => {
      const validYaml = `
targetAllocation:
  stocks: 60
  bonds: 40

etfs:
  VTI:
    name: "Vanguard Total Stock Market ETF"
    assetClasses:
      - name: "US Total Market"
        category: "stocks"
        percentage: 100
    transactions:
      - date: "2024-01-15"
        quantity: 10
        price: 220.50
  BND:
    name: "Vanguard Total Bond Market ETF"
    assetClasses:
      - name: "US Aggregate Bonds"
        category: "bonds"
        percentage: 100
    transactions:
      - date: "2024-01-15"
        quantity: 20
        price: 72.30
`;
      const file = new File([validYaml], 'portfolio.yaml', { type: 'text/yaml' });

      const result = await fileService.parsePortfolioFile(file);

      expect(result.targetAllocation).toEqual({ stocks: 60, bonds: 40 });
      expect(result.etfs).toHaveProperty('VTI');
      expect(result.etfs).toHaveProperty('BND');
    });

    it('rejects invalid YAML syntax', async () => {
      const invalidYaml = `
targetAllocation:
  stocks: 60
  bonds: [unclosed
`;
      const file = new File([invalidYaml], 'portfolio.yaml', { type: 'text/yaml' });

      await expect(fileService.parsePortfolioFile(file)).rejects.toThrow('YAML parsing error');
    });

    it('validates target allocation sums to 100%', async () => {
      const invalidYaml = `
targetAllocation:
  stocks: 50
  bonds: 30

etfs:
  VTI:
    name: "Vanguard Total Stock Market ETF"
    assetClass: "stocks"
    region: "US"
    percentage: 50
`;
      const file = new File([invalidYaml], 'portfolio.yaml', { type: 'text/yaml' });

      await expect(fileService.parsePortfolioFile(file)).rejects.toThrow(
        'Target allocation must sum to 100%'
      );
    });
  });

  describe('validateAssetCategories', () => {
    it('validates ETF categories match target allocation', () => {
      const portfolio = {
        targetAllocation: { stocks: 60, bonds: 40 },
        etfs: {
          VTI: {
            ticker: 'VTI',
            name: 'Vanguard Total Stock Market ETF',
            assetClasses: [
              { name: 'US Total Market', category: 'stocks', percentage: 100 }
            ],
            transactions: [
              { date: '2024-01-15', quantity: 10, price: 220.50 }
            ],
          },
          BND: {
            ticker: 'BND',
            name: 'Vanguard Total Bond Market ETF',
            assetClasses: [
              { name: 'US Aggregate Bonds', category: 'bonds', percentage: 100 }
            ],
            transactions: [
              { date: '2024-01-15', quantity: 20, price: 72.30 }
            ],
          },
        },
      };

      expect(() => fileService.validateAssetCategories(portfolio)).not.toThrow();
    });

    it('throws error when ETF categories do not match target allocation', () => {
      const portfolio = {
        targetAllocation: { stocks: 60, bonds: 40 },
        etfs: {
          VTI: {
            ticker: 'VTI',
            name: 'Vanguard Total Stock Market ETF',
            assetClasses: [
              { name: 'US Total Market', category: 'equities', percentage: 100 } // Wrong category
            ],
            transactions: [
              { date: '2024-01-15', quantity: 10, price: 220.50 }
            ],
          },
        },
      };

      expect(() => fileService.validateAssetCategories(portfolio)).toThrow(
        'ETFs contain asset categories not defined in target allocation'
      );
    });
  });
});
