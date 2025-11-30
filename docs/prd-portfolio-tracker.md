# Product Requirements Document (PRD)

**Product Name:** Personal ETF Portfolio Tracker  
**Version:** 1.0  
**Date:** 2025-11-30  
**Author:** Product Manager  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Vision
A pure client-side single-page application (SPA) that enables users to track their personal ETF investment portfolio, visualize asset allocation, monitor portfolio value, and receive rebalancing alerts—all without requiring a backend server or account creation.

### 1.2 Problem Statement
Individual investors managing ETF portfolios need a simple, privacy-focused tool to:
- Track buy/sell transactions across multiple ETFs
- Monitor current portfolio value with real-time market data
- Understand asset class allocation and geographic exposure
- Identify when portfolio drift requires rebalancing
- Maintain full data ownership and privacy

Existing solutions either require account creation (privacy concerns), subscription fees, or lack customization for personal allocation strategies.

### 1.3 Target Users
- **Primary:** Individual retail investors managing personal ETF portfolios
- **Characteristics:** 
  - Privacy-conscious users who prefer local data storage
  - Comfortable editing YAML/JSON files for data input
  - Seeking portfolio rebalancing guidance based on custom targets
  - Managing 5-50 different ETF positions

### 1.4 Success Metrics
- User can load portfolio data and see current value within 5 seconds
- Rebalancing alerts accurately reflect drift from target allocation
- Application works offline with cached price data
- Zero data leaves user's device (complete client-side operation)

---

## 2. Product Overview

### 2.1 Product Description
A web-based SPA that reads a user's local portfolio data file (YAML format), fetches current ETF prices via public APIs, calculates portfolio metrics, and displays:
- Total portfolio value and profit/loss
- Asset class breakdown by category
- Rebalancing status with visual indicators
- Responsive dashboard accessible on desktop, tablet, and mobile

### 2.2 Key Features (Summary)
1. Local YAML portfolio file import
2. Real-time ETF price fetching
3. Portfolio value and P&L calculation
4. Asset class breakdown visualization
5. Rebalancing alerts based on target allocation
6. Responsive dashboard UI
7. Theme support (light/dark mode)

### 2.3 Out of Scope (v1.0)
- Backend server or database
- User authentication or multi-user support
- Historical portfolio value charts
- Individual ETF performance analysis
- Multiple portfolio file management
- Transaction editing within the app
- Export functionality (PDF/CSV reports)
- Future projections or "what-if" scenarios

---

## 3. Functional Requirements

### FR1: Portfolio Data Management

#### FR1.1: YAML File Import
**Priority:** P0 (Must Have)  
**Description:** Application shall allow users to import a portfolio data file in YAML format.

**Acceptance Criteria:**
- AC1.1.1: User can select a YAML file via file picker dialog
- AC1.1.2: Application parses YAML file structure without external server
- AC1.1.3: Invalid YAML syntax displays clear error message to user
- AC1.1.4: File size limit of 10MB enforced

**Data Structure Requirements:**
```yaml
targetAllocation:
  Stocks: 70
  Bonds: 20
  Real Estate: 10

etfs:
  VWCE:
    name: "Vanguard FTSE All-World"
    assetClasses:
      - name: "US Large Cap"
        category: "Stocks"
        percentage: 60
      - name: "International Equity"
        category: "Stocks"
        percentage: 40
    transactions:
      - date: "2024-01-15"
        quantity: 10
        price: 95.50
      - date: "2024-06-20"
        quantity: -3
        price: 102.00  # Negative quantity = sell
```

#### FR1.2: Data Validation
**Priority:** P0 (Must Have)  
**Description:** Application shall validate portfolio data structure and content.

**Acceptance Criteria:**
- AC1.2.1: Validate all required fields present (targetAllocation, etfs)
- AC1.2.2: Verify asset class percentages for each ETF sum to 100%
- AC1.2.3: Ensure transaction dates are valid ISO 8601 format
- AC1.2.4: Confirm quantity and price are valid numbers
- AC1.2.5: Display validation errors with specific field references

---

### FR2: ETF Price Fetching

#### FR2.1: Real-time Price API Integration
**Priority:** P0 (Must Have)  
**Description:** Application shall fetch current ETF prices from external financial data API.

**Acceptance Criteria:**
- AC2.1.1: Integrate with Alpha Vantage API (per technical research)
- AC2.1.2: Fetch prices for all ETF tickers in portfolio
- AC2.1.3: Handle API rate limits gracefully (queue requests if needed)
- AC2.1.4: Display loading indicators during price fetch
- AC2.1.5: Handle API errors with user-friendly messages
- AC2.1.6: Support international ETF tickers

