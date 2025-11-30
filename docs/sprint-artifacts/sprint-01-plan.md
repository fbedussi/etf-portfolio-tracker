# Sprint 1 Plan

**Sprint:** 1 of 7  
**Duration:** 2 weeks (December 2-13, 2025)  
**Sprint Goal:** Establish project foundation with working skeleton that can load and parse portfolio files

---

## Sprint Overview

### Sprint Theme
**"Foundation & File Loading"**

This sprint establishes the technical foundation and delivers the first user-visible feature: loading a portfolio YAML file and displaying basic confirmation.

### Sprint Goal
By the end of Sprint 1, we will have:
1. A working React + TypeScript application
2. Project infrastructure (CI/CD, testing, linting)
3. Core architecture in place (stores, types, services)
4. Ability to load and validate a portfolio YAML file
5. Basic UI showing empty state and file upload

---

## Sprint Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| **Committed Points** | 22 points | E1 (13 pts) + E2 partial (9 pts) |
| **Team Capacity** | 80 hours | 1 developer × 2 weeks |
| **Velocity Target** | 20-25 points | First sprint, establishing baseline |
| **Stories** | 11 stories | 6 from E1, 5 from E2 |

---

## Sprint Backlog

### Epic 1: Project Foundation & Setup (13 points)

#### ✅ S1.1: Initialize React + TypeScript Project
**Priority:** P0 | **Points:** 2 | **Owner:** Dev Team

**Tasks:**
- [ ] Run `npm create vite@latest portfolio-tracker -- --template react-ts`
- [ ] Create folder structure: components/, services/, types/, hooks/, store/, utils/, config/
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint with React rules
- [ ] Configure Prettier
- [ ] Initialize Git repository
- [ ] Create .gitignore (node_modules, dist, .env)
- [ ] Test dev server runs

**Acceptance Criteria:**
- ✓ Vite dev server runs on `npm run dev`
- ✓ Project structure matches architecture doc
- ✓ ESLint passes with no errors
- ✓ Git repository initialized

**Estimated Hours:** 4h

---

#### ✅ S1.2: Install Core Dependencies
**Priority:** P0 | **Points:** 1 | **Owner:** Dev Team

**Tasks:**
- [ ] Install React 18.2+, React DOM
- [ ] Install Zustand for state management
- [ ] Install js-yaml for YAML parsing
- [ ] Install @types/js-yaml
- [ ] Install axios for HTTP client
- [ ] Install recharts for charting (Phase 2, but add now)
- [ ] Verify all packages install correctly
- [ ] Update package.json scripts

**Acceptance Criteria:**
- ✓ All dependencies installed without errors
- ✓ `npm run build` completes successfully
- ✓ No peer dependency warnings

**Estimated Hours:** 2h

---

#### ✅ S1.3: Configure shadcn/ui & Design System
**Priority:** P0 | **Points:** 3 | **Owner:** Dev Team

**Tasks:**
- [ ] Install shadcn/ui CLI: `npx shadcn-ui@latest init`
- [ ] Install base components: Button, Card, Badge, Separator, Table
- [ ] Create `styles/globals.css` with CSS variables
- [ ] Define color palette (primary, success, warning, danger)
- [ ] Define typography scale
- [ ] Set up light theme colors
- [ ] Set up dark theme colors
- [ ] Test component rendering

**Acceptance Criteria:**
- ✓ shadcn/ui components render correctly
- ✓ CSS variables defined for both themes
- ✓ Typography scale established
- ✓ Sample component page works

**Estimated Hours:** 6h

---

#### ✅ S1.4: Create TypeScript Type Definitions
**Priority:** P0 | **Points:** 2 | **Owner:** Dev Team

**Tasks:**
- [ ] Create `types/portfolio.types.ts`
  - Portfolio, ETF, AssetClass, Transaction interfaces
  - Holdings, PortfolioMetrics, HoldingDetail interfaces
- [ ] Create `types/api.types.ts`
  - PriceData, PriceCache, APIResponse interfaces
- [ ] Create `types/ui.types.ts`
  - Component prop types, theme types
- [ ] Create `types/index.ts` barrel export
- [ ] Add JSDoc comments to complex types
- [ ] Validate types compile without errors

**Acceptance Criteria:**
- ✓ All domain types defined
- ✓ Types exported from barrel file
- ✓ JSDoc comments on interfaces
- ✓ TypeScript compiles with no errors

