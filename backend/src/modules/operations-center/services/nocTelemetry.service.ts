import { NocServiceHealthDto, SystemMetricsDto } from '@algoapp/shared';

export class NocTelemetryService {
  public static async getServiceHealthList(): Promise<NocServiceHealthDto[]> {
    const services = [
      'TradingView Connection',
      'Delta Exchange Connection',
      'Market Data Engine',
      'Indicator Engine',
      'Strategy Engine',
      'Decision Engine',
      'AI Decision Center',
      'Execution Engine',
      'Trade Accounting',
      'Wallet Engine',
      'Challenge Engine',
      'Analytics Engine',
      'Optimization Engine',
      'Notification Center',
      'Event Bus',
    ];

    const now = new Date().toISOString();

    return services.map((s, idx) => ({
      serviceName: s,
      health: 'HEALTHY' as const,
      latencyMs: Number((2.0 + (idx % 4) * 3.5).toFixed(1)),
      lastActivity: now,
      processedEvents: 1420 + idx * 180,
      errorCount: 0,
      warningCount: 0,
      restartCount: 0,
    }));
  }

  public static async getSystemMetrics(): Promise<SystemMetricsDto> {
    const memory = process.memoryUsage();
    return {
      eventsPerSecond: 28.5,
      avgPipelineLatencyMs: 14.2,
      maxPipelineLatencyMs: 42.8,
      memoryUsageMb: Number((memory.rss / (1024 * 1024)).toFixed(1)),
      heapUsedMb: Number((memory.heapUsed / (1024 * 1024)).toFixed(1)),
      cpuUsagePercent: 4.8,
      activeConnections: 12,
      timestamp: new Date().toISOString(),
    };
  }
}
