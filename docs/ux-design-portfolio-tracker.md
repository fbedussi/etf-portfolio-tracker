# UX Design Document

**Product Name:** Personal ETF Portfolio Tracker  
**Version:** 1.0  
**Date:** 2025-11-30  
**Designer:** UX Designer  
**Status:** Draft

---

## 1. Design Overview

### 1.1 Design Principles

1. **Clarity First** - Critical information (portfolio value, rebalancing status) visible immediately
2. **Privacy-Focused** - No account creation, no tracking, complete user control
3. **Progressive Disclosure** - Show essentials first, details on demand
4. **Mobile-First** - Design for smallest screen, enhance for larger
5. **Accessible** - WCAG AA compliant, color-blind friendly
6. **Performance** - Fast load, instant interactions, smooth animations

### 1.2 Design Goals

- User understands portfolio status in <10 seconds
- Zero learning curve for core functionality
- Works seamlessly across desktop, tablet, mobile
- Feels fast and responsive at all times
- Handles errors gracefully with clear guidance

---

## 2. Information Architecture

### 2.1 Application Structure

```
Portfolio Tracker App
│
├── Empty State (Initial Load)
│   └── Call-to-Action: Load Portfolio Button
│
├── Dashboard (Main View - Post Load)
│   ├── Header
│   │   ├── App Title/Logo
│   │   ├── Portfolio Name
│   │   └── Actions Menu (Refresh, Load New)
│   │
│   ├── Hero Section
│   │   ├── Total Portfolio Value (Primary)
│   │   └── Total P&L (Secondary)
│   │
│   ├── Rebalancing Status Card
│   │   ├── Status Indicator (Green/Yellow/Red)
│   │   ├── Max Drift Percentage
│   │   └── Out-of-Balance Categories
│   │
│   ├── Asset Allocation Section
│   │   ├── Current vs Target Comparison
│   │   ├── Breakdown Visualization (Chart)
│   │   └── Category Details (Expandable)
│   │
│   └── Holdings List
│       ├── ETF Name & Ticker
│       ├── Quantity & Current Price
│       ├── Current Value
│       └── P&L per Position
│
└── Error States
    ├── Invalid File Format
    ├── API Unavailable
    └── Parsing Errors
```

### 2.2 Navigation Flow

```
[Empty State] 
    ↓ Click "Load Portfolio"
[File Picker Dialog]
    ↓ Select YAML file
[Loading State - Parse & Fetch Prices]
    ↓ Success
[Dashboard - Main View]
    ↓ Click "Load Different Portfolio"
[File Picker Dialog]
```

**Navigation Pattern:** Single-page application, no traditional navigation. All content on main dashboard.

---

## 3. Screen Designs

### 3.1 Empty State (Initial Load)

**Purpose:** Welcome user and prompt portfolio file loading

**Layout:**
```
┌──────────────────────────────────────────┐
│                                          │
│              [Logo/Icon]                 │
│                                          │
│       Personal ETF Portfolio Tracker     │
│                                          │
│    Track your investments, monitor       │
│    allocation, get rebalancing alerts    │
│                                          │
│     ┌──────────────────────────┐        │
│     │   📁 Load Portfolio      │        │
│     └──────────────────────────┘        │
│                                          │
│       Your data never leaves your        │
│       device. 100% client-side.          │
│                                          │
└──────────────────────────────────────────┘
```

**Elements:**
- **Logo/Icon:** Portfolio/chart icon (centered, large)
- **Title:** "Personal ETF Portfolio Tracker" (H1, centered)
- **Subtitle:** Brief value proposition (centered, muted text)
- **Primary CTA:** "Load Portfolio" button (large, prominent, centered)
- **Privacy Note:** Small text emphasizing client-side operation

**Interactions:**
- Click "Load Portfolio" → Opens file picker
- No loading or navigation required

---

### 3.2 Loading State

**Purpose:** Provide feedback during file parsing and price fetching

