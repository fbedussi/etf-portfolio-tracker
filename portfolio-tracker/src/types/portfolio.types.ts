// Core Portfolio Data Models

export interface Portfolio {
  name?: string;
  targetAllocation: Record<string, number>; // category -> percentage
  etfs: Record<string, ETF>;
}

export interface ETF {
  ticker: string;
  name: string;
  assetClasses: AssetClass[];
  transactions: Transaction[];
}

export interface AssetClass {
  name: string; // e.g., "US Large Cap"
  category: string; // e.g., "Stocks"
  percentage: number; // e.g., 60 (means 60%)
}

export interface Transaction {
  date: string; // ISO 8601: "2024-01-15"
  quantity: number; // positive = buy, negative = sell
  price: number; // price per unit in portfolio currency
}

// Computed/Derived Models

export interface Holdings {
  [ticker: string]: {
    quantity: number;
    costBasis: number; // weighted average cost per share
    totalCost: number; // total amount invested
  };
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  currentAllocation: Record<string, number>; // category -> percentage
  holdingsByETF: HoldingDetail[];
}

export interface HoldingDetail {
  ticker: string;
  name: string;
  quantity: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface RebalancingStatus {
  status: 'in-balance' | 'monitor' | 'rebalance';
  maxDrift: number;
  driftThreshold: number;
  categoryDrifts: CategoryDrift[];
}

export interface CategoryDrift {
  category: string;
  currentPercent: number;
  targetPercent: number;
  drift: number; // signed difference
  absDrift: number; // absolute difference
}
