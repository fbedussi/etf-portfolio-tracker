# S8.4: Add Retry Logic for Failed Requests

**Story**: As a user, I want failed API requests to be retried automatically, so that temporary network issues don't prevent me from seeing prices.

**Points**: 3

**Status**: ✅ Complete

## Implementation

### 1. Retry Utility (`src/utils/retry.ts`)
Created a generic retry utility with exponential backoff:

**Features**:
- Configurable max attempts (default: 3)
- Exponential backoff delays (default: 2s, 5s, 10s)
- Retry callbacks for user notifications
- Final failure callback
- Smart error detection (isRetryableError)

**Key Functions**:
```typescript
retryWithBackoff<T>(fn, options): Promise<T>
createRetryWrapper(options): RetryWrapper
isRetryableError(error): boolean
```

**Error Handling**:
- Retries network errors, timeouts, 5xx errors
- Does NOT retry:
  - 4xx client errors (except 429 rate limiting)
  - Validation errors
  - Invalid input errors

### 2. Price Service Integration
Updated `priceService.fetchPrice()` to use retry logic:

**Changes**:
- Wrapped fetch logic with `retryWithBackoff()`
- Console logging for retry attempts
- Moved core fetch logic to private `_fetchPriceOnce()` method

**User Notifications**:
- `⟳ Retry attempt X/3 for {ticker}: {error}`
- `✗ All retry attempts failed for {ticker}: {error}`

### 3. Test Updates
Enhanced priceService tests to handle retry delays:

**Approach**:
- Mock fetch to return consistent errors
- Use `vi.advanceTimersByTimeAsync()` to simulate retry delays
- Test advances through initial + 3 retry attempts (0ms, 2s, 5s, 10s)

**Test Coverage**:
- Invalid ticker with retries
- Rate limit with retries
- API failures with retries
- No data with retries
- Network errors with retries
- Timeout with retry cycles
- Successful retry after temporary failure

## Test Results
```
✓ src/utils/__tests__/retry.test.ts (17 tests)
  ✓ retryWithBackoff (7 tests)
    - should return result on first success
    - should retry on failure and eventually succeed
    - should use exponential backoff delays
    - should throw last error after all retries fail
    - should use default options when not provided
    - should handle non-Error rejections
    - should use last delay if attempts exceed delay array length
  ✓ createRetryWrapper (2 tests)
  ✓ isRetryableError (7 tests)
  ✓ DEFAULT_RETRY_OPTIONS (1 test)

✓ src/services/__tests__/priceService.test.ts (12 tests)
  - All tests updated to handle retry logic
  - Tests pass with fake timers and retry delays

Total: 463 tests passing (+17 from retry utility)
```

## User Experience

### Before
```
❌ Price fetch fails on first network hiccup
User sees error immediately
Must manually refresh
```

### After
```
🔄 Price fetch automatically retries (2s, 5s, 10s delays)
Console shows: "⟳ Retry attempt 1/3 for VTI: Network error"
Often succeeds on retry
User only sees error after all 4 attempts fail
Final error: "✗ All retry attempts failed for VTI..."
```

## Technical Decisions

### Why Exponential Backoff?
- **2s, 5s, 10s delays**: Balance between quick retry and not hammering the API
- Gives transient errors time to resolve
- Respects server load during issues

### Why Not Retry Client Errors?
- **4xx errors** (except 429): User/client issue, won't fix with retry
- **Validation errors**: Data problem, not network
- **Invalid input**: Logic error, not transient

### Why Public Retry Wrapper?
- Reusable for future API integrations
- Testable in isolation
- Configurable per use case
- Follows single responsibility principle

## Files Created/Modified

### New Files
- `src/utils/retry.ts` (151 lines)
- `src/utils/__tests__/retry.test.ts` (253 lines)

### Modified Files
- `src/services/priceService.ts`:
  - Added retry import
  - Wrapped `fetchPrice()` with `retryWithBackoff()`
  - Created private `_fetchPriceOnce()` method
  - Added retry logging
- `src/services/__tests__/priceService.test.ts`:
  - Updated 6 tests to handle retry delays
  - Changed `mockResolvedValueOnce()` to `mockResolvedValue()`
  - Added timer advancement for retry delays

## Integration Points
- **priceService**: Automatic retries for all price fetches
- **usePrices hook**: Benefits from retry logic transparently
- **Dashboard**: Users see more reliable price data
- **Error Handling**: Only shows errors after all retries exhausted

## Future Enhancements
- [ ] Configurable retry delays per environment (faster in dev?)
- [ ] Exponential backoff with jitter to prevent thundering herd
- [ ] Retry metrics/analytics (how often do retries succeed?)
- [ ] User notification of retry progress in UI (not just console)

## Sprint Progress
- ✅ S8.1: Global Error Boundary (2 pts)
- ✅ S8.2: API Error Handling (3 pts)
- ✅ S8.3: Offline Mode Detection (2 pts)
- ✅ S8.4: Retry Logic (3 pts) ← **CURRENT**
- 🔄 S8.5: Validation Error Messages (2 pts) - Next
- 🔄 S8.6: Connection Status Indicator (1 pt)

**Epic 8 Progress**: 10/13 points (77%)
**Sprint 7 Progress**: 10/29 points (34%)
**Total Tests**: 463 passing
