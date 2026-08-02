import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './logger/index.js';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info({
    port: config.port,
    environment: config.env,
    publicUrl: config.publicUrl,
  }, 'AlgoApp Pro v2 Backend Server Initialized');
});

function handleShutdown(signal: string): void {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed successfully.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully shutting down server due to timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
