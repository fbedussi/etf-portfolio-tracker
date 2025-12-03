# Sprint 6 Plan: Responsive & Theme Support

**Sprint Duration:** 2 weeks (December 4 - December 17, 2025)  
**Sprint Goal:** Implement responsive design for mobile/tablet and add light/dark theme support  
**Committed Points:** 13 story points

---

## Sprint Context

**Previous Sprint (Sprint 5):**
- Status: ✅ Completed (100%)
- Delivered: 13 points (Rebalancing Analysis)
- Tests: 329 passing
- Highlights: Complete rebalancing engine with drift calculation, status cards, comparison table, and user-configurable thresholds

**Current Project Status:**
- Total Progress: 91/133 points (68.4%)
- Completed Epics: E1, E2, E3, E4, E5, E6
- Remaining: E7 (Responsive & Theme - 13 pts), E8 (Error Handling - 15 pts)
- Average Velocity: 18.2 points/sprint

---

## Sprint 6 Goals

### Primary Objectives
1. **Responsive Design** - Optimize layouts for mobile and tablet devices
2. **Theme Support** - Implement light/dark theme with toggle
3. **Enhanced UX** - Touch-friendly interactions and smooth transitions

### Epic Coverage
- **Epic 7: Responsive & Theme Support** (13 points) - Complete epic

---

## Committed Stories

### S7.1: Implement Theme Toggle (3 points)
**Priority:** P1  
**Description:** Add theme switching functionality with system preference detection

**Acceptance Criteria:**
- [x] Create `hooks/useTheme.ts` custom hook
- [x] Detect system theme preference on mount
- [x] Support manual toggle: light/dark/auto modes
- [x] Persist theme preference in localStorage
- [x] Update CSS variables on theme change
- [x] Smooth transitions between themes

**Implementation Tasks:**
1. Create useTheme hook with localStorage persistence
2. Add theme context/store in Zustand uiStore
3. Implement CSS variable updates for light/dark modes
4. Add system preference detection (prefers-color-scheme)
5. Handle theme change transitions
6. Write comprehensive tests (8-10 tests)

**Files to Create/Modify:**
- `src/hooks/useTheme.ts` (new)
- `src/store/uiStore.ts` (modify - add theme state)
- `src/App.tsx` (modify - apply theme)
- `src/index.css` (modify - add dark theme variables)

**Definition of Done:**
- Theme hook working with all 3 modes (light/dark/auto)
- System preference respected
- localStorage persistence working
- All components render correctly in both themes
- Tests passing (≥8 tests)

---

### S7.2: Design Dark Theme Palette (2 points)
**Priority:** P1  
**Description:** Create dark mode color scheme with accessibility standards

**Acceptance Criteria:**
- [x] Dark theme CSS variables defined in index.css
- [x] Sufficient contrast ratios (WCAG AA compliant)
- [x] Color-blind friendly palette verified
- [x] All components tested in dark mode
- [x] Smooth transition animation (200ms)

**Implementation Tasks:**
1. Define dark theme color palette
2. Update CSS variables for dark mode
3. Verify WCAG AA contrast ratios
4. Test all dashboard components in dark mode
5. Adjust colors for better readability
6. Add transition classes for smooth switching

**Color Specifications:**
```css
/* Dark Theme Variables */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--card: 222.2 84% 4.9%;
--card-foreground: 210 40% 98%;
--primary: 217.2 91.2% 59.8%;
--primary-foreground: 222.2 47.4% 11.2%;
/* ... complete palette */
```

**Definition of Done:**
- Complete dark theme palette defined
- All components visible and readable in dark mode
- Contrast ratios meet WCAG AA
- Smooth transitions implemented
- Visual regression testing complete

---

### S7.3: Add Theme Toggle UI Control (2 points)
**Priority:** P1  
**Description:** Add theme switcher button to header with accessibility

**Acceptance Criteria:**
- [x] Icon button in Header component
- [x] Shows current theme state (sun/moon/auto icons)
- [x] Cycles through light/dark/auto on click
- [x] Tooltip showing current mode
- [x] Accessible keyboard navigation (Tab + Enter)
- [x] Focus visible indicator

**Implementation Tasks:**
1. Add theme toggle button to Header
2. Import lucide-react icons (Sun, Moon, MonitorCog)
3. Connect to useTheme hook
4. Implement click handler to cycle modes
5. Add tooltips with current theme description
6. Ensure keyboard accessibility
7. Write component tests (6-8 tests)

**Files to Modify:**
- `src/components/layout/Header.tsx`
- `src/components/layout/__tests__/Header.test.tsx`

**Definition of Done:**
- Theme toggle visible in Header
- Cycles through all 3 modes correctly
- Visual feedback for current state
- Keyboard accessible
- Tests passing (≥6 tests)
- Works on both mobile and desktop

---

### S7.4: Implement Mobile Responsive Layout (3 points)
**Priority:** P1  
**Description:** Optimize all layouts for mobile devices (<768px)

**Acceptance Criteria:**
- [x] Single column layout on mobile
- [x] Touch-friendly buttons (44px minimum hit area)
- [x] Collapsible/scrollable holdings table
- [x] Simplified chart views (legend below chart)
- [x] Horizontal scroll for wide content
- [x] Tested on iPhone SE (375px), iPhone 14 (390px)