**Estimated Hours:** 4h

---

#### ✅ S1.5: Set Up Global State Stores
**Priority:** P0 | **Points:** 3 | **Owner:** Dev Team

**Tasks:**
- [ ] Create `store/portfolioStore.ts`
  - State: portfolio, metrics
  - Actions: setPortfolio, clearPortfolio, updateMetrics
- [ ] Create `store/priceStore.ts`
  - State: prices, loading, errors
  - Actions: setPrices, setLoading, setError
- [ ] Create `store/uiStore.ts`
  - State: theme, isLoading, error
  - Actions: setTheme, setLoading, setError, clearError
- [ ] Add TypeScript types for all stores
- [ ] Test store actions update state correctly

**Acceptance Criteria:**
- ✓ Three Zustand stores created
- ✓ All stores have TypeScript types
- ✓ Actions follow immutable update patterns
- ✓ Stores can be imported and used

**Estimated Hours:** 6h

---

#### ✅ S1.6: Create Base Layout Components
**Priority:** P0 | **Points:** 2 | **Owner:** Dev Team

**Tasks:**
- [ ] Create `components/layout/AppContainer.tsx`
  - Main wrapper with max-width, padding
  - Responsive container
- [ ] Create `components/layout/Header.tsx`
  - App title
  - Placeholder for actions menu
- [ ] Create `components/layout/ErrorBoundary.tsx`
  - Catch React errors
  - Display fallback UI
  - Log errors to console
- [ ] Test ErrorBoundary catches errors
- [ ] Style with Tailwind/CSS

**Acceptance Criteria:**
- ✓ AppContainer wraps app content
- ✓ Header displays app title
- ✓ ErrorBoundary catches and displays errors
- ✓ Responsive design works

**Estimated Hours:** 4h

---

### Epic 2: Portfolio Data Management (Partial - 9 points)

#### ✅ S2.1: Implement YAML File Parser
**Priority:** P0 | **Points:** 3 | **Owner:** Dev Team

**Tasks:**
- [ ] Create `services/fileService.ts`
- [ ] Implement `parsePortfolioFile(file: File): Promise<Portfolio>`
  - Read file as text using FileReader API
  - Parse YAML using js-yaml
  - Convert to Portfolio type
  - Handle parsing errors
- [ ] Add error handling for invalid YAML
- [ ] Support UTF-8 encoding
- [ ] Enforce 10MB file size limit
- [ ] Write unit tests (5+ test cases)

**Acceptance Criteria:**
- ✓ Valid YAML files parse to Portfolio objects
- ✓ Invalid YAML throws clear error
- ✓ Files over 10MB rejected
- ✓ Unit tests pass

**Estimated Hours:** 6h

---

#### ✅ S2.2: Implement Portfolio Data Validation
**Priority:** P0 | **Points:** 5 | **Owner:** Dev Team

**Tasks:**
- [ ] Extend `services/fileService.ts`
- [ ] Implement `validatePortfolioData(data: any): void`
  - Check required fields (targetAllocation, etfs)
  - Validate target allocation sums to 100%
  - Validate each ETF structure
  - Validate asset class percentages sum to 100%
  - Validate transaction formats
  - Check total quantity >= 0
- [ ] Create custom ValidationError class
- [ ] Return detailed error messages
- [ ] Write comprehensive unit tests (15+ cases)

**Acceptance Criteria:**
- ✓ All validation rules implemented
- ✓ Clear error messages with field references
- ✓ Edge cases handled (zero quantity, rounding)
- ✓ Unit tests cover all scenarios

**Estimated Hours:** 10h

---

#### ✅ S2.3: Build File Upload Component
**Priority:** P0 | **Points:** 3 | **Owner:** Dev Team

**Tasks:**
- [ ] Create `components/FileUpload.tsx`
- [ ] Add file input with accept=".yaml,.yml"
- [ ] Style as prominent button
- [ ] Add file picker dialog handler
- [ ] Display selected filename
- [ ] Add loading state during parse
- [ ] Integrate with fileService
- [ ] Make accessible (keyboard, screen reader)

**Acceptance Criteria:**
- ✓ File input accepts only .yaml/.yml
- ✓ Button minimum 44px height
- ✓ Shows loading during parse
- ✓ Keyboard accessible

