# Sprint 7: Polish & Production Readiness

**Sprint Duration:** 2 weeks  
**Sprint Goal:** Complete error handling, add production features, polish UX  
**Total Points:** 29 (remaining to reach 133)

## Sprint Context

### Current State (Sprint 6 End)
- **Completed:** 104/133 points (78.2%)
- **Remaining:** 29 points
- **Test Coverage:** 357 tests passing
- **Core Features:** 100% complete (Dashboard, Calculations, Rebalancing, Theme, Responsive)

### Sprint 7 Scope
This is the **final sprint** to reach production readiness. Focus areas:
1. **Epic 8:** Error Handling & Offline Mode (15 points, 6 stories)
2. **Additional Polish:** Performance, UX enhancements, documentation (14 points)

---

## Sprint Stories

### Epic 8: Error Handling & Offline Mode (15 points)

#### S8.1: Implement Global Error Boundary (2 points)
**Priority:** P1  
**Status:** Not Started

**Description:**  
Create React error boundary to catch and display component errors gracefully.

**Acceptance Criteria:**
- [ ] ErrorBoundary component created in `src/components/layout/ErrorBoundary.tsx`
- [ ] Wraps entire app in `App.tsx`
- [ ] Displays friendly error UI with reload button
- [ ] Logs error details to console for debugging
- [ ] Prevents white screen of death
- [ ] Works with both class and function component errors
- [ ] 5+ tests covering error scenarios

**Technical Approach:**
```typescript
// Class component with componentDidCatch and getDerivedStateFromError
// Fallback UI: Card with error icon, message, and "Reload" button
// Error logging: console.error with component stack
```

**Test Scenarios:**
- Component throws error during render
- Component throws error during useEffect
- Error boundary resets on reload
- Error details logged correctly

---

#### S8.2: Add API Error Handling (3 points)
**Priority:** P1  
**Status:** Not Started

**Description:**  
Enhance priceService with comprehensive error handling, user-friendly messages, and fallback strategies.

**Acceptance Criteria:**
- [ ] Network error handling (timeout, offline)
- [ ] API-specific error handling (rate limit, invalid ticker, auth)
- [ ] User-friendly error messages in UI
- [ ] Automatic fallback to cached prices when API fails
- [ ] Error details stored in priceStore
- [ ] Retry button in price error UI
- [ ] 10+ tests for error scenarios

**Error Messages:**
- Network offline: "Cannot fetch prices. Using cached data from [timestamp]."
- Rate limit: "API limit reached. Prices will refresh in [X] minutes."
- Invalid ticker: "Price unavailable for [ticker]. Check ticker symbol."
- Timeout: "Request timed out. Retrying..."
- Generic: "Unable to fetch prices. Please try again later."

**Technical Changes:**
```typescript
// Enhance PriceServiceError with user-friendly messages
// Add error recovery in usePrices hook
// Display error banner in Header or Dashboard
// Show last successful fetch timestamp
```

**Test Scenarios:**
- Network timeout triggers fallback
- Rate limit returns appropriate message
- Invalid ticker skipped without breaking batch
- Error cleared after successful retry

---

#### S8.3: Implement Offline Mode Detection (2 points)
**Priority:** P1  
**Status:** Not Started

**Description:**  
Detect browser online/offline state and adapt UI accordingly.

**Acceptance Criteria:**
- [ ] useOnlineStatus custom hook created
- [ ] Listens to `window.addEventListener('online/offline')`
- [ ] Displays offline banner when offline
- [ ] Shows age of cached prices
- [ ] Automatically attempts refresh when back online
- [ ] Portfolio calculations work with cached prices
- [ ] 6+ tests for online/offline transitions

**UI Changes:**
- Offline banner at top: "⚠ You're offline. Showing cached prices from [timestamp]."
- Banner disappears when back online
- "Retry" button attempts immediate refresh
- Price metadata shows "Cached (X minutes ago)"

