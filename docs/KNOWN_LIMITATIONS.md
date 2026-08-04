# Known Operational Limitations — AlgoApp Pro v2.0.0-rc1

This document outlines known operational boundaries, design intentional constraints, and environment assumptions for **AlgoApp Pro v2.0.0-rc1**.

---

## 1. Timeframe & Pair Constraints

- **Strict 1H Timeframe Only**:
  The Market Rules and Strategy Engine enforce a single timeframe (`1H`). Webhooks or data inputs for other timeframes (`15M`, `4H`, `1D`) are explicitly rejected by `MarketRuleEvaluator`.
- **Perpetual Pair Allowlist**:
  Only 4 perpetual pairs are supported: `BTCUSD.P`, `ETHUSD.P`, `SOLUSD.P`, `XRPUSD.P`. All other asset tickers will be rejected with an `UNSUPPORTED_PAIR` code.

---

## 2. Live Exchange Integration

- **Live Trading Disabled By Default**:
  Live execution mode is strictly disabled out of the box. Activation requires explicit user confirmation via `/production-dashboard` and full satisfaction of the 8-Point Live Trading Safety Guard Matrix.
- **Delta Sandbox Testnet Environment**:
  Delta Exchange connectivity targets the official Testnet (`https://cdn.testnet.delta.exchange` / `wss://socket.testnet.delta.exchange`). Production credentials must be configured in environment variables prior to live trading.

---

## 3. AI Decision Center

- **Simulated Reasoning Summaries**:
  In version `v1.0.0-rc1`, `AIDecisionCenterService` uses deterministic rule-based explainability summaries (`EXPLAIN_APPROVED_BUY`, `EXPLAIN_REJECTED_DRAWDOWN`, etc.) without calling external LLM/AI APIs, ensuring zero network latency overhead during decision processing.

---

## 4. Replay & Backtesting Engine

- **Memory Cache Bounds**:
  In-memory replay sessions maintain up to 500 candles per symbol session. Historical datasets larger than 500 candles require pagination or database persistence streaming.
