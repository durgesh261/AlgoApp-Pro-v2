# Multi-stage Dockerfile for QuantEdge AI Monorepo
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root & workspace package manifests
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm ci

# Copy full source
COPY . .

# Build all workspace packages
ENV DATABASE_URL="file:./dev.db"
RUN npm run build

# Production Runtime Image for Backend
FROM node:20-alpine AS backend-runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "backend/dist/server.js"]
