# Epics and User Stories

**Product Name:** Personal ETF Portfolio Tracker  
**Version:** 1.0  
**Date:** 2025-11-30  
**Status:** Ready for Implementation

---

## Overview

This document breaks down the Portfolio Tracker PRD into implementable epics and user stories. Each epic represents a major feature area, and stories are sized to be completed within a sprint.

**Story Point Estimation Guide:**
- **1 point:** Simple component or utility (< 4 hours)
- **2 points:** Standard component with logic (4-8 hours)
- **3 points:** Complex component or service (1-2 days)
- **5 points:** Major feature or integration (2-3 days)
- **8 points:** Large epic-level work (3-5 days)

---

## Epic Summary

| Epic ID | Epic Name | Priority | Story Count | Total Points |
|---------|-----------|----------|-------------|--------------|
| E1 | Project Foundation & Setup | P0 | 6 | 13 |
| E2 | Portfolio Data Management | P0 | 8 | 21 |
| E3 | ETF Price Integration | P0 | 7 | 18 |
| E4 | Portfolio Calculations Engine | P0 | 6 | 16 |
| E5 | Dashboard UI - Core Views | P0 | 9 | 24 |
| E6 | Rebalancing Analysis | P0 | 5 | 13 |
| E7 | Responsive & Theme Support | P1 | 5 | 13 |
| E8 | Error Handling & Offline Mode | P1 | 6 | 15 |
| **Total** | | | **52** | **133** |

---

## Epic 1: Project Foundation & Setup

**Priority:** P0 (Must Have)  
**Description:** Set up the development environment, project structure, and core infrastructure needed for the application.

**Dependencies:** None  
**Business Value:** Enables all development work

### Stories

#### S1.1: Initialize React + TypeScript Project
**Priority:** P0  
**Story Points:** 2  
**Description:** Set up a new React application with TypeScript, Vite bundler, and project structure.

**Acceptance Criteria:**
- React 18+ with TypeScript configured
- Vite dev server runs successfully
- Project structure follows architecture doc (components/, services/, types/, etc.)
- ESLint and Prettier configured with rules
- Git repository initialized with .gitignore

**Technical Notes:**
```bash
npm create vite@latest portfolio-tracker -- --template react-ts
```

---

#### S1.2: Install Core Dependencies
**Priority:** P0  
**Story Points:** 1  
**Description:** Install and configure essential npm packages.

**Acceptance Criteria:**
- UI library: shadcn/ui components configured
- State management: Zustand installed
- YAML parser: js-yaml installed
- HTTP client: axios configured
- Routing: React Router (if needed for future)

**Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "js-yaml": "^4.1.0",
    "axios": "^1.6.0",
    "recharts": "^2.10.0"
  }
}
```

---

#### S1.3: Configure shadcn/ui & Design System
**Priority:** P0  
**Story Points:** 3  
**Description:** Set up shadcn/ui component library with custom theme configuration.

**Acceptance Criteria:**
- shadcn/ui CLI configured
- Base components installed (Button, Card, Badge, Separator)
- CSS variables defined for light/dark themes
- Typography scale established
- Color palette defined (primary, success, warning, danger)

**Theme Variables:**
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --success: 142.1 76.2% 36.3%;
  --warning: 45.4 93.4% 47.5%;
  --danger: 0 84.2% 60.2%;
}
```

---

#### S1.4: Create TypeScript Type Definitions
**Priority:** P0  
**Story Points:** 2  
**Description:** Define TypeScript interfaces for all domain models.

**Acceptance Criteria:**
- `types/portfolio.types.ts` with Portfolio, ETF, Transaction, AssetClass interfaces
- `types/api.types.ts` with PriceData, APIResponse interfaces
- `types/ui.types.ts` with component prop types
- All types exported from barrel file (`types/index.ts`)
- JSDoc comments on complex types

**Key Interfaces:**
- Portfolio, ETF, AssetClass, Transaction
- Holdings, PortfolioMetrics, HoldingDetail
- RebalancingStatus, CategoryDrift
- PriceData, PriceCache, APIResponse

---

#### S1.5: Set Up Global State Stores
**Priority:** P0  
**Story Points:** 3  
**Description:** Create Zustand stores for portfolio data, prices, and UI state.

**Acceptance Criteria:**
- `store/portfolioStore.ts` - manages portfolio data
- `store/priceStore.ts` - manages price data and cache
- `store/uiStore.ts` - manages theme, loading states, errors
- Each store has TypeScript types
- Store actions follow immutable update patterns

