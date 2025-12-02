# Sprint 3 Plan: Price Integration Completion & Calculations Start

**Sprint Number:** 3  
**Sprint Name:** Price Integration & Calculations  
**Duration:** 2 weeks (Dec 2 - Dec 16, 2025)  
**Status:** In Progress  
**Team Capacity:** 1 developer × 2 weeks = 10 working days

---

## 🎯 Sprint Goals

1. **Complete ETF Price Integration Epic (E3)** - Finish S3.6 (Refresh Button) and S3.7 (Price Metadata)
2. **Start Portfolio Calculations Engine (E4)** - Implement core calculation services
3. **Enable Portfolio Metrics** - Calculate holdings, value, P&L, and asset allocation

**Success Criteria:**
- ✅ Price integration 100% complete with UI controls
- ✅ Portfolio calculations functional
- ✅ Dashboard can display calculated metrics
- ✅ All Sprint 3 acceptance criteria met

---

## 📊 Sprint Metrics

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| **Committed Story Points** | 23-25 | TBD | Based on velocity of 21 avg |
| **Stories Committed** | 8-9 | TBD | E3 (2 stories) + E4 (6 stories) |
| **Stories Completed** | - | - | In progress |
| **Epics in Sprint** | 2 | 2 | E3 (completion), E4 (start) |
| **Target Velocity** | 23-25 points | - | Based on Sprint 1 & 2 average |
| **Team Capacity** | 10 days | - | - |

---

## 📋 User Stories

### Epic 3: ETF Price Integration (Completion)
**Remaining Points:** 3 (2 stories)

#### S3.6: Add Refresh Prices Button
**Priority:** P0 | **Points:** 2 | **Status:** Not Started

**Description:** Add UI control to manually refresh prices and bypass cache.

**Acceptance Criteria:**
- [ ] Button in Header component or Dashboard
- [ ] Calls `usePrices.refreshPrices()`
- [ ] Shows loading spinner during refresh
- [ ] Displays last updated timestamp
- [ ] Disabled state while loading
- [ ] Success feedback after refresh

**Implementation Tasks:**
1. Add refresh button to Header component
2. Wire up to usePrices hook
3. Implement loading state UI
4. Add timestamp display
5. Handle success/error states
6. Write component tests

**Dependencies:** S3.4 (usePrices hook - completed in Sprint 2)

**Notes:** Logic already implemented in `usePrices.refreshPrices()`, only UI needed.

---

#### S3.7: Display Price Metadata
**Priority:** P1 | **Points:** 1 | **Status:** Not Started

**Description:** Show when prices were last updated and their source.

**Acceptance Criteria:**
- [ ] Display "Prices updated X minutes ago"
- [ ] Show source indicator (API vs Cache)
- [ ] Format timestamp using relative time
- [ ] Update timestamp after refresh
- [ ] Display in header or near portfolio value

**Implementation Tasks:**
1. Create timestamp formatting utility
2. Add metadata display component
3. Connect to priceStore timestamp
4. Implement relative time formatting
5. Add cache/API indicator
6. Style and position appropriately

**Dependencies:** S3.6 (Refresh Button)

---

### Epic 4: Portfolio Calculations Engine (Start)
**Committed Points:** 16 (6 stories)

#### S4.1: Implement Holdings Calculation
**Priority:** P0 | **Points:** 3 | **Status:** Not Started

**Description:** Calculate current holdings and cost basis for each ETF from transaction history.

**Acceptance Criteria:**
- [ ] `services/portfolioService.ts` created
- [ ] `calculateHoldings(etfs)` method sums transactions
- [ ] Calculates weighted average cost basis
- [ ] Returns Holdings object with quantity, costBasis, totalCost
- [ ] Handles both buy (positive) and sell (negative) quantities
- [ ] Edge case: handles zero total quantity

**Calculation Logic:**
```typescript
// Sum all quantities
quantity = sum(transaction.quantity)

// Weighted average cost
totalCost = sum(transaction.quantity * transaction.price)
costBasis = totalCost / quantity (if quantity > 0)
```

**Implementation Tasks:**
1. Create portfolioService module
2. Implement calculateHoldings function
3. Add weighted average cost calculation
4. Handle edge cases (zero quantity, sells)
5. Add TypeScript types for Holdings
6. Write comprehensive unit tests

**Dependencies:** E2 (Portfolio data structure)

---

#### S4.2: Implement Portfolio Value Calculation
**Priority:** P0 | **Points:** 2 | **Status:** Not Started

**Description:** Calculate total current portfolio value using current prices.

