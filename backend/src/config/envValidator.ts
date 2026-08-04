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
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/algoapp_pro_v2';
    const tradingViewSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET || 'default_tradingview_secret_key_2026';
    const deltaApiKey = process.env.DELTA_API_KEY || 'sandbox_test_key_001';
    const deltaApiSecret = process.env.DELTA_API_SECRET || 'sandbox_test_secret_999';

    return {
      nodeEnv,
      port,
      databaseUrl,
      tradingViewSecret,
      deltaApiKey,
      deltaApiSecret,
    };
  }
}