#### FR2.2: Price Caching
**Priority:** P1 (Should Have)  
**Description:** Application shall cache fetched prices locally to minimize API calls.

**Acceptance Criteria:**
- AC2.2.1: Store fetched prices in browser localStorage or IndexedDB
- AC2.2.2: Include timestamp with each cached price
- AC2.2.3: Use cached prices if less than 15 minutes old
- AC2.2.4: Provide manual "Refresh Prices" button to force re-fetch
- AC2.2.5: Display last updated timestamp for prices

#### FR2.3: Offline Mode
**Priority:** P2 (Nice to Have)  
**Description:** Application shall function with cached data when offline.

**Acceptance Criteria:**
- AC2.3.1: Display portfolio calculations using last cached prices
- AC2.3.2: Show clear indicator that app is in offline mode
- AC2.3.3: Display age of cached data (e.g., "Prices as of 2 hours ago")
- AC2.3.4: Attempt to refresh prices when connection restored

---

### FR3: Portfolio Calculations

#### FR3.1: Holdings Calculation
**Priority:** P0 (Must Have)  
**Description:** Application shall calculate current holdings for each ETF based on transaction history.

**Acceptance Criteria:**
- AC3.1.1: Sum all transaction quantities (positive for buys, negative for sells)
- AC3.1.2: Calculate weighted average cost basis per ETF
- AC3.1.3: Handle zero or negative final holdings (display warning)
- AC3.1.4: Display current quantity held per ETF

#### FR3.2: Portfolio Value Calculation
**Priority:** P0 (Must Have)  
**Description:** Application shall calculate total current portfolio value.

**Acceptance Criteria:**
- AC3.2.1: Multiply current holdings by current price for each ETF
- AC3.2.2: Sum values across all ETFs for total portfolio value
- AC3.2.3: Display currency symbol (€ or $ based on locale)
- AC3.2.4: Format numbers with appropriate thousand separators

#### FR3.3: Profit/Loss Calculation
**Priority:** P0 (Must Have)  
**Description:** Application shall calculate total profit/loss (realized + unrealized).

**Acceptance Criteria:**
- AC3.3.1: Calculate total cost basis (sum of buy_quantity × price - sell_quantity × price)
- AC3.3.2: Calculate P&L as current_value - total_cost_basis
- AC3.3.3: Display P&L in both absolute value and percentage
- AC3.3.4: Use color coding (green for profit, red for loss)

#### FR3.4: Asset Class Allocation Calculation
**Priority:** P0 (Must Have)  
**Description:** Application shall calculate current asset class allocation.

**Acceptance Criteria:**
- AC3.4.1: Calculate value per asset class category (Stocks, Bonds, etc.)
- AC3.4.2: Use ETF asset class percentages to distribute each ETF's value
- AC3.4.3: Calculate percentage of portfolio in each category
- AC3.4.4: Display breakdown in descending order by value

---

### FR4: Rebalancing Alerts

#### FR4.1: Drift Calculation
**Priority:** P0 (Must Have)  
**Description:** Application shall calculate drift between current and target allocation.

**Acceptance Criteria:**
- AC4.1.1: Compare current allocation percentages to target allocation
- AC4.1.2: Calculate absolute drift for each asset class category
- AC4.1.3: Identify maximum drift across all categories
- AC4.1.4: Store drift threshold configuration (default: 5%)

#### FR4.2: Visual Rebalancing Indicator
**Priority:** P0 (Must Have)  
**Description:** Application shall display visual indicator for rebalancing status.

**Acceptance Criteria:**
- AC4.2.1: Show green indicator when max drift < threshold (no action needed)
- AC4.2.2: Show yellow indicator when threshold ≤ max drift < 2× threshold (monitor)
- AC4.2.3: Show red indicator when max drift ≥ 2× threshold (rebalance recommended)
- AC4.2.4: Display max drift percentage value
- AC4.2.5: Show which asset class(es) are most out of balance

---

### FR5: User Interface

#### FR5.1: Dashboard Layout
**Priority:** P0 (Must Have)  
**Description:** Application shall display a home dashboard with key portfolio metrics.

**Acceptance Criteria:**
- AC5.1.1: Display total portfolio value prominently at top
- AC5.1.2: Display total P&L with color coding adjacent to value
- AC5.1.3: Display rebalancing status indicator (green/yellow/red)
- AC5.1.4: Show asset class breakdown visualization (pie chart or bar chart)
- AC5.1.5: Display list of holdings with current values

#### FR5.2: Responsive Design
**Priority:** P0 (Must Have)  
**Description:** Application shall be fully responsive across device sizes.

