# Sprint 5 Plan: Rebalancing Analysis

**Sprint Number:** 5  
**Sprint Name:** Rebalancing Analysis  
**Duration:** 2 weeks (Dec 3 - Dec 16, 2025)  
**Team Velocity:** 19.5 points/sprint average  
**Committed Points:** 13 points  

## Sprint Goals

1. **Implement complete rebalancing analysis engine (E6)**
2. **Build rebalancing UI components**
3. **Enable portfolio drift monitoring**
4. **Provide actionable rebalancing recommendations**

## Epic Focus

### Epic 6: Rebalancing Analysis (13 points)
Complete implementation of portfolio drift calculation and rebalancing recommendations.

**Business Value:**
- Key differentiator for portfolio management
- Helps users maintain target allocation
- Reduces manual calculation burden
- Provides clear actionable guidance

## Committed Stories

### S6.1: Implement Drift Calculation (3 pts) ⭐️ START HERE
**Priority:** P0  
**Dependencies:** E4 (Calculations Engine) ✅ Complete

**Description:**
Calculate drift between current and target allocation for each asset category.

**Acceptance Criteria:**
- [ ] `services/rebalancingService.ts` created with TypeScript types
- [ ] `calculateDrift(current, target)` method implemented
- [ ] Calculates absolute drift for each category
- [ ] Identifies maximum drift across all categories
- [ ] Returns `CategoryDrift[]` objects with signed and absolute values
- [ ] Comprehensive unit tests (>80% coverage)

**Drift Formulas:**
```typescript
drift = currentPercent - targetPercent
absDrift = Math.abs(drift)
maxDrift = Math.max(...absDrift for all categories)
```

**Technical Notes:**
- Use existing `AllocationByCategory` type from portfolioService
- Handle edge cases: missing categories, zero allocations
- Return sorted by absolute drift (descending)

**Estimated Hours:** 6-8 hours  
**Test Count Estimate:** 15-20 tests

---

### S6.2: Implement Rebalancing Status Logic (2 pts)
**Priority:** P0  
**Dependencies:** S6.1 (Drift Calculation)

**Description:**
Determine rebalancing status based on drift threshold with configurable sensitivity.

**Acceptance Criteria:**
- [ ] `determineRebalancingStatus(maxDrift, threshold)` method
- [ ] Returns status: 'in-balance' | 'monitor' | 'rebalance'
- [ ] Threshold configurable (default: 5%)
- [ ] Status rules implemented correctly:
  - `in-balance`: maxDrift < threshold
  - `monitor`: threshold ≤ maxDrift < 2×threshold
  - `rebalance`: maxDrift ≥ 2×threshold
- [ ] Unit tests for all status transitions

**Status Logic:**
```typescript
if (maxDrift < threshold) return 'in-balance';
if (maxDrift < threshold * 2) return 'monitor';
return 'rebalance';
```

**Technical Notes:**
- Keep logic pure for testability
- Consider percentage vs decimal handling
- Add status message helper function

**Estimated Hours:** 4 hours  
**Test Count Estimate:** 10-12 tests

---

### S6.3: Create Rebalancing Status Card (3 pts)
**Priority:** P0  
**Dependencies:** S6.2 (Status Logic)

**Description:**
Visual component showing current rebalancing status with color-coded indicator.

**Acceptance Criteria:**
- [ ] `components/portfolio/RebalancingStatusCard.tsx` component
- [ ] Color-coded status indicator (green/yellow/red)
- [ ] Displays status text and max drift percentage
- [ ] Lists categories that exceed threshold
- [ ] Clear, actionable messaging
- [ ] Loading and empty states
- [ ] Responsive design
- [ ] Component tests with RTL

**Status Messages:**
- ✓ **In Balance** (green): "Your portfolio is balanced"
- ⚠️ **Monitor** (yellow): "Minor drift detected, keep monitoring"
- ⚡ **Rebalance** (red): "Rebalancing recommended"

**UI Design:**
```
┌─────────────────────────────────────────┐
│ ⚡ Rebalancing Recommended              │
│                                         │
│ Maximum drift: 8.5%                     │
│                                         │
│ Categories out of balance:              │
│ • Stocks: +8.5% over target            │
│ • Bonds: -6.2% under target            │
└─────────────────────────────────────────┘
```

**Technical Notes:**
- Use shadcn/ui Card component
- Use lucide-react icons (CheckCircle, AlertTriangle, AlertCircle)
- Integrate with usePortfolio hook for reactive data
- Add badge for drift percentage

**Estimated Hours:** 6-8 hours  
**Test Count Estimate:** 8-10 tests

---

### S6.4: Create Target vs Current Comparison View (3 pts)
**Priority:** P1  
**Dependencies:** S6.1 (Drift Calculation)

**Description:**
Detailed comparison view showing target allocation vs current allocation.

**Acceptance Criteria:**
- [ ] `components/portfolio/AllocationComparison.tsx` component
- [ ] Table showing target %, current %, and drift for each category
- [ ] Highlights categories exceeding threshold (color-coded)
- [ ] Sortable by drift amount
- [ ] Visual bars for quick comparison
- [ ] Responsive layout (stacks on mobile)
- [ ] Component tests

**Comparison Table Structure:**
| Category | Target | Current | Drift | Status |
|----------|--------|---------|-------|--------|
| Stocks | 70.0% | 78.5% | **+8.5%** | 🔴 |
| Bonds | 20.0% | 13.8% | **-6.2%** | 🔴 |
| Real Estate | 10.0% | 7.7% | -2.3% | 🟢 |

