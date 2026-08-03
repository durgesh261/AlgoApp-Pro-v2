# AlgoApp Pro v1.0.0 — Final Release Candidate

**AlgoApp Pro v2** is an institutional-grade quantitative market structure analysis, deterministic trading rules evaluation, automated strategy signal generation, AI decision explainability, trade accounting engine, and multi-adapter execution platform for crypto perpetual futures.

---

## 🏗️ Monorepo Structure

```text
AlgoApp-Pro-v2/
├── shared/             # Type definitions, DTOs, validation schemas, constants
├── backend/            # Express TypeScript API server, Prisma ORM, 15 core engine modules
├── frontend/           # React 18, Vite, TailwindCSS, Framer Motion, TanStack Query
├── tests/              # 22 Vitest unit & integration test suites (98 tests)
├── docs/               # Technical specs, release notes, deployment guides, runbooks, OpenAPI
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

## 🛡️ Key Features & Workspaces

1. **Indicator Engine**: PAT Lite & SMC zones with 0.01% boundary overlap delta.
2. **Multi-Timeframe Strategy Engine**: 15M and 1H timeframe support for BTC, ETH, SOL, XRP.
3. **Trade Accounting & 20-Day Challenge Manager**: Institutional fees, net PnL, 5%/10% drawdown tracking.
4. **Operations Center (NOC)**: 15-service telemetry health grid, error center, database diagnostics.
5. **Trade Review Center**: Post-trade review, deterministic chart reconstruction, AI summaries, trader journal.
6. **Shadow Trading Laboratory**: Continuous paper pipeline execution and Production Readiness Score (96.8%).

---

## 📄 Documentation Links

- [Final Release Report](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/FINAL_RELEASE_REPORT.md)
- [OpenAPI 3.0 Specification](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/OPENAPI.json)
- [Operations Runbook](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/OPERATIONS_RUNBOOK.md)
- [Deployment Guide](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/DEPLOYMENT_GUIDE.md)
