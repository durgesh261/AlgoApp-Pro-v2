#!/bin/bash
set -e

echo "=========================================="
echo "  QuantEdge AI — Deployment Setup"
echo "=========================================="

# 1. Install missing dependencies
echo "[1/7] Installing dependencies..."
npm install ws
npm install -D @types/ws
cd frontend && npm install -D vite-plugin-pwa workbox-window && cd ..

# 2. Generate Prisma client
echo "[2/7] Generating Prisma client..."
cd backend
npx prisma generate
npx prisma migrate dev --name strategy_alignment_final
cd ..

# 3. Create PWA icons directory
echo "[3/7] Creating PWA assets..."
mkdir -p frontend/public/icons
echo "⚠️  IMPORTANT: Add your icon PNGs to frontend/public/icons/"
echo "   Required sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512"

# 4. Build frontend
echo "[4/7] Building frontend..."
npm run build --workspace=frontend

# 5. Build backend
echo "[5/7] Building backend..."
npm run build --workspace=backend

# 6. Environment check
echo "[6/7] Checking environment..."
if [ ! -f backend/.env ]; then
  echo "⚠️  Create backend/.env with:"
  echo "   DATABASE_URL=file:./prisma/quantedge.db"
  echo "   DELTA_API_KEY=your_key"
  echo "   DELTA_API_SECRET=your_secret"
fi

if [ ! -f frontend/.env ]; then
  echo "⚠️  Create frontend/.env with:"
  echo "   VITE_API_URL=http://localhost:4000/api/v1"
  echo "   VITE_WS_URL=ws://localhost:4000/ws"
fi

# 7. Docker build
echo "[7/7] Building Docker containers..."
docker-compose -f docker/docker-compose.yml up --build -d

echo ""
echo "=========================================="
echo "  ✅ Setup Complete!"
echo "=========================================="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:4000"
echo ""
echo "Next steps:"
echo "1. Add Delta API keys in Settings"
echo "2. Start Scanner"
echo "3. Verify no fake prices in logs"
