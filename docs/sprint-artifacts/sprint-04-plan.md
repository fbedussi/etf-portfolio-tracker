# Sprint 4 Plan: Dashboard UI Start

**Sprint Duration:** 2 weeks  
**Sprint Goal:** Implement core dashboard UI components to visualize portfolio metrics  
**Total Committed Points:** 20

---

## Sprint Overview

Sprint 4 begins the Dashboard UI implementation (Epic 5). With the calculation engine complete from Sprint 3, we can now build the user-facing components that display portfolio data.

**Strategic Focus:**
- Start with formatting utilities (foundation)
- Build data visualization components
- Create main dashboard layout
- Ensure responsive design from the start

---

## Committed Stories

### S5.5: Implement Number Formatting Utilities
**Points:** 2  
**Priority:** P0  
**Epic:** E5 - Dashboard UI

**Description:** Create utilities for consistent number and currency formatting throughout the application.

**Acceptance Criteria:**
- [x] `utils/formatters.ts` already exists with basic functions
- [ ] Add `formatCurrency(value, currency?)` - formats with symbol and decimals
- [ ] Add `formatPercent(value, decimals?)` - formats percentage with sign
- [ ] Add `formatCompactNumber(value)` - formats large numbers (1.2M, 5.3K)
- [ ] Locale-aware formatting (defaults to user's locale)
- [ ] Comprehensive unit tests

**Technical Notes:**
- Extend existing formatters.ts
- Use Intl.NumberFormat for locale support
- Handle negative values with proper signs
- Format edge cases (0, null, undefined)

---

### S5.1: Create Portfolio Value Card
**Points:** 3  
**Priority:** P0  
**Epic:** E5 - Dashboard UI

**Description:** Build the hero component showing total portfolio value and P&L.

**Acceptance Criteria:**
- [ ] Create `components/portfolio/PortfolioValueCard.tsx`
- [ ] Uses `usePortfolio` hook for metrics
- [ ] Displays total portfolio value with currency formatting
- [ ] Shows total P&L (absolute and percentage)
- [ ] Color-coded P&L (green profit, red loss, gray neutral)
- [ ] Large, readable typography
- [ ] Responsive layout (card-based)
- [ ] Loading state while calculating
- [ ] Comprehensive tests

**Design Specifications:**
```
┌─────────────────────────────────┐
│  Total Portfolio Value          │
│  €102,350.45                    │
│                                 │
│  +€12,350.45 (+13.7%)          │
│  ▲ Profit (green)              │
└─────────────────────────────────┘
```

**Dependencies:**
- usePortfolio hook (S4.5 - completed)
- formatCurrency, formatPercent utilities (S5.5)

---

### S5.3: Create Asset Allocation Chart
**Points:** 5  
**Priority:** P0  
**Epic:** E5 - Dashboard UI

**Description:** Visualize current asset class allocation with an interactive chart.

**Acceptance Criteria:**
- [ ] Create `components/portfolio/AssetAllocationChart.tsx`
- [ ] Uses Recharts library (PieChart or BarChart)
- [ ] Displays allocation breakdown by asset category
- [ ] Shows category name and percentage
- [ ] Color-coded categories (consistent palette)
- [ ] Legend with category names and values
- [ ] Responsive sizing
- [ ] Empty state when no data
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Comprehensive tests

**Chart Data Structure:**
```typescript
{
  Stocks: 70.2,
  Bonds: 19.5,
  "Real Estate": 10.3
}
```

**Dependencies:**
- usePortfolio hook (provides currentAllocation)
- Recharts library (already installed)

---

### S5.2: Create Holdings Table Component
**Points:** 5  
**Priority:** P0  
**Epic:** E5 - Dashboard UI

**Description:** Display all ETF holdings in a sortable, responsive table.

**Acceptance Criteria:**
- [ ] Create `components/portfolio/HoldingsTable.tsx`
- [ ] Columns: Ticker, Name, Quantity, Current Price, Current Value, P&L
- [ ] Sortable columns (click header to sort)
- [ ] Color-coded P&L column (green/red)
- [ ] Responsive layout (stacks or horizontal scroll on mobile)
- [ ] Shows loading skeleton while fetching prices
- [ ] Empty state when no holdings
- [ ] Uses shadcn/ui Table component
- [ ] Comprehensive tests

**Table Structure:**
| Ticker | Name | Qty | Price | Value | P&L |
|--------|------|-----|-------|-------|-----|
| VWCE | Vanguard FTSE All-World | 100 | €102.50 | €10,250 | +€750 (+7.9%) |

**Dependencies:**
- usePortfolio hook (provides holdingsByETF)
- formatCurrency, formatPercent utilities

---

### S5.4: Create Main Dashboard Layout
**Points:** 3  
**Priority:** P0  
**Epic:** E5 - Dashboard UI

**Description:** Compose all dashboard components into the main view with proper layout.

**Acceptance Criteria:**
- [ ] Create `components/dashboard/Dashboard.tsx`
- [ ] Grid layout with portfolio value card at top (hero position)
- [ ] Asset allocation chart and holdings table below
- [ ] Responsive breakpoints (desktop: 2-column, tablet: 1-column, mobile: stacked)
- [ ] Smooth transitions between states (empty → loading → loaded)
- [ ] Proper spacing and padding
- [ ] Uses existing layout components (AppShell, MainContent)
- [ ] Comprehensive tests

**Layout Hierarchy:**
```
Dashboard
├── PortfolioValueCard (full width, hero)
├── Grid (2 columns on desktop)
│   ├── AssetAllocationChart
│   └── Additional metrics (future)
└── HoldingsTable (full width)
```

**Dependencies:**
- PortfolioValueCard (S5.1)
- AssetAllocationChart (S5.3)
- HoldingsTable (S5.2)

---

### S5.8: Add Load Different Portfolio Action
**Points:** 2  
**Priority:** P0  
**Epic:** E5 - Dashboard UI

**Description:** Allow users to load a different portfolio file after initial load.

**Acceptance Criteria:**
- [ ] Add "Load Different Portfolio" button to Header
- [ ] Clears current portfolio state in store
- [ ] Clears prices and cache
- [ ] Returns user to empty state with file upload
- [ ] Button only visible when portfolio is loaded
- [ ] Confirmation dialog (optional for now)
- [ ] Tests for state clearing

**Technical Notes:**
- Add action to portfolioStore: `clearPortfolio()`
- Add action to priceStore: `clearAllPrices()`
- Update Header component to show button conditionally

---

## Sprint Metrics

**Committed Points:** 20  
**Stories:** 6  
**Average Velocity:** 19 pts (Sprint 1: 15, Sprint 2: 23, Sprint 3: 19)  
**Commitment Rationale:** Slightly above average to maintain momentum

**Epics Coverage:**
- E5 (Dashboard UI): 20 points (partial, 6/9 stories)

**Deferred Stories (to Sprint 5):**
- S5.6: Skeleton Loading States (2 pts) - Nice to have, can use simple loaders
- S5.7: Date Formatting (1 pt) - Already partially done in formatters
- S5.9: Theme Styling (2 pts) - Can apply incrementally

---

## Technical Approach

### Implementation Order

1. **S5.5: Formatters** (2 pts, ~4 hours)
   - Foundation for all UI components
   - Extend existing formatters.ts
   - Add comprehensive tests

2. **S5.1: Portfolio Value Card** (3 pts, ~1 day)
   - First visible component
   - Simple data binding
   - Test integration with usePortfolio

3. **S5.3: Asset Allocation Chart** (5 pts, ~2 days)
   - Most complex visualization
   - Learn Recharts patterns
   - Ensure accessibility

4. **S5.2: Holdings Table** (5 pts, ~2 days)
   - Core data display
   - Sorting logic
   - Responsive design

5. **S5.4: Dashboard Layout** (3 pts, ~1 day)
   - Integration component
   - Compose all pieces
   - Polish responsive behavior

6. **S5.8: Load Portfolio Action** (2 pts, ~4 hours)
   - Quick win
   - Important UX feature
   - Simple state management

**Total Estimated Time:** ~9-10 days (with buffer for testing and polish)

---

## Dependencies & Risks

### Dependencies Met ✅
- ✅ E4 (Calculations Engine) - Complete from Sprint 3
- ✅ usePortfolio hook - Provides all metrics
- ✅ Basic formatters - Already exist in utils/
- ✅ Recharts library - Already installed
- ✅ shadcn/ui components - Configured and ready

### Risks

**Risk 1: Recharts Learning Curve**
- **Severity:** Medium
- **Mitigation:** Start with simple pie chart, extensive documentation available
- **Contingency:** Can swap to simpler bar chart or CSS-based visualization

**Risk 2: Responsive Table Complexity**
- **Severity:** Medium
- **Mitigation:** Use shadcn/ui Table component, test on multiple breakpoints
- **Contingency:** Use horizontal scroll container as fallback

**Risk 3: Performance with Large Portfolios**
- **Severity:** Low
- **Mitigation:** useMemo already implemented in usePortfolio hook
- **Contingency:** Add virtualization if >100 holdings (unlikely for MVP)

---

## Testing Strategy

### Unit Tests
- All formatters with edge cases
- Component rendering with mock data
- Sorting logic in HoldingsTable
- State clearing in Load Portfolio action

### Integration Tests
- Dashboard composition with real stores
- usePortfolio hook integration
- State transitions (empty → loading → loaded)

### Visual Tests
- Responsive breakpoints
- Color coding (P&L green/red)
- Chart rendering
- Loading states

**Target Coverage:** >85% for new components

---

## Definition of Done

- [ ] All 6 stories completed with acceptance criteria met
- [ ] All tests passing (unit + integration)
- [ ] No ESLint errors or warnings
- [ ] Components documented with props interfaces
- [ ] Responsive design verified on desktop, tablet, mobile
- [ ] Accessibility checked (keyboard navigation, contrast)
- [ ] Code reviewed (self-review + best practices)
- [ ] Sprint-status.yaml updated

---

## Success Metrics

**Functional:**
- Dashboard displays all portfolio metrics correctly
- Charts visualize allocation accurately
- Table sorts and displays holdings properly
- Load portfolio action clears state successfully

**Quality:**
- Test coverage >85% for new components
- No critical bugs or errors
- Lighthouse accessibility score >90
- Bundle size increase <100KB

**Velocity:**
- Complete 20 committed points
- Maintain ~19 point velocity
- Zero carryover stories

---

## Next Sprint Preview (Sprint 5)

**Planned Stories:**
- S6.1-S6.4: Rebalancing Analysis (11 pts)
- S5.6, S5.7, S5.9: Dashboard polish (5 pts)
- S7.1: Responsive layouts (3 pts)

**Total Estimated:** 19-21 pts

---

**Sprint Start Date:** December 2, 2025  
**Sprint End Date:** December 16, 2025  
**Sprint Review:** December 16, 2025  
**Sprint Retrospective:** December 16, 2025
