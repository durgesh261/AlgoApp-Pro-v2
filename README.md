# AlgoApp Pro v2.0.0-rc1

**AlgoApp Pro v2** is an enterprise-grade quantitative market structure analysis, deterministic trading rules evaluation, automated strategy signal generation, AI decision explainability, and multi-adapter execution platform.

---

## 🏗️ Monorepo Structure

```text
AlgoApp-Pro-v2/
├── shared/             # Type definitions, DTOs, validation schemas, constants
├── backend/            # Express TypeScript API server, Prisma ORM, 9 engine modules
├── frontend/           # React 18, Vite, TailwindCSS, Framer Motion, TanStack Query
├── tests/              # 12 Vitest unit & integration test suites (50 tests)
├── docs/               # Technical specs, release notes, deployment guides, runbooks
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

### 4. Start Development Servers

```bash
# Terminal 1: Backend API (http://localhost:4000)
npm run dev --workspace=backend

# Terminal 2: Frontend Desktop Terminal UI (http://localhost:5173)
npm run dev --workspace=frontend
```

---

## 🛡️ Execution Modes

1. **`PAPER`**: Virtual paper trading simulation ($50,000 equity). Default mode with zero financial risk.
2. **`SANDBOX`**: Delta Exchange Testnet integration (`https://cdn.testnet.delta.exchange`).
3. **`LIVE`**: Protected live exchange order execution (disabled by default; requires explicit user confirmation and 8-point safety check approval).

---

## 📚 Documentation

- [Release Notes v1.0.0-rc1](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/RELEASE_NOTES_v1.0.md)
- [Known Limitations](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/KNOWN_LIMITATIONS.md)
- [Deployment Guide](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/DEPLOYMENT_GUIDE.md)
- [Operations Runbook](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/OPERATIONS_RUNBOOK.md)
- [Delta Integration Specification](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/DELTA_INTEGRATION.md)
- [Production Readiness Audit](file:///c:/Users/durge/OneDrive/Desktop/Antigravity%20App/AlgoApp-Pro-v2/docs/PRODUCTION_READINESS_REPORT.md)

---

## 📜 License

MIT License. Copyright © 2026 AlgoApp Pro Team.