**Store Structure:**
```typescript
// portfolioStore.ts
interface PortfolioState {
  portfolio: Portfolio | null;
  metrics: PortfolioMetrics | null;
  setPortfolio: (portfolio: Portfolio) => void;
  clearPortfolio: () => void;
}
```

---

#### S1.6: Create Base Layout Components
**Priority:** P0  
**Story Points:** 2  
**Description:** Build foundational layout components and error boundary.

**Acceptance Criteria:**
- `components/layout/AppContainer.tsx` - main app wrapper
- `components/layout/Header.tsx` - app header with title
- `components/layout/ErrorBoundary.tsx` - catches React errors
- Responsive container with max-width constraints
- Header includes app title and future actions menu slot

---

## Epic 2: Portfolio Data Management

**Priority:** P0 (Must Have)  
**Description:** Enable users to load, parse, and validate portfolio data from YAML files.

**Dependencies:** E1 (Foundation)  
**Business Value:** Core requirement for all portfolio features

### Stories

#### S2.1: Implement YAML File Parser
**Priority:** P0  
**Story Points:** 3  
**Description:** Create service to parse YAML files into Portfolio objects.

**Acceptance Criteria:**
- `services/fileService.ts` created
- `parsePortfolioFile(file: File)` method reads and parses YAML
- Returns typed Portfolio object
- Handles file reading errors gracefully
- Supports files up to 10MB

**Technical Notes:**
- Use js-yaml library
- Handle UTF-8 encoding
- Async file reading with FileReader API

---

#### S2.2: Implement Portfolio Data Validation
**Priority:** P0  
**Story Points:** 5  
**Description:** Create comprehensive validation for portfolio data structure and business rules.

**Acceptance Criteria:**
- Validate required fields (targetAllocation, etfs)
- Verify target allocation sums to 100%
- Validate each ETF's asset class percentages sum to 100%
- Check transaction date formats (ISO 8601)
- Ensure quantity and price are valid numbers
- Validate total quantity per ETF is not negative
- Return detailed validation error messages with field references

**Validation Rules:**
- targetAllocation must exist and sum to 100% (±0.01)
- Each ETF must have name, assetClasses, transactions
- Asset class percentages must sum to 100% per ETF
- Transactions must have valid date, quantity, price
- Total quantity (sum of all transactions) must be ≥ 0

---

#### S2.3: Build File Upload Component
**Priority:** P0  
**Story Points:** 3  
**Description:** Create UI component for file selection and upload.

**Acceptance Criteria:**
- `components/FileUpload.tsx` with file input
- Prominent "Load Portfolio" button
- File picker accepts only .yaml and .yml files
- Visual feedback during file selection
- Drag-and-drop support (stretch goal)

**UX Requirements:**
- Button minimum 44px height for touch
- Clear label: "Load Portfolio File"
- Accept attribute: `.yaml,.yml`

---

#### S2.4: Create Empty State View
**Priority:** P0  
**Story Points:** 2  
**Description:** Design and build initial empty state before portfolio is loaded.

**Acceptance Criteria:**
- `components/states/EmptyState.tsx` component
- Centered layout with hero message
- Clear call-to-action to load portfolio
- Brief explanation of what the app does
- Link to example YAML file format (future)

**Content:**
- Hero: "Welcome to Portfolio Tracker"
- Subtext: "Load your YAML portfolio file to get started"
- Primary CTA: FileUpload component

---

#### S2.5: Implement Loading State Component
**Priority:** P0  
**Story Points:** 2  
**Description:** Create loading indicators for file parsing and price fetching.

**Acceptance Criteria:**
- `components/states/LoadingState.tsx` with spinner
- Progress text showing current operation
- Responsive and centered layout
- Smooth animation (CSS or Lottie)

**Loading Messages:**
- "Parsing portfolio file..."
- "Fetching current prices..."
- "Calculating portfolio metrics..."

---

#### S2.6: Build useFileUpload Custom Hook
**Priority:** P0  
**Story Points:** 3  
**Description:** Create React hook to manage file upload flow.

**Acceptance Criteria:**
- `hooks/useFileUpload.ts` custom hook
- Handles file selection event
- Calls fileService.parsePortfolioFile()
- Updates portfolioStore with parsed data
- Manages loading and error states
- Returns upload function and status

