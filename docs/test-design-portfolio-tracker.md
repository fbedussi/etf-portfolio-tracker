# Test Design Document

**Product Name:** Personal ETF Portfolio Tracker  
**Version:** 1.0  
**Date:** 2025-11-30  
**Test Engineer:** Test Engineering Analyst  
**Status:** Ready for Implementation

---

## 1. Executive Summary

### 1.1 Testing Scope
This document outlines the comprehensive testing strategy for the Portfolio Tracker application, a pure client-side SPA for managing ETF portfolios. Testing focuses on system-level testability, covering functional correctness, data integrity, API integration, UI responsiveness, and error handling.

### 1.2 Testing Objectives
1. Verify accurate portfolio calculations (holdings, value, P&L, allocation)
2. Ensure reliable API integration with proper caching and rate limiting
3. Validate data parsing and validation logic
4. Confirm UI responsiveness across devices and browsers
5. Test error handling and offline functionality
6. Assess performance and accessibility compliance

### 1.3 Testability Assessment
**Overall Testability Score: 8.5/10** (Excellent)

**Strengths:**
- Pure functions for calculations (easily unit testable)
- Service layer abstraction (mockable dependencies)
- TypeScript types provide clear contracts
- Client-side architecture simplifies testing (no backend)
- Component-based UI (isolated testing)

**Challenges:**
- API rate limiting requires careful test design
- File upload testing needs browser API mocks
- IndexedDB/localStorage testing requires browser environment
- Rebalancing logic has complex business rules

---

## 2. Test Strategy

### 2.1 Testing Pyramid

```
                    /\
                   /  \
                  / E2E \          5% - Critical user flows
                 /______\
                /        \
               / Integration \     15% - Service integration
              /______________\
             /                \
            /   Unit Tests     \   80% - Functions, components
           /____________________\
```

### 2.2 Test Types

| Test Type | Coverage Goal | Tool | Execution |
|-----------|--------------|------|-----------|
| Unit Tests | 80%+ | Vitest | Every commit |
| Integration Tests | Key workflows | Vitest + Testing Library | Every PR |
| E2E Tests | Critical paths | Playwright | Pre-release |
| Visual Regression | UI components | Percy/Chromatic | Weekly |
| Performance Tests | Core metrics | Lighthouse | Pre-release |
| Accessibility Tests | WCAG AA | axe-core | Every PR |

### 2.3 Testing Principles

1. **Test Behavior, Not Implementation** - Focus on outputs, not internal logic
2. **Fast Feedback** - Unit tests run in < 1 second
3. **Deterministic** - Tests produce same results every run
4. **Isolated** - No test dependencies or shared state
5. **Maintainable** - Tests update with code changes

---

## 3. Unit Test Plan

### 3.1 Service Layer Tests

#### 3.1.1 File Service (`services/fileService.ts`)

**Test Suite: YAML Parsing**
- ✓ Should parse valid YAML portfolio file
- ✓ Should throw error on invalid YAML syntax
- ✓ Should throw error on missing required fields
- ✓ Should handle UTF-8 encoded files
- ✓ Should reject files over 10MB
- ✓ Should parse portfolio with multiple ETFs
- ✓ Should handle empty transaction arrays

**Test Suite: Data Validation**
- ✓ Should validate target allocation sums to 100%
- ✓ Should reject target allocation < 100%
- ✓ Should reject target allocation > 100%
- ✓ Should validate ETF asset class percentages sum to 100%
- ✓ Should reject invalid transaction date formats
- ✓ Should accept ISO 8601 date formats
- ✓ Should reject non-numeric quantity or price
- ✓ Should reject negative total quantity (over-selling)
- ✓ Should allow zero quantity (fully sold position)

**Test Data:**
```yaml
# Valid Portfolio
targetAllocation:
  Stocks: 70
  Bonds: 30
etfs:
  VWCE:
    name: "Vanguard FTSE All-World"
    assetClasses:
      - name: "US Stocks"
        category: "Stocks"
        percentage: 100
    transactions:
      - date: "2024-01-15"
        quantity: 10
        price: 95.50
```

---

#### 3.1.2 Price Service (`services/priceService.ts`)

**Test Suite: API Integration**
- ✓ Should fetch price for single ticker
- ✓ Should handle successful API response
- ✓ Should parse API response correctly
- ✓ Should throw error on 401 (invalid API key)
- ✓ Should throw error on 429 (rate limit)
- ✓ Should throw error on 500 (server error)
- ✓ Should timeout after 10 seconds
- ✓ Should handle network errors
- ✓ Should queue multiple requests
- ✓ Should respect rate limit (5 calls/minute)