**Estimated Hours:** 6h

---

#### ✅ S2.4: Create Empty State View
**Priority:** P0 | **Points:** 2 | **Owner:** Dev Team

**Tasks:**
- [ ] Create `components/states/EmptyState.tsx`
- [ ] Design centered layout
- [ ] Add hero message: "Welcome to Portfolio Tracker"
- [ ] Add subtext explaining app purpose
- [ ] Embed FileUpload component
- [ ] Add app icon/logo (optional)
- [ ] Style with shadcn Card component
- [ ] Make responsive

**Acceptance Criteria:**
- ✓ Centered layout on empty state
- ✓ Clear call-to-action
- ✓ FileUpload component integrated
- ✓ Responsive on mobile

**Estimated Hours:** 4h

---

#### ✅ S2.5: Implement Loading State Component
**Priority:** P0 | **Points:** 2 | **Owner:** Dev Team

**Tasks:**
- [ ] Create `components/states/LoadingState.tsx`
- [ ] Add spinner animation (CSS or library)
- [ ] Add progress text prop
- [ ] Center vertically and horizontally
- [ ] Test with different messages
- [ ] Make accessible (aria-live)

**Acceptance Criteria:**
- ✓ Spinner animates smoothly
- ✓ Progress text displays
- ✓ Centered layout
- ✓ Screen reader announces loading

**Estimated Hours:** 4h

---

## Sprint Tasks Breakdown

### Week 1 (Dec 2-6)
**Focus:** Foundation & Infrastructure

**Monday-Tuesday:**
- S1.1: Initialize project (2 pts) ✓
- S1.2: Install dependencies (1 pt) ✓
- S1.4: Create type definitions (2 pts) ✓

**Wednesday-Thursday:**
- S1.3: Configure shadcn/ui (3 pts) ✓
- S1.5: Set up stores (3 pts) ✓

**Friday:**
- S1.6: Create layout components (2 pts) ✓
- Code review & testing

---

### Week 2 (Dec 9-13)
**Focus:** File Loading Feature

**Monday-Tuesday:**
- S2.1: Implement YAML parser (3 pts) ✓
- S2.2: Implement validation (5 pts) - Start

**Wednesday-Thursday:**
- S2.2: Continue validation (5 pts) - Complete
- S2.3: Build file upload component (3 pts) ✓

**Friday:**
- S2.4: Create empty state (2 pts) ✓
- S2.5: Create loading state (2 pts) ✓
- Sprint review & retrospective

---

## Definition of Done

### Story-Level DoD
- [ ] Code implements all acceptance criteria
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Code reviewed and approved by peer
- [ ] No ESLint errors or warnings
- [ ] Component/function has JSDoc comments
- [ ] TypeScript types defined (no `any`)
- [ ] Manual testing completed
- [ ] Merged to main branch

### Sprint-Level DoD
- [ ] All committed stories completed
- [ ] Sprint goal achieved
- [ ] All tests passing (unit + integration)
- [ ] No critical bugs
- [ ] Code coverage >80%
- [ ] Sprint demo completed
- [ ] Retrospective conducted
- [ ] Next sprint planned

---

## Testing Strategy

### Unit Tests
**Target Coverage:** 80%+

**Priority Areas:**
- `fileService.ts`: Parsing and validation logic (Critical)
- Type definitions: Ensure correct structure
- Store actions: State updates correctly

**Tools:** Vitest, @testing-library/react

---

### Integration Tests
**Priority Areas:**
- File upload → Parse → Validation flow
- Store updates when file loaded
- Error handling end-to-end

---

### Manual Testing
**Test Scenarios:**
1. Load valid portfolio file → Success
2. Load invalid YAML → Error message
3. Load file with validation errors → Detailed errors
4. Responsive layout on mobile/desktop
5. Theme toggle works (if implemented)

---

## Risk Management

### Sprint Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| YAML parsing complexity | Low | Medium | Use proven js-yaml library, add tests |
| Validation logic bugs | Medium | High | Comprehensive unit tests, edge cases |
| shadcn/ui setup issues | Low | Low | Follow official docs, community support |
| First sprint velocity unknown | High | Low | Conservative estimate, buffer time |

---

## Dependencies & Blockers

### External Dependencies
- ✅ Node.js 18+ installed
- ✅ npm or yarn available
- ✅ Git repository access