**Layout:**
```
┌──────────────────────────────────────────┐
│                                          │
│              [Spinner Animation]         │
│                                          │
│         Loading your portfolio...        │
│                                          │
│    ✓ Parsing portfolio file              │
│    ↻ Fetching current prices (12/15)     │
│    ⋯ Calculating allocations             │
│                                          │
└──────────────────────────────────────────┘
```

**Elements:**
- **Spinner:** Animated loading indicator
- **Status Text:** Current operation description
- **Progress Steps:** Checklist showing completion status
- **Progress Count:** For price fetching (e.g., "12/15 ETFs")

**Interactions:**
- No user interaction during loading
- Auto-transitions to Dashboard on success
- Shows error state if loading fails

---

### 3.3 Dashboard - Desktop Layout (≥1024px)

**Purpose:** Main application view with all portfolio information

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  Portfolio Tracker    [My Portfolio ▾]  🌓  ⋮                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    PORTFOLIO VALUE                        │ │
│  │                      €127,543.82                         │ │
│  │                 +€12,543.82 (+10.9%)                     │ │
│  │           Last updated: Nov 30, 2025 10:23 AM            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────┐  ┌──────────────────────┐│
│  │   REBALANCING STATUS            │  │  ASSET ALLOCATION    ││
│  │                                 │  │                      ││
│  │         ●  IN BALANCE           │  │    [Pie Chart]       ││
│  │                                 │  │                      ││
│  │   Maximum drift: 2.3%           │  │  Stocks      68.5%   ││
│  │   Threshold: 5.0%               │  │  Bonds       22.1%   ││
│  │                                 │  │  Real Estate  9.4%   ││
│  │   All categories within target  │  │                      ││
│  └─────────────────────────────────┘  └──────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  HOLDINGS                                    [Collapse ▲] │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  ETF          Quantity  Price     Value      P&L         │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  VWCE         150      €95.23   €14,284.50  +€1,234.50  │ │
│  │  Vanguard FTSE All-World                     (+9.4%)     │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  AGG          200      €42.15   €8,430.00   -€230.00    │ │
│  │  iShares Core U.S. Aggregate Bond                        │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  VNQ          75       €89.67   €6,725.25   +€525.25    │ │
│  │  Vanguard Real Estate ETF                    (+8.5%)     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Key Sections:**

#### A. Header Bar
- **Left:** App title/logo (clickable, reloads empty state)
- **Center:** Portfolio name dropdown (future: switch portfolios)
- **Right:** Theme toggle button, Actions menu (⋮)

**Actions Menu:**
- Refresh Prices
- Load Different Portfolio
- About / Help

#### B. Hero Section (Portfolio Value Card)
- **Primary Metric:** Total portfolio value (very large, bold)
- **Secondary Metric:** Total P&L (absolute + percentage, color-coded)
- **Metadata:** Last updated timestamp (small, muted)

**Visual Hierarchy:**
- Portfolio value: 48px font, heavy weight
- P&L: 24px font, medium weight
- Timestamp: 12px font, light weight

#### C. Rebalancing Status Card
- **Status Indicator:** Large colored circle (●)
  - Green: "IN BALANCE" 
  - Yellow: "MONITOR"
  - Red: "REBALANCE NEEDED"
- **Drift Metrics:** Current max drift vs threshold
- **Details:** List of out-of-balance categories (if any)

#### D. Asset Allocation Card
- **Visualization:** Pie chart showing current allocation
- **Legend:** Category names with percentages
- **Interaction:** Hover to highlight category, show target comparison

**Chart Details:**
- Colors: Color-blind friendly palette
- Segments: Ordered by size (largest first)
- Labels: Show percentage if segment >5%

#### E. Holdings Table
- **Columns:** ETF (name + ticker), Quantity, Current Price, Current Value, P&L
- **Sorting:** Default by value (descending), allow click-to-sort
- **Expandable:** Show/hide full table with collapse toggle
- **Responsive:** Stacks columns on smaller screens

