# AlgoApp Pro v2 — UI Audit Report

This audit documents visual, layout, component, and design system differences between the current implementation and the target **Master Design System Specification** (`docs/DESIGN_SYSTEM.md`).

---

## Audit Findings & Issue Registry

### 1. Navigation Sidebar & Layout System
- **Current Implementation**: Fixed width sidebar without toggle collapse capability (`240px` only). Lacks collapsible icon-only mode (`64px`) specified in design system.
- **Expected Implementation**: Adaptive sidebar supporting both expanded (`240px`) and collapsed icon-only (`64px`) modes with smooth transition (`150ms`), active left border indicator bar (`3px` in `--color-accent-primary`), and tabular monospace footer telemetry.
- **Severity**: **HIGH**
- **Exact Component Responsible**: `frontend/src/components/layout/Sidebar.tsx`

### 2. Desktop Header & Emergency Controls
- **Current Implementation**: Standard header lacking prominent visual mode distinction, search trigger shortcut hint (`Ctrl + K`), and high-impact Emergency Kill Switch CTA with red glow (`#DC2626`).
- **Expected Implementation**: 56px fixed header displaying persistent Environment Mode Chip (`PAPER` / `SANDBOX` / `LIVE`), Search/Command Palette trigger (`Ctrl + K`), and prominent high-contrast Emergency Kill Switch button with glowing shadow (`0 0 14px rgba(220,38,38,0.4)`).
- **Severity**: **HIGH**
- **Exact Component Responsible**: `frontend/src/components/layout/Header.tsx`

### 3. Top Market Ticker Bar
- **Current Implementation**: Ticker component lacks explicit 1H perpetual pair formatting, tabular numeral alignment, and live price delta styling (`+` in `--trade-profit` `#00C896`, `-` in `--trade-loss` `#F6465D`).
- **Expected Implementation**: Full-width compact ticker displaying all 4 allowlisted perpetual pairs (`BTCUSD.P`, `ETHUSD.P`, `SOLUSD.P`, `XRPUSD.P`) with monospace prices, tabular numeric alignment (`font-variant-numeric: tabular-nums`), and colored percentage changes.
- **Severity**: **HIGH**
- **Exact Component Responsible**: `frontend/src/components/layout/TopMarketTicker.tsx`

### 4. Financial Tables & Monospace Formatting
- **Current Implementation**: Tables across Paper Trading, Live Trading, Journal, and Analytics use default sans-serif font for prices, lack right-alignment on numeric columns, and miss explicit sign prefixes (`+`/`-`).
- **Expected Implementation**: Right-aligned numeric columns (`text-right`), mandatory `font-mono` (`JetBrains Mono`), tabular numerals (`tabular-nums`), uppercase 11px headers in `--text-secondary`, and explicit positive (`+$...`) / negative (`-$...`) cell backgrounds.
- **Severity**: **HIGH**
- **Exact Component Responsible**:
  - `frontend/src/features/paper-trading/PaperTradingPage.tsx`
  - `frontend/src/features/live-trading/LiveTradingPage.tsx`
  - `frontend/src/features/journal/TradeJournalPage.tsx`
  - `frontend/src/features/analytics/AnalyticsPage.tsx`

### 5. Trading Buttons & CTAs
- **Current Implementation**: Action buttons rely on basic blue/gray styling without distinct TradingView/Binance Buy (`#00C896`) vs Sell (`#F6465D`) color contrast or hover glow shadows.
- **Expected Implementation**: Buy/Long actions styled in `#00C896` with dark text, Sell/Short actions in `#F6465D` with white text, and Danger actions in `#DC2626` with glow shadows (`--shadow-glow-sell`).
- **Severity**: **HIGH**
- **Exact Component Responsible**:
  - `frontend/src/features/paper-trading/PaperTradingPage.tsx`
  - `frontend/src/features/live-trading/LiveTradingPage.tsx`
  - `frontend/src/features/production/ProductionDashboardPage.tsx`

### 6. Card Spacing & Surface Elevation
- **Current Implementation**: Inconsistent card backgrounds and spacing across feature pages, lacking glassmorphism materials (`glass-panel`) and environment card accents (blue top border for Paper, amber top border for Live).
- **Expected Implementation**: Uniform `--bg-surface-1` (`#161D2A`) card fills, `1px solid --border-subtle` (`#1E293B`), 8px border radius, standard `16px` card gaps, and top border accents for environment cards.
- **Severity**: **MEDIUM**
- **Exact Component Responsible**:
  - `frontend/src/features/dashboard/DashboardPage.tsx`
  - `frontend/src/features/system-monitor/SystemMonitorPage.tsx`
  - `frontend/src/features/analysis/AnalysisPage.tsx`
  - `frontend/src/features/backtesting/BacktestingPage.tsx`

---

## Action Plan for Remediation

1. **Refine Global CSS & Theme Tokens (`frontend/src/index.css`)**:
   - Add glassmorphism classes, glow shadows (`--shadow-glow-buy`, `--shadow-glow-sell`, `--shadow-glow-kill`), tabular numeral utilities, and color variables matching `docs/DESIGN_SYSTEM.md`.

2. **Enhance Layout Components**:
   - `Sidebar.tsx`: Add sidebar collapse/expand toggle (`240px` vs `64px`), active left border accent (`3px solid #3B82F6`), and status indicator.
   - `Header.tsx`: Fix height to `56px`, add `Ctrl + K` Command Palette trigger, environment mode indicator, and glowing Emergency Kill Switch CTA.
   - `TopMarketTicker.tsx`: Format 1H perpetual pair stream with monospace tabular numerals and green/red delta chips.
   - `StatusBar.tsx`: 28px bottom status bar with engine health, latency telemetry, and active mode indicator.

3. **Overhaul Feature Page Components**:
   - `DashboardPage.tsx`: Standardize 3-column workstation layout, card elevations, and metric displays.
   - `PaperTradingPage.tsx`: Apply right-aligned tabular numerals to orders/positions tables, Buy (`#00C896`) & Sell (`#F6465D`) buttons, and top border environment card accents.
   - `LiveTradingPage.tsx`: Embed `DeltaConnectionPanel.tsx` with high-contrast Binance/TradingView styling.
   - `ProductionDashboardPage.tsx`: Enhance 8-Point Live Trading Safety Guard Matrix grid and telemetry cards.
   - `SystemMonitorPage.tsx`: Upgrade 9-stage pipeline visualizer and trace inspector.
   - `AnalysisPage.tsx`, `ReplayPage.tsx`, `BacktestingPage.tsx`, `TradeJournalPage.tsx`, `AnalyticsPage.tsx`, `ChallengePage.tsx`, `SettingsPage.tsx`: Apply consistent monospace formatting, card spacing, and table cell alignment.