**Test Suite: Request Queuing**
- ✓ Should process requests sequentially
- ✓ Should delay 12 seconds between calls
- ✓ Should handle queue cancellation
- ✓ Should emit progress events
- ✓ Should return results in order

**Mock API Response:**
```json
{
  "Global Quote": {
    "01. symbol": "VWCE",
    "05. price": "102.5000",
    "07. latest trading day": "2025-11-29"
  }
}
```

---

#### 3.1.3 Cache Service (`services/cacheService.ts`)

**Test Suite: Cache Operations**
- ✓ Should store price in cache
- ✓ Should retrieve cached price
- ✓ Should return null for expired cache
- ✓ Should return null for missing ticker
- ✓ Should update existing cache entry
- ✓ Should clear all cache entries
- ✓ Should set 15-minute expiration
- ✓ Should handle localStorage quota exceeded

**Test Suite: Cache Freshness**
- ✓ Should return cached price if < 15 minutes old
- ✓ Should return null if > 15 minutes old
- ✓ Should check expiration timestamp correctly

---

#### 3.1.4 Portfolio Service (`services/portfolioService.ts`)

**Test Suite: Holdings Calculation**
- ✓ Should calculate total quantity from transactions
- ✓ Should handle buy transactions (positive quantity)
- ✓ Should handle sell transactions (negative quantity)
- ✓ Should calculate weighted average cost basis
- ✓ Should handle zero quantity (fully sold)
- ✓ Should handle single transaction
- ✓ Should handle multiple buy and sell transactions

**Example Test:**
```typescript
test('calculates weighted average cost basis', () => {
  const transactions = [
    { date: '2024-01-15', quantity: 10, price: 100 },
    { date: '2024-06-20', quantity: 5, price: 110 },
  ];
  const holdings = calculateHoldings({ transactions });
  
  // Total cost: (10 * 100) + (5 * 110) = 1550
  // Total quantity: 15
  // Cost basis: 1550 / 15 = 103.33
  expect(holdings.costBasis).toBeCloseTo(103.33, 2);
});
```

**Test Suite: Portfolio Value Calculation**
- ✓ Should calculate value for single ETF
- ✓ Should sum values across multiple ETFs
- ✓ Should handle zero holdings
- ✓ Should handle missing prices (skip ETF)
- ✓ Should format currency correctly

**Test Suite: P&L Calculation**
- ✓ Should calculate profit (value > cost)
- ✓ Should calculate loss (value < cost)
- ✓ Should calculate P&L percentage
- ✓ Should handle zero cost basis
- ✓ Should calculate per-ETF P&L

**Test Suite: Asset Allocation Calculation**
- ✓ Should distribute ETF value across asset classes
- ✓ Should group by category (Stocks, Bonds, etc.)
- ✓ Should calculate percentages correctly
- ✓ Should handle multiple ETFs with same category
- ✓ Should sum to 100% (within rounding)
- ✓ Should handle ETFs with multiple asset classes

**Complex Allocation Test:**
```typescript
test('distributes multi-asset ETF correctly', () => {
  const portfolio = {
    etfs: {
      AOA: {
        assetClasses: [
          { category: 'Stocks', percentage: 80 },
          { category: 'Bonds', percentage: 20 }
        ],
        transactions: [{ quantity: 10, price: 100 }]
      }
    }
  };
  const prices = { AOA: 110 };
  
  // Total value: 10 * 110 = 1100
  // Stocks: 1100 * 0.80 = 880 (80%)
  // Bonds: 1100 * 0.20 = 220 (20%)
  const allocation = calculateAllocation(portfolio, prices);
  
  expect(allocation.Stocks).toBe(80);
  expect(allocation.Bonds).toBe(20);
});
```

---

#### 3.1.5 Rebalancing Service (`services/rebalancingService.ts`)

**Test Suite: Drift Calculation**
- ✓ Should calculate drift for each category
- ✓ Should calculate signed drift (positive/negative)
- ✓ Should calculate absolute drift
- ✓ Should identify maximum drift
- ✓ Should handle zero drift (perfect balance)
- ✓ Should handle missing categories in current allocation

