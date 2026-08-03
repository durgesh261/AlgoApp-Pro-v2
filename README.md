# AlgoApp Pro v4.0.0 — Daily Trader Edition

**AlgoApp Pro v4** is an institutional-grade desktop trading workstation built with a 4-pane single-screen layout, TradingView Lightweight Charts, Morning Operational Checklists, Pre-Trade Risk Confirmation Modals, During-Trade Live Gauges, End-of-Day Closing Workflows, deterministic market structure analysis (PAT Lite & SMC), multi-timeframe strategy evaluation (15M / 1H), and multi-adapter execution for crypto perpetual futures.

---

## 🏗️ Monorepo Structure

```text
AlgoApp-Pro-v2/
├── shared/             # Type definitions, DTOs, validation schemas, constants
├── backend/            # Express TypeScript API server, Prisma ORM, 16 core engine modules
├── frontend/           # React 18, Vite, TradingView Lightweight Charts, TailwindCSS, TanStack Query
├── tests/              # 22 Vitest unit & integration test suites (99 tests)
├── docs/               # Technical specs, release notes, deployment guides, runbooks, OpenAPI, v4 trader report
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

## 🖥️ Operational Workstation & Reliability Highlights (v4.0)

- **Single-Screen Workstation Layout**: Market Watch (Left), TradingView Chart (Center), AI Decision Panel (Right), Execution Dock (Bottom).
- **Morning Operational Checklist**: 10 prerequisite safety checks blocking order execution.
- **Pre-Trade Risk Confirmation Modal**: Full risk-reward, fees, and challenge impact review before order submission.
- **End-of-Day Closing Report**: Daily trade summary, win rate, net profit, fees, taxes, and tomorrow's focus.
- **8-Hour Shadow Stability**: 100% uptime, 4.8ms avg API latency, flat memory RSS (148.5MB), zero memory leaks.

---

## 📄 Documentation Links

- [V4 Daily Trader Edition Report](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/V4_DAILY_TRADER_REPORT.md)
- [V3 Quantitative Research Platform Report](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/V3_RESEARCH_PLATFORM_REPORT.md)
- [V3 Live Trading Validation Report](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/V3_LIVE_VALIDATION_REPORT.md)
- [V3 Professional Chart Workspace Audit](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/V3_CHART_WORKSPACE_AUDIT.md)
- [V2 Final Functional Verification](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/V2_FINAL_VERIFICATION.md)
- [OpenAPI 3.0 Specification](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/OPENAPI.json)
