# Brainstorming Session Results

**Session Date:** 2025-11-30
**Facilitator:** Business Analyst Mary
**Participant:** Fra

## Session Start

**Approach Selected:** AI-Recommended Techniques

**Techniques Planned:**
1. What If Scenarios (Creative) - 15 min - Explore feature possibilities within client-side constraints
2. First Principles Thinking (Creative) - 15 min - Establish architectural fundamentals
3. SCAMPER Method (Structured) - 20 min - Refine UX and implementation details

## Executive Summary

**Topic:** Client-side SPA for tracking personal investment portfolio of ETFs

**Session Goals:** 
- Pure client-side application (no backend)
- Local file-based data (buy/sell transactions: date, ticker, quantity, unit price)
- User-friendly data format (JSON/YAML)
- Explore features, architecture, and UX optimization

**Techniques Used:** What If Scenarios, First Principles Thinking, SCAMPER Method

**Total Ideas Generated:** 35+

### Key Themes Identified:

1. **Simplicity First** - Pure client-side, single YAML file, minimal data structure
2. **Core Value Focus** - Portfolio value + rebalancing alerts are the essence
3. **Progressive Enhancement** - Start with MVP, layer features intelligently
4. **User-Friendly Data** - YAML with comments, negative quantities for sells
5. **Dashboard-Centric UX** - Home screen shows critical info immediately

## Technique Sessions

### Session 1: What If Scenarios

**Ideas Generated:**

1. **Interactive time-series chart** showing portfolio value over time
2. **ETF isolation capability** - view individual ETF performance
3. **Asset class & country breakdown dashboards** - geographic and sector exposure
4. **Real-time price data** via client-side API calls (Yahoo Finance, Alpha Vantage)
5. **Local data caching** (IndexedDB/localStorage) to minimize API calls
6. **Timeframe-based gains/losses** - since beginning, 10yr, 5yr, 1yr, custom periods
7. **User-defined target allocations** - explicit configuration by user
8. **Drift threshold configuration** - set when rebalancing alerts should trigger
9. **Visual rebalancing indicators** - color-coded alerts when portfolio drifts from target
10. **Offline mode with graceful degradation** - show last cached prices when no internet
11. **Multiple portfolio support** - separate files for different accounts
12. **Transaction notes/annotations** - attach context to buy/sell operations
13. **System theme preference** - auto light/dark mode following OS settings
14. **Fully responsive design** - works across desktop, tablet, mobile
15. **Future considerations:** Export reports (PDF/CSV), keyboard shortcuts

### Session 2: First Principles Thinking

**Fundamental Truths Established:**

1. A portfolio is just a list of transactions over time
2. Current value = quantity × current price
3. No server means all computation happens in browser
4. Minimum viable data = 1 transaction (date, ticker, quantity, price)
5. Core value = current portfolio value + rebalancing alerts
6. MVP = Data loading + Current value + Asset allocation breakdown
7. Asset class mappings stored in data file (ETF → asset classes with %)
8. Rebalancing alerts come AFTER MVP
9. Charts come AFTER MVP
10. Single file structure - each ETF contains transactions + asset class mappings
11. This enforces data integrity - can't add transactions for unmapped ETFs
12. Asset classes have name + category (breakdowns group by category)

**Architectural Decisions:**

- **Data structure:** Nested JSON - ETFs as keys, each containing metadata + transactions
- **File organization:** Single file (simple, ensures integrity)
- **Asset class hierarchy:** Name (granular) → Category (for grouping/breakdowns)
- **Target allocation:** Portfolio-level config in same file
- **MVP scope:** Parse file → Calculate holdings → Fetch prices → Display value + breakdown

**Example Data Structure:**
```json
{
  "targetAllocation": {
    "Stocks": 70,
    "Bonds": 20,
    "Real Estate": 10
  },
  "etfs": {
    "VWCE": {
      "name": "Vanguard FTSE All-World",
      "assetClasses": [
        {"name": "US Large Cap", "category": "Stocks", "percentage": 60},
        {"name": "International Equity", "category": "Stocks", "percentage": 40}
      ],
      "transactions": [
        {"date": "2024-01-15", "type": "buy", "quantity": 10, "price": 95.50}
      ]
    }
  }
}
```

### Session 3: SCAMPER Method

**S - Substitute:**
- Use YAML instead of JSON (more readable, supports comments)

**C - Combine:**
- Future: Combine multiple portfolio files into consolidated view
- Future: Combine historical data with future projections

**M - Modify / P - Put to other use:**
- Not pursued for MVP

**E - Eliminate:**
- Remove "type" field from transactions - use negative quantities for sells
- Simplified transaction structure: `{date, quantity, price}`

**R - Reverse / Rearrange:**
- Home screen shows BOTH current value AND rebalancing status together
- Dashboard design: Core values (portfolio value + rebalancing indicator) front and center
## Idea Categorization

### Immediate Opportunities (MVP)