**Hook Interface:**
```typescript
interface UseFileUpload {
  uploadFile: (file: File) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}
```

---

#### S2.7: Implement Error Display Component
**Priority:** P0  
**Story Points:** 2  
**Description:** Create component to display validation and parsing errors.

**Acceptance Criteria:**
- `components/states/ErrorState.tsx` component
- Displays error message in user-friendly format
- Shows specific validation failures
- "Try Again" button to reset state
- Red/danger color theme

**Error Types:**
- File parsing errors (invalid YAML syntax)
- Validation errors (business rule failures)
- File read errors (permissions, size)

---

#### S2.8: Create Portfolio File Examples
**Priority:** P1  
**Story Points:** 1  
**Description:** Create example YAML files for testing and documentation.

**Acceptance Criteria:**
- `examples/portfolio-simple.yaml` - minimal valid example
- `examples/portfolio-full.yaml` - comprehensive example with multiple ETFs
- `examples/portfolio-invalid.yaml` - intentionally invalid for testing
- Examples follow exact schema from PRD

---

## Epic 3: ETF Price Integration

**Priority:** P0 (Must Have)  
**Description:** Integrate with Alpha Vantage API to fetch real-time ETF prices.

**Dependencies:** E1 (Foundation), E2 (Data Management)  
**Business Value:** Essential for portfolio value calculation

### Stories

#### S3.1: Create API Configuration
**Priority:** P0  
**Story Points:** 1  
**Description:** Set up API configuration with base URL and key management.

**Acceptance Criteria:**
- `config/api.config.ts` with Alpha Vantage endpoints
- Environment variable for API key (`VITE_ALPHAVANTAGE_API_KEY`)
- `.env.example` file with placeholder
- API key not hardcoded in source

**Config Structure:**
```typescript
export const API_CONFIG = {
  baseURL: 'https://www.alphavantage.co/query',
  apiKey: import.meta.env.VITE_ALPHAVANTAGE_API_KEY,
  timeout: 10000,
};
```

---

#### S3.2: Implement Price API Client
**Priority:** P0  
**Story Points:** 5  
**Description:** Create service to fetch ETF prices from Alpha Vantage API.

**Acceptance Criteria:**
- `services/priceService.ts` created
- `fetchPrice(ticker: string)` method calls API
- Handles API response parsing
- Manages rate limits with request queuing
- Returns PriceData object with timestamp
- Handles API errors (network, auth, rate limit)

**API Endpoint:**
- Function: `GLOBAL_QUOTE`
- Parameters: `symbol`, `apikey`

**Rate Limiting:**
- Free tier: 25 requests/day, 5 calls/minute
- Implement queue with 12-second delay between calls

---

#### S3.3: Build Price Cache Service
**Priority:** P0  
**Story Points:** 3  
**Description:** Implement local caching for fetched prices using IndexedDB or localStorage.

**Acceptance Criteria:**
- `services/cacheService.ts` created
- Store prices with ticker, value, timestamp
- Set 15-minute cache expiration
- `getCachedPrice(ticker)` checks freshness
- `setCachedPrice(ticker, price)` stores price
- `clearCache()` removes all cached prices

**Cache Structure:**
```typescript
{
  [ticker: string]: {
    price: number;
    timestamp: number;
    expiresAt: number;
  }
}
```

---

#### S3.4: Create usePrices Custom Hook
**Priority:** P0  
**Story Points:** 3  
**Description:** React hook to manage price fetching and caching logic.

**Acceptance Criteria:**
- `hooks/usePrices.ts` custom hook
- Fetches prices for all ETFs in portfolio
- Checks cache before API call
- Updates priceStore with fetched prices
- Manages loading state per ticker
- Handles partial failures (some tickers succeed, some fail)

**Hook Interface:**
```typescript
interface UsePrices {
  fetchPrices: (tickers: string[]) => Promise<void>;
  refreshPrices: () => Promise<void>;
  isLoading: boolean;
  errors: Record<string, string>;
}
```

---

#### S3.5: Implement Request Queue for Rate Limiting
**Priority:** P0  
**Story Points:** 3  
**Description:** Build queue system to respect API rate limits.

**Acceptance Criteria:**
- Queue requests with configurable delay
- Process requests sequentially
- Emit events for queue progress
- Handle queue cancellation
- Return results in order

