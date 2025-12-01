import yaml from 'js-yaml';
import type { Portfolio, ETF } from '@/types';

/**
 * Service for parsing and validating portfolio YAML files
 */
export class FileService {
  /**
   * Parse a YAML portfolio file and validate its structure
   * @param file - The uploaded File object
   * @returns Parsed and validated Portfolio object
   * @throws Error if file is invalid or parsing fails
   */
  async parsePortfolioFile(file: File): Promise<Portfolio> {
    // Validate file type
    if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
      throw new Error('Invalid file type. Please upload a YAML file (.yaml or .yml)');
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File is too large. Maximum size is 5MB');
    }

    try {
      // Read file content
      const content = await this.readFileAsText(file);

      // Parse YAML
      const data = yaml.load(content) as any;

      // Validate and transform to Portfolio structure
      const portfolio = this.validatePortfolio(data);

      return portfolio;
    } catch (error) {
      if (error instanceof yaml.YAMLException) {
        throw new Error(`YAML parsing error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Read file content as text
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Validate portfolio data structure and business rules
   */
  private validatePortfolio(data: any): Portfolio {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid portfolio format: Expected an object');
    }

    // Validate targetAllocation
    if (!data.targetAllocation || typeof data.targetAllocation !== 'object') {
      throw new Error('Missing or invalid "targetAllocation" field');
    }

    const targetAllocation = data.targetAllocation;
    const totalAllocation = Object.values(targetAllocation).reduce(
      (sum: number, val) => sum + (typeof val === 'number' ? val : 0),
      0
    );

    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error(
        `Target allocation must sum to 100% (currently ${totalAllocation.toFixed(2)}%)`
      );
    }

    // Validate ETFs
    if (!data.etfs || typeof data.etfs !== 'object') {
      throw new Error('Missing or invalid "etfs" field');
    }

    const etfs: Record<string, ETF> = {};
    for (const [ticker, etfData] of Object.entries(data.etfs)) {
      etfs[ticker] = this.validateETF(ticker, etfData);
    }

    if (Object.keys(etfs).length === 0) {
      throw new Error('Portfolio must contain at least one ETF');
    }

    return {
      name: data.name,
      targetAllocation,
      etfs,
    };
  }

  /**
   * Validate individual ETF structure
   */
  private validateETF(ticker: string, data: any): ETF {
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid ETF format for ${ticker}`);
    }

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
      throw new Error(`Missing or invalid "name" field for ETF ${ticker}`);
    }

    // Validate assetClasses
    if (!Array.isArray(data.assetClasses) || data.assetClasses.length === 0) {
      throw new Error(`ETF ${ticker} must have at least one asset class`);
    }

    const assetClasses = data.assetClasses.map((ac: any, index: number) => {
      if (!ac.name || typeof ac.name !== 'string') {
        throw new Error(`Invalid asset class name at index ${index} for ETF ${ticker}`);
      }
      if (!ac.category || typeof ac.category !== 'string') {
        throw new Error(`Invalid asset class category at index ${index} for ETF ${ticker}`);
      }
      if (typeof ac.percentage !== 'number' || ac.percentage < 0 || ac.percentage > 100) {
        throw new Error(
          `Invalid asset class percentage at index ${index} for ETF ${ticker} (must be 0-100)`
        );
      }

      return {
        name: ac.name,
        category: ac.category,
        percentage: ac.percentage,
      };
    });

    // Validate asset class percentages sum to 100
    const totalPercentage = assetClasses.reduce(
      (sum: number, ac: {percentage: number}) => sum + ac.percentage,
      0
    );
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error(
        `Asset class percentages for ETF ${ticker} must sum to 100% (currently ${totalPercentage.toFixed(2)}%)`
      );
    }

    // Validate transactions
    if (!Array.isArray(data.transactions) || data.transactions.length === 0) {
      throw new Error(`ETF ${ticker} must have at least one transaction`);
    }

    const transactions = data.transactions.map((tx: any, index: number) => {
      if (!tx.date || typeof tx.date !== 'string') {
        throw new Error(`Invalid transaction date at index ${index} for ETF ${ticker}`);
      }

      // Validate date format (basic ISO 8601 check)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(tx.date)) {
        throw new Error(
          `Invalid date format at index ${index} for ETF ${ticker} (expected YYYY-MM-DD)`
        );
      }

      if (typeof tx.quantity !== 'number' || tx.quantity === 0) {
        throw new Error(
          `Invalid transaction quantity at index ${index} for ETF ${ticker} (must be non-zero number)`
        );
      }

      if (typeof tx.price !== 'number' || tx.price <= 0) {
        throw new Error(
          `Invalid transaction price at index ${index} for ETF ${ticker} (must be positive number)`
        );
      }

      return {
        date: tx.date,
        quantity: tx.quantity,
        price: tx.price,
      };
    });

    return {
      ticker,
      name: data.name,
      assetClasses,
      transactions,
    };
  }

  /**
   * Validate that portfolio references known asset categories
   * This is a business rule validation
   */
  validateAssetCategories(portfolio: Portfolio): void {
    const targetCategories = new Set(Object.keys(portfolio.targetAllocation));
    const usedCategories = new Set<string>();

    // Collect all categories used in ETFs
    Object.values(portfolio.etfs).forEach((etf) => {
      etf.assetClasses.forEach((ac) => {
        usedCategories.add(ac.category);
      });
    });

    // Check for categories in target allocation not used in ETFs
    const unusedTargets = Array.from(targetCategories).filter(
      (cat) => !usedCategories.has(cat)
    );
    if (unusedTargets.length > 0) {
      console.warn(
        `Warning: Target allocation includes categories not found in any ETF: ${unusedTargets.join(', ')}`
      );
    }

    // Check for categories in ETFs not in target allocation
    const missingTargets = Array.from(usedCategories).filter(
      (cat) => !targetCategories.has(cat)
    );
    if (missingTargets.length > 0) {
      throw new Error(
        `ETFs contain asset categories not defined in target allocation: ${missingTargets.join(', ')}`
      );
    }
  }
}

export const fileService = new FileService();