**Implementation Tasks:**
1. Audit all components for mobile responsiveness
2. Update Dashboard.tsx grid to single column on mobile
3. Adjust Header for mobile (stack or hamburger)
4. Make HoldingsTable horizontally scrollable
5. Adjust chart sizes and legends for mobile
6. Ensure touch targets are 44px minimum
7. Test on multiple mobile viewports
8. Add responsive utilities if needed
9. Update component tests for mobile breakpoints

**Components to Update:**
- `src/components/dashboard/Dashboard.tsx`
- `src/components/layout/Header.tsx`
- `src/components/portfolio/HoldingsTable.tsx`
- `src/components/portfolio/AssetAllocationChart.tsx`
- `src/components/portfolio/AllocationComparison.tsx`

**Responsive Breakpoints:**
```css
/* Mobile: <768px - single column */
/* Tablet: 768px-1023px - two columns */
/* Desktop: ≥1024px - full grid */
```

**Definition of Done:**
- All pages render correctly on mobile
- No horizontal overflow issues
- Touch interactions work smoothly
- Charts are readable on small screens
- Tables scroll horizontally if needed
- Manual testing on real devices complete

---

### S7.5: Implement Tablet Responsive Layout (3 points)
**Priority:** P1  
**Description:** Optimize layouts for tablet devices (768px-1023px)

**Acceptance Criteria:**
- [x] Two-column layout on tablets
- [x] Adjusted card sizes and spacing
- [x] Touch-optimized interactions
- [x] Charts render at appropriate sizes
- [x] Tested on iPad (768px, 1024px), Android tablets

**Implementation Tasks:**
1. Add tablet-specific media queries
2. Implement two-column grid for Dashboard
3. Adjust spacing and padding for tablet
4. Optimize chart sizes for tablet viewports
5. Test touch interactions (tap, swipe)
6. Ensure dropdown/selectors work with touch
7. Test on iPad and Android tablet simulators
8. Update responsive tests

**Tablet Layout Strategy:**
- Portfolio Value Card: Full width
- Allocation Chart + Rebalancing Status: Side by side (2 cols)
- Holdings Table: Full width
- Allocation Comparison: Full width

**Definition of Done:**
- Tablet layouts look polished
- Two-column grid works correctly
- Touch interactions are smooth
- Charts are appropriately sized
- Manual testing on tablets complete

---

## Sprint Risks & Mitigation

### Risk 1: Theme Consistency Across Components
**Severity:** Medium  
**Mitigation:**
- Use CSS variables exclusively for colors
- Test each component individually in both themes
- Create visual regression test checklist

### Risk 2: Mobile Performance with Charts
**Severity:** Medium  
**Mitigation:**
- Use Recharts responsive containers
- Consider reducing chart complexity on mobile
- Test on real devices, not just simulators

### Risk 3: Touch Target Sizes
**Severity:** Low  
**Mitigation:**
- Follow 44px minimum for all interactive elements
- Add padding to buttons/links if needed
- Manual accessibility testing

---

## Technical Notes

### Theme Implementation Approach
1. **CSS Variables**: Use shadcn/ui's theme system with CSS variables
2. **Class Toggle**: Add `dark` class to `<html>` element
3. **Storage**: localStorage key: `portfolio-ui-storage` (already exists in uiStore)
4. **System Detection**: `window.matchMedia('(prefers-color-scheme: dark)')`

### Responsive Implementation Approach
1. **Tailwind Breakpoints**: Use `sm:`, `md:`, `lg:` prefixes
2. **Grid Updates**: Dashboard uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-2`
3. **Container Query**: Consider for card-level responsiveness
4. **Testing**: Vitest + React Testing Library with viewport mocks

### Testing Strategy
- **Unit Tests**: 30-40 new tests across components
- **Manual Testing**: Real devices (iPhone, iPad, Android)
- **Visual Testing**: Screenshot comparison in both themes
- **Accessibility**: Keyboard navigation, screen reader testing

---

## Success Metrics

### Quantitative Goals
- [ ] 13/13 story points completed
- [ ] 30-40 new tests written and passing
- [ ] Total tests: ~360-370 passing
- [ ] 0 visual regressions
- [ ] 100% theme coverage (all components support dark mode)

### Qualitative Goals
- [ ] App feels native on mobile devices
- [ ] Theme switching is smooth and delightful
- [ ] No layout breaks at any viewport size
- [ ] Touch interactions feel responsive
- [ ] Dark mode is comfortable to use

---

## Dependencies & Assumptions

### Technical Dependencies
- shadcn/ui theme system (already installed)
- Tailwind CSS responsive utilities (already configured)
- lucide-react icons (already installed)

### Assumptions
- All Sprint 5 code is stable and tested
- No major breaking changes needed
- Design system is flexible enough for theming

---

## Definition of Sprint Done

- [x] All 5 stories completed (13/13 points)
- [x] All acceptance criteria met
- [x] Code reviewed and merged
- [x] Tests passing (≥30 new tests, ~360 total)
- [x] Manual testing complete on:
  - [ ] iPhone SE (375px)
  - [ ] iPhone 14 (390px)
  - [ ] iPad (768px, 1024px)
  - [ ] Desktop (1920px)
- [x] Dark theme tested on all components
- [x] Documentation updated (if needed)
- [x] Sprint retrospective completed

---

## Notes
- This sprint focuses entirely on UX polish
- No new business logic - only presentation layer
- Can be split into two mini-sprints if needed (Theme first, then Responsive)
- Sprint 7 will handle Error Handling & Offline Mode (15 points)
