# QuantEdge AI — Enterprise Architecture & Zero-Mock Rewrite Report

## 1. Executive Summary

This report documents the architectural audit and foundational rewrite of **QuantEdge AI** into an enterprise-grade, real-time algorithmic trading platform connected directly to **Delta Exchange India**.

### Core Tenets
1. **Zero Fake Data Policy**: Complete elimination of simulated random number generation (`Math.random()`), mock candle feeds, and stub order state.
2. **Delta Exchange India Native**: All market data, trade accounting, active orders, positions, and balances reflect the authentic Delta Exchange India broker state.
3. **Decoupled Event-Driven Core**: Asynchronous `EventBus` connecting REST clients, WebSocket subscriptions, server-side `CandleEngine`, and execution pipelines.
4. **Server-Side Tick Aggregation**: Server-side `CandleEngine` generating real-time multi-timeframe candles (`1m`, `5m`, `15m`, `1H`, `4H`) bucketed strictly on timestamp boundaries.
5. **Real Trade Accounting**: Automatic deduction of 0.05% taker fee, funding rates, and Indian crypto tax (30% STCG) on position closures.

---

## 2. Implemented Core Architecture

### A. Central Event Bus (`backend/src/services/EventBus.ts`)
- Lightweight, strongly typed pub/sub bus.
- Decouples incoming WebSocket tick streams from candle aggregation, order state synchronization, and execution events.

### B. Production Delta REST Client (`backend/src/delta/DeltaRestClient.ts`)
- Automatic HMAC-SHA256 request signing using `api-key`, `signature`, and epoch timestamps.
- Built-in caching for Delta product metadata (`BTCUSD.P`, `ETHUSD.P`, `SOLUSD.P`, `XRPUSD.P`).
- Endpoints for wallet balances, active positions, open orders, order placement, and cancellation.

### C. Resilient Delta WebSocket Client (`backend/src/delta/DeltaWebSocketClient.ts`)
- Connects directly to Delta India WSS (`wss://socket.india.delta.exchange` / `wss://socket.delta.exchange`).
- Automatic authentication handshake and channel subscription (`v2/ticker`, `v2/positions`, `v2/orders`, `v2/wallet`).
- 15-second heartbeat ping/pong keepalive with auto-reconnection on socket drops.

### D. Server-Side Candle Engine (`backend/src/engine/CandleEngine.ts`)
- Ingests trade ticks in real-time.
- Maintains in-memory OHLCV buckets for `1m`, `5m`, `15m`, `1H`, and `4H`.
- Emits live updates across the event bus without polling delays.

### E. Delta Synchronization Service (`backend/src/services/DeltaSyncService.ts`)
- Combines continuous real-time WebSocket event ingestion with 30-second periodic REST reconciliation.
- Manages connection health tracking (`CONNECTED`, `DISCONNECTED`, `ERROR`).

### F. Automated Execution Service (`backend/src/services/ExecutionService.ts`)
- Idempotent order placement against Delta Exchange.
- Tracks millisecond lifecycle latency (`latencyMs`) and order fill IDs.

### G. Trade Accounting & Compliance Service (`backend/src/services/TradeAccountingService.ts`)
- Computes gross and net PnL.
- Deducts standard 0.05% taker fee.
- Deducts 30% STCG tax liability for Indian crypto compliance.

---

## 3. Verification & Operational Checklist

| Feature Subsystem | Status | Verification Detail |
|---|---|---|
| EventBus Pub/Sub | ✅ Operational | Verified memory safety and decoupled message routing |
| Delta REST Client | ✅ Operational | HMAC-SHA256 signing active |
| Delta WSS Client | ✅ Operational | Heartbeat ping/pong and auto-reconnect |
| CandleEngine | ✅ Operational | Multi-timeframe bucket aggregation active |
| Execution Service | ✅ Operational | Idempotent order request generation |
| Trade Accounting | ✅ Operational | Gross to Net PnL calculation with 30% tax & 0.05% fee |
| Enterprise API Router | ✅ Mounted | Available under `/api/v1/core/*` |
