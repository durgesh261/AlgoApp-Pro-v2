# Production Deployment Guide — AlgoApp Pro v2.0.0-rc1

This guide covers the deployment of **AlgoApp Pro v2** using Docker, Docker Compose, and environment configuration profiles.

---

## 1. Prerequisites

- **Docker Engine**: v20.10+
- **Docker Compose**: v2.10+
- **Node.js**: v20.x (for local developer builds)
- **PostgreSQL**: v15+

---

## 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your production parameters:

```bash
cp .env.example .env
```

### `.env` File Parameters

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:postgrespassword2026@postgres:5432/algoapp_pro_v2
TRADINGVIEW_WEBHOOK_SECRET=your_production_webhook_secret
DELTA_API_KEY=your_delta_exchange_api_key
DELTA_API_SECRET=your_delta_exchange_api_secret
```

---

## 3. Docker Compose Production Deployment

Build and start the multi-container production stack (PostgreSQL database and Backend API):

```bash
docker-compose up -d --build
```

### Verify Container Status

```bash
docker-compose ps
```

---

## 4. Database Migration & Prisma Setup

Run database migrations inside the backend container:

```bash
docker-compose exec backend npx prisma migrate deploy
```

---

## 5. Health & Readiness Verification

Verify application health endpoints:

- **Liveness Endpoint**: `GET http://localhost:4000/api/v1/system/liveness`
- **Readiness Endpoint**: `GET http://localhost:4000/api/v1/system/readiness`
- **Production Overview**: `GET http://localhost:4000/api/v1/production/overview`

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "HEALTHY",
    "uptimeSeconds": 120
  }
}
```