**Technical Approach:**
- Use Promise-based queue
- 12-second delay between calls (5 calls/min limit)
- Show progress: "Fetching prices 3/10..."

---

#### S3.6: Add Refresh Prices Button
**Priority:** P0  
**Story Points:** 2  
**Description:** Add UI control to manually refresh prices.

**Acceptance Criteria:**
- Button in Header component
- Calls `usePrices.refreshPrices()`
- Shows loading spinner during refresh
- Displays last updated timestamp
- Disabled state while loading

---

#### S3.7: Display Price Metadata
**Priority:** P1  
**Story Points:** 1  
**Description:** Show when prices were last updated.

**Acceptance Criteria:**
- Display "Prices updated X minutes ago"
- Show source indicator (API vs Cache)
- Format timestamp using relative time
- Update timestamp after refresh

---

## Epic 4: Portfolio Calculations Engine

**Priority:** P0 (Must Have)  
**Description:** Calculate portfolio metrics including holdings, value, P&L, and asset allocation.

**Dependencies:** E2 (Data Management), E3 (Price Integration)  
**Business Value:** Core business logic for portfolio tracking

### Stories

#### S4.1: Implement Holdings Calculation
**Priority:** P0  
**Story Points:** 3  
**Description:** Calculate current holdings and cost basis for each ETF.

**Acceptance Criteria:**
- `services/portfolioService.ts` created
- `calculateHoldings(etfs)` method sums transactions
- Calculates weighted average cost basis
- Returns Holdings object with quantity, costBasis, totalCost
- Handles both buy (positive) and sell (negative) quantities

**Calculation Logic:**
```typescript
// Sum all quantities
quantity = sum(transaction.quantity)

// Weighted average cost
totalCost = sum(transaction.quantity * transaction.price)
costBasis = totalCost / quantity
```

---

#### S4.2: Implement Portfolio Value Calculation
**Priority:** P0  
**Story Points:** 2  
**Description:** Calculate total current portfolio value.

**Acceptance Criteria:**
- `calculatePortfolioValue(holdings, prices)` method
- Multiplies quantity × current price for each ETF
- Sums across all holdings
- Returns total portfolio value
- Handles missing prices gracefully

---

#### S4.3: Implement Profit/Loss Calculation
**Priority:** P0  
**Story Points:** 2  
**Description:** Calculate total and per-ETF profit/loss.

**Acceptance Criteria:**
- Calculates P&L as: currentValue - totalCost
- Returns absolute P&L and percentage
- Calculates per-ETF P&L for holdings table
- Handles edge cases (zero cost basis)

**Formula:**
```
P&L = (quantity × currentPrice) - totalCost
P&L% = (P&L / totalCost) × 100
```

---

#### S4.4: Implement Asset Class Allocation Calculation
**Priority:** P0  
**Story Points:** 5  
**Description:** Calculate current asset class allocation across all ETFs.

**Acceptance Criteria:**
- `calculateAllocation(holdings, prices)` method
- Distributes each ETF's value across its asset classes
- Groups by category (Stocks, Bonds, Real Estate, etc.)
- Returns allocation as percentages
- Handles multiple asset classes per ETF

**Algorithm:**
```typescript
For each ETF:
  etfValue = quantity × price
  For each assetClass in ETF:
    categoryValue = etfValue × (assetClass.percentage / 100)
    Add categoryValue to category total

Calculate percentages:
  categoryPercent = (categoryTotal / portfolioTotal) × 100
```

---

#### S4.5: Build usePortfolio Custom Hook
**Priority:** P0  
**Story Points:** 3  
**Description:** React hook to orchestrate portfolio calculations.

**Acceptance Criteria:**
- `hooks/usePortfolio.ts` custom hook
- Triggers calculations when portfolio or prices change
- Updates portfolioStore.metrics with results
- Exposes portfolio metrics to components
- Memoizes calculations to avoid redundant work

**Hook Returns:**
```typescript
{
  metrics: PortfolioMetrics | null;
  isCalculating: boolean;
  recalculate: () => void;
}
```

---

#### S4.6: Create Calculation Utility Functions
**Priority:** P0  
**Story Points:** 1  
**Description:** Build reusable utility functions for common calculations.

**Acceptance Criteria:**
- `utils/calculations.ts` created
- `calculateWeightedAverage()` function
- `sumByKey()` function for aggregations
- `percentageChange()` function
- All functions have unit tests

---

## Epic 5: Dashboard UI - Core Views

