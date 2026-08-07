import { prisma } from '../../../db.js';
import { deltaSyncService } from '../../delta-exchange/index.js';
import { DeltaSyncService } from '../../delta-exchange/services/DeltaSyncService.js';
import { logger } from '../../../logger/index.js';

export interface SystemSettingsDto {
  id: string;
  defaultCurrency: string;
  timezone: string;
  maxStaleSignalSeconds: number;
  isKillSwitchActive: boolean;
  deltaApiKey: string;
  hasDeltaApiSecret: boolean;
  deltaEnvironment: 'PRODUCTION' | 'SANDBOX';
  deltaHealth: ReturnType<typeof deltaSyncService.getHealth>;
  updatedAt: string;
}

export class SettingsService {
  private static async getOrCreateSettings() {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default-settings' },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default-settings',
          defaultCurrency: 'USD',
          timezone: 'UTC',
          maxStaleSignalSeconds: 60,
          isKillSwitchActive: false,
          deltaApiKey: process.env['DELTA_API_KEY'] || null,
          deltaApiSecret: process.env['DELTA_API_SECRET'] || null,
          deltaEnvironment: (process.env['DELTA_ENVIRONMENT'] as string) || 'PRODUCTION',
        },
      });
    }

    return settings;
  }

  public static async getSettings(): Promise<SystemSettingsDto> {
    const settings = await this.getOrCreateSettings();
    const effectiveApiKey = settings.deltaApiKey || process.env['DELTA_API_KEY'] || '';
    const hasSecret = Boolean(settings.deltaApiSecret || process.env['DELTA_API_SECRET']);
    const effectiveEnv = (settings.deltaEnvironment as 'PRODUCTION' | 'SANDBOX') || 
      (process.env['DELTA_ENVIRONMENT'] === 'SANDBOX' ? 'SANDBOX' : 'PRODUCTION');

    return {
      id: settings.id,
      defaultCurrency: settings.defaultCurrency,
      timezone: settings.timezone,
      maxStaleSignalSeconds: settings.maxStaleSignalSeconds,
      isKillSwitchActive: settings.isKillSwitchActive,
      deltaApiKey: effectiveApiKey,
      hasDeltaApiSecret: hasSecret,
      deltaEnvironment: effectiveEnv,
      deltaHealth: deltaSyncService.getHealth(),
      updatedAt: settings.updatedAt.toISOString(),
    };
  }

  public static async saveDeltaCredentials(input: {
    apiKey: string;
    apiSecret: string;
    environment: 'PRODUCTION' | 'SANDBOX';
  }): Promise<{ success: boolean; message: string; settings: SystemSettingsDto }> {
    const { apiKey, apiSecret, environment } = input;

    const trimmedKey = apiKey.trim();
    const trimmedSecret = apiSecret.trim();

    // Persist in DB
    const updated = await prisma.systemSettings.upsert({
      where: { id: 'default-settings' },
      update: {
        deltaApiKey: trimmedKey,
        deltaApiSecret: trimmedSecret,
        deltaEnvironment: environment,
        updatedAt: new Date(),
      },
      create: {
        id: 'default-settings',
        deltaApiKey: trimmedKey,
        deltaApiSecret: trimmedSecret,
        deltaEnvironment: environment,
      },
    });

    // Update in memory env for any existing modules
    process.env['DELTA_API_KEY'] = trimmedKey;
    process.env['DELTA_API_SECRET'] = trimmedSecret;
    process.env['DELTA_ENVIRONMENT'] = environment;

    // Dynamically update DeltaSyncService daemon
    const isTestnet = environment === 'SANDBOX';
    const syncResult = await deltaSyncService.updateCredentials(
      { apiKey: trimmedKey, apiSecret: trimmedSecret },
      isTestnet
    );

    logger.info({ apiKeyPrefix: trimmedKey.substring(0, 6), environment }, 'Delta API credentials saved and synchronized');

    const settingsDto: SystemSettingsDto = {
      id: updated.id,
      defaultCurrency: updated.defaultCurrency,
      timezone: updated.timezone,
      maxStaleSignalSeconds: updated.maxStaleSignalSeconds,
      isKillSwitchActive: updated.isKillSwitchActive,
      deltaApiKey: trimmedKey,
      hasDeltaApiSecret: Boolean(trimmedSecret),
      deltaEnvironment: environment,
      deltaHealth: deltaSyncService.getHealth(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return {
      success: syncResult.success,
      message: syncResult.message || 'Delta API credentials saved and synchronized successfully',
      settings: settingsDto,
    };
  }

  public static async testDeltaCredentials(input: {
    apiKey: string;
    apiSecret: string;
    environment: 'PRODUCTION' | 'SANDBOX';
  }): Promise<{ success: boolean; latencyMs: number; message: string; data?: any }> {
    const { apiKey, apiSecret, environment } = input;
    const isTestnet = environment === 'SANDBOX';

    return DeltaSyncService.testCredentials(
      { apiKey: apiKey.trim(), apiSecret: apiSecret.trim() },
      isTestnet
    );
  }

  public static async deleteDeltaCredentials(): Promise<{ success: boolean; message: string }> {
    await prisma.systemSettings.upsert({
      where: { id: 'default-settings' },
      update: {
        deltaApiKey: null,
        deltaApiSecret: null,
        updatedAt: new Date(),
      },
      create: {
        id: 'default-settings',
        deltaApiKey: null,
        deltaApiSecret: null,
      },
    });

    delete process.env['DELTA_API_KEY'];
    delete process.env['DELTA_API_SECRET'];

    await deltaSyncService.updateCredentials({ apiKey: '', apiSecret: '' });

    logger.info('Delta API credentials removed from system');

    return {
      success: true,
      message: 'Delta API credentials successfully removed',
    };
  }
}