**UI Features:**
- Color-coded drift cells (red > threshold, yellow ≥ threshold/2, green < threshold/2)
- Progress bars showing current vs target
- Expandable detail view per category
- Sort by: category name, drift (abs), target, current

**Technical Notes:**
- Use shadcn/ui Table component
- Integrate with usePortfolio hook
- Use formatPercentage from utils
- Add trend arrows (up/down)

**Estimated Hours:** 6-8 hours  
**Test Count Estimate:** 10-12 tests

---

### S6.5: Add Drift Threshold Configuration (2 pts)
**Priority:** P2  
**Dependencies:** S6.2 (Status Logic), S6.3 (Status Card)

**Description:**
Allow users to configure their drift threshold preference.

**Acceptance Criteria:**
- [ ] Threshold setting stored in localStorage
- [ ] Default value: 5%
- [ ] UI control in Header menu or settings dropdown
- [ ] Updates rebalancing status reactively when changed
- [ ] Input validation (1-20% range)
- [ ] Persists across sessions
- [ ] Component tests

**UI Options:**
1. **Dropdown in Header** (Simple):
   - "Drift Threshold: 5%" dropdown
   - Options: 2%, 3%, 5%, 7%, 10%

2. **Settings Dialog** (More flexible):
   - Slider control (1-20%)
   - Input field with validation
   - "Reset to default" button

**Technical Notes:**
- Store as `portfolioSettings` in localStorage
- Add to uiStore or create settingsStore
- Validate: 1 <= threshold <= 20
- Update rebalancingStatus calculation on change
- Consider adding "Conservative / Moderate / Relaxed" presets

**Estimated Hours:** 4-6 hours  
**Test Count Estimate:** 6-8 tests

---

## Sprint Metrics

| Metric | Target |
|--------|--------|
| **Total Story Points** | 13 |
| **Stories Committed** | 5 |
| **Estimated Test Count** | 49-62 tests |
| **Target Code Coverage** | >80% |
| **Epic Completion** | E6 (100%) |

## Technical Approach

### Architecture Changes
1. **New Service:** `rebalancingService.ts`
   - Pure calculation functions
   - No side effects
   - Easy to test and reason about

2. **Store Updates:**
   - Add `rebalancingStatus` to portfolioStore
   - Optional: Create `settingsStore` for threshold config

3. **New Components:**
   - `RebalancingStatusCard` (hero component)
   - `AllocationComparison` (detailed table)

### Testing Strategy
- **Unit Tests:** All calculation logic (rebalancingService)
- **Integration Tests:** Components with store data
- **Edge Cases:** Missing data, zero allocations, extreme drifts
- **Visual Tests:** Color-coded indicators work correctly

### Dependencies
- ✅ E4 Complete: All calculation utilities available
- ✅ usePortfolio hook: Provides allocation data
- ✅ formatPercentage: Format drift values

## Definition of Done

Each story is complete when:
- ✅ All acceptance criteria met
- ✅ Unit tests written and passing
- ✅ Component tests written (for UI stories)
- ✅ Code reviewed (self-review checklist)
- ✅ No TypeScript errors
- ✅ No console warnings
- ✅ Integrated with Dashboard (if UI component)
- ✅ Documentation updated (inline comments)

## Sprint Checklist

### Pre-Sprint
- [x] Sprint plan created and reviewed
- [x] Stories estimated and prioritized
- [x] Dependencies verified
- [x] Team capacity confirmed

### During Sprint
- [ ] Daily progress tracking
- [ ] Blockers identified early
- [ ] Code quality maintained
- [ ] Tests written with features

### Post-Sprint
- [ ] All committed stories completed
- [ ] Sprint retrospective conducted
- [ ] Velocity updated
- [ ] Sprint 6 planned

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Calculation complexity | Medium | High | Comprehensive tests, manual verification |
| UI/UX clarity | Low | Medium | Follow PRD wireframes, user feedback |
| Threshold configuration scope creep | Low | Low | Keep UI simple, defer advanced features |
| Integration with Dashboard | Low | Low | Reuse existing patterns from Sprint 4 |

## Success Criteria

Sprint 5 is successful when:
1. ✅ All 5 stories (13 points) completed
2. ✅ Rebalancing analysis fully functional
3. ✅ 49+ tests passing
4. ✅ No critical bugs
5. ✅ Dashboard shows rebalancing status
6. ✅ Users can monitor portfolio drift

## Sprint Timeline

**Week 1 (Dec 3-6):**
- Day 1: S6.1 (Drift Calculation) - 3 pts
- Day 2: S6.2 (Status Logic) - 2 pts
- Day 3-4: S6.3 (Status Card) - 3 pts

**Week 2 (Dec 9-13):**
- Day 1-2: S6.4 (Comparison View) - 3 pts
- Day 3: S6.5 (Threshold Config) - 2 pts
- Day 4: Testing, integration, polish
- Day 5: Sprint review, retrospective, Sprint 6 planning

## Notes

- Conservative commitment: 13 points (below 19.5 avg velocity)
- Focus on quality rebalancing logic
- Rebalancing is key product differentiator
- Foundation for future trade suggestions (future sprint)
- Keep threshold configuration simple initially

---

**Status:** 🟢 Ready to Start  
**Next Action:** Begin S6.1 (Drift Calculation)  
**Updated:** December 3, 2025
