# Architecture Document

**Product Name:** Personal ETF Portfolio Tracker  
**Version:** 1.0  
**Date:** 2025-11-30  
**Architect:** System Architect  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Architecture Overview
The Personal ETF Portfolio Tracker is a pure client-side single-page application (SPA) built with modern web technologies. The architecture emphasizes simplicity, privacy, and performance by eliminating backend dependencies and processing all data within the user's browser.

### 1.2 Key Architectural Decisions
1. **Pure Client-Side Architecture** - No backend server, all computation in browser
2. **Static Site Deployment** - Served via CDN (GitHub Pages, Netlify, Vercel)
3. **Local Data Storage** - Browser IndexedDB for caching
4. **External API Integration** - Alpha Vantage for real-time ETF prices
5. **Modern JavaScript Framework** - React with TypeScript for type safety
6. **Component-Based UI** - Modular, reusable components
7. **Responsive Design** - Mobile-first CSS approach

### 1.3 Architecture Goals
- **Privacy:** All data processing occurs client-side
- **Simplicity:** Minimal dependencies, straightforward deployment
- **Performance:** Fast load times, smooth interactions
- **Maintainability:** Clean code structure, testable components
- **Extensibility:** Easy to add features without major refactoring

---

## 2. System Context

### 2.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    User's Browser                       │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │     Personal ETF Portfolio Tracker SPA           │ │
│  │                                                   │ │
│  │  • Parse YAML portfolio file                     │ │
│  │  • Fetch ETF prices from API                     │ │
│  │  • Calculate portfolio metrics                   │ │
│  │  • Render dashboard UI                           │ │
│  │  • Cache data locally                            │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
           │                           │
           │                           │
           ▼                           ▼
    ┌─────────────┐          ┌──────────────────┐
    │   Local     │          │  Alpha Vantage   │
    │   File      │          │  API (HTTPS)     │
    │   System    │          │                  │
    │   (YAML)    │          │  Real-time ETF   │
    └─────────────┘          │  price data      │
                             └──────────────────┘
```

### 2.2 External Dependencies

| System | Type | Purpose | Protocol | Authentication |
|--------|------|---------|----------|----------------|
| User's File System | Data Source | Portfolio YAML file | File API | None |
| Alpha Vantage API | External Service | Real-time ETF prices | HTTPS/REST | API Key |
| CDN/Static Host | Deployment | Serve application files | HTTPS | None |

---

## 3. High-Level Architecture

### 3.1 Logical Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                     │
│  (React Components, UI State Management)                │
│                                                         │
│  • Dashboard Views                                      │
│  • Charts & Visualizations                              │
│  • Theme Management                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                      │
│  (Business Logic, State Management)                     │
│                                                         │
│  • Portfolio Calculations                               │
│  • Rebalancing Logic                                    │
│  • Data Validation                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                     │
│  (API Clients, Cache Management, File Parsing)          │
│                                                         │
│  • YAML Parser                                          │
│  • Price API Client                                     │
│  • Cache Service (IndexedDB)                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                   │
│  (Browser APIs, External Services)                      │
│                                                         │
│  • File API                                             │
│  • Fetch API                                            │
│  • Storage API                                          │
│  • Alpha Vantage API                                    │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Component Architecture

```
src/
├── components/           # React Components (Presentation Layer)
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   └── separator.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── AppContainer.tsx
│   │   └── ErrorBoundary.tsx
│   ├── portfolio/
│   │   ├── PortfolioValueCard.tsx
│   │   ├── RebalancingStatusCard.tsx
│   │   ├── AssetAllocationChart.tsx
│   │   └── HoldingsTable.tsx
│   └── states/
│       ├── EmptyState.tsx
│       └── LoadingState.tsx
│
├── services/             # Business Logic & Data Access
│   ├── portfolioService.ts      # Portfolio calculations
│   ├── rebalancingService.ts    # Rebalancing logic
│   ├── priceService.ts          # API client for prices
│   ├── cacheService.ts          # Cache management
│   ├── fileService.ts           # YAML file parsing
│   └── validationService.ts     # Data validation
│
├── hooks/                # Custom React Hooks
│   ├── usePortfolio.ts          # Portfolio state management
│   ├── usePrices.ts             # Price fetching & caching
│   ├── useTheme.ts              # Theme management
│   └── useFileUpload.ts         # File upload handling
│
├── store/                # Global State Management (Zustand)
│   ├── portfolioStore.ts        # Portfolio data state
│   ├── priceStore.ts            # Price data state
│   └── uiStore.ts               # UI state (theme, modals)
│
├── types/                # TypeScript Type Definitions
│   ├── portfolio.types.ts
│   ├── api.types.ts
│   └── ui.types.ts
│
├── utils/                # Utility Functions
│   ├── formatters.ts            # Number/date formatting
│   ├── calculations.ts          # Math utilities
│   └── validators.ts            # Validation helpers
│
├── config/               # Configuration
│   ├── api.config.ts            # API endpoints, keys
│   ├── app.config.ts            # App constants
│   └── theme.config.ts          # Design system tokens
│
├── styles/               # Global Styles
│   ├── globals.css
│   ├── variables.css            # CSS custom properties
│   └── themes.css               # Light/dark themes
│
└── App.tsx               # Root component
```

---

## 4. Detailed Component Design

### 4.1 Data Models

#### 4.1.1 Portfolio Data Model

```typescript
// types/portfolio.types.ts

