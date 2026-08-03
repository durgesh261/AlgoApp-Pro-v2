# Indicator Reverse Engineering & Technical Analysis Decomposition

**AlgoApp Pro v2 — Version 2.0.0**  
**Document Revision:** 1.0.0  
**Scope:** Reimplementation Mapping for `PA Toolkit Lite [UAlgo]` and `Smart Money Concepts [LuxAlgo]`

---

## Executive Summary

To achieve zero-latency, server-side market structure evaluation, AlgoApp Pro v2 reverse engineers the Pine Script logic from **Price Action Toolkit Lite (`[UAlgo]`)** and **Smart Money Concepts (`[LuxAlgo]`)** into a pure TypeScript engine. 

Visual rendering components (lines, boxes, labels, watermarks) are stripped out, while numerical pivot extraction, liquidity sweep algorithms, order block identification, and zone merging are unified into `zoneDetector.service.ts` and `marketDataEngine.service.ts`.

---

## 1. Price Action Toolkit Lite (`[UAlgo]`) Reimplementation

### A. Reimplemented Algorithms
1. **ZigZag Market Structure (`zigzagLen = 9`)**:
   - Tracking highest high `ta.highest(high, 9)` and lowest low `ta.lowest(low, 9)`.
   - Direction changes trigger macro pivot recording into `highValIndex`, `highVal`, `lowValIndex`, `lowVal` arrays.
2. **Order Block Extraction (`PIT_LITE`)**:
   - Triggered when price closes beyond the previous low (`downState`) or high (`upState`).
   - Order block top/bottom bounds set using 14-period Average True Range (`ATR`):
     - Bearish OB: `top = maxHigh - ATR`, `bottom = maxHigh`.
     - Bullish OB: `top = minLow + ATR`, `bottom = minLow`.
3. **Liquidity Sweeps (`liquidity_len = 30`)**:
   - Pivot highs (`phLiquidity`) and lows (`plLiquidity`) extracted over 30 bars.
   - Sweep confirmed when candle `high > pivotHigh` or `low < pivotLow`, but `close` returns inside the pivot boundary.

---

## 2. Smart Money Concepts (`[LuxAlgo]`) Reimplementation

### A. Reimplemented Algorithms
1. **Dual Market Structure (`Internal` vs `Swing`)**:
   - **Internal Structure**: Micro breakouts calculated using shorter leg lookbacks.
   - **Swing Structure**: Macro breakouts calculated using 50-bar swing pivots (`swingsLengthInput = 50`).
   - Structural transitions flag `CHOCH` (Change of Character) on trend reversal or `BOS` (Break of Structure) on trend continuation.
2. **Order Blocks with Volatility Filter (`LUXALGO`)**:
   - Filters out high-volatility outlier bars where `(high - low) >= 2 * ATR_200`.
   - Tracks up to 5 unmitigated order blocks per direction (`internalOrderBlocksSizeInput = 5`).
   - Order block mitigation checked on every tick against `candle.low` (for Bullish OB) or `candle.high` (for Bearish OB).
3. **Fair Value Gaps (`FVG`)**:
   - Identifies 3-candle imbalances:
     - Bullish FVG: `low[0] > high[2]`.
     - Bearish FVG: `high[0] < low[2]`.
4. **Equal Highs / Equal Lows (`EQH` / `EQL`)**:
   - Pairs pivot highs/lows within `0.1 * ATR` threshold over a 3-bar confirmation window.

---

## 3. Discarded TradingView-Only Drawing Features

The following Pine Script visualization features are **completely discarded** in the backend strategy engine to reduce computational overhead and maintain clean separation between calculations and UI rendering:

| Discarded Pine Feature | Source Script | Reason for Elimination | Replacement in System |
| :--- | :--- | :--- | :--- |
| `line.new()` (ZigZag lines) | UAlgo / LuxAlgo | Graphical canvas element only | Internal timestamp/price pivot arrays |
| `box.new()` (Order Block boxes) | UAlgo / LuxAlgo | Graphical canvas element only | `ZoneDto` JSON data structures |
| `label.new()` (BOS / CHoCH labels) | UAlgo / LuxAlgo | Graphical text element only | Enum flags (`MarketStructureEvent`) |
| `table.new()` (UAlgo Watermark) | UAlgo | UI watermark | Discarded |
| `extendTrendline()` | UAlgo | Dynamic line extension for charts | Visual chart component layer in React |
| `plotcandle()` / `plotchar()` | LuxAlgo | Candle recoloring | UI theme tokens in React frontend |

---

## 4. Unified Custom Indicator Engine Merge Architecture

Rather than executing two isolated script runtimes, AlgoApp Pro v2 merges both algorithms into a single **Deterministic Market Structure Pipeline**:

```text
                               1H Candle Tick
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    UAlgo Pivot Engine (ZigZag 9)          LuxAlgo Pivot Engine (Leg 50)
                 │                                       │
                 ▼                                       ▼
     PIT_LITE Order Blocks                      LUXALGO Order Blocks
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     │
                                     ▼
                          Zone Merger Service
                   (40% Overlap Consolidation Rule)
                                     │
                                     ▼
                            Canonical Zone Store
                   (FRESH / TOUCHED / TESTED / BROKEN)
```

### Key Architectural Benefits
1. **Zero Redundancy**: Computes ATR and pivot points once per 1H candle tick.
2. **Consolidated Level Precision**: Overlapping order blocks are merged into high-probability zones (`ZoneSource.MERGED`).
3. **Deterministic State Machine**: Fully testable via unit test suites without requiring a Pine Script runtime environment.