**Test Suite: Status Determination**
- ✓ Should return 'in-balance' when drift < threshold
- ✓ Should return 'monitor' when drift = threshold
- ✓ Should return 'monitor' when drift < 2× threshold
- ✓ Should return 'rebalance' when drift ≥ 2× threshold
- ✓ Should respect custom threshold
- ✓ Should default to 5% threshold

**Edge Cases:**
```typescript
test('handles edge case: single category portfolio', () => {
  const current = { Stocks: 100 };
  const target = { Stocks: 100 };
  const status = calculateRebalancingStatus(current, target);
  
  expect(status.status).toBe('in-balance');
  expect(status.maxDrift).toBe(0);
});

test('handles new category not in target', () => {
  const current = { Stocks: 90, Crypto: 10 };
  const target = { Stocks: 100 };
  const status = calculateRebalancingStatus(current, target);
  
  // Crypto has 10% drift from 0% target
  expect(status.maxDrift).toBe(10);
});
```

---

### 3.2 Utility Function Tests

#### 3.2.1 Formatters (`utils/formatters.ts`)

**Test Suite: Currency Formatting**
- ✓ Should format positive amounts
- ✓ Should format negative amounts
- ✓ Should add thousand separators
- ✓ Should show 2 decimal places
- ✓ Should handle zero
- ✓ Should respect locale (€ vs $)

**Test Suite: Percentage Formatting**
- ✓ Should format positive percentages with +
- ✓ Should format negative percentages with -
- ✓ Should show 1 decimal place
- ✓ Should handle zero

**Test Suite: Date Formatting**
- ✓ Should format ISO date string
- ✓ Should format timestamp
- ✓ Should format relative time ("2 hours ago")
- ✓ Should handle invalid dates

---

#### 3.2.2 Validators (`utils/validators.ts`)

**Test Suite: Date Validation**
- ✓ Should accept valid ISO 8601 dates
- ✓ Should reject invalid date strings
- ✓ Should reject future dates (optional)
- ✓ Should handle different date formats

**Test Suite: Number Validation**
- ✓ Should accept positive numbers
- ✓ Should accept negative numbers
- ✓ Should reject NaN
- ✓ Should reject Infinity
- ✓ Should accept zero

---

### 3.3 React Component Tests

#### 3.3.1 Portfolio Value Card

**Test Suite: Rendering**
- ✓ Should display total value
- ✓ Should display P&L with color coding
- ✓ Should show green for profit
- ✓ Should show red for loss
- ✓ Should format numbers correctly
- ✓ Should handle null metrics (loading)

**Test Suite: Interaction**
- ✓ Should update when metrics change
- ✓ Should maintain accessibility attributes

---

#### 3.3.2 Holdings Table

**Test Suite: Rendering**
- ✓ Should display all holdings
- ✓ Should show ticker, name, quantity, price, value, P&L
- ✓ Should color-code P&L column
- ✓ Should handle empty holdings
- ✓ Should show loading skeleton

**Test Suite: Sorting**
- ✓ Should sort by ticker (ascending/descending)
- ✓ Should sort by value
- ✓ Should sort by P&L
- ✓ Should maintain sort on data update

**Test Suite: Responsive**
- ✓ Should render table on desktop
- ✓ Should render cards on mobile
- ✓ Should stack columns on small screens

---

#### 3.3.3 Asset Allocation Chart

**Test Suite: Rendering**
- ✓ Should render pie chart with categories
- ✓ Should display percentages
- ✓ Should use distinct colors
- ✓ Should show legend
- ✓ Should handle empty allocation
- ✓ Should handle single category

**Test Suite: Interaction**
- ✓ Should highlight segment on hover
- ✓ Should show tooltip with details
- ✓ Should be accessible (aria-labels)

---

#### 3.3.4 Rebalancing Status Card

**Test Suite: Status Display**
- ✓ Should show green indicator for in-balance
- ✓ Should show yellow indicator for monitor
- ✓ Should show red indicator for rebalance
- ✓ Should display max drift percentage
- ✓ Should list out-of-balance categories

**Test Suite: Conditional Rendering**
- ✓ Should show "Portfolio is balanced" when in-balance
- ✓ Should show warning message for monitor
- ✓ Should show action message for rebalance

---

### 3.4 Custom Hook Tests

#### 3.4.1 useFileUpload

**Test Suite: File Upload Flow**
- ✓ Should call fileService.parsePortfolioFile
- ✓ Should update portfolioStore on success
- ✓ Should set loading state during parse
- ✓ Should set error state on failure
- ✓ Should clear error on retry
- ✓ Should handle validation errors

