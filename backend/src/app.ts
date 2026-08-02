import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { API_VERSION_PREFIX } from '@algoapp/shared';
import { config } from './config/index.js';
import { logger } from './logger/index.js';
import { correlationIdMiddleware } from './middleware/correlationId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));

  app.use(pinoHttp({ logger }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(correlationIdMiddleware);

  app.use(API_VERSION_PREFIX, apiRouter);

  app.use(errorHandler);

  return app;
}
