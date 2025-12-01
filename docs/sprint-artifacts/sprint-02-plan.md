# Sprint 2 Plan: Data Management & Price Integration Start

**Sprint Number:** 2  
**Sprint Name:** Data Management & Price Integration Start  
**Duration:** 2 weeks (Dec 16-27, 2025)  
**Status:** In Progress  
**Team Capacity:** 1 developer × 2 weeks = 10 working days

---

## 🎯 Sprint Goals

1. **Complete Portfolio Data Management Epic (E2)** - Finish remaining stories S2.6, S2.7, S2.8
2. **Start ETF Price Integration (E3)** - Implement API client and caching (S3.1-S3.4)
3. **Enable Price Fetching** - Integrate price fetching with portfolio data

**Success Criteria:**
- ✅ Portfolio file upload workflow 100% complete
- ✅ Price API client functional with caching
- ✅ Basic price fetching working for loaded portfolios
- ✅ All Sprint 2 acceptance criteria met

---

## 📊 Sprint Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| **Committed Story Points** | 24 | Based on Sprint 1 velocity |
| **Stories Committed** | 9 | 3 from E2, 6 from E3 |
| **Epics in Sprint** | 2 | E2 (complete), E3 (partial) |
| **Expected Velocity** | 22-26 points | Adjusted after Sprint 1 |
| **Team Capacity** | 10 days | 1 developer, full-time |

---

## 📋 User Stories

### Epic 2: Portfolio Data Management (Completion)
**Remaining Points:** 12 (3 stories)

#### ✅ S2.6: Build useFileUpload Custom Hook
**Priority:** P0 | **Points:** 3 | **Status:** Not Started

**Description:** Create React hook to manage file upload flow and orchestrate parsing/validation.

**Acceptance Criteria:**
- [ ] `hooks/useFileUpload.ts` custom hook created
- [ ] Handles file selection event
- [ ] Calls `fileService.parsePortfolioFile()`
- [ ] Updates `portfolioStore` with parsed data
- [ ] Manages loading and error states
- [ ] Returns upload function and status

**Hook Interface:**
```typescript
interface UseFileUpload {
  uploadFile: (file: File) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}
```

**Implementation Tasks:**
1. Create hook file structure
2. Implement file reading logic
3. Wire up fileService integration
4. Add error handling
5. Connect to portfolioStore
6. Write unit tests

**Dependencies:** S2.1 (YAML Parser), S2.2 (Validation), S2.3 (FileUpload Component)

---

#### ✅ S2.7: Implement Error Display Component
**Priority:** P0 | **Points:** 2 | **Status:** Not Started

**Description:** Create component to display validation and parsing errors in user-friendly format.

**Acceptance Criteria:**
- [ ] `components/states/ErrorState.tsx` component created
- [ ] Displays error message in user-friendly format
- [ ] Shows specific validation failures
- [ ] "Try Again" button to reset state
- [ ] Red/danger color theme using design system

**Error Types to Handle:**
- File parsing errors (invalid YAML syntax)
- Validation errors (business rule failures)
- File read errors (permissions, size)

**Implementation Tasks:**
1. Create ErrorState component
2. Design error message formatting
3. Add retry functionality
4. Style with shadcn/ui theme
5. Add error icon/illustration
6. Write component tests

**Dependencies:** None (UI only)

---

#### ✅ S2.8: Create Portfolio File Examples
**Priority:** P1 | **Points:** 1 | **Status:** Not Started

**Description:** Create example YAML files for testing, documentation, and user reference.

**Acceptance Criteria:**
- [ ] `examples/portfolio-simple.yaml` - minimal valid example
- [ ] `examples/portfolio-full.yaml` - comprehensive example
- [ ] `examples/portfolio-invalid.yaml` - for testing error handling
- [ ] Examples follow exact schema from PRD
- [ ] README in examples/ explaining each file

**Implementation Tasks:**
1. Create examples directory
2. Write simple portfolio example (2-3 ETFs)
3. Write comprehensive example (5-6 ETFs, multiple asset classes)
4. Create intentionally invalid examples
5. Add examples README
6. Test files against validation logic

**Dependencies:** S2.2 (Validation - to ensure examples are valid)

---

### Epic 3: ETF Price Integration (Start)
**Committed Points:** 12 (4 stories)

#### ✅ S3.1: Create API Configuration
**Priority:** P0 | **Points:** 1 | **Status:** Not Started

**Description:** Set up API configuration with base URL and key management for Alpha Vantage.

**Acceptance Criteria:**
- [ ] `config/api.config.ts` with Alpha Vantage endpoints
- [ ] Environment variable for API key (`VITE_ALPHAVANTAGE_API_KEY`)
- [ ] `.env.example` file with placeholder
- [ ] `.env` added to `.gitignore`
- [ ] API key not hardcoded in source