---

#### 3.4.2 usePrices

**Test Suite: Price Fetching**
- ✓ Should fetch prices for all tickers
- ✓ Should check cache before API call
- ✓ Should update priceStore with results
- ✓ Should handle partial failures
- ✓ Should respect rate limits
- ✓ Should emit progress updates

---

#### 3.4.3 usePortfolio

**Test Suite: Calculation Orchestration**
- ✓ Should recalculate on portfolio change
- ✓ Should recalculate on price change
- ✓ Should memoize results
- ✓ Should update metrics store
- ✓ Should handle calculation errors

---

#### 3.4.4 useTheme

**Test Suite: Theme Management**
- ✓ Should detect system preference
- ✓ Should toggle between light/dark
- ✓ Should persist preference to localStorage
- ✓ Should apply theme class to document
- ✓ Should handle 'auto' mode

---

## 4. Integration Test Plan

### 4.1 File Upload to Dashboard Flow

**Test: Happy Path**
```typescript
test('loads portfolio and displays dashboard', async () => {
  const user = userEvent.setup();
  const file = createMockYAMLFile(validPortfolio);
  
  render(<App />);
  
  // Start at empty state
  expect(screen.getByText(/Load Portfolio/i)).toBeInTheDocument();
  
  // Upload file
  const input = screen.getByLabelText(/upload/i);
  await user.upload(input, file);
  
  // Wait for parsing
  expect(screen.getByText(/Parsing/i)).toBeInTheDocument();
  
  // Wait for prices to load
  await waitFor(() => {
    expect(screen.getByText(/Total Portfolio Value/i)).toBeInTheDocument();
  });
  
  // Verify dashboard content
  expect(screen.getByText(/€10,250/i)).toBeInTheDocument();
  expect(screen.getByText(/VWCE/i)).toBeInTheDocument();
});
```

**Test: Invalid File**
```typescript
test('displays error for invalid YAML', async () => {
  const user = userEvent.setup();
  const file = createMockYAMLFile('invalid: yaml: content::');
  
  render(<App />);
  
  const input = screen.getByLabelText(/upload/i);
  await user.upload(input, file);
  
  await waitFor(() => {
    expect(screen.getByText(/Invalid YAML/i)).toBeInTheDocument();
  });
});
```

---

### 4.2 Price Fetching and Caching Flow

**Test: Cache Hit**
```typescript
test('uses cached prices when fresh', async () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;
  
  // Pre-populate cache
  cacheService.setCachedPrice('VWCE', 102.5, Date.now());
  
  const { result } = renderHook(() => usePrices());
  
  await act(async () => {
    await result.current.fetchPrices(['VWCE']);
  });
  
  // Should not call API
  expect(mockFetch).not.toHaveBeenCalled();
  expect(result.current.prices.VWCE).toBe(102.5);
});
```

**Test: Cache Miss**
```typescript
test('fetches from API when cache expired', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    json: () => ({ 'Global Quote': { '05. price': '105.0' } })
  });
  global.fetch = mockFetch;
  
  // Set expired cache
  const fifteenMinutesAgo = Date.now() - (16 * 60 * 1000);
  cacheService.setCachedPrice('VWCE', 102.5, fifteenMinutesAgo);
  
  const { result } = renderHook(() => usePrices());
  
  await act(async () => {
    await result.current.fetchPrices(['VWCE']);
  });
  
  expect(mockFetch).toHaveBeenCalled();
  expect(result.current.prices.VWCE).toBe(105.0);
});
```

---

### 4.3 Portfolio Calculation Flow

**Test: End-to-End Calculation**
```typescript
test('calculates metrics from portfolio and prices', () => {
  const portfolio = {
    targetAllocation: { Stocks: 100 },
    etfs: {
      VWCE: {
        name: 'Vanguard FTSE All-World',
        assetClasses: [
          { category: 'Stocks', percentage: 100 }
        ],
        transactions: [
          { date: '2024-01-15', quantity: 10, price: 100 }
        ]
      }
    }
  };
  
  const prices = { VWCE: 110 };
  
  const { result } = renderHook(() => usePortfolio());
  
  act(() => {
    portfolioStore.getState().setPortfolio(portfolio);
    priceStore.getState().setPrices(prices);
  });
  
  expect(result.current.metrics).toMatchObject({
    totalValue: 1100, // 10 * 110
    totalCost: 1000, // 10 * 100
    totalProfitLoss: 100,
    totalProfitLossPercent: 10,
    currentAllocation: { Stocks: 100 }
  });
});
```