**Technical Approach:**
```typescript
// hooks/useOnlineStatus.ts
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

---

#### S8.4: Add Retry Logic for Failed Requests (3 points)
**Priority:** P1  
**Status:** Not Started

**Description:**  
Implement exponential backoff retry strategy for failed API requests.

**Acceptance Criteria:**
- [ ] Retry utility function with exponential backoff
- [ ] Maximum 3 retry attempts
- [ ] Configurable delays: 2s, 5s, 10s
- [ ] User notification of retry attempts
- [ ] Manual retry button as fallback
- [ ] Retry count tracked per request
- [ ] 8+ tests for retry scenarios

**Retry Strategy:**
```typescript
// utils/retry.ts
interface RetryOptions {
  maxAttempts: number;
  delays: number[]; // [2000, 5000, 10000]
  onRetry?: (attempt: number) => void;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T>
```

**UI Feedback:**
- Toast notification: "Fetching prices failed. Retrying (1/3)..."
- Progress indicator during retry
- Success toast: "Prices updated successfully"
- Final failure: "Unable to fetch prices after 3 attempts. Try again later."

**Integration Points:**
- priceService.fetchPrice wraps API call with retry
- usePrices shows retry progress
- Request queue respects retry delays

---

#### S8.5: Create Validation Error Messages (2 points)
**Priority:** P1  
**Status:** Not Started

**Description:**  
Enhance YAML validation error messages with specific details and examples.

**Acceptance Criteria:**
- [ ] Detailed error messages per validation rule
- [ ] Field-level error highlighting
- [ ] Examples of correct format in error message
- [ ] Error aggregation (show all errors, not just first)
- [ ] Copy error report button
- [ ] 10+ tests for validation messages

**Enhanced Error Messages:**

**Current:**
- "Invalid portfolio format"

**Enhanced:**
- "Target allocation sums to 95%, must equal 100%"
- "ETF VWCE: Asset classes sum to 103%, must equal 100%"
- "ETF VTI: Invalid date format '2024/01/15'. Use ISO 8601 format (YYYY-MM-DD). Example: 2024-01-15"
- "ETF BND: Transaction #3 has negative price (-82.50). Prices must be positive."
- "Missing required field: targetAllocation"

**Error Display:**
```typescript
// ErrorState component enhanced
- Shows error title: "Portfolio Validation Failed"
- Lists all errors with bullet points
- Highlights affected fields/ETFs
- "Copy Error Report" button (JSON format)
- "View Example File" link
```

**Technical Changes:**
- Enhance fileService validation to return structured errors
- ValidationError type with field, message, example
- ErrorState component accepts array of errors

---

#### S8.6: Display Connection Status Indicator (1 point)
**Priority:** P2  
**Status:** Not Started

**Description:**  
Add subtle online/offline status indicator to UI.

**Acceptance Criteria:**
- [ ] Status indicator in Header or Footer
- [ ] Green dot when online
- [ ] Gray dot when offline
- [ ] Tooltip with status text
- [ ] Smooth color transition
- [ ] 3+ tests

**UI Design:**
```
Header: [Logo] [Portfolio Tracker]  [○] [Theme] [Upload]
                                     ↑
                                Status dot
```

**Tooltip Text:**
- Online: "Online - Prices are current"
- Offline: "Offline - Using cached prices"

**Implementation:**
- Uses useOnlineStatus hook
- Badge component with color variant
- Positioned in Header next to theme toggle
- Accessible with aria-label

---

### Additional Polish Stories (14 points)

#### S9.1: Implement Portfolio Export (3 points)
**Priority:** P1  
**Status:** Not Started

**Description:**  
Allow users to export current portfolio data to YAML or JSON.

**Acceptance Criteria:**
- [ ] "Export Portfolio" button in Header menu
- [ ] Export as YAML (same format as input)
- [ ] Export as JSON (structured data)
- [ ] Include current prices and calculated metrics
- [ ] Download as file with timestamp in filename
- [ ] 5+ tests

**Export Formats:**
- YAML: Original portfolio + current prices annotation
- JSON: Full portfolio state with metrics

**Filename Format:**
- `portfolio-export-2025-12-04.yaml`
- `portfolio-export-2025-12-04.json`

---

#### S9.2: Add Performance Monitoring (2 points)
**Priority:** P2  
**Status:** Not Started

**Description:**  
Add performance metrics tracking for key operations.

**Acceptance Criteria:**
- [ ] Track portfolio calculation time
- [ ] Track price fetch time
- [ ] Track file parsing time
- [ ] Log performance metrics to console (dev mode)
- [ ] Display warning if operation exceeds threshold
- [ ] 4+ tests

**Metrics:**
- Portfolio calculations: <500ms target
- Price fetching: <10s target (with queue)
- File parsing: <1s target

**Implementation:**
```typescript
// utils/performance.ts
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (import.meta.env.DEV) {
    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}
```

---

#### S9.3: Add Keyboard Shortcuts (2 points)
**Priority:** P2  
**Status:** Not Started

**Description:**  
Implement keyboard shortcuts for common actions.

**Acceptance Criteria:**
- [ ] `Ctrl/Cmd + O`: Open file upload
- [ ] `Ctrl/Cmd + R`: Refresh prices
- [ ] `Ctrl/Cmd + T`: Toggle theme
- [ ] `?`: Show keyboard shortcuts help dialog
- [ ] Shortcuts work on all platforms (Windows, Mac, Linux)
- [ ] 5+ tests

**Shortcuts List:**
| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + O` | Load Portfolio |
| `⌘/Ctrl + R` | Refresh Prices |
| `⌘/Ctrl + T` | Toggle Theme |
| `⌘/Ctrl + E` | Export Portfolio |
| `?` | Show Help |

**Implementation:**
- useKeyboardShortcuts hook
- Shortcuts modal component
- Prevents conflicts with browser shortcuts

---

#### S9.4: Improve Loading Experience (2 points)
**Priority:** P1  
**Status:** Not Started

**Description:**  
Enhance loading states with better visual feedback.

**Acceptance Criteria:**
- [ ] Progress bar for multi-step operations
- [ ] Skeleton loaders for all components
- [ ] Smooth transitions between states
- [ ] Optimistic UI updates where possible
- [ ] 6+ tests

**Enhancements:**
- File upload: "Parsing portfolio... 50%"
- Price fetch: "Fetching prices 3/10..."
- Calculations: "Calculating metrics..."
- Smooth fade-in for loaded content

---

#### S9.5: Add User Onboarding (3 points)
**Priority:** P2  
**Status:** Not Started

**Description:**  
Create first-time user onboarding experience.

**Acceptance Criteria:**
- [ ] Welcome modal on first visit
- [ ] Highlights key features
- [ ] Link to example portfolio files
- [ ] "Don't show again" checkbox
- [ ] Stored in localStorage
- [ ] 4+ tests

**Onboarding Content:**
1. **Welcome:** "Welcome to Portfolio Tracker!"
2. **Load Portfolio:** "Upload your YAML portfolio file"
3. **View Dashboard:** "See your holdings and performance"
4. **Rebalancing:** "Monitor portfolio drift and get rebalancing alerts"
5. **Get Started:** Button to dismiss

---

#### S9.6: Create User Documentation (2 points)
**Priority:** P1  
**Status:** Not Started

**Description:**  
Write comprehensive user documentation and README.

**Acceptance Criteria:**
- [ ] README.md with project overview
- [ ] Getting started guide
- [ ] YAML format documentation
- [ ] FAQ section
- [ ] Troubleshooting guide
- [ ] Screenshots of main features

**Documentation Sections:**
1. **Introduction:** What is Portfolio Tracker?
2. **Quick Start:** Load your first portfolio
3. **YAML Format:** Complete schema reference
4. **Features:** Dashboard, Rebalancing, Themes
5. **FAQ:** Common questions
6. **Troubleshooting:** Error solutions

---

## Sprint Schedule

### Week 1: Error Handling & Core Polish
**Days 1-2:** S8.1, S8.2 (Error Boundary, API Error Handling)  
**Days 3-4:** S8.3, S8.4 (Offline Mode, Retry Logic)  
**Day 5:** S8.5 (Validation Messages)

### Week 2: Polish & Documentation
**Days 1-2:** S8.6, S9.1, S9.2 (Status Indicator, Export, Performance)  
**Days 3-4:** S9.3, S9.4 (Keyboard Shortcuts, Loading)  
**Day 5:** S9.5, S9.6 (Onboarding, Documentation)

---

## Testing Strategy

### Unit Tests (Target: 400+ total tests)
- Error boundary edge cases
- Retry logic with various failure scenarios
- Offline mode state transitions
- Validation error message formatting
- Export functionality
- Keyboard shortcut handlers

### Integration Tests
- Complete error recovery flows
- Offline → Online transition
- Failed fetch → Retry → Success
- File validation → Error display → Retry

### E2E Tests (Add 10+ scenarios)
- Load portfolio with network error
- Recover from offline state
- Use keyboard shortcuts
- Export portfolio
- Complete onboarding flow

### Manual Testing
- Test on slow network (throttle to 3G)
- Test with API rate limiting
- Test offline mode on mobile
- Verify all error messages are clear
- Test keyboard shortcuts on all OS

---

## Acceptance Criteria

### Sprint Success Criteria
- [ ] All 15 Epic 8 stories completed (100%)
- [ ] All 14 polish stories completed (100%)
- [ ] 400+ tests passing (target)
- [ ] Zero critical bugs
- [ ] All error messages user-friendly
- [ ] Documentation complete and accurate

### Production Readiness Checklist
- [ ] Error handling comprehensive
- [ ] Offline mode functional
- [ ] Performance targets met (<500ms calculations, <10s price fetch)
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Cross-browser testing complete (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing complete (iOS, Android)
- [ ] User documentation complete
- [ ] README with setup instructions
- [ ] Example files in repository
- [ ] No console errors in production build
- [ ] Bundle size optimized (<500KB)
- [ ] Lighthouse score >90

---

## Risks & Mitigation

### Risk 1: Testing Complexity
**Impact:** Medium  
**Mitigation:** Focus on critical error paths first, defer edge cases if needed

### Risk 2: Documentation Time
**Impact:** Low  
**Mitigation:** Write docs incrementally throughout sprint, not all at end

### Risk 3: Scope Creep
**Impact:** Medium  
**Mitigation:** Strict prioritization, defer P2 stories if behind schedule

---

## Success Metrics

### Code Quality
- Test coverage: >80%
- TypeScript strict mode: 100%
- ESLint errors: 0
- Console warnings: 0

### Performance
- Initial load: <3s
- Portfolio calculations: <500ms
- Price fetching: <10s (5 tickers)
- File parsing: <1s

### User Experience
- All error messages clear and actionable
- Offline mode seamless
- Loading states smooth
- Keyboard shortcuts intuitive

---

## Deliverables

1. **Code:**
   - All Sprint 7 stories implemented
   - 400+ tests passing
   - Zero critical bugs

2. **Documentation:**
   - README.md complete
   - User guide written
   - YAML schema documented
   - Troubleshooting guide

3. **Production Build:**
   - Optimized bundle
   - Environment configs
   - Deployment ready

4. **Quality Assurance:**
   - Cross-browser tested
   - Mobile tested
   - Accessibility audited
   - Performance benchmarked

---

## Notes

- This is the **final sprint** before v1.0 release
- Focus on production readiness and polish
- Comprehensive testing is critical
- Documentation should be clear for non-technical users
- All error messages must be user-friendly

**Sprint 7 will complete all 133 story points and deliver a production-ready Portfolio Tracker!** 🚀