**Acceptance Criteria:**
- AC5.2.1: Desktop (≥1024px): Multi-column layout with sidebar
- AC5.2.2: Tablet (768-1023px): Adjusted layout with stacked sections
- AC5.2.3: Mobile (<768px): Single column layout with collapsible sections
- AC5.2.4: Touch-friendly controls on mobile (minimum 44px tap targets)
- AC5.2.5: Test on Chrome, Firefox, Safari, and Edge

#### FR5.3: Theme Support
**Priority:** P1 (Should Have)  
**Description:** Application shall support light and dark themes.

**Acceptance Criteria:**
- AC5.3.1: Automatically detect user's system theme preference
- AC5.3.2: Provide manual theme toggle (light/dark/auto)
- AC5.3.3: Persist theme preference in localStorage
- AC5.3.4: Ensure sufficient contrast ratios (WCAG AA compliance)

#### FR5.4: File Import UX
**Priority:** P0 (Must Have)  
**Description:** Application shall provide intuitive file import experience.

**Acceptance Criteria:**
- AC5.4.1: Show prominent "Load Portfolio" button on empty state
- AC5.4.2: Display file picker on button click
- AC5.4.3: Show loading spinner during file parse and price fetch
- AC5.4.4: Display success message with portfolio name/summary
- AC5.4.5: Provide "Load Different Portfolio" option after load

---

## 4. Non-Functional Requirements

### NFR1: Performance
- **NFR1.1:** Initial page load shall complete in <3 seconds on 4G connection
- **NFR1.2:** Portfolio file parsing shall complete in <1 second for files up to 10MB
- **NFR1.3:** Price fetching shall complete in <5 seconds for portfolios up to 50 ETFs
- **NFR1.4:** Dashboard rendering shall complete in <500ms after data ready
- **NFR1.5:** Application shall remain responsive during background price fetches

### NFR2: Security & Privacy
- **NFR2.1:** All data processing shall occur client-side (no data sent to backend)
- **NFR2.2:** Portfolio data shall never be transmitted except to fetch prices
- **NFR2.3:** API keys shall be stored in environment configuration (not hardcoded)
- **NFR2.4:** External API calls shall use HTTPS only
- **NFR2.5:** No user tracking, analytics, or telemetry without explicit consent

### NFR3: Reliability
- **NFR3.1:** Application shall handle malformed YAML files without crashing
- **NFR3.2:** API failures shall not prevent app from functioning with cached data
- **NFR3.3:** Application shall validate all user inputs before processing
- **NFR3.4:** Browser console errors shall be minimized in production build

### NFR4: Usability
- **NFR4.1:** Error messages shall be clear and actionable (avoid technical jargon)
- **NFR4.2:** Critical actions shall provide visual feedback within 100ms
- **NFR4.3:** Data visualizations shall be color-blind friendly
- **NFR4.4:** Application shall work with browser zoom levels 50%-200%

### NFR5: Maintainability
- **NFR5.1:** Codebase shall use modern JavaScript framework (React, Vue, or Svelte)
- **NFR5.2:** Code shall follow consistent style guide with linting
- **NFR5.3:** Components shall be modular and reusable
- **NFR5.4:** API integration shall be abstracted to allow provider swapping

### NFR6: Compatibility
- **NFR6.1:** Support Chrome/Edge 90+, Firefox 88+, Safari 14+
- **NFR6.2:** Minimum screen resolution: 320px width (iPhone SE)
- **NFR6.3:** No browser plugins or extensions required
- **NFR6.4:** Work offline after initial load and price cache

### NFR7: Scalability
- **NFR7.1:** Support portfolios with up to 50 different ETF tickers
- **NFR7.2:** Support transaction history with up to 1000 transactions per ETF
- **NFR7.3:** Handle portfolios with up to 20 asset class categories

---

## 5. Technical Constraints

### 5.1 Architecture Constraints
- Pure client-side application (no backend server)
- Static site hosting (can be served from CDN or GitHub Pages)
- No database or server-side data storage
- All computation performed in browser JavaScript runtime

### 5.2 API Constraints
- Financial data API must have free tier with sufficient rate limits
- API must support international ETF tickers
- Recommended: Alpha Vantage (per technical research)
- API key required (user provides or embedded in deployment)

### 5.3 Data Format Constraints
- Portfolio data must be in YAML format
- File must follow specified schema (see FR1.1)
- User responsible for maintaining data file accuracy
- No automatic transaction import from brokers

### 5.4 Browser Requirements
- Modern browser with ES6+ JavaScript support
- LocalStorage or IndexedDB available
- Fetch API or XMLHttpRequest support
- File API for local file reading

---

## 6. User Stories

### Epic 1: Portfolio Data Import
**US1.1:** As a user, I want to load my portfolio data from a YAML file, so I can see my investments in the app.  
**US1.2:** As a user, I want clear error messages if my file format is wrong, so I can fix issues easily.