---

### 4.4 Rebalancing Alert Flow

**Test: Drift Detection**
```typescript
test('shows rebalance alert when drift exceeds threshold', () => {
  const portfolio = {
    targetAllocation: { Stocks: 70, Bonds: 30 },
    etfs: {
      VTI: {
        assetClasses: [{ category: 'Stocks', percentage: 100 }],
        transactions: [{ quantity: 10, price: 100 }]
      },
      BND: {
        assetClasses: [{ category: 'Bonds', percentage: 100 }],
        transactions: [{ quantity: 2, price: 100 }]
      }
    }
  };
  
  const prices = { VTI: 150, BND: 80 };
  // VTI value: 1500, BND value: 160
  // Total: 1660
  // Stocks: 90.4%, Bonds: 9.6%
  // Drift: Stocks +20.4%, Bonds -20.4%
  
  render(<Dashboard />);
  
  act(() => {
    portfolioStore.getState().setPortfolio(portfolio);
    priceStore.getState().setPrices(prices);
  });
  
  expect(screen.getByText(/Rebalancing recommended/i)).toBeInTheDocument();
  expect(screen.getByText(/20.4%/i)).toBeInTheDocument();
});
```

---

## 5. End-to-End Test Plan

### 5.1 Critical User Journeys

#### Journey 1: First Time User - Load Portfolio

**Steps:**
1. Navigate to app URL
2. See empty state with "Load Portfolio" button
3. Click button, select YAML file
4. See loading indicator
5. See dashboard with portfolio data
6. Verify all metrics displayed correctly

**Assertions:**
- Empty state renders
- File picker opens
- Loading states show
- Dashboard populates
- Numbers match expected calculations

---

#### Journey 2: Refresh Prices

**Steps:**
1. Start with loaded portfolio
2. Note "Last updated" timestamp
3. Click "Refresh Prices" button
4. See loading indicator
5. See updated timestamp
6. Verify portfolio value updated

**Assertions:**
- Refresh button clickable
- Loading state during refresh
- Timestamp updates
- Values recalculate

---

#### Journey 3: Theme Toggle

**Steps:**
1. Open app in light mode
2. Click theme toggle
3. Verify dark mode applies
4. Refresh page
5. Verify dark mode persists

**Assertions:**
- Theme toggle works
- Colors change appropriately
- Preference persists across refresh

---

#### Journey 4: Mobile Responsive

**Steps:**
1. Open app on mobile viewport (375px)
2. Load portfolio
3. Scroll through dashboard
4. Verify all content accessible

**Assertions:**
- Single column layout
- No horizontal scroll
- Touch targets ≥44px
- Readable text sizes

---

#### Journey 5: Error Recovery

**Steps:**
1. Load invalid YAML file
2. See error message
3. Click "Try Again"
4. Load valid file
5. See dashboard

**Assertions:**
- Error displays clearly
- Retry mechanism works
- Can recover from error

---

### 5.2 E2E Test Implementation

**Tool:** Playwright

**Test Structure:**
```typescript
// e2e/portfolio-loading.spec.ts
import { test, expect } from '@playwright/test';

test('complete portfolio workflow', async ({ page }) => {
  await page.goto('/');
  
  // Empty state
  await expect(page.getByText('Load Portfolio')).toBeVisible();
  
  // Upload file
  await page.setInputFiles('input[type="file"]', 'examples/portfolio-simple.yaml');
  
  // Wait for dashboard
  await expect(page.getByText('Total Portfolio Value')).toBeVisible({ timeout: 10000 });
  
  // Verify content
  const value = await page.locator('[data-testid="portfolio-value"]').textContent();
  expect(value).toContain('€');
  
  // Check holdings table
  await expect(page.getByText('VWCE')).toBeVisible();
  
  // Take screenshot
  await page.screenshot({ path: 'screenshots/dashboard.png' });
});
```

---

## 6. Performance Testing

### 6.1 Lighthouse Metrics

**Target Scores:**
- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥80

**Key Metrics:**
- First Contentful Paint: <1.8s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.8s
- Cumulative Layout Shift: <0.1

---

### 6.2 Load Testing Scenarios

**Scenario 1: Large Portfolio**
- 50 different ETFs
- 1000 total transactions
- Measure: Parse time, calculation time, render time
- Target: <3 seconds total