**Config Structure:**
```typescript
export const API_CONFIG = {
  baseURL: 'https://www.alphavantage.co/query',
  apiKey: import.meta.env.VITE_ALPHAVANTAGE_API_KEY,
  timeout: 10000,
  rateLimit: {
    callsPerMinute: 5,
    callsPerDay: 25,
  },
};
```

**Implementation Tasks:**
1. Create config directory structure
2. Set up API configuration object
3. Add environment variable handling
4. Create .env.example template
5. Update documentation

**Dependencies:** None

---

#### ✅ S3.2: Implement Price API Client
**Priority:** P0 | **Points:** 5 | **Status:** Not Started

**Description:** Create service to fetch ETF prices from Alpha Vantage API with error handling.

**Acceptance Criteria:**
- [ ] `services/priceService.ts` created
- [ ] `fetchPrice(ticker: string)` method calls API
- [ ] Handles API response parsing
- [ ] Returns `PriceData` object with timestamp
- [ ] Handles API errors (network, auth, rate limit, invalid ticker)
- [ ] Logs errors appropriately
- [ ] Unit tests with mocked API responses

**API Details:**
- **Endpoint:** `GLOBAL_QUOTE`
- **Parameters:** `symbol`, `apikey`
- **Response:** JSON with current price, timestamp

**Rate Limiting:**
- Free tier: 25 requests/day, 5 calls/minute
- Deferred to S3.5 (Request Queue)

**Implementation Tasks:**
1. Create priceService module
2. Implement fetchPrice function
3. Add response parsing logic
4. Implement error handling
5. Add TypeScript types for API responses
6. Write unit tests with mock data
7. Test with real API (limited calls)

**Dependencies:** S3.1 (API Configuration)

---

#### ✅ S3.3: Build Price Cache Service
**Priority:** P0 | **Points:** 3 | **Status:** Not Started

**Description:** Implement local caching for fetched prices using localStorage to minimize API calls.

**Acceptance Criteria:**
- [ ] `services/cacheService.ts` created
- [ ] Store prices with ticker, value, timestamp
- [ ] Set 15-minute cache expiration
- [ ] `getCachedPrice(ticker)` checks freshness
- [ ] `setCachedPrice(ticker, price)` stores price
- [ ] `clearCache()` removes all cached prices
- [ ] Cache persists across page reloads

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

**Implementation Tasks:**
1. Create cacheService module
2. Implement localStorage wrapper
3. Add cache get/set/clear functions
4. Implement expiration logic
5. Add cache statistics (hit/miss rate)
6. Write unit tests
7. Test cache persistence

**Dependencies:** None

---

#### ✅ S3.4: Create usePrices Custom Hook
**Priority:** P0 | **Points:** 3 | **Status:** Not Started

**Description:** React hook to manage price fetching and caching logic with loading states.

**Acceptance Criteria:**
- [ ] `hooks/usePrices.ts` custom hook created
- [ ] Fetches prices for all ETFs in portfolio
- [ ] Checks cache before making API call
- [ ] Updates `priceStore` with fetched prices
- [ ] Manages loading state per ticker
- [ ] Handles partial failures (some tickers succeed, others fail)
- [ ] Provides refresh functionality

**Hook Interface:**
```typescript
interface UsePrices {
  fetchPrices: (tickers: string[]) => Promise<void>;
  refreshPrices: () => Promise<void>;
  isLoading: boolean;
  loadingTickers: string[];
  errors: Record<string, string>;
}
```

**Implementation Tasks:**
1. Create usePrices hook
2. Implement fetchPrices logic with cache check
3. Wire up priceService integration
4. Connect to priceStore
5. Add loading state management
6. Implement error handling per ticker
7. Add refresh functionality
8. Write hook tests

**Dependencies:** S3.2 (Price API Client), S3.3 (Cache Service)

---

## 🗓️ Sprint Timeline

### Week 1: Dec 16-20 (Complete E2, Start E3)

**Day 1-2: Complete E2**
- [ ] S2.6: useFileUpload Hook (3 pts)
- [ ] S2.7: Error Display Component (2 pts)
- [ ] S2.8: Portfolio Examples (1 pts)
- **Deliverable:** E2 100% complete, full file upload workflow working

**Day 3: API Setup**
- [ ] S3.1: API Configuration (1 pt)
- **Deliverable:** API config ready, environment variables set up

**Day 4-5: Price Service Foundation**
- [ ] S3.2: Price API Client (5 pts)
- **Deliverable:** Can fetch single price from Alpha Vantage

### Week 2: Dec 23-27 (Price Integration)

**Day 6-7: Caching Layer**
- [ ] S3.3: Price Cache Service (3 pts)
- **Deliverable:** Price caching working, reduces API calls

**Day 8-9: Hook Integration**
- [ ] S3.4: usePrices Hook (3 pts)
- **Deliverable:** Hook fetches prices for loaded portfolio

**Day 10: Testing & Polish**
- [ ] Integration testing
- [ ] Bug fixes
- [ ] Demo preparation
- **Deliverable:** Sprint demo ready

---

## 🎨 UI/UX Deliverables

