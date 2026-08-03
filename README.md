# AlgoApp Pro v3.0.0 — Professional Trading Chart Workspace

**AlgoApp Pro v3** is an institutional-grade desktop trading workstation built with **TradingView Lightweight Charts**, deterministic market structure analysis (PAT Lite & SMC), multi-timeframe strategy evaluation (15M / 1H), AI decision explainability, trade accounting, and multi-adapter execution platform for crypto perpetual futures.

---

## 🏗️ Monorepo Structure

```text
AlgoApp-Pro-v2/
├── shared/             # Type definitions, DTOs, validation schemas, constants
├── backend/            # Express TypeScript API server, Prisma ORM, 16 core engine modules
├── frontend/           # React 18, Vite, TradingView Lightweight Charts, TailwindCSS, TanStack Query
├── tests/              # 22 Vitest unit & integration test suites (99 tests)
├── docs/               # Technical specs, release notes, deployment guides, runbooks, OpenAPI, v3 chart audit
├── Dockerfile          # Multi-stage Docker build specification
└── docker-compose.yml  # Multi-container production deployment setup
```

---

## ⚡ Quickstart Developer Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Workspaces

```bash
npm run build
```

### 3. Run Test Suite

```bash
npx vitest run
```

### 4. Start Production / Dev Servers

```bash
# Backend API (http://localhost:4000)
npm run dev --workspace=backend

# Frontend Desktop Terminal UI (http://localhost:3000)
npm run dev --workspace=frontend
```

---

## 📊 Milestone 21 — Professional Trading Chart Workspace

1. **TradingView Lightweight Charts**: Smooth 60 FPS candlestick and volume histogram rendering supporting 10,000+ candles.
2. **Market Structure Overlays**: Supply & Demand Zones with freshness decay, touch count, BOS, CHoCH, Liquidity Sweeps, and FVGs.
3. **Trade Position Risk Boxes**: Interactive Entry, Stop Loss, Take Profit lines, Risk-Reward ratio, and Win/Loss badges.
4. **Interactive Trade Decision Drawer**: Clicking trade markers reveals decision confidence %, reason codes, and AI reviews.
5. **Multi-Timeframe Propagation**: Timeframe toolbar switching (`15M` / `1H`) reloads market data dynamically without page refresh.

---

## 📄 Documentation Links

- [V3 Professional Chart Workspace Audit](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/V3_CHART_WORKSPACE_AUDIT.md)
- [V2 Final Functional Verification](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/V2_FINAL_VERIFICATION.md)
- [V2 Production Refactor Audit](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/V2_PRODUCTION_REFACTOR_AUDIT.md)
- [Final Live Verification Report](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/FINAL_LIVE_VERIFICATION.md)
- [Final System Audit Report](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/FINAL_SYSTEM_AUDIT.md)
- [OpenAPI 3.0 Specification](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/OPENAPI.json)