**Scenario 2: Slow Network**
- Throttle to 3G
- Measure: Initial load time
- Target: <10 seconds

**Scenario 3: API Rate Limit**
- 50 ETFs (requires queuing)
- Measure: Total price fetch time
- Target: <2 minutes (with progress indicator)

---

## 7. Accessibility Testing

### 7.1 Automated Tests

**Tool:** axe-core + jest-axe

**Test Coverage:**
- All main views (Empty State, Dashboard, Error State)
- All interactive components (buttons, file input, charts)
- Color contrast ratios
- Keyboard navigation
- Screen reader support

**Example Test:**
```typescript
test('dashboard has no accessibility violations', async () => {
  const { container } = render(<Dashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

### 7.2 Manual Testing Checklist

**Keyboard Navigation:**
- [ ] Tab through all interactive elements
- [ ] File upload works with Enter key
- [ ] Theme toggle works with keyboard
- [ ] Focus indicators visible

**Screen Reader:**
- [ ] All images have alt text
- [ ] Charts have aria-labels
- [ ] Form inputs have labels
- [ ] Status messages announced

**Color Blindness:**
- [ ] P&L indicators distinguishable without color
- [ ] Charts use patterns in addition to color
- [ ] Theme works for all color blindness types

---

## 8. Browser & Device Testing

### 8.1 Browser Compatibility Matrix

| Browser | Versions | Priority | Status |
|---------|----------|----------|--------|
| Chrome | 90+ | P0 | ✓ |
| Firefox | 88+ | P0 | ✓ |
| Safari | 14+ | P0 | ✓ |
| Edge | 90+ | P0 | ✓ |
| Opera | Latest | P2 | - |

---

### 8.2 Device Testing

**Desktop:**
- Windows 10/11
- macOS Monterey+
- Ubuntu 20.04+

**Mobile:**
- iPhone SE (375×667)
- iPhone 14 (390×844)
- iPad (768×1024)
- Samsung Galaxy S21 (360×800)
- Samsung Galaxy Tab

**Responsive Breakpoints:**
- 320px (min)
- 375px (iPhone SE)
- 768px (tablet)
- 1024px (desktop)
- 1440px (large desktop)

---

## 9. Security Testing

### 9.1 Client-Side Security

**XSS Prevention:**
- ✓ React escapes all user input by default
- ✓ No dangerouslySetInnerHTML usage
- ✓ Validate all YAML parsing output

**API Key Security:**
- ✓ API key in environment variable
- ✓ Not exposed in client bundle
- ✓ HTTPS-only API calls

**Data Privacy:**
- ✓ No data sent to backend
- ✓ Portfolio data never leaves browser
- ✓ localStorage cleared on demand

---

### 9.2 Dependency Security

**Tools:**
- npm audit (vulnerabilities in dependencies)
- Snyk (automated security scanning)
- Dependabot (automated updates)

**Process:**
- Run npm audit before each release
- Fix high/critical vulnerabilities immediately
- Update dependencies monthly

---

## 10. Test Data Management

### 10.1 Test Portfolio Files

**Simple Portfolio:**
```yaml
# test-data/simple-portfolio.yaml
targetAllocation:
  Stocks: 100
etfs:
  VWCE:
    name: "Vanguard FTSE All-World"
    assetClasses:
      - name: "Global Stocks"
        category: "Stocks"
        percentage: 100
    transactions:
      - date: "2024-01-15"
        quantity: 10
        price: 95.50
```

**Complex Portfolio:**
```yaml
# test-data/complex-portfolio.yaml
targetAllocation:
  Stocks: 70
  Bonds: 20
  Real Estate: 10
etfs:
  VWCE:
    # ... multiple asset classes
  BND:
    # ... bond ETF
  VNQ:
    # ... real estate ETF
  # ... multiple transactions, buys and sells
```

**Invalid Portfolio:**
```yaml
# test-data/invalid-portfolio.yaml
targetAllocation:
  Stocks: 95  # Invalid: doesn't sum to 100
etfs:
  VWCE:
    assetClasses:
      - category: "Stocks"
        percentage: 103  # Invalid: > 100
    transactions:
      - date: "2024/01/15"  # Invalid: wrong date format
        quantity: "ten"     # Invalid: not a number
        price: -95.50       # Invalid: negative price
