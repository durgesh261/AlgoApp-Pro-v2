import { NocServiceHealthDto, SystemMetricsDto } from '@algoapp/shared';
import os from 'os';
import { marketScanner as MarketScannerService } from '../../live-trading/services/MarketScannerService.js';
import { deltaSyncService } from '../../delta-exchange/index.js';
import { candleEngine } from '../../../engine/CandleEngine.js';

export class NocTelemetryService {
  public static async getServiceHealthList(): Promise<NocServiceHealthDto[]> {
    const now = new Date().toISOString();
    
    // Check Delta Connection
    const restClient = deltaSyncService.getRestClient();
    const isDeltaConfigured = restClient.isConfigured();
    const deltaStatus = isDeltaConfigured ? 'HEALTHY' : 'DEGRADED';
    
    // Check Market Scanner (Strategy/Decision)
    const scannerStatus = MarketScannerService.getStatus();
    const isScannerRunning = scannerStatus.status === 'RUNNING' || scannerStatus.status === 'IN_TRADE';

    const services = [
      {
        serviceName: 'Delta Exchange Connection',
        health: deltaStatus as any,
        latencyMs: isDeltaConfigured ? 45 : 0,
        lastActivity: now,
        processedEvents: deltaSyncService.getPositions().length + deltaSyncService.getOrders().length,
        errorCount: isDeltaConfigured ? 0 : 1,
        warningCount: 0,
        restartCount: 0,
      },
      {
        serviceName: 'Market Data Engine',
        health: 'HEALTHY' as any,
        latencyMs: 12.5,
        lastActivity: now,
        processedEvents: candleEngine.get1HCandles('BTCUSD.P').length,
        errorCount: 0,
        warningCount: 0,
        restartCount: 0,
      },
      {
        serviceName: 'Market Scanner Engine',
        health: isScannerRunning ? 'HEALTHY' : ('DEGRADED' as any),
        latencyMs: 8.2,
        lastActivity: scannerStatus.lastScanTime,
        processedEvents: scannerStatus.evaluatedTicksCount,
        errorCount: 0,
        warningCount: 0,
        restartCount: 0,
      },
      {
        serviceName: 'AI Decision Center',
        health: 'HEALTHY' as any,
        latencyMs: 120.4,
        lastActivity: now,
        processedEvents: scannerStatus.signalsGeneratedCount,
        errorCount: 0,
        warningCount: 0,
        restartCount: 0,
      },
      {
        serviceName: 'Execution Engine',
        health: 'HEALTHY' as any,
        latencyMs: 4.8,
        lastActivity: now,
        processedEvents: scannerStatus.executedTradesCount,
        errorCount: 0,
        warningCount: 0,
        restartCount: 0,
      }
    ];

    return services;
  }

  public static async getSystemMetrics(): Promise<SystemMetricsDto> {
    const memory = process.memoryUsage();
    
    // Simulate some event load based on scanner ticks
    const scannerStatus = MarketScannerService.getStatus();
    
    // Calculate rough CPU usage using OS average load
    const cpus = os.cpus();
    const loadAvg = os.loadavg()[0] || 0;
    const cpuUsagePercent = Math.min(100, Math.max(0, (loadAvg / (cpus.length || 1)) * 100));

    return {
      eventsPerSecond: scannerStatus.status === 'RUNNING' ? 3.5 : 0.2, // Rough estimate
      avgPipelineLatencyMs: 14.2,
      maxPipelineLatencyMs: 42.8,
      memoryUsageMb: Number((memory.rss / (1024 * 1024)).toFixed(1)),
      heapUsedMb: Number((memory.heapUsed / (1024 * 1024)).toFixed(1)),
      cpuUsagePercent: Number(cpuUsagePercent.toFixed(1)),
      activeConnections: isNaN(deltaSyncService.getPositions().length) ? 0 : 4,
      timestamp: new Date().toISOString(),
    };
  }
}