**Visual Details:**
- Zebra striping for rows
- ETF full name shown below ticker (muted)
- P&L color-coded (green/red)

---

### 3.4 Dashboard - Tablet Layout (768-1023px)

**Layout Adjustments:**
```
┌────────────────────────────────────┐
│  Portfolio Tracker  🌓  ⋮          │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │    PORTFOLIO VALUE           │ │
│  │      €127,543.82             │ │
│  │   +€12,543.82 (+10.9%)       │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  REBALANCING STATUS          │ │
│  │      ●  IN BALANCE           │ │
│  │  Maximum drift: 2.3%         │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  ASSET ALLOCATION            │ │
│  │    [Pie Chart]               │ │
│  │  Stocks      68.5%           │ │
│  │  Bonds       22.1%           │ │
│  │  Real Estate  9.4%           │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  HOLDINGS              [▲]   │ │
│  │  (Table - same as desktop)   │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

**Changes from Desktop:**
- Single column layout (stacked cards)
- Portfolio name moved to actions menu
- Slightly larger touch targets (48px minimum)
- Reduced margins between sections

---

### 3.5 Dashboard - Mobile Layout (<768px)

**Layout Adjustments:**
```
┌──────────────────────────┐
│  Portfolio     🌓  ⋮     │
├──────────────────────────┤
│                          │
│  PORTFOLIO VALUE         │
│  €127,543.82             │
│  +€12,543 (+10.9%)       │
│  Updated: 10:23 AM       │
│                          │
├──────────────────────────┤
│  REBALANCING             │
│     ● IN BALANCE         │
│  Max drift: 2.3%         │
│                          │
├──────────────────────────┤
│  ALLOCATION       [▼]    │
│                          │
│  (Collapsed by default)  │
│                          │
├──────────────────────────┤
│  HOLDINGS         [▼]    │
│                          │
│  ┌────────────────────┐ │
│  │ VWCE             ▼ │ │
│  │ €14,284.50         │ │
│  │ +€1,234 (+9.4%)    │ │
│  └────────────────────┘ │
│                          │
│  ┌────────────────────┐ │
│  │ AGG              ▼ │ │
│  │ €8,430.00          │ │
│  │ -€230 (-2.7%)      │ │
│  └────────────────────┘ │
│                          │
└──────────────────────────┘
```

**Mobile-Specific Optimizations:**
- Abbreviated labels to save space
- Collapsible sections (allocation, holdings) - default collapsed
- Card-based holdings (not table) - tap to expand details
- Swipe gestures: Pull down to refresh prices
- Sticky header with condensed title
- Larger text for primary metrics
- Removed last updated date (moved to menu)

---

### 3.6 Error States

#### A. Invalid File Format Error
```
┌────────────────────────────────────┐
│                                    │
│          ⚠️                        │
│                                    │
│     Invalid Portfolio File         │
│                                    │
│  The file you selected is not a    │
│  valid YAML portfolio file.        │
│                                    │
│  Common issues:                    │
│  • File syntax errors              │
│  • Missing required fields         │
│  • Incorrect data structure        │
│                                    │
│  [View Example File]               │
│  [Try Again]                       │
│                                    │
└────────────────────────────────────┘
```

**Elements:**
- Warning icon (large, centered)
- Error title (clear, non-technical)
- Explanation text (helpful, actionable)
- Common issues list (educational)
- Actions: View example, Try again

#### B. API Unavailable Error
```
┌────────────────────────────────────┐
│                                    │
│  Portfolio loaded successfully!    │
│                                    │
│  ⚠️ Unable to fetch current prices │
│                                    │
│  Using cached prices from:         │
│  Nov 30, 2025 8:15 AM              │
│                                    │
│  The app will work in offline      │
│  mode until connection is restored.│
│                                    │
│  [Retry Now]  [Continue Anyway]    │
│                                    │
└────────────────────────────────────┘
```

**Elements:**
- Success message first (positive framing)
- Warning about missing prices
- Show cached data timestamp
- Explain offline mode behavior
- Actions: Retry, Continue with cached data

#### C. Validation Error (Detailed)
```
┌────────────────────────────────────┐
│                                    │
│     Portfolio File Issues Found    │
│                                    │
│  The following issues need to be   │
│  fixed in your portfolio file:     │
│                                    │
│  ❌ ETF "VWCE": Asset class        │
│     percentages sum to 95%         │
│     (must equal 100%)              │
│                                    │
│  ❌ Transaction on line 28:        │
│     Invalid date format            │
│     (use YYYY-MM-DD)               │
│                                    │
│  ⚠️ ETF "AGG": No transactions     │
│     found (will be ignored)        │
│                                    │
│  [View Documentation]              │
│  [Try Different File]              │
│                                    │
└────────────────────────────────────┘
```

**Elements:**
- Issue list with severity icons (❌ error, ⚠️ warning)
- Specific field/line references
- Clear resolution guidance
- Actions: View docs, Try again

---

## 4. Component Specifications

### 4.1 Portfolio Value Card

**Visual Design:**
- Background: Subtle gradient (light mode: white→gray-50, dark mode: gray-900→gray-800)
- Border: 1px solid, rounded corners (12px radius)
- Padding: 32px (desktop), 24px (mobile)
- Shadow: Soft drop shadow (0 2px 8px rgba(0,0,0,0.08))

**Typography:**
- Portfolio value: 48px, font-weight 700, line-height 1.2
- Currency symbol: Same size as value
- P&L: 24px, font-weight 500
- Percentage: 20px, font-weight 400, (parentheses)
- Timestamp: 12px, font-weight 400, opacity 0.6

**Color Coding:**
- Profit (positive P&L): Green-600 light, Green-400 dark
- Loss (negative P&L): Red-600 light, Red-400 dark
- Neutral (zero): Gray-600

**Responsive Behavior:**
- Desktop: Value 48px, horizontal layout
- Tablet: Value 40px, horizontal layout
- Mobile: Value 36px, vertical stack

---

### 4.2 Rebalancing Status Indicator

**Status Colors:**
- **Green (In Balance):** 
  - Circle: Green-500
  - Background: Green-50 (light), Green-900/20 (dark)
  - Border: Green-200
  - Text: "IN BALANCE"
  
- **Yellow (Monitor):**
  - Circle: Yellow-500
  - Background: Yellow-50 (light), Yellow-900/20 (dark)
  - Border: Yellow-200
  - Text: "MONITOR"
  
- **Red (Rebalance Needed):**
  - Circle: Red-500
  - Background: Red-50 (light), Red-900/20 (dark)
  - Border: Red-200
  - Text: "REBALANCE NEEDED"

**Layout:**
- Status circle: 24px diameter (desktop), 20px (mobile)
- Status text: 18px, font-weight 600, uppercase
- Drift metrics: 14px, font-weight 400
- Card padding: 24px
- Border radius: 12px

**Animation:**
- Status circle: Subtle pulse animation when red/yellow
- Transition: 200ms ease when status changes

---

### 4.3 Asset Allocation Chart

**Chart Type:** Donut chart (pie chart with center hole)

**Visual Specifications:**
- Outer radius: 120px (desktop), 100px (tablet), 80px (mobile)
- Inner radius: 60% of outer radius
- Segment spacing: 2px gap between segments
- Animation: Segments animate in on load (300ms stagger)

**Color Palette (Color-blind Friendly):**
1. Blue-500 (#3B82F6)
2. Orange-500 (#F97316)
3. Teal-500 (#14B8A6)
4. Purple-500 (#A855F7)
5. Pink-500 (#EC4899)
6. Lime-500 (#84CC16)
7. Cyan-500 (#06B6D4)

**Legend:**
- Position: Right side (desktop), below (mobile)
- Items: Color square (12px), category name, percentage
- Font size: 14px
- Spacing: 8px between items

**Interactions:**
- Hover: Highlight segment, show tooltip with details
- Tooltip: Category name, current %, target %, drift

**Center Display:**
- Show "Current" label (12px, uppercase, gray)
- Optionally show largest category (mobile only)

---

### 4.4 Holdings Table/Cards

**Desktop Table:**
- Header: 14px, font-weight 600, uppercase, gray-600
- Row height: 72px (includes ETF name + ticker)
- Font size: 16px (values), 14px (ETF names), 12px (tickers)
- Borders: Bottom border only (1px, gray-200)
- Hover: Light background on row hover

**Column Widths:**
- ETF: 35% (name + ticker)
- Quantity: 12%
- Price: 15%
- Value: 18%
- P&L: 20%

**Mobile Cards:**
- Card height: 64px (collapsed), auto (expanded)
- Ticker: 18px, font-weight 600
- Value: 20px, font-weight 500 (most prominent)
- P&L: 16px, below value
- Expand icon: Chevron (▼/▲) on right
- Tap: Expand to show quantity, price, full name

**P&L Formatting:**
- Positive: "+€1,234.50 (+9.4%)" in green
- Negative: "-€230.00 (-2.7%)" in red
- Zero: "€0.00 (0.0%)" in gray

---

### 4.5 Buttons

**Primary Button (CTA):**
- Height: 48px (desktop), 52px (mobile for touch)
- Padding: 12px 24px
- Font: 16px, font-weight 600
- Border radius: 8px
- Color: Blue-600 background, white text
- Hover: Blue-700 background
- Active: Blue-800 background
- Shadow: 0 1px 3px rgba(0,0,0,0.1)

**Secondary Button:**
- Same dimensions as primary
- Background: Transparent
- Border: 2px solid gray-300
- Color: Gray-700 text
- Hover: Gray-50 background

**Icon Buttons (Theme toggle, menu):**
- Size: 40px × 40px
- Border radius: 8px
- Hover: Gray-100 background (light), gray-800 (dark)
- Icon size: 20px

---

### 4.6 Loading Spinner

**Style:** Circular spinner with rotating arc

**Specifications:**
- Size: 48px diameter (large), 24px (inline)
- Stroke width: 4px
- Color: Blue-600 (matches brand)
- Animation: 1s linear infinite rotation
- Opacity: 0.8

**Usage:**
- Large: Center of screen during initial load
- Inline: Next to "Refresh Prices" during update

---

## 5. Interaction Patterns

### 5.1 File Loading Flow

1. **Empty State** - User sees "Load Portfolio" button
2. **Click** - Opens native file picker dialog
3. **File Selection** - User selects YAML file
4. **Loading State** - Show spinner with progress steps
5. **Success** - Smooth transition to dashboard (fade in)
6. **Error** - Show error modal, keep empty state visible

**Timing:**
- Transition animations: 300ms ease-in-out
- Loading state minimum display: 500ms (avoid flash)

---

### 5.2 Price Refresh Flow

**Trigger Options:**
1. Manual: Click "Refresh Prices" in actions menu
2. Auto: Every 15 minutes if app remains open
3. Pull-to-refresh: Mobile only, swipe down gesture

**Visual Feedback:**
1. Button shows inline spinner
2. Last updated timestamp updates
3. Values smoothly animate to new prices (number counting)
4. Toast notification: "Prices updated" (2s duration)

**Error Handling:**
- Show toast: "Unable to fetch prices. Using cached data."
- Don't block UI or interrupt user
- Retry automatically after 5 minutes

---

### 5.3 Rebalancing Status Details

**Interaction:** Click/tap on rebalancing status card

**Behavior:**
- Expands card to show detailed breakdown
- Lists all asset classes with current vs target percentages
- Highlights out-of-balance categories
- Shows suggested actions (future enhancement)

**Example Expanded View:**
```
REBALANCING STATUS: MONITOR