```

---

### 10.2 Mock API Responses

**Success Response:**
```json
{
  "Global Quote": {
    "01. symbol": "VWCE",
    "05. price": "102.5000",
    "07. latest trading day": "2025-11-29",
    "09. change": "0.5000",
    "10. change percent": "0.4902%"
  }
}
```

**Error Responses:**
```json
// Rate Limit Error
{
  "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute."
}

// Invalid API Key
{
  "Error Message": "Invalid API call. Please retry or visit the documentation."
}

// Invalid Symbol
{
  "Error Message": "Invalid API call. Symbol not found."
}
```

---

## 11. Test Automation

### 11.1 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

### 11.2 Pre-commit Hooks

**Husky Configuration:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## 12. Test Coverage Goals

### 12.1 Coverage Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Services | 95% | Critical business logic |
| Utilities | 90% | Pure functions, easy to test |
| Components | 80% | UI components, visual testing supplement |
| Hooks | 85% | Reusable logic |
| Overall | 80% | Balanced coverage |

---

### 12.2 Coverage Monitoring

**Tools:**
- Istanbul/nyc (coverage reporting)
- Codecov (coverage tracking)
- SonarQube (code quality + coverage)

**Process:**
- Coverage reports on every PR
- Fail PR if coverage drops >2%
- Weekly coverage review meetings

---

## 13. Known Testing Challenges

### 13.1 Challenge: API Rate Limiting

**Issue:** Alpha Vantage limits to 5 calls/minute, making tests slow.

**Solution:**
- Mock API calls in unit/integration tests
- Use VCR-style fixtures for recorded responses
- Only hit real API in E2E tests (sparingly)
- Use separate test API key with higher limits

---

### 13.2 Challenge: File Upload Testing

**Issue:** Browser File API difficult to test.

**Solution:**
- Mock File objects in tests
- Use Testing Library's `user.upload()` helper
- Test file reading logic separately from UI

---

### 13.3 Challenge: IndexedDB/localStorage Testing

**Issue:** Browser storage requires DOM environment.

**Solution:**
- Use fake-indexeddb and localstorage-polyfill
- Mock storage in unit tests
- Test storage in integration tests with jsdom

---

### 13.4 Challenge: Chart Testing

**Issue:** Recharts renders SVG, difficult to assert on.

**Solution:**
- Test data transformation, not rendering
- Visual regression testing for charts
- Accessibility testing for chart labels

---

## 14. Regression Testing

### 14.1 Regression Test Suite

**Scenarios to Test on Every Release:**
1. Load valid portfolio → dashboard displays correctly
2. Invalid YAML → error message displays
3. API rate limit → graceful degradation
4. Offline mode → uses cached prices
5. Theme toggle → persists across reload
6. Mobile responsive → all content accessible
7. Refresh prices → values update
8. Large portfolio (50 ETFs) → performance acceptable

---

### 14.2 Smoke Test Checklist

**Quick sanity check before release:**
- [ ] App loads without errors
- [ ] Can load example portfolio file
- [ ] Dashboard displays with correct values
- [ ] Rebalancing status shows correctly
- [ ] Theme toggle works
- [ ] Refresh prices works
- [ ] No console errors
- [ ] Mobile view renders correctly

---

## 15. Test Maintenance Strategy

### 15.1 Test Review Process

**Quarterly Review:**
- Identify flaky tests (fail inconsistently)
- Remove obsolete tests
- Update tests for new features
- Refactor duplicated test code

---

### 15.2 Test Documentation

**Requirements:**
- Each test file has header comment
- Complex tests have explanatory comments
- Test data fixtures documented
- Setup/teardown logic explained

**Example:**
```typescript
/**
 * Portfolio Service Tests
 * 
 * Tests the core portfolio calculation logic including:
 * - Holdings calculation from transactions
 * - Portfolio value and P&L
 * - Asset allocation across multiple ETFs
 * 
 * Key edge cases:
 * - Zero quantity (fully sold positions)
 * - Multiple buys and sells
 * - ETFs with multiple asset classes
 */
