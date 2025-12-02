# Story 3.6: Add Refresh Prices Button

**Status:** ready-for-dev  
**Epic:** E3 - ETF Price Integration  
**Sprint:** Sprint 3  
**Story Points:** 2  
**Priority:** P0

---

## Story

As a **portfolio tracker user**,  
I want **a button to manually refresh ETF prices**,  
so that **I can get the latest market data on-demand and bypass the cache when needed**.

---

## Context

This story completes Epic 3 (ETF Price Integration) by adding the final user-facing UI control for price refresh functionality. The backend logic for refreshing prices is already implemented in the `usePrices` hook (completed in Sprint 2, story S3.4), so this story focuses purely on the UI layer.

**From Previous Sprint (Sprint 2):**
- `usePrices.refreshPrices()` method is fully functional
- Price caching with 15-minute expiration is working
- Request queue handles rate limiting automatically
- All core price fetching services complete

This story enables users to manually trigger price updates, providing transparency and control over when fresh market data is fetched.

---

## Acceptance Criteria

### AC1: Refresh Button UI Component
- [ ] **AC1.1:** Refresh button added to Header component (or Dashboard, near portfolio value)
- [ ] **AC1.2:** Button displays a refresh icon (e.g., ↻ or similar icon from icon library)
- [ ] **AC1.3:** Button is prominently visible but not intrusive to main content
- [ ] **AC1.4:** Button has accessible label/aria-label: "Refresh Prices"

### AC2: Refresh Button Behavior
- [ ] **AC2.1:** Clicking button calls `usePrices.refreshPrices()` method
- [ ] **AC2.2:** Button enters disabled state while refresh is in progress
- [ ] **AC2.3:** Loading spinner or rotating icon animation displayed during refresh
- [ ] **AC2.4:** Button re-enables after refresh completes (success or error)

### AC3: Last Updated Timestamp Display
- [ ] **AC3.1:** Display shows "Prices updated X minutes ago" text
- [ ] **AC3.2:** Timestamp updates after successful refresh
- [ ] **AC3.3:** Uses relative time format (e.g., "2 minutes ago", "just now")
- [ ] **AC3.4:** Timestamp shown near refresh button or portfolio value card

### AC4: Success/Error Feedback
- [ ] **AC4.1:** Success: timestamp updates, optional subtle success indicator
- [ ] **AC4.2:** Error: display error message if refresh fails
- [ ] **AC4.3:** Partial failure: show which tickers succeeded/failed
- [ ] **AC4.4:** Error states don't break UI, user can retry

### AC5: Responsive & Accessible
- [ ] **AC5.1:** Button is touch-friendly on mobile (minimum 44px tap target)
- [ ] **AC5.2:** Button accessible via keyboard (focusable, Enter/Space to activate)
- [ ] **AC5.3:** Loading state announced to screen readers
- [ ] **AC5.4:** Works across all breakpoints (mobile, tablet, desktop)

### AC6: Testing
- [ ] **AC6.1:** Component unit tests for button states (idle, loading, disabled)
- [ ] **AC6.2:** Integration test: button click triggers refresh logic
- [ ] **AC6.3:** Test error handling scenarios
- [ ] **AC6.4:** Manual testing on multiple devices/browsers

---

## Tasks / Subtasks

### Task 1: Add Refresh Button to Header Component (AC: #1, #2, #5)
- [ ] **1.1:** Import `usePrices` hook into Header component
- [ ] **1.2:** Add refresh button JSX with icon (use lucide-react or similar)
- [ ] **1.3:** Wire onClick handler to call `refreshPrices()` method
- [ ] **1.4:** Implement loading state (disabled + spinner icon)
- [ ] **1.5:** Style button consistent with shadcn/ui design system
- [ ] **1.6:** Ensure 44px minimum touch target size
- [ ] **1.7:** Add aria-label and keyboard accessibility attributes

### Task 2: Implement Last Updated Timestamp Display (AC: #3)
- [ ] **2.1:** Create utility function `formatRelativeTime(timestamp)` in `utils/formatters.ts`
- [ ] **2.2:** Get last updated timestamp from `priceStore`
- [ ] **2.3:** Add timestamp display component/element near button
- [ ] **2.4:** Format timestamp using relative time utility
- [ ] **2.5:** Update timestamp reactively when `priceStore` changes
- [ ] **2.6:** Handle missing/null timestamp gracefully ("Never updated")

### Task 3: Add Success/Error Feedback (AC: #4)
- [ ] **3.1:** Handle successful refresh: update timestamp, optional toast notification
- [ ] **3.2:** Handle error state: display error message from `usePrices` errors
- [ ] **3.3:** Show partial failure details (which tickers failed)
- [ ] **3.4:** Ensure UI remains functional after errors (no broken states)
- [ ] **3.5:** Add retry capability for failed refreshes

