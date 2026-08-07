import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './logger/index.js';
import { JournalAutomationService } from './modules/journal/services/journalAutomation.service.js';
import { marketScanner } from './modules/live-trading/services/MarketScannerService.js';

const app = createApp();

JournalAutomationService.initialize();
marketScanner.startScanner();

import { prisma } from './db.js';
import { deltaSyncService } from './modules/delta-exchange/index.js';

async function bootstrapDelta(): Promise<void> {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default-settings' },
    });

    const apiKey = settings?.deltaApiKey || process.env['DELTA_API_KEY'] || '';
    const apiSecret = settings?.deltaApiSecret || process.env['DELTA_API_SECRET'] || '';
    const env = settings?.deltaEnvironment || process.env['DELTA_ENVIRONMENT'] || 'PRODUCTION';
    const isTestnet = env === 'SANDBOX';

    if (apiKey && apiSecret) {
      process.env['DELTA_API_KEY'] = apiKey;
      process.env['DELTA_API_SECRET'] = apiSecret;
      process.env['DELTA_ENVIRONMENT'] = env;
      await deltaSyncService.updateCredentials({ apiKey, apiSecret }, isTestnet);
      logger.info({ environment: env, apiKeyPrefix: apiKey.substring(0, 6) }, 'Delta Exchange daemon initialized from configuration');
    } else {
      logger.info('Delta Exchange not yet configured. Users can input API keys in Settings.');
    }
  } catch (err) {
    logger.warn({ err }, 'Delta initialization notice');
  }
}

void bootstrapDelta();

const server = app.listen(config.port, () => {
  logger.info({
    port: config.port,
    environment: config.env,
    publicUrl: config.publicUrl,
  }, 'QuantEdge AI Backend Server Initialized');
});

function handleShutdown(signal: string): void {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  deltaSyncService.stop();
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