interface Portfolio {
  name?: string;
  targetAllocation: Record<string, number>; // category -> percentage
  etfs: Record<string, ETF>;
}

interface ETF {
  ticker: string;
  name: string;
  assetClasses: AssetClass[];
  transactions: Transaction[];
}

interface AssetClass {
  name: string;          // e.g., "US Large Cap"
  category: string;      // e.g., "Stocks"
  percentage: number;    // e.g., 60 (means 60%)
}

interface Transaction {
  date: string;          // ISO 8601: "2024-01-15"
  quantity: number;      // positive = buy, negative = sell
  price: number;         // price per unit in portfolio currency
}

// Computed/Derived Models

interface Holdings {
  [ticker: string]: {
    quantity: number;
    costBasis: number;    // weighted average cost per share
    totalCost: number;    // total amount invested
  };
}

interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  currentAllocation: Record<string, number>; // category -> percentage
  holdingsByETF: HoldingDetail[];
}

interface HoldingDetail {
  ticker: string;
  name: string;
  quantity: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface RebalancingStatus {
  status: 'in-balance' | 'monitor' | 'rebalance';
  maxDrift: number;
  driftThreshold: number;
  categoryDrifts: CategoryDrift[];
}

interface CategoryDrift {
  category: string;
  currentPercent: number;
  targetPercent: number;
  drift: number;         // signed difference
  absDrift: number;      // absolute difference
}
```

#### 4.1.2 Price Data Model

```typescript
// types/api.types.ts

interface PriceData {
  ticker: string;
  price: number;
  timestamp: number;     // Unix timestamp
  currency: string;      // e.g., "EUR", "USD"
  source: 'api' | 'cache';
}

interface PriceCache {
  [ticker: string]: {
    price: number;
    timestamp: number;
    expiresAt: number;
  };
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}
```

### 4.2 Service Layer Design

#### 4.2.1 File Service

```typescript
// services/fileService.ts

class FileService {
  /**
   * Parse YAML file and convert to Portfolio object
   */
  async parsePortfolioFile(file: File): Promise<Portfolio> {
    const text = await file.text();
    const data = YAML.parse(text);
    
    // Validate structure
    this.validatePortfolioData(data);
    
    return data as Portfolio;
  }

  /**
   * Validate portfolio data structure and content
   */
  private validatePortfolioData(data: unknown): void {
    // Check required fields
    if (!data.targetAllocation) {
      throw new ValidationError('Missing targetAllocation');
    }
    if (!data.etfs || Object.keys(data.etfs).length === 0) {
      throw new ValidationError('No ETFs defined');
    }

    // Validate target allocation sums to 100%
    const allocationSum = Object.values(data.targetAllocation).reduce(
      (sum: number, value: any) => sum + value,
      0
    );
    if (Math.abs(allocationSum - 100) > 0.01) {
      throw new ValidationError(
        `Target allocation sums to ${allocationSum}%, must equal 100%`
      );
    }

    // Validate each ETF
    for (const [ticker, etf] of Object.entries(data.etfs)) {
      this.validateETF(ticker, etf);
    }
  }

