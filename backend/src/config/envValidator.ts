import { AppEnvironment } from '@algoapp/shared';

export interface EnvConfig {
  nodeEnv: AppEnvironment;
  port: number;
  databaseUrl: string;
  tradingViewSecret: string;
  deltaApiKey?: string | undefined;
  deltaApiSecret?: string | undefined;
}

export class EnvValidator {
  public static validateEnv(): EnvConfig {
    const nodeEnv = (process.env.NODE_ENV as AppEnvironment) || 'development';
    const port = parseInt(process.env.PORT || '4000', 10);
    const databaseUrl = process.env.DATABASE_URL || 'file:./algoapp.db';
    const tradingViewSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET;
    const deltaApiKey = process.env.DELTA_API_KEY;
    const deltaApiSecret = process.env.DELTA_API_SECRET;

    const resolvedTvSecret = tradingViewSecret || 'tv_webhook_secret_default';

    return {
      nodeEnv,
      port,
      databaseUrl,
      tradingViewSecret: resolvedTvSecret,
      deltaApiKey,
      deltaApiSecret,
    };
  }
}
