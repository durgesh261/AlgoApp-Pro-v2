# AlgoApp Pro v2

AlgoApp Pro v2 is a production-grade single-user algorithmic trading platform for research, risk governance, and operational visibility.

This repository contains the complete Phase 1 single-user software foundation monorepo, design system specifications, and platform architecture documentation.

---

## Workspace Monorepo Structure

```text
AlgoApp-Pro-v2/
├── frontend/                      # React + TypeScript + Vite + TailwindCSS desktop terminal
│   └── src/
│       ├── components/layout/    # DesktopTerminalLayout, Sidebar, Header, Ticker, StatusBar
│       └── features/             # Feature pages (Dashboard, Paper, Live, Analysis, Journal, etc.)
├── backend/                       # Express + TypeScript + Prisma + Pino API service
│   ├── prisma/                   # Single-user PostgreSQL schema
│   └── src/modules/              # Feature API modules (system, dashboard, paper-trading, etc.)
├── shared/                        # Shared contracts, Zod schemas, utilities, and constants
├── docker/                        # Containerization configs (PostgreSQL, Backend, Frontend)
├── scripts/                       # Startup (`dev.sh`) and build automation scripts
├── tests/                         # Vitest unit test and Playwright E2E configurations
└── docs/                          # Platform architecture and Design System specifications
```

---

## Quickstart — Single Command Startup

To launch the entire development environment (Shared, Backend Express API, and Frontend Vite desktop terminal) with a single command:

```bash
# Install dependencies across all workspace packages
npm install

# Option A: Single npm command
npm run dev

# Option B: Single bash script command
./scripts/dev.sh
```

- **Frontend Desktop Terminal**: `http://localhost:3000`
- **Backend Express API**: `http://localhost:4000/api/v1/system/liveness`

---

## Docker Container Deployment

To launch the full containerized stack (PostgreSQL 16 database, Express Backend, Nginx Frontend):

```bash
docker compose -f docker/docker-compose.yml up --build
```

---

## Phase 1 Foundation Scope

This initial software foundation establishes:
1. **Single-User Architecture**: Clean, zero-overhead baseline without multi-tenant complexity or external dependencies (no Redis, no message brokers, no auth frameworks yet).
2. **Desktop Trading Terminal Layout**: Top market ticker bar, header with command palette (`Ctrl+K`), collapsible navigation sidebar, main feature page viewports, and live status bar.
3. **8 Feature Page Surfaces**:
   - **Dashboard**: System health overview and metric cards.
   - **Paper Trading**: Simulated execution surface.
   - **Live Trading**: Production gate and risk limits surface.
   - **Analysis**: Quantitative research & technical indicator workspace.
   - **Trade Journal**: Post-trade logging & execution rationale.
   - **Analytics**: Performance metrics & drawdown analysis.
   - **Challenge**: Trader challenge rule monitor.
   - **Settings**: Single-user platform settings & emergency kill switch.
4. **Feature-Based Backend API Architecture**: Modular Express routes per feature (`/api/v1/system`, `/api/v1/dashboard`, `/api/v1/paper-trading`, etc.).

---

## Related Documentation

- [Master Index](docs/00_MASTER_INDEX.md)
- [Architecture Specifications](docs/03_ARCHITECTURE.md)
- [Design System Specifications](docs/DESIGN_SYSTEM.md)
- [Project Audit](docs/PROJECT_AUDIT.md)
- [Roadmap](docs/21_ROADMAP.md)