### Task 4: Write Component Tests (AC: #6)
- [ ] **4.1:** Unit test: button renders in idle state
- [ ] **4.2:** Unit test: button disabled during loading
- [ ] **4.3:** Unit test: button re-enables after completion
- [ ] **4.4:** Integration test: click triggers `refreshPrices()`
- [ ] **4.5:** Test error handling paths
- [ ] **4.6:** Test timestamp formatting logic
- [ ] **4.7:** Manual test on Chrome, Firefox, Safari
- [ ] **4.8:** Manual test on mobile devices (iOS, Android)

### Task 5: Documentation & Code Review Prep (AC: All)
- [ ] **5.1:** Add JSDoc comments to new components/functions
- [ ] **5.2:** Update component documentation if needed
- [ ] **5.3:** Verify code follows project style guide
- [ ] **5.4:** Self-review for accessibility compliance
- [ ] **5.5:** Prepare screenshots/demo for code review

---

## Dev Notes

### Technical Approach

**Components to Modify:**
- `src/components/layout/Header.tsx` - Add refresh button and timestamp display
- `src/utils/formatters.ts` - Add `formatRelativeTime()` utility function
- `src/hooks/usePrices.ts` - Already has `refreshPrices()` method, no changes needed

**Key Dependencies:**
- `usePrices` hook from Sprint 2 (S3.4) - provides `refreshPrices()`, `isLoading`, `errors`
- `priceStore` - provides last updated timestamp
- Icon library (lucide-react or similar) - for refresh icon
- shadcn/ui Button component - for consistent styling

**Implementation Notes:**
1. **Hook Integration:**
   ```typescript
   const { refreshPrices, isLoading, errors } = usePrices();
   ```

2. **Button Component Pattern:**
   ```tsx
   <Button
     onClick={refreshPrices}
     disabled={isLoading}
     aria-label="Refresh Prices"
   >
     {isLoading ? <Spinner /> : <RefreshIcon />}
   </Button>
   ```

3. **Timestamp Format Examples:**
   - Just now
   - 2 minutes ago
   - 1 hour ago
   - Today at 2:30 PM (if > 6 hours)

### Architecture Alignment

**From Architecture Document [docs/architecture-portfolio-tracker.md]:**
- Component-based UI architecture - refresh button is a self-contained UI component
- State management via Zustand stores - `priceStore` tracks last update time
- API client handles rate limiting - already managed by request queue service
- Responsive design - button must work across all breakpoints

**Testing Standards:**
- Unit tests for component behavior (>80% coverage)
- Integration tests for hook interaction
- Accessibility testing (keyboard, screen reader)
- Manual cross-browser testing

### Project Structure Notes

**Expected File Locations:**
- Component: `src/components/layout/Header.tsx` (modify existing)
- Utility: `src/utils/formatters.ts` (add `formatRelativeTime()`)
- Tests: `src/components/layout/__tests__/Header.test.tsx`
- Hook: `src/hooks/usePrices.ts` (already exists, no changes)

**Styling:**
- Use shadcn/ui Button component for consistency
- Follow existing Header component styling patterns
- Ensure button matches app theme (light/dark mode)

### UX Considerations

**From UX Design [docs/ux-design-portfolio-tracker.md]:**
- Button should be visible but not dominate the header
- Loading state must be clearly communicated
- Timestamp provides transparency about data freshness
- Error messages must be user-friendly, not technical
- Mobile: button accessible with thumb-friendly placement

### Edge Cases to Handle

1. **First Load (No Prices Yet):** Timestamp shows "Never updated" or similar
2. **Rapid Clicks:** Button disabled during refresh prevents duplicate calls
3. **Network Offline:** Error message explains offline state, suggests waiting
4. **Partial Failures:** Show which tickers succeeded and which failed
5. **Very Old Cache:** Highlight if prices are >24 hours old

### Performance Considerations

- Timestamp updates should be efficient (use React memoization)
- Relative time formatting should not cause excessive re-renders
- Loading state transitions should be smooth, no UI jank

### Accessibility Requirements

- **WCAG AA Compliance:**
  - Button has sufficient color contrast
  - Minimum 44x44px touch target
  - Keyboard accessible (Tab to focus, Enter/Space to activate)
  - Loading state announced to screen readers
  - Icon has accessible text alternative

### References

- [Source: docs/epics-and-stories.md#S3.6]
- [Source: docs/architecture-portfolio-tracker.md#Component-Architecture]
- [Source: docs/ux-design-portfolio-tracker.md#Header-Component]
- [Source: docs/sprint-artifacts/sprint-02-plan.md#S3.4-usePrices-Hook]

---

## Dev Agent Record

### Context Reference

- [Story Context XML](3-6-add-refresh-prices-button.context.xml)

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled during implementation_

### Completion Notes List

_To be filled after story completion:_
- Components created/modified
- Patterns established
- Technical decisions made
- Deferred work or technical debt

### File List

_To be filled after story completion:_

```
NEW:
- (list new files created)

MODIFIED:
- (list files modified)

DELETED:
- (list files deleted, if any)
```

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-02 | Bob (SM) | Story drafted for Sprint 3 |
