import { describe, it, expect } from 'vitest';
import { fileService } from '@/services/fileService';
import fs from 'fs';
import path from 'path';

describe('Portfolio YAML Examples Validation', () => {
  const examplesPath = path.resolve(__dirname, '../../../examples');

  describe('portfolio-simple.yaml', () => {
    it('should parse and validate successfully', async () => {
      const yamlContent = fs.readFileSync(
        path.join(examplesPath, 'portfolio-simple.yaml'),
        'utf-8'
      );
      const file = new File([yamlContent], 'portfolio-simple.yaml', { type: 'text/yaml' });

      const portfolio = await fileService.parsePortfolioFile(file);

      expect(portfolio.name).toBe('My Simple Portfolio');
      expect(portfolio.targetAllocation).toEqual({
        Stocks: 70,
        Bonds: 30,
      });
      expect(Object.keys(portfolio.etfs)).toHaveLength(2);
      expect(portfolio.etfs).toHaveProperty('VTI');
      expect(portfolio.etfs).toHaveProperty('BND');
    });

    it('should have valid asset class allocations', async () => {
      const yamlContent = fs.readFileSync(
        path.join(examplesPath, 'portfolio-simple.yaml'),
        'utf-8'
      );
      const file = new File([yamlContent], 'portfolio-simple.yaml', { type: 'text/yaml' });

      const portfolio = await fileService.parsePortfolioFile(file);

      expect(() => fileService.validateAssetCategories(portfolio)).not.toThrow();
    });
  });

  describe('portfolio-full.yaml', () => {
    it('should parse and validate successfully', async () => {
      const yamlContent = fs.readFileSync(
        path.join(examplesPath, 'portfolio-full.yaml'),
        'utf-8'
      );
      const file = new File([yamlContent], 'portfolio-full.yaml', { type: 'text/yaml' });

      const portfolio = await fileService.parsePortfolioFile(file);

      expect(portfolio.name).toBe('Diversified Global Portfolio');
      expect(portfolio.targetAllocation).toEqual({
        Stocks: 60,
        Bonds: 25,
        'Real Estate': 10,
        Commodities: 5,
      });
      expect(Object.keys(portfolio.etfs).length).toBeGreaterThanOrEqual(4);
    });

    it('should have valid asset class allocations', async () => {
      const yamlContent = fs.readFileSync(
        path.join(examplesPath, 'portfolio-full.yaml'),
        'utf-8'
      );
      const file = new File([yamlContent], 'portfolio-full.yaml', { type: 'text/yaml' });

      const portfolio = await fileService.parsePortfolioFile(file);

      expect(() => fileService.validateAssetCategories(portfolio)).not.toThrow();
    });

    it('should contain multiple ETFs with transactions', async () => {
      const yamlContent = fs.readFileSync(
        path.join(examplesPath, 'portfolio-full.yaml'),
        'utf-8'
      );
      const file = new File([yamlContent], 'portfolio-full.yaml', { type: 'text/yaml' });

      const portfolio = await fileService.parsePortfolioFile(file);

      // Verify that ETFs have transactions
      const vtiETF = portfolio.etfs['VTI'];
      expect(vtiETF).toBeDefined();
      expect(vtiETF.transactions).toBeDefined();
      expect(vtiETF.transactions.length).toBeGreaterThan(0);
    });
  });

  describe('portfolio-invalid.yaml', () => {
    it('should fail validation with appropriate error', async () => {
      const yamlContent = fs.readFileSync(
        path.join(examplesPath, 'portfolio-invalid.yaml'),
        'utf-8'
      );
      const file = new File([yamlContent], 'portfolio-invalid.yaml', { type: 'text/yaml' });

      // The invalid file should either fail parsing or validation
      await expect(
        fileService.parsePortfolioFile(file)
      ).rejects.toThrow();
    });
  });
});