_Ideas ready to implement now_

1. **Load YAML data file** - Parse portfolio data structure
2. **Fetch current prices** - Client-side API calls to financial data provider
3. **Calculate & display current portfolio value** - Core metric #1
4. **Calculate & display current profit/loss** - Total gains/losses
5. **Show asset class breakdown** - Breakdown by category
6. **Show rebalancing alert** - Visual indicator (green/yellow/red)
7. **Responsive design** - Works on desktop, tablet, mobile
8. **System theme preference** - Auto light/dark mode

### Future Innovations

_Ideas requiring development/research_

1. **Profit/loss for different timeframes** - 1yr, 5yr, 10yr, custom periods
2. **Interactive time-series chart** - Portfolio value trend over time
3. **ETF isolation view** - Individual ETF performance analysis
4. **Country/geographic breakdowns** - Geographic exposure visualization
5. **Multiple portfolio files support** - Track separate accounts
6. **Transaction notes/annotations** - Context for buy/sell decisions
7. **Offline mode with cached prices** - Graceful degradation
8. **Combine multiple portfolios** - Consolidated view across accounts
9. **Future projections** - "What if" scenarios with contributions

### Moonshots
## Action Planning

### Top 3 Priority Ideas

#### #1 Priority: Data Structure & YAML Parsing

- **Rationale:** Foundation for everything - must get data model right before building features
- **Next steps:** 
  - Define complete YAML schema with examples
  - Choose YAML parsing library
  - Implement data validation
  - Create sample portfolio file for testing
- **Resources needed:** YAML parser library (js-yaml), schema validation
- **Timeline:** First implementation task

#### #2 Priority: Price Fetching & Portfolio Calculation

- **Rationale:** Core value delivery - users need to see current portfolio value and profit/loss
- **Next steps:**
  - Research free financial API options (Yahoo Finance, Alpha Vantage, etc.)
  - Implement API client with error handling
  - Build calculation engine (holdings, values, P&L)
  - Implement local caching strategy
- **Resources needed:** Financial data API, caching mechanism (IndexedDB/localStorage)
- **Timeline:** After data structure complete

#### #3 Priority: Home Dashboard UI

- **Rationale:** Surface the two critical values - portfolio value and rebalancing status
- **Next steps:**
  - Design dashboard layout (wireframe)
  - Implement portfolio value display (prominent)
  - Implement rebalancing status indicator (visual)
  - Add asset class breakdown visualization
  - Ensure responsive design
- **Resources needed:** UI framework/library (React, Vue, etc.), charting library for breakdowns
- **Timeline:** After calculation engine works
#### #1 Priority: [To be determined]

- Rationale: [To be determined]
- Next steps: [To be determined]
- Resources needed: [To be determined]
- Timeline: [To be determined]

#### #2 Priority: [To be determined]
## Reflection and Follow-up

### What Worked Well

- **What If Scenarios** generated broad feature possibilities while respecting constraints
- **First Principles Thinking** cut through complexity to establish MVP and data architecture
- **SCAMPER** refined practical details (YAML, negative quantities, dashboard UX)
- **Progressive flow** moved naturally from exploration → foundation → refinement

### Areas for Further Exploration

1. **Technical Stack Selection** - Which frontend framework? (React, Vue, Svelte?)
2. **Charting Library Research** - Best option for interactive time-series and breakdowns?
3. **API Provider Evaluation** - Which financial data API offers best free tier?
4. **State Management** - How to handle portfolio calculations and caching efficiently?
5. **File Import UX** - Drag-and-drop? File picker? Both?
6. **Rebalancing Algorithm** - Exact logic for calculating drift and suggesting trades
7. **Asset Class Taxonomy** - Standard categories for stocks/bonds/RE/commodities?

### Recommended Follow-up Techniques

- **Research workflow** - Deep dive on financial APIs, charting libraries, frontend frameworks
- **Mind Mapping** - Visual map of component architecture and data flow
- **Assumption Reversal** - Challenge decisions (Do we need real-time? Could it work offline-first?)

### Questions That Emerged

1. Which financial data API has best coverage for international ETFs?
2. Should target allocation support nested categories (e.g., Stocks → US → Large Cap)?
3. How to handle currency conversions for international ETFs?
4. Should the app validate that asset class percentages sum to 100%?
5. What happens if API is down - show stale data or error state?
6. Should transaction history be editable in-app or only via file editing?
7. How to handle stock splits or dividend reinvestments?

### Next Session Planning

- **Suggested topics:** Technical architecture, API selection, UX wireframes
- **Timeframe:** Before starting PRD (next phase in workflow)
- **Preparation:** Research financial APIs and frontend frameworks
### Recommended Follow-up Techniques

[To be populated]

### Questions That Emerged

[To be populated]

### Next Session Planning

- **Suggested topics:** [To be determined]
- **Timeframe:** [To be determined]
- **Preparation:** [To be determined]
