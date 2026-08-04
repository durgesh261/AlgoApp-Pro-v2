# AlgoApp Terminal — Fake Data Audit & Purge Inventory

> **Audit Date:** August 4, 2026  
> **Milestone:** Version 5.0 Live Data & Connectivity Purge  
> **Objective:** Identify, catalogue, and purge all static, mock, dummy, or hardcoded values across the frontend and backend repositories.

---

## 1. Purged Mock & Scaffolding Files

| File Path | Description / Purpose | Action Taken |
| :--- | :--- | :---: |
| `frontend/src/mock/chartData.ts` | Early scaffolding dummy candle dataset | **DELETED** |
| `frontend/src/mock/marketData.ts` | Early scaffolding dummy ticker dataset | **DELETED** |
| `frontend/src/mock/tradeHistory.ts` | Early scaffolding dummy trade history array | **DELETED** |
| `frontend/src/router/index.tsx` | Duplicate unreferenced router file | **DELETED** |
| `backend/src/modules/dashboard/dashboard.routes.ts` | Unused `/api/v1/dashboard/summary` static route | **DELETED** |

---

## 2. Hardcoded PnL, Equity & Telemetry Purge

| File | Purged Static Value / String | Replaced Live Data Source | Verification |
| :--- | :--- | :--- | :---: |
| `backend/.../tradeSync.service.ts` | Auto-seeded `$649.55` Equity / `$639.55` PnL seed trade | Real empty trade ledger array until live trade executed | **VERIFIED** |
| `backend/.../walletEngine.service.ts` | `$10.00` default initial balance seed | Dynamic `$0.00` / Delta Live wallet balance | **VERIFIED** |
| `backend/.../challengeEngine.service.ts` | `$10.00` default challenge initial balance | Dynamic `$0.00` / Delta Live balance | **VERIFIED** |
| `frontend/.../PortfolioDashboardPage.tsx` | `$10.00` fallback values & `100% RECONCILED` badge | Dynamic `$0.00` / `SYNCHRONIZED` telemetry status | **VERIFIED** |
| `frontend/.../StatusBar.tsx` | `BE: ONLINE (12.4ms)` static text | Dynamic HTTP roundtrip ping via `systemApi.getLiveness()` | **VERIFIED** |
| `frontend/.../StatusBar.tsx` | `PIPELINE: (18.5ms)` static text | Dynamic execution latency computed from API response timing | **VERIFIED** |
| `frontend/.../Header.tsx` | `PAPER` Telemetry Badge | Dynamic `DELTA LIVE` telemetry badge | **VERIFIED** |

---

## 3. Dashboard & Component Value Fallback Inventory

| Component | Display Field | Unpopulated Fallback Display |
| :--- | :--- | :--- |
| `DashboardPage.tsx` | Today's Net PnL | `$0.00` / `No Data` |
| `DashboardPage.tsx` | AI Decision Confidence | `No Data` |
| `DashboardPage.tsx` | Account Equity / Risk | `$0.00` / `No Data` |
| `LiveTradingPage.tsx` | Delta Balance & Margin | `$0.00` / `No Data` |
| `PositionsPage.tsx` | Open Positions List | `No open positions found.` |
| `OrdersPage.tsx` | Active Orders List | `No active or pending orders found.` |
| `TradeHistoryPage.tsx` | Historical Trade Ledger | `No trade history records found.` |

---

## 4. Verification Summary

All static mock arrays, hardcoded PnL/equity seeds (`$649.55`, `$639.55`), hardcoded latency values, and dummy percentage strings have been completely purged from the codebase. Unpopulated metrics render `$0.00`, `"No Data"`, or `"Not Connected"`.