### New Components
1. **ErrorState Component** (S2.7)
   - Error message display
   - Retry button
   - User-friendly formatting

### Enhanced Components
2. **FileUpload Component** (S2.6)
   - Connected to useFileUpload hook
   - Loading states
   - Error handling

### New Hooks
3. **useFileUpload** - File upload orchestration
4. **usePrices** - Price fetching & caching

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] `useFileUpload` hook tests
- [ ] `ErrorState` component tests
- [ ] `priceService` API client tests (mocked)
- [ ] `cacheService` cache logic tests
- [ ] `usePrices` hook tests

### Integration Tests
- [ ] File upload → parse → validate → store flow
- [ ] Price fetch → cache → store → display flow
- [ ] Cache hit/miss scenarios
- [ ] Error handling end-to-end

### Manual Testing
- [ ] Upload valid portfolio file
- [ ] Upload invalid file (test error display)
- [ ] Fetch prices for loaded portfolio
- [ ] Verify cache is used on refresh
- [ ] Test with API key missing
- [ ] Test with invalid ticker

---

## 🎯 Definition of Done

A story is considered "done" when:

- ✅ All acceptance criteria met
- ✅ Code reviewed (self-review + checklist)
- ✅ Unit tests written and passing
- ✅ Integration tests passing (where applicable)
- ✅ No TypeScript errors
- ✅ ESLint warnings resolved
- ✅ Component/hook documented (JSDoc)
- ✅ Manually tested in browser
- ✅ No regression in existing features

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Alpha Vantage API rate limits | High | Medium | Implement caching (S3.3), use queue (deferred to S3.5) |
| API key setup complexity | Medium | Low | Clear .env.example, documentation |
| Cache invalidation bugs | Medium | Medium | Comprehensive tests, conservative expiration |
| Validation edge cases | Medium | Medium | Extensive example files, thorough testing |

---

## 🚫 Out of Scope (Deferred)

**Deferred to Sprint 3:**
- S3.5: Request Queue for Rate Limiting (3 pts)
- S3.6: Refresh Prices Button (2 pts)
- S3.7: Display Price Metadata (1 pt)

**Rationale:** Focus on core price fetching functionality first. Rate limiting queue can be added in Sprint 3 when we have more tickers to test with.

---

## 📦 Dependencies

### External Dependencies
- Alpha Vantage API (free tier)
- API key required (obtain from alphavantage.co)

### Internal Dependencies
- Sprint 1 deliverables (foundation, basic UI, stores)
- Portfolio data structure (from E2)

---

## 🎓 Learning Objectives

1. **API Integration Patterns**
   - RESTful API consumption
   - Error handling strategies
   - Rate limit management

2. **Caching Strategies**
   - localStorage usage
   - Cache invalidation
   - Performance optimization

3. **React Patterns**
   - Custom hooks for complex logic
   - State management across components
   - Error boundary patterns

---

## 📈 Success Metrics

**Functional Metrics:**
- [ ] All 9 stories completed
- [ ] 24 story points delivered
- [ ] Zero critical bugs
- [ ] All tests passing

**Quality Metrics:**
- [ ] Test coverage > 80%
- [ ] TypeScript strict mode passing
- [ ] No console errors
- [ ] Performance: Price fetch < 2s per ticker

**User Experience:**
- [ ] Error messages are clear and actionable
- [ ] Loading states are informative
- [ ] File upload workflow is smooth
- [ ] Prices update visibly in UI

---

## 🎬 Sprint Demo Script

**Demo Date:** Dec 27, 2025

**Demo Flow:**
1. **File Upload (E2 Complete)**
   - Show ErrorState with invalid file
   - Upload valid portfolio file
   - Demonstrate error handling

2. **Price Fetching (E3 Partial)**
   - Load portfolio with multiple ETFs
   - Trigger price fetch
   - Show loading states
   - Display fetched prices in console/UI
   - Demonstrate caching (refresh page, no API call)

3. **Developer View**
   - Show cache in localStorage
   - Show API response in network tab
   - Demonstrate error handling (bad ticker)

**Key Talking Points:**
- E2 (Portfolio Data Management) is 100% complete
- Price API integration is functional
- Caching reduces API calls significantly
- Foundation ready for calculations (Sprint 3)

---

## 📝 Sprint Retrospective (To be completed Dec 27)

**What Went Well:**
- TBD

**What Could Be Improved:**
- TBD

**Action Items:**
- TBD

**Velocity Actual:**
- TBD

---

## 🔗 References

- **Epic Details:** `docs/epics-and-stories.md` (E2, E3)
- **Architecture:** `docs/architecture-portfolio-tracker.md`
- **PRD:** `docs/prd-portfolio-tracker.md`
- **Sprint Status:** `docs/sprint-status.yaml`
- **Alpha Vantage API Docs:** https://www.alphavantage.co/documentation/

---

**Sprint Owner:** Dev Team  
**Created:** 2025-11-30  
**Last Updated:** 2025-11-30
