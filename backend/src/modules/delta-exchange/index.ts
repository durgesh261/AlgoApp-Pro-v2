import { DeltaSyncService } from './services/DeltaSyncService.js';
import { DeltaExecutionService } from './services/DeltaExecutionService.js';
import { DeltaPortfolioService } from './services/DeltaPortfolioService.js';
import { createDeltaExchangeRouter } from './deltaExchange.routes.js';

const deltaApiKey = process.env['DELTA_API_KEY'] || '';
const deltaApiSecret = process.env['DELTA_API_SECRET'] || '';
const isTestnet = process.env['DELTA_ENVIRONMENT'] === 'SANDBOX';

export const deltaSyncService = new DeltaSyncService(
  { apiKey: deltaApiKey, apiSecret: deltaApiSecret },
  isTestnet
);

export const deltaExecutionService = new DeltaExecutionService(deltaSyncService.getRestClient());
export const deltaPortfolioService = new DeltaPortfolioService(deltaSyncService);

export const deltaExchangeRouter = createDeltaExchangeRouter(
  deltaSyncService,
  deltaExecutionService,
  deltaPortfolioService
);
