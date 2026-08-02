# AlgoApp Pro v2 — Design System Specification

## Table of Contents

- [1. Overview & Aesthetic Vision](#1-overview--aesthetic-vision)
- [2. Color Palette](#2-color-palette)
- [3. Typography & Financial Number Formatting](#3-typography--financial-number-formatting)
- [4. Spacing & Grid System](#4-spacing--grid-system)
- [5. Shadows & Elevation](#5-shadows--elevation)
- [6. Glassmorphism & Surface Materials](#6-glassmorphism--surface-materials)
- [7. Card Components & Containers](#7-card-components--containers)
- [8. Financial Data Grids & Tables](#8-financial-data-grids--tables)
- [9. Buttons & Interactive Controls](#9-buttons--interactive-controls)
- [10. Inputs & Form Controls](#10-inputs--form-controls)
- [11. Dropdowns, Selects & Context Menus](#11-dropdowns-selects--context-menus)
- [12. Sidebar Navigation](#12-sidebar-navigation)
- [13. Top Navbar & Header](#13-top-navbar--header)
- [14. Financial Charts & Visualizations](#14-financial-charts--visualizations)
- [15. Status Colors & Execution Badges](#15-status-colors--execution-badges)
- [16. Iconography Guidelines](#16-iconography-guidelines)
- [17. Notifications & Alert Toast System](#17-notifications--alert-toast-system)
- [18. Empty States](#18-empty-states)
- [19. Loading States & Skeletons](#19-loading-states--skeletons)
- [20. Error States & Fail-Closed Alerts](#20-error-states--fail-closed-alerts)
- [21. Responsive Breakpoints & Adaptability](#21-responsive-breakpoints--adaptability)
- [22. Animation Guidelines & Micro-Interactions](#22-animation-guidelines--micro-interactions)
- [23. Design Tokens & CSS Custom Properties](#23-design-tokens--css-custom-properties)

---

## 1. Overview & Aesthetic Vision

The **AlgoApp Pro v2 Design System** defines the visual, structural, and behavioral standards for the web platform. Designed explicitly for high-frequency trading research, risk monitoring, signal evaluation, and automated execution, the design language bridges four major design influences:

1. **TradingView Desktop**: High-contrast dark workspaces, high data density, precise financial charting, and unmistakable state badges.
2. **Binance Desktop**: Rapid visual scannability, clear order book/fill typography, explicit buy/sell color contrasts, and compact action controls.
3. **Bloomberg Terminal**: Zero-clutter information architecture, tabular numeric alignment, zero decorative latency, and functional density.
4. **Modern Premium SaaS**: Sleek glassmorphism accents, refined dark-mode surface elevation layers, subtle micro-animations, and accessible WCAG 2.2 AA contrast ratios.

### Core Principles
- **Clarity Over Ornamentation**: Information hierarchy must always elevate execution safety, risk utilization, and data freshness above visual decoration.
- **Unmistakable Mode Distinction**: Live trading environments, paper simulation modes, and emergency kill-switch states must be instantly recognizable via distinct visual headers and borders.
- **Tabular Precision**: Every price, quantity, profit/loss (P&L), and timestamp metric uses monospace font variants with aligned decimals to prevent layout jitter during live market updates.

---

## 2. Color Palette

The color system uses curated HSL values built for dark-mode financial interfaces. Binary floating-point visual ambiguity is eliminated by pairing semantic colors with high-contrast text tokens.

### Surface & Neutral Palette
| Token Name | Hex Code | HSL Value | Description / Usage |
| --- | --- | --- | --- |
| `--bg-base` | `#0B0E14` | `hsl(222, 28%, 6%)` | Root application background |
| `--bg-surface-1` | `#121722` | `hsl(220, 31%, 10%)` | Primary container & panel background |
| `--bg-surface-2` | `#1A2130` | `hsl(220, 30%, 15%)` | Elevated cards, dropdowns, and modals |
| `--bg-surface-3` | `#242E42` | `hsl(220, 29%, 20%)` | Hover states, active tabs, search bars |
| `--border-subtle` | `#1E293B` | `hsl(217, 33%, 17%)` | Primary structural grid lines & dividers |
| `--border-strong` | `#334155` | `hsl(215, 25%, 27%)` | Interactive control borders, focus rings |

### Financial & Trading Action Palette
| Token Name | Hex Code | HSL Value | Description / Usage |
| --- | --- | --- | --- |
| `--trade-buy` | `#00C896` | `hsl(165, 100%, 39%)` | Buy / Long orders, positive P&L, bullish bars |
| `--trade-buy-bg` | `rgba(0, 200, 150, 0.12)` | `hsla(165, 100%, 39%, 0.12)` | Buy button hover background, profit highlights |
| `--trade-sell` | `#F6465D` | `hsl(352, 90%, 62%)` | Sell / Short orders, negative P&L, bearish bars |
| `--trade-sell-bg` | `rgba(246, 70, 93, 0.12)` | `hsla(352, 90%, 62%, 0.12)` | Sell button hover background, loss highlights |
| `--trade-accent` | `#3B82F6` | `hsl(217, 91%, 60%)` | Primary action buttons, active navigation items |
| `--trade-warning` | `#F59E0B` | `hsl(38, 92%, 50%)` | Risk limit warnings, deferred state, stale data |

### Semantic Text Tokens
| Token Name | Hex Code | Usage |
| --- | --- | --- |
| `--text-primary` | `#F8FAFC` | Main headings, primary values, active tab titles |
| `--text-secondary` | `#94A3B8` | Subtitles, field labels, metadata headers |
| `--text-muted` | `#64748B` | Disabled labels, historical timestamps, hints |
| `--text-inverse` | `#0F172A` | Text on high-light backgrounds (e.g. badges) |

---

## 3. Typography & Financial Number Formatting

### Font Families
- **Primary Interface Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif` — Used for headings, labels, navigation, and body copy.
- **Monospace & Financial Data Font**: `JetBrains Mono`, `Fira Code`, `Consolas`, `monospace` — Used for prices, quantities, order IDs, JSON payloads, and timestamps.

### Type Scale & Hierarchy
| Level | Font Size | Line Height | Weight | Font Family | Usage |
| --- | --- | --- | --- | --- | --- |
| **Display 1** | `28px (1.75rem)` | `34px` | `700` | Primary | Major metrics, Dashboard P&L summaries |
| **Heading 1** | `22px (1.375rem)`| `28px` | `600` | Primary | Page titles, Section headers |
| **Heading 2** | `18px (1.125rem)`| `24px` | `600` | Primary | Card titles, Modal headers |
| **Subheading** | `15px (0.9375rem)`| `20px` | `500` | Primary | Form group labels, Tab titles |
| **Body Primary**| `14px (0.875rem)` | `20px` | `400` | Primary | Standard table text, Descriptions |
| **Body Compact**| `13px (0.8125rem)`| `18px` | `400` | Primary/Mono | Dense table rows, Grid cell text |
| **Caption / Badge**| `11px (0.6875rem)`| `14px` | `600` | Primary/Mono | Badges, Field hints, Timestamps |

### Monospace Financial Formatting Rules
1. **Decimal Alignment**: Financial tables must right-align numeric cells (`text-align: right`) and enable `font-variant-numeric: tabular-nums lining-nums`.
2. **Explicit Signs**: Positive financial values always prefix with explicit `+` (e.g., `+$1,245.50`), rendered in `--trade-buy`. Negative values prefix with `-` (e.g., `-$430.12`), rendered in `--trade-sell`.
3. **Zero State**: Zero value P&L renders as `0.00000000` in `--text-muted`.

---

## 4. Spacing & Grid System

The design system is built on a **4px / 8px baseline grid**.

### Spacing Scale Tokens
| Token | Value | Common Application |
| --- | --- | --- |
| `--space-1` | `4px (0.25rem)` | Tight icon-to-text gap, badge padding |
| `--space-2` | `8px (0.50rem)` | Button inline padding, input icon offsets |
| `--space-3` | `12px (0.75rem)` | Card internal element gaps, table cell vertical padding |
| `--space-4` | `16px (1.00rem)` | Standard card padding, grid gap baseline |
| `--space-6` | `24px (1.50rem)` | Page section padding, container margins |
| `--space-8` | `32px (2.00rem)` | Major layout split gaps, modal inner margins |

### Layout Container Widths
- **Full Trading Layout**: `100%` viewport width with fixed sidebars.
- **Standard Dashboard**: `max-width: 1600px` centered.
- **Focused Admin / Identity Container**: `max-width: 1024px` centered.

---

## 5. Shadows & Elevation

Dark mode relies on subtle borders and stacked surface colors combined with elevation shadows.

```css
/* Elevation 1: Embedded panels & subtle card surfaces */
--shadow-elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.4);

/* Elevation 2: Floating cards, dropdown menus, context popovers */
--shadow-elevation-2: 0 4px 12px -2px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);

/* Elevation 3: Modals, slide-over panels, critical alerts */
--shadow-elevation-3: 0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.4);

/* Glow Effects for Execution States */
--shadow-glow-buy: 0 0 12px rgba(0, 200, 150, 0.25);
--shadow-glow-sell: 0 0 12px rgba(246, 70, 93, 0.25);
--shadow-glow-focus: 0 0 0 2px rgba(59, 130, 246, 0.5);
```

---

## 6. Glassmorphism & Surface Materials

Glassmorphism provides visual depth for top navigation bars, overlay panels, and active floating controls.

```css
/* Glass Card Material */
.glass-panel {
  background: rgba(18, 23, 34, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Floating Glass Header */
.glass-header {
  background: rgba(11, 14, 20, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(30, 41, 59, 0.8);
}
```

---

## 7. Card Components & Containers

Cards group trading metrics, risk utilization gauges, and strategy controls.

### Card Variants
1. **Standard Card**: Dark surface (`--bg-surface-1`), 1px subtle border (`--border-subtle`), 8px border radius (`border-radius: 8px`).
2. **Glass Card**: Semi-transparent background with backdrop-filter blur for header widgets.
3. **Interactive / Selectable Card**: Hover state transition brightening background to `--bg-surface-2` with `--trade-accent` border highlighting.
4. **Environment-Gated Card**:
   - **Paper Mode**: Top border accent `3px solid #3B82F6` (Blue).
   - **Live Mode**: Top border accent `3px solid #F59E0B` (Amber) with "LIVE TRADING" badge.

---

## 8. Financial Data Grids & Tables

Financial tables require extreme readability, zero visual clutter, sticky headers, and compact padding.

### Table Specifications
- **Header Row**: Height `36px`, background `--bg-surface-2`, font size `12px`, uppercase, bold (`600`), text color `--text-secondary`, border bottom `1px solid --border-strong`.
- **Data Rows**: Height `40px` (dense mode) or `48px` (standard mode), hover background `--bg-surface-3`.
- **Zebra Striping**: Optional alternate row background `rgba(255, 255, 255, 0.015)`.
- **Cell Alignment**: Text fields left-aligned; Numeric/Financial fields right-aligned; Status badges centered.

---

## 9. Buttons & Interactive Controls

Buttons are high-contrast, touch-friendly, and provide clear active/hover/disabled states.

### Button Variants & CSS Specifications

```css
/* Base Button Properties */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-primary);
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  padding: 8px 16px;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  border: 1px solid transparent;
}

/* Primary Action Button */
.btn-primary {
  background-color: var(--trade-accent);
  color: #FFFFFF;
}
.btn-primary:hover {
  background-color: hsl(217, 91%, 52%);
  box-shadow: var(--shadow-glow-focus);
}

/* Buy / Long Order Button */
.btn-buy {
  background-color: var(--trade-buy);
  color: #0B0E14;
}
.btn-buy:hover {
  background-color: hsl(165, 100%, 34%);
  box-shadow: var(--shadow-glow-buy);
}

/* Sell / Short Order Button */
.btn-sell {
  background-color: var(--trade-sell);
  color: #FFFFFF;
}
.btn-sell:hover {
  background-color: hsl(352, 90%, 54%);
  box-shadow: var(--shadow-glow-sell);
}

/* Secondary / Outline Button */
.btn-secondary {
  background-color: var(--bg-surface-2);
  border-color: var(--border-strong);
  color: var(--text-primary);
}
.btn-secondary:hover {
  background-color: var(--bg-surface-3);
  border-color: var(--text-secondary);
}

/* Danger / Emergency Kill-Switch Button */
.btn-danger {
  background-color: #DC2626;
  color: #FFFFFF;
}
.btn-danger:hover {
  background-color: #B91C1C;
  box-shadow: 0 0 14px rgba(220, 38, 38, 0.4);
}
```

---

## 10. Inputs & Form Controls

Form controls must handle search filters, strategy configuration parameters, and numerical inputs without precision loss.

### Input Design Specifications
- **Background**: `--bg-base` (`#0B0E14`).
- **Border**: `1px solid --border-strong`.
- **Text Color**: `--text-primary` with monospace font for numerical inputs.
- **Focus Ring**: `border-color: --trade-accent`, `box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3)`.
- **Error State**: `border-color: --trade-sell`, `box-shadow: 0 0 0 2px rgba(246, 70, 93, 0.3)`.

---

## 11. Dropdowns, Selects & Context Menus

Dropdown menus use high-elevation surfaces (`--bg-surface-2`) to float above data grids.

### Styling Specs
- **Menu Container**: `border: 1px solid --border-strong`, `border-radius: 8px`, `box-shadow: var(--shadow-elevation-2)`, `background: --bg-surface-2`.
- **Menu Item**: Height `36px`, padding `8px 12px`, text `--text-primary`, rounded `4px`.
- **Selected Item**: Background `rgba(59, 130, 246, 0.15)`, text color `--trade-accent`, bold weight (`600`).
- **Hover Item**: Background `--bg-surface-3`.

---

## 12. Sidebar Navigation

The sidebar supports both **Expanded (240px)** and **Collapsed (64px)** modes.

### Visual States
- **Container**: Width `240px`, background `--bg-surface-1`, border-right `1px solid --border-subtle`.
- **Active Navigation Item**: Left border `3px solid --trade-accent`, background `rgba(59, 130, 246, 0.12)`, text `--text-primary`.
- **Inactive Item**: Text `--text-secondary`, hover background `--bg-surface-2`, hover text `--text-primary`.
- **Environment Indicator**: Bottom section badge displaying active Tenant Name, Account Mode (`PAPER` vs `LIVE`), and Environment Health.

---

## 13. Top Navbar & Header

The Navbar acts as the central command bar for organization switching and system health observation.

### Header Element Layout
1. **Left**: Logo & Organization Context Selector dropdown.
2. **Center**: System Status Indicator (`HEALTHY` [Green dot], `DEGRADED` [Amber dot]), Market Data Freshness badge (`Data lag: 14ms`).
3. **Right**: Active Account Mode Selector (`Paper Account` vs `Live Account`), Notifications Inbox Bell with unread counter, User Profile avatar.

---

## 14. Financial Charts & Visualizations

Charts use high-visibility color sets matching TradingView dark defaults.

### Chart Color Specifications
- **Bullish Candle / Line**: `--trade-buy` (`#00C896`).
- **Bearish Candle / Line**: `--trade-sell` (`#F6465D`).
- **Chart Grid Lines**: `rgba(255, 255, 255, 0.04)`.
- **Crosshair Line**: `rgba(255, 255, 255, 0.4)` dotted.
- **Area Chart Gradient**: Top `rgba(0, 200, 150, 0.35)` to Bottom `rgba(0, 200, 150, 0.0)`.
- **Volume Bars**: Bullish `rgba(0, 200, 150, 0.5)`, Bearish `rgba(246, 70, 93, 0.5)`.

---

## 15. Status Colors & Execution Badges

Execution states require distinct, accessible status badges.

| Domain Entity | Status Name | Badge Background | Badge Text Color | Icon Indicator |
| --- | --- | --- | --- | --- |
| **Strategy** | `draft` | `rgba(148, 163, 184, 0.15)` | `#94A3B8` | Edit3 |
| **Strategy** | `validated` | `rgba(59, 130, 246, 0.15)` | `#3B82F6` | CheckCircle |
| **Strategy** | `paper_enabled`| `rgba(0, 200, 150, 0.15)` | `#00C896` | Play |
| **Strategy** | `live_approved` | `rgba(245, 158, 11, 0.20)` | `#F59E0B` | ShieldAlert |
| **Strategy** | `paused` | `rgba(245, 158, 11, 0.15)` | `#F59E0B` | Pause |
| **Order** | `filled` | `rgba(0, 200, 150, 0.15)` | `#00C896` | Check |
| **Order** | `rejected` | `rgba(246, 70, 93, 0.15)` | `#F6465D` | XCircle |
| **Order** | `unknown` | `rgba(239, 68, 68, 0.25)` | `#EF4444` | AlertOctagon |

---

## 16. Iconography Guidelines

Icons utilize the **Lucide Icon Set** rendered at crisp pixel sizes (`16px`, `20px`, `24px`).

### Icon Usage Standards
- **Stroke Width**: `1.75px` for 20px icons, `2.0px` for 16px compact table icons.
- **Color Matching**: Icons inherit parent text color (`currentColor`) unless representing explicit state indicators.
- **Mandatory Icon Mapping**:
  - `Kill Switch`: `AlertOctagon`
  - `Risk Assessment`: `ShieldCheck` / `ShieldAlert`
  - `Delta Exchange`: `Layers`
  - `TradingView Signal`: `Radio`
  - `Reconciliation`: `RefreshCw`

---

## 17. Notifications & Alert Toast System

Notifications are categorized into four severity tiers and positioned at `top-right` with auto-dismiss timers.

```text
+-------------------------------------------------------------+
| [!] CRITICAL RISK ALERT                                     |
| Kill-switch triggered on Account #ACC-8841 (Drawdown > 5%)  |
| 14:32:04 UTC | Action Required                              |
+-------------------------------------------------------------+
```

### Toast Tiers & Behavior
1. **Critical (Red)**: Persistent until manually dismissed by user. Plays alert tone for Kill-switch & Unknown order states.
2. **Warning (Amber)**: Auto-dismiss after 8 seconds. Used for risk limit warnings & data freshness lag.
3. **Success (Green)**: Auto-dismiss after 4 seconds. Used for strategy approval & connection confirmation.
4. **Info (Blue)**: Auto-dismiss after 4 seconds. Used for general system notices & exports.

---

## 18. Empty States

Empty states teach the user the next safe action rather than displaying a blank screen.

### Structure Specification
- **Icon**: `48px` muted icon (`--text-muted`) inside a circular background (`--bg-surface-2`).
- **Title**: `Heading 2` (`18px`, `--text-primary`), concise statement (e.g. "No Strategies Registered").
- **Description**: `Body Primary` (`14px`, `--text-secondary`), explaining how to create or import a strategy.
- **Primary CTA**: Standard Primary Button leading directly to the creation flow.

---

## 19. Loading States & Skeletons

Loading states must avoid layout shifts during fast market updates.

### Guidelines
- **Skeleton Shimmer**: Animated background gradient scanning across `--bg-surface-2` to `--bg-surface-3`.
- **Monospace Table Skeletons**: Pre-allocated row heights matching standard `40px` dense rows.
- **Spinner Control**: Used for inline button action submissions (`16px` spinning circle).

---

## 20. Error States & Fail-Closed Alerts

Error states adhere to the principle: **Services fail closed for execution and fail visibly for observation.**

### Display Standards
- **Unknown Execution State**: Displays a full-width persistent red top banner (`--trade-sell`) stating: `"Order Execution State Uncertain. New Orders Blocked Pending Reconciliation."`
- **Field Validation Error**: Renders directly below the affected input field in `--trade-sell` font size `12px` with a warning icon.
- **Dependency Failure Callout**: Explains what dependency failed (e.g., "Delta Exchange Sandbox Disconnected"), why it matters, and provides an audited Retry button.

---

## 21. Responsive Breakpoints & Adaptability

The dashboard is optimized for multi-monitor desktop workstations while maintaining full responsiveness down to tablet displays.

| Breakpoint Name | Min Width | Layout Strategy |
| --- | --- | --- |
| **Desktop Ultra** | `1920px` | 4-column layout (Sidebar + Strategy List + Chart/Order Ticket + Execution Log) |
| **Desktop Standard**| `1440px` | 3-column layout (Sidebar + Main Workspace + Execution Panel) |
| **Laptop / Compact**| `1024px` | 2-column layout (Collapsed Sidebar + Main Workspace with tabbed panels) |
| **Tablet** | `768px` | Single-column stacked view with top dropdown navigation |

---

## 22. Animation Guidelines & Micro-Interactions

Animations must feel snappy, precise, and hardware-accelerated without delaying execution actions.

### Transition Tokens
- **Duration Fast**: `150ms` (Button hover, tab selection, checkbox toggle).
- **Duration Normal**: `250ms` (Modal backdrop fade, accordion expand, drawer slide-over).
- **Easing Curve**: `cubic-bezier(0.16, 1, 0.3, 1)` (Out-Cubic: fast initial motion with smooth deceleration).

---

## 23. Design Tokens & CSS Custom Properties

```css
:root {
  /* Color Tokens */
  --bg-base: #0B0E14;
  --bg-surface-1: #121722;
  --bg-surface-2: #1A2130;
  --bg-surface-3: #242E42;
  --border-subtle: #1E293B;
  --border-strong: #334155;

  --trade-buy: #00C896;
  --trade-buy-bg: rgba(0, 200, 150, 0.12);
  --trade-sell: #F6465D;
  --trade-sell-bg: rgba(246, 70, 93, 0.12);
  --trade-accent: #3B82F6;
  --trade-warning: #F59E0B;

  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;

  /* Typography Tokens */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;

  /* Elevation Shadows */
  --shadow-elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --shadow-elevation-2: 0 4px 12px -2px rgba(0, 0, 0, 0.5);
  --shadow-elevation-3: 0 20px 25px -5px rgba(0, 0, 0, 0.7);

  /* Radius Tokens */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```
