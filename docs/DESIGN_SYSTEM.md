# AlgoApp Pro v2 — Master Design System Specification

## Table of Contents

- [1. Design Philosophy](#1-design-philosophy)
- [2. Color Palette](#2-color-palette)
- [3. Typography](#3-typography)
- [4. Layout System](#4-layout-system)
- [5. Components](#5-components)
- [6. Charts](#6-charts)
- [7. Icons](#7-icons)
- [8. Loading States](#8-loading-states)
- [9. Empty States](#9-empty-states)
- [10. Error States](#10-error-states)
- [11. Animation Guidelines](#11-animation-guidelines)
- [12. Mobile Design](#12-mobile-design)
- [13. Desktop Design](#13-desktop-design)
- [14. Tablet Design](#14-tablet-design)
- [15. Accessibility](#15-accessibility)
- [16. Theme Tokens](#16-theme-tokens)
- [17. Design Rules](#17-design-rules)
- [18. UI Do's and Don'ts](#18-ui-dos-and-donts)

---

## 1. Design Philosophy

The **AlgoApp Pro v2 Design System** is the single source of truth for the application's visual language, component architecture, and interaction patterns. 

Designed for high-frequency algorithmic research, controlled automated execution, risk governance, and live operational monitoring, the system synthesizes four iconic inspirations:

1. **TradingView Desktop**: Precision financial charting, dark workspace contrast, high data density, clear drawing overlays, and unambiguous indicator badges.
2. **Binance Desktop**: Rapid visual scannability, explicit buy/sell color contrasts, compact order-book typography, and high-frequency fill visibility.
3. **Bloomberg Terminal**: Functional data density, tabular numeric alignment, zero visual latency, and clutter-free information hierarchy.
4. **Modern SaaS Quality**: Sleek glassmorphism accents, stacked dark surface elevation, smooth micro-interactions, and accessible WCAG 2.2 AA compliance.

### Core Architectural Principles
- **Dark Theme First**: Engineered from the ground up for low-eyestrain dark environments used by active quantitative traders.
- **Safety Precedes Decoration**: Visual elements prioritize live execution safety, risk utilization, and data freshness above aesthetic flair.
- **Unmistakable Mode Distinction**: Live trading environments, paper simulation modes, and emergency kill-switch states are immediately distinguishable by high-contrast environment bars and distinct border accents.
- **Tabular Decimal Precision**: Every financial number, price, quantity, P&L value, and timestamp uses monospace font variants with fixed decimal alignment to prevent layout jitter during live market stream updates.

---

## 2. Color Palette

The color system uses curated HSL values built for dark-mode financial interfaces.

### Background Colors
| Token Name | Hex Code | HSL Value | Description / Usage |
| --- | --- | --- | --- |
| `--bg-base` | `#0B0E14` | `hsl(222, 28%, 6%)` | Root application background |
| `--bg-root` | `#0E121A` | `hsl(220, 27%, 8%)` | Main viewport container background |
| `--bg-app` | `#121722` | `hsl(220, 31%, 10%)` | Application workspace background |

### Surface & Card Colors
| Token Name | Hex Code | HSL Value | Description / Usage |
| --- | --- | --- | --- |
| `--bg-surface-1` | `#161D2A` | `hsl(220, 31%, 12%)` | Primary panel & sidebar background |
| `--bg-surface-2` | `#1E2638` | `hsl(220, 29%, 17%)` | Elevated cards, dropdowns, and popovers |
| `--bg-surface-3` | `#28334A` | `hsl(220, 30%, 22%)` | Active row hover states, search bars |
| `--bg-card-default`| `#161D2A` | `hsl(220, 31%, 12%)` | Default container card fill |
| `--bg-card-hover`  | `#1E2638` | `hsl(220, 29%, 17%)` | Interactive card hover fill |
| `--bg-card-active` | `#243046` | `hsl(220, 32%, 21%)` | Selected card fill |

### Border Colors
| Token Name | Hex Code | HSL Value | Description / Usage |
| --- | --- | --- | --- |
| `--border-subtle` | `#1E293B` | `hsl(217, 33%, 17%)` | Divider lines & table grid borders |
| `--border-strong` | `#334155` | `hsl(215, 25%, 27%)` | Input borders, card outlines |
| `--border-focus`  | `#3B82F6` | `hsl(217, 91%, 60%)` | Active input focus rings |
| `--border-accent` | `#60A5FA` | `hsl(217, 91%, 68%)` | Selected element highlight borders |

### Functional & Trading Colors
| Token Name | Hex Code | HSL Value | Usage |
| --- | --- | --- | --- |
| `--color-accent-primary` | `#3B82F6` | `hsl(217, 91%, 60%)` | Primary actions, links, active tabs |
| `--color-success` | `#10B981` | `hsl(160, 84%, 39%)` | System health OK, confirmation badges |
| `--color-warning` | `#F59E0B` | `hsl(38, 92%, 50%)` | Risk warning thresholds, stale data |
| `--color-danger`  | `#EF4444` | `hsl(0, 84%, 60%)` | Kill-switch, errors, execution halts |
| `--color-info`    | `#06B6D4` | `hsl(189, 94%, 43%)` | Informational callouts, telemetry |
| `--trade-profit`  | `#00C896` | `hsl(165, 100%, 39%)` | Buy/Long orders, positive P&L |
| `--trade-profit-bg`| `rgba(0, 200, 150, 0.12)` | `hsla(165, 100%, 39%, 0.12)` | Positive P&L cell background |
| `--trade-loss`    | `#F6465D` | `hsl(352, 90%, 62%)` | Sell/Short orders, negative P&L |
| `--trade-loss-bg`  | `rgba(246, 70, 93, 0.12)` | `hsla(352, 90%, 62%, 0.12)` | Negative P&L cell background |

### Zone & Confidence Colors
| Token Name | Hex Code | HSL Value | Usage |
| --- | --- | --- | --- |
| `--zone-overbought` | `#F59E0B` | `hsl(38, 92%, 50%)` | Chart overbought indicator zone |
| `--zone-oversold`   | `#3B82F6` | `hsl(217, 91%, 60%)` | Chart oversold indicator zone |
| `--zone-neutral`    | `#64748B` | `hsl(215, 16%, 47%)` | Neutral strategy range |
| `--confidence-high` | `#00C896` | `hsl(165, 100%, 39%)` | High decision confidence indicator |
| `--confidence-mid`  | `#F59E0B` | `hsl(38, 92%, 50%)` | Medium decision confidence |
| `--confidence-low`  | `#F97316` | `hsl(24, 95%, 53%)` | Low decision confidence warning |
| `--confidence-invalid`| `#64748B`| `hsl(215, 16%, 47%)` | Invalid / expired signal state |

---

## 3. Typography

### Font Families
- **Primary Interface Font**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif` — Used for navigation, labels, page titles, and body copy.
- **Monospace Financial Font**: `JetBrains Mono`, `Fira Code`, `Consolas`, `monospace` — Mandatory for all financial values, prices, quantities, order IDs, JSON payloads, and timestamps.

### Type Hierarchy
| Scale Name | Size (px / rem) | Line Height | Weight | Family | Application |
| --- | --- | --- | --- | --- | --- |
| **Display 1** | `28px (1.75rem)` | `34px` | `700` | Primary | Major Metric Cards, P&L Summaries |
| **Heading 1** | `22px (1.375rem)`| `28px` | `600` | Primary | Page Titles, Main Dashboard Header |
| **Heading 2** | `18px (1.125rem)`| `24px` | `600` | Primary | Section Headers, Card Titles |
| **Subheading**| `15px (0.9375rem)`| `20px` | `500` | Primary | Modal Headers, Tab Titles |
| **Body Primary**| `14px (0.875rem)` | `20px` | `400` | Primary | Form Labels, Descriptions |
| **Body Compact**| `13px (0.8125rem)`| `18px` | `400` | Primary/Mono | Table Rows, Data Grids |
| **Caption / Badge**| `11px (0.6875rem)`| `14px` | `600` | Primary/Mono | Badges, Timestamps, Table Headers |

### Numeric Display & Monospace Formatting Rules
1. **Tabular Numerals**: Monospace numeric text must include `font-variant-numeric: tabular-nums lining-nums`.
2. **Explicit Financial Signs**: Positive values prefix with `+` (e.g. `+$1,450.00`) in `--trade-profit`. Negative values prefix with `-` (e.g. `-$210.50`) in `--trade-loss`. Zero values render as `0.00000000` in `--text-muted`.
3. **Cell Alignment**: Numeric columns in tables are strictly right-aligned (`text-align: right`).

---

## 4. Layout System

### Spatial Metrics
| Layout Token | Value | Description |
| --- | --- | --- |
| `--sidebar-width-expanded` | `240px` | Full navigation sidebar width |
| `--sidebar-width-collapsed` | `64px` | Icon-only collapsed sidebar width |
| `--header-height` | `56px` | Top navbar height |
| `--card-spacing-tight` | `12px` | Dense data grid card gaps |
| `--card-spacing-standard`| `16px` | Standard dashboard layout spacing |
| `--card-spacing-loose` | `24px` | Detailed admin / settings spacing |

### Baseline Grid & Spacing Scale
The spatial model uses an **8px baseline grid** (with a 4px sub-grid for badges and tight controls):
- `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`.

### Responsive Breakpoints
| Breakpoint | Min Width | Target Device | Layout Behavior |
| --- | --- | --- | --- |
| `sm` | `640px` | Mobile (Landscape) | Single column stacked layout |
| `md` | `768px` | Tablet (Portrait) | Collapsed sidebar, 2-column grid |
| `lg` | `1024px` | Tablet (Landscape) / Laptop | 2-column layout with tabbed drawers |
| `xl` | `1280px` | Standard Desktop | 3-column workstation layout |
| `2xl` | `1440px` | Large Workstation | Full 3-column layout + execution panel |
| `3xl` | `1920px` | Multi-Monitor Setup | 4-column multi-pane trading layout |

---

## 5. Components

### 5.1 Buttons
- **Primary Button**: Background `--color-accent-primary`, hover `hsl(217, 91%, 52%)`, white text, 6px border radius.
- **Buy / Long Button**: Background `--trade-profit` (`#00C896`), dark text (`#0B0E14`), hover glow `--shadow-glow-buy`.
- **Sell / Short Button**: Background `--trade-loss` (`#F6465D`), white text, hover glow `--shadow-glow-sell`.
- **Danger / Kill-Switch Button**: Background `#DC2626`, bold text, red glow (`0 0 14px rgba(220,38,38,0.4)`).
- **Secondary / Outline**: Background `--bg-surface-2`, border `--border-strong`, hover `--bg-surface-3`.
- **Sizes**: Small (`28px` height, `11px` text), Medium (`36px` height, `13px` text), Large (`44px` height, `15px` text).

### 5.2 Cards
- **Container Card**: `--bg-surface-1`, `1px solid --border-subtle`, `border-radius: 8px`.
- **Environment Card Accents**:
  - **Paper Mode**: Top border `3px solid #3B82F6` (Blue).
  - **Live Mode**: Top border `3px solid #F59E0B` (Amber) with "LIVE TRADING" tag.

### 5.3 Tables & Data Grids
- **Header Row**: Height `36px`, background `--bg-surface-2`, uppercase `11px` caption text in `--text-secondary`, border bottom `1px solid --border-strong`.
- **Data Rows**: Height `40px` (dense) or `48px` (standard), hover fill `--bg-surface-3`, cursor `pointer`.
- **Numeric Cells**: Right-aligned, monospace font, tabular numerals.

### 5.4 Forms & Inputs
- **Input Field**: Height `36px`, fill `--bg-base`, border `1px solid --border-strong`, text `--text-primary`, focus ring `0 0 0 2px rgba(59, 130, 246, 0.4)`.
- **Number Input with Stepper**: Integrated `+` / `-` stepper buttons with exact decimal scale validation.

### 5.5 Dropdowns & Selects
- **Menu Panel**: Surface `--bg-surface-2`, border `1px solid --border-strong`, shadow `var(--shadow-elevation-2)`.
- **Searchable Select**: Search input pinned to top of dropdown list.

### 5.6 Tabs & Segmented Controls
- **Underline Tabs**: Active tab displays `--color-accent-primary` bottom bar (`2px`).
- **Pill Tabs**: Active tab displays fill `--bg-surface-3` with white text.

### 5.7 Badges & Status Chips
- **Strategy State Badges**:
  - `draft`: Muted gray (`#94A3B8`).
  - `validated`: Blue (`#3B82F6`).
  - `paper_enabled`: Emerald green (`#00C896`).
  - `live_approved`: Amber alert (`#F59E0B`).
  - `paused`: Orange (`#F97316`).

### 5.8 Tooltips
- Surface `--bg-surface-3`, border `1px solid --border-strong`, text `12px` `--text-primary`, z-index `9999`.

### 5.9 Dialogs & Modals
- Backdrop fill `rgba(11, 14, 20, 0.75)` with `backdrop-filter: blur(8px)`.
- Container `--bg-surface-1`, border `1px solid --border-strong`, max-width `560px` for standard modals, shadow `var(--shadow-elevation-3)`.

### 5.10 Drawers & Slide-Over Panels
- Slide from `right`, width `480px`, surface `--bg-surface-1`, border-left `1px solid --border-strong`.

### 5.11 Toast Notifications
- Position: Top-Right (`top: 16px`, `right: 16px`). Width `380px`.
- Auto-dismiss: Critical (Manual), Warning (8s), Success (4s), Info (4s).

---

## 6. Charts

### 6.1 Trading Chart (Candlestick / OHLC)
- **Bullish Bar / Wick**: `--trade-profit` (`#00C896`).
- **Bearish Bar / Wick**: `--trade-loss` (`#F6465D`).
- **Grid Lines**: Horizontal & vertical dotted lines in `rgba(255, 255, 255, 0.04)`.
- **Crosshair**: White `50%` opacity dotted lines with price/time axis labels.

### 6.2 Equity Curve Chart
- Line stroke `2px` in `--color-accent-primary` (`#3B82F6`).
- Area fill linear gradient: Top `rgba(59, 130, 246, 0.25)` to Bottom `rgba(59, 130, 246, 0.0)`.

### 6.3 PnL & Win Rate Charts
- Realized profit bars in `--trade-profit`, realized loss bars in `--trade-loss`.
- Win rate donut chart: Win segment `--trade-profit`, Loss segment `--trade-loss`, Break-even `--text-muted`.

### 6.4 Challenge Progress Chart
- Target balance line: Dotted green line (`#10B981`).
- Drawdown limit threshold: Solid red line (`#EF4444`).

---

## 7. Icons

- **Icon Library**: `Lucide Icon Set`.
- **Scale**: `14px` (micro badges), `16px` (table cell icons), `20px` (standard navigation/buttons), `24px` (page headers).
- **Stroke Width**: `1.75px` default (`2.0px` for 16px icons).
- **Domain Mappings**:
  - `Kill Switch`: `AlertOctagon`
  - `Risk Engine`: `ShieldCheck`
  - `Strategy`: `Cpu`
  - `TradingView Webhook`: `Radio`
  - `Delta Exchange`: `Layers`
  - `Reconciliation`: `RefreshCw`

---

## 8. Loading States

- **Skeleton Shimmer**: Animated background gradient scanning across `--bg-surface-2` to `--bg-surface-3` (`animation: shimmer 1.5s infinite`).
- **Monospace Table Skeletons**: Pre-allocated row skeletons matching `40px` table cell heights.
- **Button Loading**: Replaces button icon with a `16px` spinning indicator (`spin 0.75s linear infinite`).

---

## 9. Empty States

Empty states teach the user the next safe action:
- **Icon**: `48px` muted icon inside `--bg-surface-2` circle.
- **Title**: `Heading 2` (`18px`, `--text-primary`), e.g., *"No Strategies Registered"*.
- **Description**: `Body Primary` (`14px`, `--text-secondary`), e.g., *"Create a strategy version or connect a TradingView alert source to begin."*
- **Action**: Primary CTA button leading to creation flow.

---

## 10. Error States

Services fail closed for execution and fail visibly for observation:
- **Unknown Order State Banner**: Persistent full-width red top banner (`--color-danger`) stating: *"Execution State Uncertain. New orders blocked pending reconciliation."*
- **Inline Field Error**: Text below field in `--color-danger` (`12px`) with `AlertTriangle` icon.
- **Dependency Failure Callout**: Explains dependency failure (e.g., *"Delta Exchange REST API Unreachable"*), impact, and provides an Audited Retry button.

---

## 11. Animation Guidelines

- **Duration Tokens**:
  - `--duration-fast`: `150ms` (Button hover, checkbox toggle).
  - `--duration-normal`: `250ms` (Modal open, tab switch, drawer slide).
  - `--duration-slow`: `400ms` (Page transition, expandable panel expansion).
- **Easing Curve**: `cubic-bezier(0.16, 1, 0.3, 1)` (Out-Cubic: fast initial response with smooth landing).

---

## 12. Mobile Design

- **Viewport Range**: `< 768px`.
- **Navigation**: Bottom navigation bar (`56px` height) with 4 key tabs: *Overview*, *Strategies*, *Orders*, *Risk*.
- **Touch Targets**: Minimum clickable area `44px x 44px`.
- **Layout**: Single column vertically stacked cards; horizontal swipeable tables.

---

## 13. Desktop Design

- **Viewport Range**: `≥ 1280px`.
- **Multi-Pane Layout**: Fixed 240px sidebar, top 56px header, main workspace split into Strategy List, Chart View, and Order Ticket/Execution Log.
- **Keyboard Shortcuts**:
  - `Ctrl + K`: Global Command Palette
  - `Esc`: Close Modals & Drawers
  - `Ctrl + Shift + K`: Emergency Kill Switch Trigger Prompt

---

## 14. Tablet Design

- **Viewport Range**: `768px - 1023px`.
- **Adaptive Sidebar**: Collapses automatically to icon-only mode (`64px` width).
- **Dashboard Grid**: Adapts to 2-column layout with tabbed drawers for order execution.

---

## 15. Accessibility

- **Standard**: Full compliance with **WCAG 2.2 AA**.
- **Contrast Ratios**: Minimum `4.5:1` contrast for standard text; `3:1` for interactive borders and graphical controls.
- **Keyboard Navigation**: Full tab ordering across all forms, tables, and modals. Focus indicator: `outline: 2px solid --color-accent-primary` with `2px` offset.
- **Screen Reader Support**: Use proper ARIA roles (`role="grid"`, `aria-live="polite"` for live price ticks, `aria-expanded`).
- **Reduced Motion**: Respect `@media (prefers-reduced-motion: reduce)` by disabling non-essential transitions.

---

## 16. Theme Tokens

```css
:root {
  /* Surface Colors */
  --bg-base: #0B0E14;
  --bg-root: #0E121A;
  --bg-app: #121722;
  --bg-surface-1: #161D2A;
  --bg-surface-2: #1E2638;
  --bg-surface-3: #28334A;

  /* Border Colors */
  --border-subtle: #1E293B;
  --border-strong: #334155;
  --border-focus: #3B82F6;
  --border-accent: #60A5FA;

  /* Trading & Status Colors */
  --color-accent-primary: #3B82F6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #06B6D4;

  --trade-profit: #00C896;
  --trade-profit-bg: rgba(0, 200, 150, 0.12);
  --trade-loss: #F6465D;
  --trade-loss-bg: rgba(246, 70, 93, 0.12);

  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;

  /* Shadows */
  --shadow-elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --shadow-elevation-2: 0 4px 12px -2px rgba(0, 0, 0, 0.5);
  --shadow-elevation-3: 0 20px 25px -5px rgba(0, 0, 0, 0.7);

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-out-cubic: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 17. Design Rules

1. **Always Use Monospace for Financial Data**: Every price, size, fee, P&L, order ID, and timestamp must use `--font-mono`.
2. **Never Rely Solely on Color**: Pair color changes (green/red) with explicit icons (`ArrowUp`, `ArrowDown`, `Check`, `X`) or sign prefixes (`+`/`-`).
3. **Environment Isolation**: Live mode elements MUST render Amber/Orange header badges to prevent accidental live execution in paper mode.
4. **Zero Layout Shift**: Pre-allocate numeric container widths (`min-width`) so changing values do not jitter adjacent layout items.

---

## 18. UI Do's and Don'ts

| Category | DO | DON'T |
| --- | --- | --- |
| **Financial Values** | DO right-align numeric table cells and format with explicit decimals. | DON'T left-align prices or omit zero decimals (e.g. `$12.5` instead of `$12.50000000`). |
| **Live Trading Mode**| DO display persistent environment indicators on every screen. | DON'T hide whether an account is connected to Live vs Paper venue. |
| **Status Indication**| DO pair status colors with readable text labels and icons. | DON'T use raw colored dots without text tooltips or labels. |
| **Buttons & CTAs**  | DO use high-contrast primary buttons for destructive/trading actions. | DON'T use ambiguous ghost buttons for critical operations like Kill-Switch. |
| **Modals & Drawers** | DO lock background scrolling and support `Esc` key dismissal. | DON'T allow accidental clicks outside an active order-confirmation modal to execute actions. |