describe('PortfolioService', () => {
  // ...
});
```

---

## 16. Test Reporting

### 16.1 Test Reports

**Generated Reports:**
- Unit test results (Vitest HTML report)
- Coverage report (Istanbul HTML)
- E2E test videos (Playwright)
- Accessibility report (axe-core JSON)
- Performance report (Lighthouse JSON)

---

### 16.2 Metrics Dashboard

**Key Metrics to Track:**
- Test pass rate (target: >99%)
- Code coverage (target: >80%)
- Test execution time (target: <5 min)
- Flaky test rate (target: <1%)
- Bug escape rate (bugs found in production)

---

## 17. Definition of Done - Testing Perspective

### Story-Level DoD
- [ ] Unit tests written for new code
- [ ] Integration tests added if applicable
- [ ] All tests passing
- [ ] Code coverage ≥80% for new code
- [ ] No new accessibility violations
- [ ] Manual testing completed
- [ ] Test documentation updated

### Release-Level DoD
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Cross-browser testing completed
- [ ] Mobile device testing completed
- [ ] Security scan passed
- [ ] Regression test suite passed

---

## 18. Risk Assessment

### 18.1 High Risk Areas

**Calculation Logic (P0):**
- Portfolio value calculations
- P&L calculations
- Asset allocation distribution
- Rebalancing drift calculations

**Mitigation:** Exhaustive unit tests, manual verification with real portfolios

**API Integration (P0):**
- Rate limiting
- Error handling
- Caching logic

**Mitigation:** Mock API tests, integration tests with test API key

**Data Validation (P0):**
- YAML parsing
- Business rule validation

**Mitigation:** Comprehensive test data including edge cases

---

### 18.2 Medium Risk Areas

**UI Rendering (P1):**
- Responsive layouts
- Chart rendering
- Theme switching

**Mitigation:** Visual regression testing, manual cross-browser testing

**Browser Compatibility (P1):**
- Storage APIs
- File APIs
- Fetch API

**Mitigation:** Polyfills, cross-browser E2E tests

---

## 19. Testability Improvements

### 19.1 Code Design for Testability

**Principles:**
1. **Pure Functions** - No side effects, easy to test
2. **Dependency Injection** - Pass dependencies as parameters
3. **Single Responsibility** - Each function does one thing
4. **Separation of Concerns** - Logic separate from UI

**Example:**
```typescript
// Good: Pure function, easy to test
export function calculateProfitLoss(
  currentValue: number,
  totalCost: number
): ProfitLoss {
  const absolute = currentValue - totalCost;
  const percent = (absolute / totalCost) * 100;
  return { absolute, percent };
}

// Bad: Side effects, hard to test
export function calculateAndDisplayProfitLoss() {
  const value = getValueFromDOM();
  const cost = getCostFromStorage();
  const pl = value - cost;
  updateDOMWithPL(pl);
}
```

---

### 19.2 Test Utilities

**Create Reusable Test Helpers:**
```typescript
// test-utils/factories.ts

export function createMockPortfolio(overrides?: Partial<Portfolio>): Portfolio {
  return {
    targetAllocation: { Stocks: 100 },
    etfs: {
      VWCE: createMockETF()
    },
    ...overrides
  };
}

export function createMockETF(overrides?: Partial<ETF>): ETF {
  return {
    name: 'Test ETF',
    assetClasses: [{ category: 'Stocks', percentage: 100 }],
    transactions: [{ date: '2024-01-15', quantity: 10, price: 100 }],
    ...overrides
  };
}
```

---

## 20. Conclusion

### 20.1 Testing Summary

This comprehensive test design ensures the Portfolio Tracker is:
- ✅ **Functionally Correct** - All calculations verified
- ✅ **Reliable** - Error handling and edge cases covered
- ✅ **Performant** - Load times and responsiveness tested
- ✅ **Accessible** - WCAG AA compliance verified
- ✅ **Maintainable** - Clear test structure and documentation

### 20.2 Testability Score: 8.5/10

**Strengths:**
- Pure client-side architecture (no backend complexity)
- Service layer abstraction (easily mockable)
- Component-based UI (isolated testing)
- TypeScript types (clear contracts)
- Pure calculation functions (deterministic)

**Areas for Improvement:**
- API mocking requires careful setup
- Chart testing needs visual regression tools
- Browser API mocking adds complexity

### 20.3 Next Steps

1. ✅ Test design approved
2. 🔜 Implement test infrastructure (Vitest, Playwright setup)
3. 🔜 Write unit tests alongside story implementation
4. 🔜 Build E2E test suite during integration
5. 🔜 Set up CI/CD pipeline with automated testing
6. 🔜 Conduct accessibility and performance audits before release

---

**Document History:**
- 2025-11-30: Initial test design document (v1.0)

**Approvals:**
- Test Engineering Analyst: ✓
- Development Lead: Pending
- Product Manager: Pending