**Priority:** P0 (Must Have)  
**Description:** Build the main dashboard with portfolio metrics visualization.

**Dependencies:** E4 (Calculations Engine)  
**Business Value:** Primary user interface for portfolio tracking

### Stories

#### S5.1: Create Portfolio Value Card
**Priority:** P0  
**Story Points:** 3  
**Description:** Display total portfolio value and P&L prominently.

**Acceptance Criteria:**
- `components/portfolio/PortfolioValueCard.tsx` component
- Shows total value with currency symbol
- Shows total P&L with color coding (green profit, red loss)
- Shows P&L percentage
- Large, readable typography
- Responsive layout

**Design:**
```
┌─────────────────────────────────┐
│  Total Portfolio Value          │
│  €102,350.45                    │
│                                 │
│  +€12,350.45 (+13.7%)          │
│  ▲ Profit (green)              │
└─────────────────────────────────┘
```

---

#### S5.2: Create Holdings Table Component
**Priority:** P0  
**Story Points:** 5  
**Description:** Display list of all ETF holdings with details.

**Acceptance Criteria:**
- `components/portfolio/HoldingsTable.tsx` component
- Columns: Ticker, Name, Quantity, Price, Value, P&L
- Sortable columns (ascending/descending)
- Color-coded P&L column
- Responsive (stacks on mobile)
- Shows loading skeleton while fetching

**Table Structure:**
| Ticker | Name | Qty | Price | Value | P&L |
|--------|------|-----|-------|-------|-----|
| VWCE | Vanguard FTSE All-World | 100 | €102.50 | €10,250 | +€750 (+7.9%) |

---

#### S5.3: Create Asset Allocation Chart
**Priority:** P0  
**Story Points:** 5  
**Description:** Visualize current asset class allocation.

**Acceptance Criteria:**
- `components/portfolio/AssetAllocationChart.tsx` component
- Pie chart or bar chart showing allocation breakdown
- Shows category name and percentage
- Color-coded categories
- Legend with values
- Uses Recharts library

**Chart Data:**
- Stocks: 70.2%
- Bonds: 19.5%
- Real Estate: 10.3%

---

#### S5.4: Create Main Dashboard Layout
**Priority:** P0  
**Story Points:** 3  
**Description:** Compose all dashboard components into main view.

**Acceptance Criteria:**
- `components/Dashboard.tsx` component
- Grid layout with portfolio value at top
- Holdings table and allocation chart below
- Responsive breakpoints (desktop, tablet, mobile)
- Smooth transitions between empty/loading/loaded states

**Layout Hierarchy:**
```
Header
├── Portfolio Value Card (hero)
├── Rebalancing Status Card (from E6)
├── Asset Allocation Chart
└── Holdings Table
```

---

#### S5.5: Implement Number Formatting Utilities
**Priority:** P0  
**Story Points:** 2  
**Description:** Create utilities for consistent number and currency formatting.