Maximum drift: 6.2% (Stocks)

Asset Class Details:
┌──────────────────────────────────┐
│ Stocks                           │
│ Current: 73.2%  Target: 70.0%    │
│ Drift: +3.2% ⚠️                  │
├──────────────────────────────────┤
│ Bonds                            │
│ Current: 17.4%  Target: 20.0%    │
│ Drift: -2.6% ⚠️                  │
├──────────────────────────────────┤
│ Real Estate                      │
│ Current: 9.4%   Target: 10.0%    │
│ Drift: -0.6% ✓                   │
└──────────────────────────────────┘
```

---

### 5.4 Holdings Expansion (Mobile)

**Collapsed State:**
```
┌────────────────────┐
│ VWCE             ▼ │
│ €14,284.50         │
│ +€1,234 (+9.4%)    │
└────────────────────┘
```

**Expanded State:**
```
┌────────────────────┐
│ VWCE             ▲ │
│ Vanguard FTSE      │
│ All-World          │
│                    │
│ 150 shares         │
│ @ €95.23           │
│                    │
│ Value: €14,284.50  │
│ P&L: +€1,234       │
│      (+9.4%)       │
└────────────────────┘
```

**Animation:**
- Height: Smooth expand/collapse (200ms ease)
- Chevron: Rotate 180° on toggle
- Content: Fade in/out (150ms)

---

### 5.5 Theme Toggle

**States:**
- Light mode (☀️ icon)
- Dark mode (🌙 icon)
- Auto mode (💻 icon) - follows system preference

**Interaction:**
1. Click icon button in header
2. Cycles: Light → Dark → Auto → Light
3. Saves preference to localStorage
4. Smooth color transition (200ms)

**Visual Transition:**
- All colors interpolate smoothly
- No flash or jarring changes
- Background transitions last

---

## 6. Responsive Breakpoints

### 6.1 Breakpoint Definitions

```css
/* Mobile First Approach */
Mobile:       0px - 767px    (base styles)
Tablet:       768px - 1023px (@media min-width: 768px)
Desktop:      1024px - 1439px (@media min-width: 1024px)
Desktop XL:   1440px+         (@media min-width: 1440px)
```

### 6.2 Layout Behavior by Breakpoint

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Header | Single row | Single row | Single row |
| Portfolio Value | Full width | Full width | Full width |
| Rebalancing + Allocation | Stacked | Stacked | Side-by-side |
| Holdings | Cards | Table (scrollable) | Table |
| Font Scale | Base (16px) | +1px (17px) | +2px (18px) |
| Padding | 16px | 24px | 32px |

---

## 7. Accessibility

### 7.1 WCAG AA Compliance

**Color Contrast:**
- Body text: Minimum 4.5:1 ratio
- Large text (≥24px): Minimum 3:1 ratio
- UI components: Minimum 3:1 ratio
- Test with color blindness simulators

**Color-Blind Friendly Palette:**
- Avoid red/green as sole differentiators
- Use icons + colors (not color alone)
- Rebalancing: Circle shape + text label
- P&L: +/- symbols + color

**Keyboard Navigation:**
- All interactive elements focusable
- Logical tab order (top to bottom, left to right)
- Focus indicators visible (2px outline, blue-500)
- Skip to content link (hidden until focused)

**Screen Reader Support:**
- Semantic HTML (header, nav, main, section)
- ARIA labels for icon buttons
- ARIA live regions for dynamic updates
- Alt text for all meaningful graphics
- Table headers properly associated

**Focus Management:**
- After file load, focus moves to dashboard
- After error, focus moves to error message
- Modal dialogs trap focus

### 7.2 Touch Targets

**Minimum Sizes:**
- Buttons: 48px × 48px (iOS/Android guidelines)
- Tap targets spacing: 8px minimum between
- Form inputs: 52px height on mobile

---

## 8. Visual Design System

### 8.1 Color Palette

**Light Mode:**
```
Background:    #FFFFFF
Surface:       #F9FAFB (gray-50)
Border:        #E5E7EB (gray-200)
Text Primary:  #111827 (gray-900)
Text Secondary: #6B7280 (gray-500)
Brand Primary: #3B82F6 (blue-600)
Success:       #10B981 (green-500)
Warning:       #F59E0B (yellow-500)
Error:         #EF4444 (red-500)
```

**Dark Mode:**
```
Background:    #0F172A (slate-900)
Surface:       #1E293B (slate-800)
Border:        #334155 (slate-700)
Text Primary:  #F1F5F9 (slate-100)
Text Secondary: #94A3B8 (slate-400)
Brand Primary: #60A5FA (blue-400)
Success:       #34D399 (green-400)
Warning:       #FBBF24 (yellow-400)
Error:         #F87171 (red-400)
```

### 8.2 Typography

**Font Family:**
- Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Monospace: "SF Mono", Monaco, Consolas, monospace (for numbers/prices)

**Type Scale:**
```
Hero:     48px / 56px line-height, font-weight 700
H1:       36px / 44px, font-weight 700
H2:       24px / 32px, font-weight 600
H3:       20px / 28px, font-weight 600
Body:     16px / 24px, font-weight 400
Small:    14px / 20px, font-weight 400
Tiny:     12px / 16px, font-weight 400
```

### 8.3 Spacing Scale

```
xs:   4px    (tight spacing, icon gaps)
sm:   8px    (component internal spacing)
md:   16px   (default spacing)
lg:   24px   (section spacing)
xl:   32px   (major section spacing)
2xl:  48px   (hero section spacing)
```

### 8.4 Elevation (Shadows)

```
sm:   0 1px 2px rgba(0,0,0,0.05)
md:   0 2px 8px rgba(0,0,0,0.08)
lg:   0 4px 16px rgba(0,0,0,0.12)
xl:   0 8px 24px rgba(0,0,0,0.16)
```

### 8.5 Border Radius

```
sm:   4px    (small elements)
md:   8px    (buttons, inputs)
lg:   12px   (cards)
xl:   16px   (large cards)
full: 9999px (pills, circles)
```

---

## 9. Animation & Transitions

### 9.1 Timing Functions

```
Linear:      linear (loaders, spinners)
Ease:        ease (general purpose)
Ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) (smooth)
Spring:      cubic-bezier(0.34, 1.56, 0.64, 1) (bouncy)
```

### 9.2 Standard Durations

```
Instant:  100ms (micro-interactions)
Fast:     200ms (hover states, focus)
Normal:   300ms (transitions, fades)
Slow:     500ms (page transitions)
```

### 9.3 Key Animations

**Page Load:**
- Dashboard fades in (300ms)
- Cards stagger in from bottom (100ms delay each)
- Chart animates in last (500ms draw)

**Price Update:**
- Numbers count up/down (300ms)
- Color shifts smoothly (200ms)
- Subtle flash effect on change (300ms fade out)

**Hover Effects:**
- Button: Scale 1.02, shadow increases (200ms)
- Table row: Background color fade (150ms)
- Cards: Lift with shadow (200ms)

**Loading States:**
- Spinner rotation: 1s linear infinite
- Skeleton screens: Shimmer effect 2s infinite

---

## 10. Error Handling & Edge Cases

### 10.1 File Loading Errors

**Invalid YAML:**
- Show syntax error location
- Provide link to example file
- Offer to validate online (external tool)

**Missing Required Fields:**
- List all missing fields
- Explain what each field is for
- Link to documentation

**Empty Portfolio:**
- Allow load but show warning
- Explain no data to display
- Prompt to add transactions

### 10.2 API Errors

**Rate Limit Exceeded:**
- Explain rate limiting
- Show retry countdown timer
- Use cached prices automatically

**Ticker Not Found:**
- Show which tickers failed
- Suggest checking ticker symbols
- Allow app to continue with available data

**Network Offline:**
- Auto-detect offline state
- Show offline indicator in header
- Use cached data automatically

### 10.3 Data Validation Issues

**Negative Holdings:**
- Show warning icon next to ETF
- Tooltip: "More shares sold than bought"
- Don't crash, display as negative

**Asset Classes Don't Sum to 100%:**
- Show warning in allocation view
- Display actual sum (e.g., "Total: 95%")
- Normalize for display purposes

**Future Dated Transactions:**
- Show warning icon
- Tooltip: "Transaction date is in the future"
- Include in calculations anyway

---

## 11. Performance Considerations

### 11.1 Perceived Performance

**Loading Optimizations:**
- Show skeleton screens immediately
- Load hero metrics first, details later
- Defer chart rendering until visible
- Lazy load holdings if >20 ETFs

**Smooth Interactions:**
- Debounce search/filter (300ms)
- Throttle scroll handlers (100ms)
- Use CSS transforms for animations (GPU accelerated)
- Avoid layout thrashing (batch DOM reads/writes)

### 11.2 Actual Performance

**Bundle Size:**
- Target: <200KB gzipped (main bundle)
- Code split by route if adding features
- Tree-shake unused dependencies
- Optimize images and icons

**Runtime Performance:**
- Virtual scrolling for >50 holdings
- Memoize expensive calculations
- Use Web Workers for large portfolios
- IndexedDB for large cache datasets

---

## 12. Future Enhancements

### 12.1 Phase 2 Features

**Historical Chart:**
- Time-series line chart
- Zoom/pan interactions
- Configurable time ranges
- Smooth tooltips on hover

**Individual ETF View:**
- Dedicated page per ETF
- Transaction history timeline
- Performance vs benchmark
- Asset class contribution detail

### 12.2 Phase 3 Features

**Multiple Portfolios:**
- Portfolio switcher in header
- Consolidated view across portfolios
- Compare portfolios side-by-side

**Advanced Visualizations:**
- Treemap for holdings
- Sankey diagram for allocation
- Geographic map for country exposure

---

## 13. Design Deliverables

### 13.1 Assets to Create

- [ ] App icon/logo (SVG)
- [ ] Empty state illustration
- [ ] Loading spinner component
- [ ] Status indicator icons (green/yellow/red)
- [ ] Theme toggle icons (sun/moon/auto)
- [ ] Action menu icons
- [ ] Error state illustrations

### 13.2 Prototype Recommendations

**Tools:** Figma, Adobe XD, or high-fidelity HTML/CSS prototype

**Screens to Prototype:**
1. Empty state
2. Loading state
3. Dashboard (desktop)
4. Dashboard (mobile)
5. Rebalancing details (expanded)
6. Error states (3 variants)

**Interactions to Demonstrate:**
- File loading flow
- Price refresh animation
- Theme toggle
- Mobile card expansion
- Hover states

---

## 14. Design Review Checklist

Before implementation:
- [ ] All screens designed for mobile, tablet, desktop
- [ ] Color contrast ratios verified (WCAG AA)
- [ ] Focus states defined for all interactive elements
- [ ] Error states documented
- [ ] Loading states defined
- [ ] Animations specified with timing
- [ ] Responsive breakpoints documented
- [ ] Typography scale consistent
- [ ] Spacing system applied consistently
- [ ] Icon set complete and consistent
- [ ] Dark mode fully designed
- [ ] Accessibility annotations included

---

## 15. Open Design Questions

1. **Brand Identity:** Should we create a unique logo or use a generic portfolio icon?
2. **Chart Library:** Which library best supports our color-blind friendly palette? (Chart.js, D3, Recharts)
3. **Export Feature UI:** If added later, where should export button live?
4. **Onboarding:** Should we show a first-time user tutorial/tour?
5. **Sample Data:** Provide "Load Sample Portfolio" option for demo purposes?
6. **Settings Panel:** Future need for drift threshold configuration - dedicated settings page or inline?
7. **Animation Preferences:** Respect `prefers-reduced-motion` system setting?

---

## 16. Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| UX Designer | [To be filled] | | |
| Product Manager | [To be filled] | | |
| Tech Lead | [To be filled] | | |
| Stakeholder | Fra | | |

---

**Document History:**
- 2025-11-30: Initial draft (v1.0)
