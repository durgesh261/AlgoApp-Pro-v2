import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './logger/index.js';
import { DeltaSyncService } from './services/DeltaSyncService.js';

const app = createApp();

const deltaApiKey = process.env['DELTA_API_KEY'] || '';
const deltaApiSecret = process.env['DELTA_API_SECRET'] || '';
const isTestnet = process.env['DELTA_ENVIRONMENT'] === 'SANDBOX';

let deltaSync: DeltaSyncService | null = null;

if (deltaApiKey && deltaApiSecret) {
  deltaSync = new DeltaSyncService(
    { apiKey: deltaApiKey, apiSecret: deltaApiSecret },
    isTestnet
  );
  deltaSync.start().catch((err) => {
    logger.warn({ err }, 'DeltaSyncService background sync initialization notice');
  });
}

const server = app.listen(config.port, () => {
  logger.info({
    port: config.port,
    environment: config.env,
    publicUrl: config.publicUrl,
    deltaExchangeEnabled: Boolean(deltaSync),
  }, 'AlgoApp Pro v2 Backend Server Initialized');
});

function handleShutdown(signal: string): void {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  deltaSync?.stop();
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

