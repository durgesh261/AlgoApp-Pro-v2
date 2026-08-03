# AlgoApp Pro v2 — Institutional Deployment Guide

## Prerequisites
- Node.js v18.0+ or v20.0+
- PostgreSQL or SQLite database
- Delta Exchange Testnet / Production API Credentials

## Quick Start Deployment

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/durgesh261/AlgoApp-Pro-v2.git
   cd AlgoApp-Pro-v2
   npm install
   ```

2. **Environment Configuration**:
   Create `.env` file in `backend/`:
   ```env
   PORT=4000
   DATABASE_URL="file:./dev.db"
   DELTA_API_KEY="your_delta_api_key"
   DELTA_API_SECRET="your_delta_api_secret"
   TRADINGVIEW_WEBHOOK_SECRET="your_webhook_secret"
   ```

3. **Build & Database Migration**:
   ```bash
   npm run build
   ```

4. **Start Production Servers**:
   ```bash
   npm run dev --workspace=backend
   npm run dev --workspace=frontend
   ```

5. **Access Application Terminals**:
   - Terminal Desktop UI: `http://localhost:3000`
   - Operations NOC: `http://localhost:3000/operations`
   - Shadow Laboratory: `http://localhost:3000/shadow-laboratory`
   - Trade Review Workspace: `http://localhost:3000/trade-review`