### Internal Dependencies
- None (first sprint)

### Potential Blockers
- None identified

---

## Sprint Ceremonies

### Sprint Planning
**Date:** December 2, 2025 (Monday)  
**Duration:** 2 hours  
**Attendees:** Dev Team, Product Owner, Scrum Master

**Agenda:**
1. Review sprint goal
2. Review and estimate stories
3. Commit to sprint backlog
4. Assign story owners
5. Identify risks and dependencies

---

### Daily Standup
**Time:** 9:00 AM daily  
**Duration:** 15 minutes  
**Format:** Async (written updates)

**Updates:**
- What I completed yesterday
- What I'm working on today
- Any blockers

---

### Sprint Review/Demo
**Date:** December 13, 2025 (Friday)  
**Duration:** 1 hour  
**Attendees:** Dev Team, Product Owner, Stakeholder

**Demo:**
1. Project setup and structure
2. Empty state UI
3. File upload and parsing
4. Validation with error messages
5. Q&A

---

### Sprint Retrospective
**Date:** December 13, 2025 (Friday)  
**Duration:** 1 hour  
**Attendees:** Dev Team, Scrum Master

**Format:**
- What went well?
- What could be improved?
- Action items for next sprint

---

## Success Criteria

### Must Have (Sprint Goal)
- ✅ Project compiles and runs
- ✅ Can load a YAML portfolio file
- ✅ Validation catches errors
- ✅ Empty state displays with file upload
- ✅ Basic UI structure in place

### Nice to Have (Stretch Goals)
- 🎯 Error state component (S2.7 - moved to Sprint 2)
- 🎯 File upload hook (S2.6 - moved to Sprint 2)
- 🎯 Example portfolio files (S2.8 - moved to Sprint 2)

---

## Burndown Chart

**Planned:**
```
Day 1:  22 points remaining
Day 2:  20 points remaining (S1.1, S1.2 complete)
Day 3:  18 points remaining (S1.4 complete)
Day 4:  15 points remaining (S1.3 complete)
Day 5:  12 points remaining (S1.5 complete)
Day 6:  10 points remaining (S1.6 complete)
Day 7:   7 points remaining (S2.1 complete)
Day 8:   2 points remaining (S2.2 complete)
Day 9:   0 points remaining (S2.3, S2.4, S2.5 complete)
Day 10:  Buffer day for testing/bug fixes
```

---

## Notes & Decisions

### Architecture Decisions
- **State Management:** Zustand chosen for simplicity over Redux
- **Build Tool:** Vite for fast dev experience
- **UI Library:** shadcn/ui for customizable components
- **Testing:** Vitest for unit tests (Vite integration)

### Deferred to Future Sprints
- Price fetching (Sprint 2)
- Dashboard UI (Sprint 3)
- Theme toggle (Sprint 4)
- Error boundary testing (Sprint 2)

### Team Agreements
- Commit convention: Conventional Commits (feat:, fix:, docs:, etc.)
- PR review: At least 1 approval required
- Branch naming: feature/S{story-number}-{description}
- Merge strategy: Squash and merge

---

## Appendix: Story Details

### S2.2 Validation Rules Reference

**Target Allocation Validation:**
```typescript
// Must sum to 100% (±0.01 tolerance)
const sum = Object.values(targetAllocation).reduce((a, b) => a + b, 0);
if (Math.abs(sum - 100) > 0.01) {
  throw new ValidationError(`Target allocation sums to ${sum}%, must equal 100%`);
}
```

**ETF Asset Class Validation:**
```typescript
// Each ETF's asset classes must sum to 100%
const sum = etf.assetClasses.reduce((acc, ac) => acc + ac.percentage, 0);
if (Math.abs(sum - 100) > 0.01) {
  throw new ValidationError(`ETF ${ticker}: Asset classes sum to ${sum}%, must equal 100%`);
}
```

**Transaction Validation:**
```typescript
// Total quantity must not be negative
const totalQty = transactions.reduce((sum, tx) => sum + tx.quantity, 0);
if (totalQty < 0) {
  throw new ValidationError(`ETF ${ticker}: Total quantity is negative (cannot oversell)`);
}
```

---

**Sprint 1 Plan Version:** 1.0  
**Created:** 2025-11-30  
**Status:** Ready to Start  
**Next Review:** Sprint Review (Dec 13, 2025)