**Acceptance Criteria:**
- [ ] `calculatePortfolioValue(holdings, prices)` method created
- [ ] Multiplies quantity × current price for each ETF
- [ ] Sums across all holdings
- [ ] Returns total portfolio value
- [ ] Handles missing prices gracefully (exclude or use cached)
- [ ] Returns 0 for empty portfolio

**Implementation Tasks:**
1. Add calculatePortfolioValue function
2. Integrate with holdings calculation
3. Handle missing price scenarios
4. Add error handling
5. Write unit tests

**Dependencies:** S4.1 (Holdings Calculation), E3 (Price data)

---

#### S4.3: Implement Profit/Loss Calculation
**Priority:** P0 | **Points:** 2 | **Status:** Not Started

**Description:** Calculate total and per-ETF profit/loss with percentages.

**Acceptance Criteria:**
- [ ] Calculates P&L as: currentValue - totalCost
- [ ] Returns absolute P&L and percentage
- [ ] Calculates per-ETF P&L for holdings table
- [ ] Handles edge cases (zero cost basis, all sells)
- [ ] Returns null for invalid scenarios

**Formula:**
```
P&L = (quantity × currentPrice) - totalCost
P&L% = (P&L / totalCost) × 100
```

**Implementation Tasks:**
1. Add calculateProfitLoss function
2. Implement percentage calculation
3. Handle per-ETF and portfolio-wide P&L
4. Add edge case handling
5. Write unit tests

**Dependencies:** S4.1 (Holdings), S4.2 (Portfolio Value)

---

#### S4.4: Implement Asset Class Allocation Calculation
**Priority:** P0 | **Points:** 5 | **Status:** Not Started

**Description:** Calculate current asset class allocation across all ETFs with weighted distribution.

**Acceptance Criteria:**
- [ ] `calculateAllocation(holdings, prices)` method created
- [ ] Distributes each ETF's value across its asset classes
- [ ] Groups by category (Stocks, Bonds, Real Estate, etc.)
- [ ] Returns allocation as percentages
- [ ] Handles multiple asset classes per ETF
- [ ] Percentages sum to 100% (or very close)

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

**Implementation Tasks:**
1. Add calculateAllocation function
2. Implement weighted distribution logic
3. Group by asset class category
4. Calculate percentage allocations
5. Handle edge cases (missing prices, zero value)
6. Write comprehensive unit tests

**Dependencies:** S4.2 (Portfolio Value)

---

#### S4.5: Build usePortfolio Custom Hook
**Priority:** P0 | **Points:** 3 | **Status:** Not Started

**Description:** React hook to orchestrate portfolio calculations and manage state.

**Acceptance Criteria:**
- [ ] `hooks/usePortfolio.ts` custom hook created
- [ ] Triggers calculations when portfolio or prices change
- [ ] Updates `portfolioStore.metrics` with results
- [ ] Exposes portfolio metrics to components
- [ ] Memoizes calculations to avoid redundant work
- [ ] Handles loading states during calculation

**Hook Returns:**
```typescript
{
  metrics: PortfolioMetrics | null;
  isCalculating: boolean;
  recalculate: () => void;
}
```

**Implementation Tasks:**
1. Create usePortfolio hook
2. Wire up to portfolioService functions
3. Implement effect to trigger on data changes
4. Add memoization with useMemo
5. Connect to portfolioStore
6. Write hook tests

**Dependencies:** S4.1-S4.4 (All calculation functions)

---

#### S4.6: Create Calculation Utility Functions
**Priority:** P0 | **Points:** 1 | **Status:** Not Started

**Description:** Build reusable utility functions for common calculations.

**Acceptance Criteria:**
- [ ] `utils/calculations.ts` created
- [ ] `calculateWeightedAverage()` function
- [ ] `sumByKey()` function for aggregations
- [ ] `percentageChange()` function
- [ ] `roundToDecimals()` function
- [ ] All functions have JSDoc comments
- [ ] All functions have unit tests

**Implementation Tasks:**
1. Create calculations utility module
2. Implement weighted average calculation
3. Implement sumByKey aggregation
4. Implement percentage utilities
5. Add JSDoc documentation
6. Write unit tests

**Dependencies:** None (utilities)

---

## 📅 Sprint Timeline

### Week 1 (Dec 2-6)
- **Mon-Tue:** Complete E3 stories (S3.6, S3.7) - UI for price refresh
- **Wed-Fri:** Start E4 foundation (S4.6 utilities, S4.1 holdings calculation)