**Acceptance Criteria:**
- `utils/formatters.ts` created
- `formatCurrency(value)` - formats with symbol and decimals
- `formatPercent(value)` - formats percentage with sign
- `formatNumber(value)` - formats with thousand separators
- Locale-aware formatting (defaults to user's locale)

**Examples:**
```typescript
formatCurrency(10250.5) // "€10,250.50"
formatPercent(13.75) // "+13.8%"
formatNumber(1234567) // "1,234,567"
```

---

#### S5.6: Add Skeleton Loading States
**Priority:** P1  
**Story Points:** 2  
**Description:** Create skeleton loaders for components while data loads.

**Acceptance Criteria:**
- Skeleton versions of PortfolioValueCard
- Skeleton for HoldingsTable rows
- Skeleton for AssetAllocationChart
- Smooth transition from skeleton to real data
- Uses shadcn/ui Skeleton component

---

#### S5.7: Implement Date Formatting
**Priority:** P1  
**Story Points:** 1  
**Description:** Add utilities for date formatting.

**Acceptance Criteria:**
- `formatDate(isoString)` - formats as locale date
- `formatRelativeTime(timestamp)` - "2 minutes ago"
- `formatDateTime(timestamp)` - full date and time

---

#### S5.8: Add Load Different Portfolio Action
**Priority:** P0  
**Story Points:** 2  
**Description:** Allow users to load a different portfolio after initial load.

**Acceptance Criteria:**
- "Load Different Portfolio" button in Header
- Clears current portfolio state
- Returns to Empty State
- Confirms action if unsaved changes (future)

---

#### S5.9: Style Dashboard with Theme
**Priority:** P0  
**Story Points:** 2  
**Description:** Apply consistent styling and spacing to dashboard.

**Acceptance Criteria:**
- Consistent card styling with shadows
- Proper spacing between sections
- Typography hierarchy (h1, h2, body)
- Color palette from theme
- Accessible contrast ratios (WCAG AA)

---

## Epic 6: Rebalancing Analysis

**Priority:** P0 (Must Have)  
**Description:** Calculate portfolio drift and provide rebalancing alerts.

**Dependencies:** E4 (Calculations Engine)  
**Business Value:** Key differentiator for portfolio management

### Stories

#### S6.1: Implement Drift Calculation
**Priority:** P0  
**Story Points:** 3  
**Description:** Calculate drift between current and target allocation.

**Acceptance Criteria:**
- `services/rebalancingService.ts` created
- `calculateDrift(current, target)` method
- Calculates absolute drift for each category
- Identifies maximum drift
- Returns CategoryDrift objects with signed and absolute values

**Drift Formula:**
```
drift = currentPercent - targetPercent
absDrift = |drift|
maxDrift = max(absDrift for all categories)
```

---

#### S6.2: Implement Rebalancing Status Logic
**Priority:** P0  
**Story Points:** 2  
**Description:** Determine rebalancing status based on drift threshold.

**Acceptance Criteria:**
- `determineStatus(maxDrift, threshold)` method
- Returns 'in-balance', 'monitor', or 'rebalance'
- Threshold configurable (default: 5%)
- Status rules:
  - in-balance: maxDrift < threshold
  - monitor: threshold ≤ maxDrift < 2×threshold
  - rebalance: maxDrift ≥ 2×threshold

---

#### S6.3: Create Rebalancing Status Card
**Priority:** P0  
**Story Points:** 3  
**Description:** Visual component showing rebalancing status.

**Acceptance Criteria:**
- `components/portfolio/RebalancingStatusCard.tsx` component
- Color-coded indicator (green/yellow/red)
- Displays status text and max drift percentage
- Lists categories that are out of balance
- Clear, actionable messaging

**Status Messages:**
- ✓ In Balance: "Portfolio is balanced"
- ⚠ Monitor: "Minor drift detected, keep monitoring"
- ⚡ Rebalance: "Rebalancing recommended"

---

#### S6.4: Create Target vs Current Comparison View
**Priority:** P1  
**Story Points:** 3  
**Description:** Detailed view comparing target and current allocation.

**Acceptance Criteria:**
- `components/portfolio/AllocationComparison.tsx` component
- Side-by-side bar chart or table
- Shows target %, current %, and drift for each category
- Highlights categories exceeding threshold
- Expandable/collapsible detail view

**Comparison Table:**
| Category | Target | Current | Drift |
|----------|--------|---------|-------|
| Stocks | 70% | 68.5% | -1.5% |
| Bonds | 20% | 21.2% | +1.2% |
| Real Estate | 10% | 10.3% | +0.3% |

---

#### S6.5: Add Drift Threshold Configuration
**Priority:** P2  
**Story Points:** 2  
**Description:** Allow users to configure drift threshold.

**Acceptance Criteria:**
- Setting stored in localStorage
- Default: 5%
- UI control in settings/header menu
- Updates rebalancing status when changed
- Validates input (1-20% range)

---

## Epic 7: Responsive & Theme Support

**Priority:** P1 (Should Have)  
**Description:** Ensure app works across devices and supports light/dark themes.

**Dependencies:** E5 (Dashboard UI)  
**Business Value:** Improves user experience and accessibility

### Stories

#### S7.1: Implement Theme Toggle
**Priority:** P1  
**Story Points:** 3  
**Description:** Add theme switching functionality.

**Acceptance Criteria:**
- `hooks/useTheme.ts` custom hook
- Detects system theme preference
- Manual toggle: light/dark/auto
- Persists preference in localStorage
- Updates CSS variables on theme change

**Theme Modes:**
- Auto: follows system preference
- Light: force light mode
- Dark: force dark mode

---

#### S7.2: Design Dark Theme Palette
**Priority:** P1  
**Story Points:** 2  
**Description:** Create dark mode color scheme.

**Acceptance Criteria:**
- Dark theme CSS variables defined
- Sufficient contrast ratios (WCAG AA)
- Color-blind friendly palette
- Tests on all components
- Smooth transition between themes

**Dark Theme Colors:**
- Background: #1a1a1a
- Foreground: #f5f5f5
- Primary: adjusted for dark background
- Success/Warning/Danger: adjusted for readability

---

#### S7.3: Add Theme Toggle UI Control
**Priority:** P1  
**Story Points:** 2  
**Description:** Add theme switcher to header.

**Acceptance Criteria:**
- Icon button in Header component
- Shows current theme state
- Cycles through light/dark/auto
- Tooltip showing current mode
- Accessible keyboard navigation

---

#### S7.4: Implement Mobile Responsive Layout
**Priority:** P1  
**Story Points:** 3  
**Description:** Optimize layouts for mobile devices.

**Acceptance Criteria:**
- Single column layout on mobile (<768px)
- Touch-friendly buttons (44px minimum)
- Collapsible sections for holdings table
- Simplified chart views on small screens
- Horizontal scroll for wide tables
- Test on iPhone SE, iPhone 14, Android devices

**Responsive Breakpoints:**
- Mobile: <768px
- Tablet: 768px-1023px
- Desktop: ≥1024px

---

#### S7.5: Implement Tablet Responsive Layout
**Priority:** P1  
**Story Points:** 3  
**Description:** Optimize layouts for tablet devices.

**Acceptance Criteria:**
- Two-column layout on tablets
- Adjusted card sizes and spacing
- Touch-optimized interactions
- Test on iPad, Android tablets

---

## Epic 8: Error Handling & Offline Mode

**Priority:** P1 (Should Have)  
**Description:** Graceful error handling and offline functionality.

**Dependencies:** E2, E3, E5  
**Business Value:** Improves reliability and user trust

### Stories

#### S8.1: Implement Global Error Boundary
**Priority:** P1  
**Story Points:** 2  
**Description:** Catch and display React errors gracefully.

**Acceptance Criteria:**
- ErrorBoundary component wraps app
- Displays friendly error message
- Logs error to console for debugging
- "Reload" button to recover
- Prevents white screen crashes

---

#### S8.2: Add API Error Handling
**Priority:** P1  
**Story Points:** 3  
**Description:** Handle Alpha Vantage API errors gracefully.

**Acceptance Criteria:**
- Catch network errors (timeout, no connection)
- Handle API-specific errors (rate limit, invalid ticker)
- Display user-friendly error messages
- Provide retry mechanism
- Fall back to cached prices when possible

**Error Scenarios:**
- Network offline: "Cannot fetch prices, using cached data"
- Rate limit: "API limit reached, try again in X minutes"
- Invalid ticker: "Price unavailable for ticker XYZ"

---

#### S8.3: Implement Offline Mode Detection
**Priority:** P1  
**Story Points:** 2  
**Description:** Detect and handle offline state.

**Acceptance Criteria:**
- Listen to browser online/offline events
- Show offline indicator banner
- Display age of cached prices
- Attempt price refresh when back online
- Portfolio calculations work with cached prices

---

#### S8.4: Add Retry Logic for Failed Requests
**Priority:** P1  
**Story Points:** 3  
**Description:** Automatically retry failed API requests.

**Acceptance Criteria:**
- Exponential backoff for retries
- Maximum 3 retry attempts
- User notification of retry attempts
- Manual retry button as fallback

**Retry Strategy:**
- 1st retry: 2 seconds
- 2nd retry: 5 seconds
- 3rd retry: 10 seconds

---

#### S8.5: Create Validation Error Messages
**Priority:** P1  
**Story Points:** 2  
**Description:** Improve validation error messaging.

**Acceptance Criteria:**
- Specific error messages per validation rule
- Highlight which field/ETF caused error
- Provide example of correct format
- Link to documentation (future)

**Error Message Examples:**
- "Target allocation sums to 95%, must equal 100%"
- "ETF VWCE: Asset classes sum to 103%, must equal 100%"
- "ETF VTI: Invalid date format '2024/01/15', use ISO 8601 format (YYYY-MM-DD)"

---

#### S8.6: Display Connection Status Indicator
**Priority:** P2  
**Story Points:** 1  
**Description:** Show online/offline status in UI.

**Acceptance Criteria:**
- Small indicator in header or footer
- Green dot: online
- Gray dot: offline
- Tooltip with status text

---

## Implementation Phases

### Phase 1: Foundation (Sprint 1-2)
**Goal:** Working app skeleton with data loading  
**Epics:** E1, E2  
**Stories:** S1.1-S1.6, S2.1-S2.8  
**Deliverable:** App can load and validate YAML files

### Phase 2: Core Features (Sprint 3-4)
**Goal:** Portfolio value and calculations  
**Epics:** E3, E4  
**Stories:** S3.1-S3.7, S4.1-S4.6  
**Deliverable:** Display portfolio value, holdings, P&L

### Phase 3: Visualization (Sprint 5-6)
**Goal:** Complete dashboard UI  
**Epics:** E5, E6  
**Stories:** S5.1-S5.9, S6.1-S6.5  
**Deliverable:** Full dashboard with rebalancing

### Phase 4: Polish (Sprint 7)
**Goal:** Responsive, themed, robust  
**Epics:** E7, E8  
**Stories:** S7.1-S7.5, S8.1-S8.6  
**Deliverable:** Production-ready app

---

## Story Dependencies

### Critical Path
```
S1.1 → S1.2 → S1.3 → S1.4 → S1.5
  ↓
S2.1 → S2.2 → S2.6
  ↓
S3.2 → S3.3 → S3.4
  ↓
S4.1 → S4.2 → S4.3 → S4.4 → S4.5
  ↓
S5.1 → S5.2 → S5.3 → S5.4
  ↓
S6.1 → S6.2 → S6.3
```

### Parallel Work Streams
- **UI Components:** S5.x can be built in parallel with backend services
- **Error Handling:** E8 stories can be added incrementally throughout sprints
- **Responsive/Theme:** S7.x can be added after core UI is complete

---

## Testing Strategy

### Unit Tests (Per Story)
- All service methods (fileService, priceService, portfolioService)
- Calculation utilities
- Data validation functions
- Custom hooks (use @testing-library/react-hooks)

### Integration Tests
- File upload → parsing → validation flow
- Price fetching → caching → calculation flow
- Portfolio calculation → UI rendering
- Error handling scenarios

### E2E Tests (Cypress/Playwright)
- Load portfolio file and see dashboard
- Refresh prices and see updated values
- Load invalid file and see error message
- Theme toggle functionality
- Responsive layout on different viewports

### Manual Testing
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile devices (iOS Safari, Android Chrome)
- Offline mode functionality
- Large portfolio files (performance)

---

## Definition of Done

### Story Level
- [ ] Code implements all acceptance criteria
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Code reviewed and approved
- [ ] No console errors or warnings
- [ ] Component documented with JSDoc
- [ ] TypeScript types defined
- [ ] Manual testing completed

### Epic Level
- [ ] All stories completed
- [ ] Integration tests passing
- [ ] E2E tests passing for epic features
- [ ] UX review completed
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Documentation updated

### Release Level
- [ ] All epics completed
- [ ] Full regression testing passed
- [ ] Cross-browser testing completed
- [ ] Mobile device testing completed
- [ ] Security audit passed
- [ ] User acceptance testing completed
- [ ] Deployment scripts tested
- [ ] README and user guide updated

---

## Risk Mitigation

### High Priority Risks

#### R1: Alpha Vantage API Rate Limits
**Impact:** High  
**Mitigation:**
- Aggressive caching (S3.3)
- Request queuing (S3.5)
- Consider fallback to manual price entry (future)

#### R2: YAML Format Complexity
**Impact:** Medium  
**Mitigation:**
- Comprehensive validation with clear errors (S2.2, S8.5)
- Example files (S2.8)
- Future: YAML editor UI

#### R3: Calculation Accuracy
**Impact:** High  
**Mitigation:**
- Thorough unit tests (per story)
- Validation against manual calculations
- Edge case testing (zero holdings, negative P&L)

---

## Success Metrics

### Development Metrics
- **Velocity:** Target 20-25 story points per 2-week sprint
- **Code Quality:** >80% test coverage, <5 critical bugs
- **Performance:** Initial load <3s, calculations <500ms

### User Metrics (Post-Launch)
- **Usability:** Users load portfolio successfully on first try >90%
- **Accuracy:** Zero reported calculation errors
- **Engagement:** Users check portfolio daily/weekly
- **Satisfaction:** NPS >50 (if collecting feedback)

---

**Document History:**
- 2025-11-30: Initial epic and story breakdown (v1.0)
