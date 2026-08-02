import crypto from 'crypto';
import { DeltaSyncStatusDto } from '@algoapp/shared';

export class DeltaSandboxClient {
  private restUrl = 'https://cdn.testnet.delta.exchange';
  private wsUrl = 'wss://socket.testnet.delta.exchange';
  public apiKey = 'sandbox_test_key_001';
  private apiSecret = 'sandbox_test_secret_999';

  public generateSignature(method: string, timestamp: string, path: string, body: string = ''): string {
    const payload = method.toUpperCase() + timestamp + path + body;
    return crypto.createHmac('sha256', this.apiSecret).update(payload).digest('hex');
  }

  public getUrls(): { restUrl: string; wsUrl: string } {
    return { restUrl: this.restUrl, wsUrl: this.wsUrl };
  }

  public async fetchSyncStatus(): Promise<DeltaSyncStatusDto> {
    return {
      isSynchronized: true,
      lastSyncAt: new Date().toISOString(),
      ordersCount: 2,
      positionsCount: 1,
      balanceUsd: 50000.0,
      availableMarginUsd: 48500.0,
    };
  }
}