### Week 2 (Dec 9-13)
- **Mon-Tue:** Portfolio value and P&L (S4.2, S4.3)
- **Wed-Thu:** Asset allocation calculation (S4.4)
- **Fri:** usePortfolio hook integration (S4.5)

### Sprint End (Dec 16)
- Sprint review
- Sprint retrospective
- Update sprint-status.yaml with actuals
- Plan Sprint 4

---

## 🎯 Sprint Backlog Priority

| Priority | Story | Points | Rationale |
|----------|-------|--------|-----------|
| 1 | S3.6 | 2 | Complete E3, enable UI price refresh |
| 2 | S3.7 | 1 | Price metadata for user transparency |
| 3 | S4.6 | 1 | Utilities needed for calculations |
| 4 | S4.1 | 3 | Foundation for all other calculations |
| 5 | S4.2 | 2 | Portfolio value needed for P&L |
| 6 | S4.3 | 2 | P&L critical for dashboard |
| 7 | S4.4 | 5 | Complex but required for allocation |
| 8 | S4.5 | 3 | Integration layer for React components |

**Total Committed:** 19 points (conservative based on complexity)

---

## 🔗 Dependencies

### External Dependencies
- None (all dependencies from previous sprints completed)

### Internal Dependencies
```
S3.6 → S3.7 (refresh before metadata display)
S4.6 → S4.1 (utilities used in calculations)
S4.1 → S4.2 → S4.3 (sequential calculation dependencies)
S4.2 → S4.4 (value needed for allocation)
S4.1, S4.2, S4.3, S4.4 → S4.5 (hook orchestrates all)
```

---

## ⚠️ Risks & Mitigation

### Risk 1: Calculation Complexity
**Impact:** High  
**Probability:** Medium  
**Mitigation:**
- Start with utilities and unit tests (S4.6 first)
- Comprehensive test coverage for edge cases
- Manual verification against spreadsheet calculations
- Peer review of calculation logic

### Risk 2: Performance with Large Portfolios
**Impact:** Medium  
**Probability:** Low  
**Mitigation:**
- Implement memoization in usePortfolio hook
- Test with large example portfolios (50+ ETFs)
- Profile performance if issues arise
- Consider Web Worker for heavy calculations (future)

### Risk 3: Floating Point Precision
**Impact:** Medium  
**Probability:** Medium  
**Mitigation:**
- Use proper rounding utilities
- Test with edge cases (very small percentages)
- Document precision limitations
- Consider using decimal libraries if needed

---

## ✅ Definition of Ready

Stories are ready to be worked if they meet:
- [ ] Acceptance criteria clearly defined
- [ ] Dependencies identified and completed
- [ ] Technical approach discussed
- [ ] Estimates validated by team
- [ ] Test scenarios identified

**All Sprint 3 stories meet DoR:** ✅

---

## ✅ Definition of Done

A story is done when:
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Code reviewed and approved
- [ ] No console errors or warnings
- [ ] TypeScript types defined
- [ ] JSDoc comments added
- [ ] Manual testing completed
- [ ] Integration with existing code verified
- [ ] Documentation updated (if needed)

---

## 📈 Velocity Tracking

| Sprint | Committed | Completed | Velocity | Notes |
|--------|-----------|-----------|----------|-------|
| Sprint 1 | 22 | 15 | 15 | Foundation, learning phase |
| Sprint 2 | 24 | 23 | 23 | Excellent productivity |
| Sprint 3 | 19-23 | TBD | TBD | Conservative estimate |

**Target Velocity:** 21 points (average of Sprint 1 & 2)  
**Committed Range:** 19-23 points allows flexibility

---

## 🎉 Sprint Success Criteria

Sprint 3 will be successful if:
1. ✅ E3 (Price Integration) is 100% complete
2. ✅ Portfolio calculations are functional and tested
3. ✅ usePortfolio hook provides metrics to UI
4. ✅ All unit tests passing with >80% coverage
5. ✅ Zero calculation accuracy bugs
6. ✅ Ready to start Dashboard UI in Sprint 4

---

## 📝 Notes

- **Focus:** Quality over speed - calculations must be accurate
- **Testing:** Comprehensive unit tests are critical for calculation functions
- **Documentation:** Document calculation formulas in code comments
- **Performance:** Monitor calculation performance with larger portfolios
- **Next Sprint:** Sprint 4 will focus on Dashboard UI (E5) using these calculations

---

## 🔄 Daily Standup Questions

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers or impediments?
4. Are calculations accurate and tested?
5. On track for sprint goals?

---

**Document History:**
- 2025-12-02: Sprint 3 plan created at sprint start