  private validateETF(ticker: string, etf: any): void {
    // Validate asset class percentages sum to 100
    const sum = etf.assetClasses.reduce(
      (acc: number, ac: any) => acc + ac.percentage, 
      0
    );
    if (Math.abs(sum - 100) > 0.01) {
      throw new ValidationError(
        `ETF ${ticker}: Asset classes sum to ${sum}%, must equal 100%`
      );
    }

    // Validate transactions
    let totalQuantity = 0;
    for (const tx of etf.transactions) {
      if (!this.isValidDate(tx.date)) {
        throw new ValidationError(
          `ETF ${ticker}: Invalid date format "${tx.date}"`
        );
      }
      if (typeof tx.quantity !== 'number' || typeof tx.price !== 'number') {
        throw new ValidationError(
          `ETF ${ticker}: Invalid quantity or price`
        );
      }
      totalQuantity += tx.quantity;
    }

    // Validate that total quantity is not negative (can't sell more than owned)
    if (totalQuantity < 0) {
      throw new ValidationError(
        `ETF ${ticker}: Total quantity is negative (${totalQuantity}). Cannot sell more shares than owned.`
      );
    }
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
```

#### 4.2.2 Price Service

```typescript
// services/priceService.ts

class PriceService {
  private apiKey: string;
  private baseUrl: string = 'https://www.alphavantage.co/query';
  private cacheService: CacheService;

  constructor(apiKey: string, cacheService: CacheService) {
    this.apiKey = apiKey;
    this.cacheService = cacheService;
  }

  /**
   * Fetch current prices for multiple tickers
   */
  async fetchPrices(tickers: string[]): Promise<Map<string, PriceData>> {
    const prices = new Map<string, PriceData>();
    const tickersToFetch: string[] = [];

    // Check cache first
    for (const ticker of tickers) {
      const cached = await this.cacheService.getPrice(ticker);
      if (cached && !this.isCacheExpired(cached)) {
        prices.set(ticker, {
          ticker,
          price: cached.price,
          timestamp: cached.timestamp,
          currency: 'EUR', // TODO: Support multiple currencies
          source: 'cache'
        });
      } else {
        tickersToFetch.push(ticker);
      }
    }

    // Fetch missing prices from API
    if (tickersToFetch.length > 0) {
      const fetchedPrices = await this.fetchFromAPI(tickersToFetch);
      
      for (const [ticker, priceData] of fetchedPrices) {
        prices.set(ticker, priceData);
        // Cache the new price
        await this.cacheService.setPrice(ticker, {
          price: priceData.price,
          timestamp: priceData.timestamp,
          expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
        });
      }
    }

    return prices;
  }

  /**
   * Fetch prices from Alpha Vantage API
   */
  private async fetchFromAPI(
    tickers: string[]
  ): Promise<Map<string, PriceData>> {
    const prices = new Map<string, PriceData>();

    // Alpha Vantage rate limit: 5 requests/minute for free tier
    // Process in batches with delays
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      
      try {
        const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${this.apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data['Global Quote'] && data['Global Quote']['05. price']) {
          const price = parseFloat(data['Global Quote']['05. price']);
          prices.set(ticker, {
            ticker,
            price,
            timestamp: Date.now(),
            currency: 'EUR',
            source: 'api'
          });
        } else {
          console.error(`No price data for ${ticker}`);
        }

        // Rate limiting: wait 12 seconds between requests (5 req/min)
        if (i < tickers.length - 1) {
          await this.delay(12000);
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${ticker}:`, error);
      }
    }

    return prices;
  }

  private isCacheExpired(cached: { expiresAt: number }): boolean {
    return Date.now() > cached.expiresAt;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manual refresh - bypass cache
   */
  async refreshPrices(tickers: string[]): Promise<Map<string, PriceData>> {
    // Clear cache for these tickers
    await Promise.all(tickers.map(ticker => this.cacheService.clearPrice(ticker)));
    
    // Fetch fresh data
    return this.fetchPrices(tickers);
  }
}
```

#### 4.2.3 Portfolio Service

```typescript
// services/portfolioService.ts

class PortfolioService {
  /**
   * Calculate current holdings from transaction history
   */
  calculateHoldings(portfolio: Portfolio): Holdings {
    const holdings: Holdings = {};

    for (const [ticker, etf] of Object.entries(portfolio.etfs)) {
      let totalQuantity = 0;
      let totalCost = 0;

      // Sum all transactions
      for (const tx of etf.transactions) {
        totalQuantity += tx.quantity;
        totalCost += tx.quantity * tx.price;
      }

      if (totalQuantity !== 0) {
        holdings[ticker] = {
          quantity: totalQuantity,
          costBasis: totalCost / totalQuantity,
          totalCost: totalCost
        };
      }
    }

    return holdings;
  }

  /**
   * Calculate portfolio metrics with current prices
   */
  calculateMetrics(
    portfolio: Portfolio,
    holdings: Holdings,
    prices: Map<string, PriceData>
  ): PortfolioMetrics {
    let totalValue = 0;
    let totalCost = 0;
    const holdingsByETF: HoldingDetail[] = [];

    // Calculate per-ETF metrics
    for (const [ticker, holding] of Object.entries(holdings)) {
      const priceData = prices.get(ticker);
      if (!priceData) continue;

      const currentValue = holding.quantity * priceData.price;
      const profitLoss = currentValue - holding.totalCost;
      const profitLossPercent = (profitLoss / holding.totalCost) * 100;

      totalValue += currentValue;
      totalCost += holding.totalCost;

      holdingsByETF.push({
        ticker,
        name: portfolio.etfs[ticker].name,
        quantity: holding.quantity,
        currentPrice: priceData.price,
        currentValue,
        costBasis: holding.costBasis,
        profitLoss,
        profitLossPercent
      });
    }

    // Sort by value descending
    holdingsByETF.sort((a, b) => b.currentValue - a.currentValue);

    // Calculate current allocation
    const currentAllocation = this.calculateCurrentAllocation(
      portfolio,
      holdingsByETF
    );

    return {
      totalValue,
      totalCost,
      totalProfitLoss: totalValue - totalCost,
      totalProfitLossPercent: ((totalValue - totalCost) / totalCost) * 100,
      currentAllocation,
      holdingsByETF
    };
  }

  /**
   * Calculate current asset class allocation
   */
  private calculateCurrentAllocation(
    portfolio: Portfolio,
    holdings: HoldingDetail[]
  ): Record<string, number> {
    const categoryValues: Record<string, number> = {};
    let totalValue = 0;

    // Calculate value per category
    for (const holding of holdings) {
      const etf = portfolio.etfs[holding.ticker];
      
      for (const assetClass of etf.assetClasses) {
        const valueInClass = holding.currentValue * (assetClass.percentage / 100);
        categoryValues[assetClass.category] = 
          (categoryValues[assetClass.category] || 0) + valueInClass;
        totalValue += valueInClass;
      }
    }

    // Convert to percentages
    const allocation: Record<string, number> = {};
    for (const [category, value] of Object.entries(categoryValues)) {
      allocation[category] = (value / totalValue) * 100;
    }

    return allocation;
  }
}
```

#### 4.2.4 Rebalancing Service

```typescript
// services/rebalancingService.ts

class RebalancingService {
  private driftThreshold: number = 5.0; // 5% default

  /**
   * Analyze portfolio for rebalancing needs
   */
  analyzeRebalancing(
    targetAllocation: Record<string, number>,
    currentAllocation: Record<string, number>
  ): RebalancingStatus {
    const categoryDrifts: CategoryDrift[] = [];
    let maxDrift = 0;

    // Calculate drift for each category
    for (const [category, target] of Object.entries(targetAllocation)) {
      const current = currentAllocation[category] || 0;
      const drift = current - target;
      const absDrift = Math.abs(drift);

      categoryDrifts.push({
        category,
        currentPercent: current,
        targetPercent: target,
        drift,
        absDrift
      });

      maxDrift = Math.max(maxDrift, absDrift);
    }

    // Sort by absolute drift descending
    categoryDrifts.sort((a, b) => b.absDrift - a.absDrift);

    // Determine status
    let status: 'in-balance' | 'monitor' | 'rebalance';
    if (maxDrift < this.driftThreshold) {
      status = 'in-balance';
    } else if (maxDrift < this.driftThreshold * 2) {
      status = 'monitor';
    } else {
      status = 'rebalance';
    }

    return {
      status,
      maxDrift,
      driftThreshold: this.driftThreshold,
      categoryDrifts
    };
  }

  /**
   * Set custom drift threshold
   */
  setDriftThreshold(threshold: number): void {
    this.driftThreshold = threshold;
  }
}
```

#### 4.2.5 Cache Service

```typescript
// services/cacheService.ts

class CacheService {
  private readonly DB_NAME = 'PortfolioCacheDB';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'prices';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const objectStore = db.createObjectStore(this.STORE_NAME, { keyPath: 'ticker' });
          objectStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  /**
   * Ensure DB is ready
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('IndexedDB not available');
    }
    return this.db;
  }

  /**
   * Get cached price for ticker
   */
  async getPrice(ticker: string): Promise<{ price: number; timestamp: number; expiresAt: number } | null> {
    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(ticker);

        request.onsuccess = () => {
          const result = request.result;
          if (result && result.expiresAt > Date.now()) {
            resolve({
              price: result.price,
              timestamp: result.timestamp,
              expiresAt: result.expiresAt
            });
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error('Cache read error:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  /**
   * Cache price for ticker
   */
  async setPrice(ticker: string, data: { price: number; timestamp: number; expiresAt: number }): Promise<void> {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put({
          ticker,
          price: data.price,
          timestamp: data.timestamp,
          expiresAt: data.expiresAt
        });

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Cache write error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  /**
   * Clear cached price for ticker
   */
  async clearPrice(ticker: string): Promise<void> {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(ticker);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Cache delete error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all expired prices from cache
   */
  async clearExpiredPrices(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const now = Date.now();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('expiresAt');
        const range = IDBKeyRange.upperBound(now);
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => {
          console.error('Clear expired error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Clear expired error:', error);
    }
  }

  /**
   * Clear all cached prices
   */
  async clearAllPrices(): Promise<void> {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Clear all error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Clear all error:', error);
    }
  }
}
```

### 4.3 State Management

#### 4.3.1 Portfolio Store (Zustand)

```typescript
// store/portfolioStore.ts

interface PortfolioState {
  // Data
  portfolio: Portfolio | null;
  holdings: Holdings | null;
  metrics: PortfolioMetrics | null;
  rebalancingStatus: RebalancingStatus | null;
  
  // Loading states
  isLoading: boolean;
  isFetchingPrices: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  loadPortfolio: (file: File) => Promise<void>;
  refreshPrices: () => Promise<void>;
  clearPortfolio: () => void;
}

const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: null,
  holdings: null,
  metrics: null,
  rebalancingStatus: null,
  isLoading: false,
  isFetchingPrices: false,
  error: null,

  loadPortfolio: async (file: File) => {
    set({ isLoading: true, error: null });
    
    try {
      // Parse file
      const fileService = new FileService();
      const portfolio = await fileService.parsePortfolioFile(file);
      
      // Calculate holdings
      const portfolioService = new PortfolioService();
      const holdings = portfolioService.calculateHoldings(portfolio);
      
      // Fetch prices
      const priceService = new PriceService(API_KEY, new CacheService());
      const tickers = Object.keys(holdings);
      const prices = await priceService.fetchPrices(tickers);
      
      // Calculate metrics
      const metrics = portfolioService.calculateMetrics(
        portfolio,
        holdings,
        prices
      );
      
      // Analyze rebalancing
      const rebalancingService = new RebalancingService();
      const rebalancingStatus = rebalancingService.analyzeRebalancing(
        portfolio.targetAllocation,
        metrics.currentAllocation
      );
      
      set({
        portfolio,
        holdings,
        metrics,
        rebalancingStatus,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  },

  refreshPrices: async () => {
    const { portfolio, holdings } = get();
    if (!portfolio || !holdings) return;
    
    set({ isFetchingPrices: true });
    
    try {
      const priceService = new PriceService(API_KEY, new CacheService());
      const tickers = Object.keys(holdings);
      const prices = await priceService.refreshPrices(tickers);
      
      const portfolioService = new PortfolioService();
      const metrics = portfolioService.calculateMetrics(
        portfolio,
        holdings,
        prices
      );
      
      const rebalancingService = new RebalancingService();
      const rebalancingStatus = rebalancingService.analyzeRebalancing(
        portfolio.targetAllocation,
        metrics.currentAllocation
      );
      
      set({
        metrics,
        rebalancingStatus,
        isFetchingPrices: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh prices',
        isFetchingPrices: false
      });
    }
  },

  clearPortfolio: () => {
    set({
      portfolio: null,
      holdings: null,
      metrics: null,
      rebalancingStatus: null,
      error: null
    });
  }
}));
```

#### 4.3.2 UI Store (Theme, Modals)

```typescript
// store/uiStore.ts

interface UIState {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  
  isRebalancingExpanded: boolean;
  toggleRebalancingExpanded: () => void;
  
  isHoldingsCollapsed: boolean;
  toggleHoldingsCollapsed: () => void;
}

const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('theme') as any) || 'auto',
  
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
    applyTheme(theme);
  },
  
  isRebalancingExpanded: false,
  toggleRebalancingExpanded: () => 
    set(state => ({ isRebalancingExpanded: !state.isRebalancingExpanded })),
  
  isHoldingsCollapsed: false,
  toggleHoldingsCollapsed: () =>
    set(state => ({ isHoldingsCollapsed: !state.isHoldingsCollapsed }))
}));

function applyTheme(theme: 'light' | 'dark' | 'auto') {
  const root = document.documentElement;
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}
```

---

## 5. Technology Stack

### 5.1 Core Technologies

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Framework | React | 18.x | Industry standard, large ecosystem, excellent TypeScript support |
| Language | TypeScript | 5.x | Type safety, better DX, fewer runtime errors |
| Build Tool | Vite | 5.x | Fast dev server, optimized production builds |
| State Management | Zustand | 4.x | Lightweight, simple API, no boilerplate |
| Styling | Tailwind CSS | 3.x | Utility-first, responsive, consistent design system |
| UI Components | shadcn/ui | Latest | Accessible, customizable components built on Radix UI |
| Data Parsing | js-yaml | 4.x | Well-maintained YAML parser for JavaScript |
| Charts | shadcn/ui charts | Latest | Built on Recharts, fully integrated with shadcn/ui design system |

### 5.2 Development Tools

| Tool | Purpose |CacheService
|------|---------|
| ESLint | Code linting and style enforcement |
| Prettier | Code formatting |
| Vitest | Unit testing framework |
| React Testing Library | Component testing |
| TypeScript | Type checking |
| Git | Version control |

### 5.3 Deployment Stack

| Service | Purpose | Cost |
|---------|---------|------|
| GitHub Pages | Static site hosting | Free |
| Netlify (alternative) | Static site hosting with CI/CD | Free tier available |
| Vercel (alternative) | Static site hosting with edge functions | Free tier available |

---

## 6. API Integration Design

### 6.1 Alpha Vantage API Integration

**Endpoint:** `https://www.alphavantage.co/query`

**Function:** `GLOBAL_QUOTE` - Get real-time quote

**Request Example:**
```
GET https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=VWCE&apikey=YOUR_API_KEY
```

**Response Example:**
```json
{
  "Global Quote": {
    "01. symbol": "VWCE",
    "02. open": "95.2000",
    "03. high": "95.8000",
    "04. low": "94.9000",
    "05. price": "95.4500",
    "06. volume": "1234567",
    "07. latest trading day": "2025-11-29",
    "08. previous close": "95.1000",
    "09. change": "0.3500",
    "10. change percent": "0.3682%"
  }
}
```

**Rate Limits:**
- Free tier: 5 API requests per minute, 500 per day
- Premium tier: 75 requests per minute, 150,000 per day

**Mitigation Strategies:**
1. Aggressive caching (15-minute TTL)
2. Batch requests with delays (12 seconds between)
3. Queue system for large portfolios
4. Graceful degradation with cached data

### 6.2 API Configuration

```typescript
// config/api.config.ts

export const API_CONFIG = {
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
    API_KEY: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 5,
      DELAY_BETWEEN_REQUESTS: 12000 // milliseconds
    },
    TIMEOUT: 10000 // 10 seconds
  },
  CACHE: {
    TTL: 15 * 60 * 1000, // 15 minutes
    MAX_AGE: 24 * 60 * 60 * 1000 // 24 hours
  }
};
```

---

## 7. Data Flow Diagrams

### 7.1 Portfolio Loading Flow

```
User                    App                     FileService         PriceService        PortfolioService
 │                       │                           │                   │                    │
 │  Select File          │                           │                   │                    │
 ├──────────────────────>│                           │                   │                    │
 │                       │  Parse File               │                   │                    │
 │                       ├──────────────────────────>│                   │                    │
 │                       │                           │  Validate         │                    │
 │                       │                           ├──────────────┐    │                    │
 │                       │                           │              │    │                    │
 │                       │                           │<─────────────┘    │                    │
 │                       │  Portfolio Object         │                   │                    │
 │                       │<──────────────────────────┤                   │                    │
 │                       │                           │                   │                    │
 │                       │  Calculate Holdings       │                   │                    │
 │                       ├───────────────────────────┼───────────────────┼───────────────────>│
 │                       │                           │                   │  Holdings Object   │
 │                       │<──────────────────────────┼───────────────────┼────────────────────┤
 │                       │                           │                   │                    │
 │                       │  Fetch Prices             │                   │                    │
 │                       ├───────────────────────────┼──────────────────>│                    │
 │                       │                           │  Check Cache      │                    │
 │                       │                           │<──────────────────┤                    │
 │                       │                           │  Fetch from API   │                    │
 │                       │                           │──────────────────>│                    │
 │                       │                           │  Price Data       │                    │
 │                       │<──────────────────────────┼───────────────────┤                    │
 │                       │                           │                   │                    │
 │                       │  Calculate Metrics        │                   │                    │
 │                       ├───────────────────────────┼───────────────────┼───────────────────>│
 │                       │                           │                   │  Metrics Object    │
 │                       │<──────────────────────────┼───────────────────┼────────────────────┤
 │                       │                           │                   │                    │
 │  Display Dashboard    │                           │                   │                    │
 │<──────────────────────┤                           │                   │                    │
```

### 7.2 Price Refresh Flow

```
User            App             PriceService      CacheService      Alpha Vantage API
 │               │                    │                 │                    │
 │  Click Refresh│                    │                 │                    │
 ├──────────────>│                    │                 │                    │
 │               │  Clear Cache       │                 │                    │
 │               ├───────────────────>│────────────────>│                    │
 │               │                    │                 │                    │
 │               │  Fetch Prices      │                 │                    │
 │               ├───────────────────>│                 │                    │
 │               │                    │  API Request    │                    │
 │               │                    ├─────────────────┼───────────────────>│
 │               │                    │                 │  Price Response    │
 │               │                    │<────────────────┼────────────────────┤
 │               │                    │  Cache Price    │                    │
 │               │                    ├────────────────>│                    │
 │               │  Price Data        │                 │                    │
 │               │<───────────────────┤                 │                    │
 │               │                    │                 │                    │
 │               │  Recalculate       │                 │                    │
 │               ├──────────────┐     │                 │                    │
 │               │              │     │                 │                    │
 │               │<─────────────┘     │                 │                    │
 │  Update UI    │                    │                 │                    │
 │<──────────────┤                    │                 │                    │
```

---

## 8. Security Considerations

### 8.1 Threat Model

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| XSS attacks | High | Low | React auto-escaping, no dangerouslySetInnerHTML |
| API key exposure | Medium | Medium | Environment variables, not in code |
| Man-in-the-middle | Medium | Low | HTTPS only for API calls |
| Local storage tampering | Low | Medium | No sensitive data stored, validation on load |
| Malicious YAML files | Medium | Low | Input validation, try-catch blocks |

### 8.2 Security Best Practices

1. **API Key Management**
   - Store in environment variable: `VITE_ALPHA_VANTAGE_API_KEY`
   - Never commit to Git (use `.env.local`)
   - For public deployments, consider proxy service

2. **Input Validation**
   - Validate all YAML input before processing
   - Sanitize user-provided data
   - Limit file size (10MB max)

3. **HTTPS Enforcement**
   - All external API calls over HTTPS
   - Deploy app on HTTPS-enabled host
   - Set Content Security Policy headers

4. **Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' https://www.alphavantage.co;">
```

---

## 9. Performance Optimization

### 9.1 Load Time Optimization

**Strategies:**
1. **Code Splitting**
   - Lazy load chart components
   - Split vendor bundles
   - Dynamic imports for large dependencies

2. **Asset Optimization**
   - Minify JavaScript and CSS
   - Compress images (if any)
   - Use modern image formats (WebP)

3. **Caching Strategy**
   - Service Worker for offline support (Phase 2)
   - Aggressive price caching
   - Browser cache headers

**Target Metrics:**
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Bundle size: <200KB gzipped

### 9.2 Runtime Performance

**Strategies:**
1. **React Optimization**
   - Use React.memo for expensive components
   - useMemo for expensive calculations
   - useCallback for stable function references
   - Virtual scrolling for large holdings lists

2. **Calculation Optimization**
   - Memoize portfolio calculations
   - Debounce/throttle event handlers
   - Web Workers for heavy computations (future)

3. **Rendering Optimization**
   - CSS transforms for animations (GPU-accelerated)
   - Avoid layout thrashing
   - Batch DOM updates

**Target Metrics:**
- Dashboard render: <500ms
- Interaction response: <100ms
- 60fps animations

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
                    E2E Tests (10%)
                  /              \
              Integration Tests (30%)
            /                      \
        Unit Tests (60%)
```

### 10.2 Unit Testing

**Test Coverage Targets:**
- Services: 90%+ coverage
- Utilities: 90%+ coverage
- Components: 70%+ coverage

**Example Test:**
```typescript
// services/__tests__/portfolioService.test.ts

describe('PortfolioService', () => {
  describe('calculateHoldings', () => {
    it('should calculate correct holdings from transactions', () => {
      const portfolio: Portfolio = {
        targetAllocation: { Stocks: 100 },
        etfs: {
          VWCE: {
            ticker: 'VWCE',
            name: 'Vanguard FTSE All-World',
            assetClasses: [{ name: 'Global Stocks', category: 'Stocks', percentage: 100 }],
            transactions: [
              { date: '2024-01-01', quantity: 10, price: 95.0 },
              { date: '2024-06-01', quantity: 5, price: 100.0 }
            ]
          }
        }
      };

      const service = new PortfolioService();
      const holdings = service.calculateHoldings(portfolio);

      expect(holdings.VWCE.quantity).toBe(15);
      expect(holdings.VWCE.totalCost).toBe(1450);
      expect(holdings.VWCE.costBasis).toBeCloseTo(96.67, 2);
    });

    it('should handle sell transactions (negative quantity)', () => {
      const portfolio: Portfolio = {
        targetAllocation: { Stocks: 100 },
        etfs: {
          VWCE: {
            ticker: 'VWCE',
            name: 'Vanguard FTSE All-World',
            assetClasses: [{ name: 'Global Stocks', category: 'Stocks', percentage: 100 }],
            transactions: [
              { date: '2024-01-01', quantity: 10, price: 95.0 },
              { date: '2024-06-01', quantity: -3, price: 105.0 }
            ]
          }
        }
      };

      const service = new PortfolioService();
      const holdings = service.calculateHoldings(portfolio);

      expect(holdings.VWCE.quantity).toBe(7);
      expect(holdings.VWCE.totalCost).toBe(635); // 950 - 315
    });
  });
});
```

### 10.3 Component Testing

**Example Test:**
```typescript
// components/__tests__/PortfolioValueCard.test.tsx

describe('PortfolioValueCard', () => {
  it('should display portfolio value correctly', () => {
    const metrics: PortfolioMetrics = {
      totalValue: 127543.82,
      totalCost: 115000,
      totalProfitLoss: 12543.82,
      totalProfitLossPercent: 10.9,
      currentAllocation: {},
      holdingsByETF: []
    };

    render(<PortfolioValueCard metrics={metrics} />);

    expect(screen.getByText('€127,543.82')).toBeInTheDocument();
    expect(screen.getByText('+€12,543.82 (+10.9%)')).toBeInTheDocument();
  });

  it('should show loss in red color', () => {
    const metrics: PortfolioMetrics = {
      totalValue: 95000,
      totalCost: 100000,
      totalProfitLoss: -5000,
      totalProfitLossPercent: -5.0,
      currentAllocation: {},
      holdingsByETF: []
    };

    render(<PortfolioValueCard metrics={metrics} />);

    const plElement = screen.getByText('-€5,000.00 (-5.0%)');
    expect(plElement).toHaveClass('text-red-600');
  });
});
```

### 10.4 Integration Testing

Focus on critical user flows:
1. Load portfolio file → Display dashboard
2. Refresh prices → Update values
3. Toggle theme → Apply theme
4. Error handling → Display error message

### 10.5 E2E Testing (Future Phase)

Tools: Playwright or Cypress

**Critical Paths:**
1. Complete portfolio loading flow
2. Price refresh with cache
3. Responsive design across devices
4. Error recovery flows

---

## 11. Deployment Architecture

### 11.1 Build Process

```
Source Code (TypeScript + React)
          ↓
    TypeScript Compilation
          ↓
    Vite Build (Production)
          ↓
    Bundle Optimization
    • Tree shaking
    • Minification
    • Code splitting
          ↓
    Static Files (dist/)
    • index.html
    • assets/js/*.js
    • assets/css/*.css
          ↓
    Deploy to CDN/Static Host
```

### 11.2 Deployment Options

#### Option 1: GitHub Pages (Recommended for MVP)

**Pros:**
- Free hosting
- Automatic deployment via GitHub Actions
- Custom domain support
- HTTPS by default

**Cons:**
- Public repository required (or paid GitHub)
- No server-side logic
- Limited to static content

**Setup:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_ALPHA_VANTAGE_API_KEY: ${{ secrets.ALPHA_VANTAGE_API_KEY }}
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Option 2: Netlify

**Pros:**
- Free tier available
- Automatic HTTPS
- Preview deployments for PRs
- Environment variable management
- Edge functions (future use)

**Cons:**
- Build minutes limited on free tier

**Configuration:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### Option 3: Vercel

**Pros:**
- Excellent DX
- Fast edge network
- Preview deployments
- Serverless functions (future use)

**Cons:**
- Commercial usage restrictions on free tier

### 11.3 Environment Configuration

```bash
# .env.example
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
VITE_API_TIMEOUT=10000
VITE_CACHE_TTL=900000
```

**Important:** Never commit `.env` files. Use `.env.example` as template.

---

## 12. Monitoring & Observability

### 12.1 Error Tracking

**Strategy:** Client-side error logging

**Options:**
1. **Sentry** (recommended)
   - Free tier for small projects
   - Source map support
   - User session replay

2. **LogRocket**
   - Session replay
   - Performance monitoring

**Implementation:**
```typescript
// utils/errorTracking.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 0.1, // 10% of transactions
});
```

### 12.2 Analytics (Optional)

**Privacy-Friendly Options:**
1. **Plausible** - Privacy-focused, GDPR compliant
2. **Umami** - Self-hosted, lightweight
3. **None** - Respect user privacy completely

**Decision:** Consider user preference. If implemented, make it opt-in.

### 12.3 Performance Monitoring

**Web Vitals:**
```typescript
// utils/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  console.log(metric); // Or send to analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 13. Scalability & Future Considerations

### 13.1 Current Limitations

| Aspect | Current Limit | Mitigation |
|--------|--------------|------------|
| ETF Tickers | ~50 | Alpha Vantage rate limits |
| Transactions per ETF | ~1000 | Client-side processing capacity |
| Portfolio File Size | 10MB | Browser memory constraints |
| API Requests | 5/min (free tier) | Aggressive caching, request queuing |

### 13.2 Scaling Strategies

**If User Base Grows:**

1. **Backend API Layer** (Phase 3+)
   - Proxy for Alpha Vantage requests
   - Server-side caching (Redis)
   - Rate limit pooling across users
   - Support premium API tier

2. **Database Layer** (Phase 3+)
   - Store historical price data
   - User accounts (optional)
   - Portfolio sync across devices

3. **Advanced Caching**
   - Service Worker for offline-first
   - IndexedDB for large datasets
   - Background sync for price updates

### 13.3 Alternative API Providers

**Research for Future:**
- Yahoo Finance API (free, less reliable)
- IEX Cloud (reasonable pricing)
- Finnhub (good free tier)
- Polygon.io (enterprise-grade)

---

## 14. Development Roadmap

### 14.1 Phase 1: MVP (Current Scope)

**Timeline:** 4-6 weeks

**Deliverables:**
- Portfolio YAML loading
- Real-time price fetching
- Dashboard with metrics
- Rebalancing alerts
- Responsive design
- Theme support

### 14.2 Phase 2: Enhancements

**Timeline:** 2-3 weeks

**Features:**
- Historical portfolio value chart
- Individual ETF detail view
- Enhanced error handling
- Performance optimizations
- Comprehensive testing

### 14.3 Phase 3: Advanced Features

**Timeline:** 4-6 weeks

**Features:**
- Multiple portfolio management
- Backend API proxy
- User accounts (optional)
- Export functionality
- Advanced visualizations

---

## 15. Risk Assessment

### 15.1 Technical Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| Alpha Vantage API deprecation | High | Low | Abstract API layer for easy swapping |
| Rate limit exceeded | Medium | Medium | Aggressive caching, user education |
| Browser compatibility issues | Medium | Low | Polyfills, thorough testing |
| Performance with large portfolios | Low | Low | Virtual scrolling, lazy loading |
| API key exposure | Medium | Medium | Environment variables, proxy option |

### 15.2 Non-Technical Risks

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| User confusion with YAML | Medium | Medium | Clear documentation, examples |
| Low adoption | Low | Medium | Good UX, marketing |
| Competition | Low | Low | Focus on privacy, simplicity |

---

## 16. Documentation Requirements

### 16.1 Technical Documentation

- [ ] API documentation (services, utilities)
- [ ] Component library (Storybook)
- [ ] Architecture decision records (ADRs)
- [ ] Contributing guidelines
- [ ] Code style guide

### 16.2 User Documentation

- [ ] README with quick start
- [ ] YAML schema documentation
- [ ] Example portfolio files
- [ ] FAQ section
- [ ] Troubleshooting guide

---

## 17. Acceptance Criteria

### 17.1 Technical Acceptance

- [ ] All unit tests pass (>80% coverage)
- [ ] No critical accessibility issues
- [ ] Lighthouse score >90 (Performance, Accessibility, Best Practices)
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Responsive on mobile, tablet, desktop
- [ ] Handles errors gracefully

### 17.2 Functional Acceptance

- [ ] User can load valid YAML file
- [ ] Dashboard displays correct metrics
- [ ] Prices update from API
- [ ] Rebalancing alerts show correctly
- [ ] Theme toggle works
- [ ] Caching reduces API calls

---

## 18. Open Architecture Questions

1. **API Key Distribution:** Embed in app or user-provided? (Recommend: Embed for MVP)
3. **State Management:** Zustand vs Redux vs Context? (Recommend: Zustand for simplicity)
4. **Testing Framework:** Vitest vs Jest? (Recommend: Vitest for Vite integration)
5. **Currency Support:** Single currency or multi-currency? (Recommend: Single for MVP)
6. **Offline Support:** Service Worker in MVP or Phase 2? (Recommend: Phase 2)

---

## 19. Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Architect | [To be filled] | | |
| Tech Lead | [To be filled] | | |
| Product Manager | [To be filled] | | |
| Security Engineer | [To be filled] | | |
| Stakeholder | Fra | | |

---

**Document History:**
- 2025-11-30: Initial draft (v1.0)