### Epic 2: Portfolio Value Tracking
**US2.1:** As a user, I want to see my total portfolio value, so I know my current net worth.  
**US2.2:** As a user, I want to see my profit/loss, so I know how my investments are performing.  
**US2.3:** As a user, I want prices to update automatically, so I always see current values.

### Epic 3: Asset Allocation Analysis
**US3.1:** As a user, I want to see my asset class breakdown, so I understand my portfolio composition.  
**US3.2:** As a user, I want to compare my current allocation to my target, so I know if rebalancing is needed.

### Epic 4: Rebalancing Guidance
**US4.1:** As a user, I want visual alerts when my portfolio drifts from target, so I know when to rebalance.  
**US4.2:** As a user, I want to see which asset classes are out of balance, so I know what to adjust.

### Epic 5: Multi-Device Access
**US5.1:** As a user, I want the app to work on my phone, so I can check my portfolio on the go.  
**US5.2:** As a user, I want the app to match my system theme, so it's comfortable to use.

---

## 7. Dependencies & Risks

### 7.1 External Dependencies
| Dependency | Type | Risk Level | Mitigation |
|------------|------|------------|------------|
| Alpha Vantage API | External Service | Medium | Implement caching; design for API provider swapping |
| YAML parsing library | npm Package | Low | Use well-maintained library (js-yaml) |
| Charting library | npm Package | Low | Evaluate options during architecture phase |

### 7.2 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API rate limits exceeded | High | Medium | Implement aggressive caching; queue requests |
| International ETF ticker support | Medium | Medium | Research API coverage during architecture |
| Browser compatibility issues | Medium | Low | Use polyfills; test across browsers |
| Large portfolio performance | Low | Low | Implement virtual scrolling if needed |

### 7.3 User Experience Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Users confused by YAML format | Medium | Medium | Provide clear documentation and examples |
| API key management complexity | Medium | Low | Embed key or provide simple config UI |
| Offline experience unclear | Low | Medium | Clear indicators for offline mode |

---

## 8. Assumptions

1. Users are comfortable editing text files (YAML) for data input
2. Users have stable internet connection for price fetching
3. Users understand basic portfolio concepts (cost basis, asset allocation)
4. Alpha Vantage API provides sufficient free tier rate limits
5. Users will manually update transaction history (no broker integration)
6. Single user per browser (no concurrent portfolio management)
7. Portfolio data file size remains under 10MB
8. Users have modern browsers with JavaScript enabled

---

## 9. Open Questions

1. **API Key Management:** Should API key be embedded in deployment or user-provided?
2. **Currency Handling:** Support multiple currencies or assume single currency?
3. **Asset Class Taxonomy:** Provide standard asset class categories or fully custom?
4. **Drift Threshold:** Allow user configuration of rebalancing threshold or fixed 5%?
5. **Data Validation:** Strict validation (reject file) or permissive (warnings)?
6. **Broker-Specific Fields:** Support for broker names, account numbers, or keep minimal?
7. **Tax Lot Tracking:** Track individual tax lots or aggregate cost basis?

---

## 10. Success Criteria

### 10.1 Launch Criteria (MVP)
- [ ] User can load valid YAML portfolio file
- [ ] Application fetches prices for all ETFs
- [ ] Dashboard displays portfolio value and P&L
- [ ] Asset class breakdown visualization renders correctly
- [ ] Rebalancing indicator shows correct status
- [ ] Application works on desktop and mobile browsers
- [ ] Offline mode functions with cached prices
- [ ] No console errors in production build

### 10.2 User Acceptance Criteria
- [ ] User can understand portfolio status within 10 seconds of loading
- [ ] Rebalancing alerts match user's manual calculations
- [ ] Application feels responsive (no janky animations or delays)
- [ ] Error messages help user fix issues without external help

---

## 11. Future Enhancements (Post-MVP)

### Phase 2 Features (Priority Order)
1. Historical portfolio value chart (time-series)
2. Individual ETF performance analysis view
3. Multiple portfolio file management
4. Detailed transaction history view with notes
5. Export functionality (CSV, PDF reports)

### Phase 3 Features
6. Custom timeframe P&L (1yr, 5yr, 10yr)
7. Geographic/country breakdown visualizations
8. "What-if" scenario planning with future contributions
9. Keyboard shortcuts for power users
10. Dividend tracking and reinvestment handling

---

## 12. Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | [To be filled] | | |
| Tech Lead / Architect | [To be filled] | | |
| UX Designer | [To be filled] | | |
| Stakeholder | Fra | | |

---

**Document History:**
- 2025-11-30: Initial draft (v1.0)
