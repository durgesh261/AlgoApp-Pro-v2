import { Router } from 'express';
import { prisma } from '../db.js';
import { logger } from '../logger/index.js';

const router = Router();

router.get('/', async (_req, res) => {
  const health: {
    status: string;
    timestamp: string;
    uptime: number;
    services: { database: string; deltaExchange: string };
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      deltaExchange: 'unknown',
    },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'connected';
  } catch (err) {
    health.services.database = 'disconnected';
    health.status = 'degraded';
    logger.warn('[Health] Database check failed');
  }

  // Check Delta Exchange API (lightweight HEAD request)
  try {
    const deltaRes = await fetch('https://api.delta.exchange/v2/products', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    health.services.deltaExchange = deltaRes.ok ? 'connected' : 'degraded';
  } catch {
    health.services.deltaExchange = 'disconnected';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
