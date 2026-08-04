export interface SystemMetricsDto {
  eventsPerSecond: number;
  avgPipelineLatencyMs: number;
  maxPipelineLatencyMs: number;
  memoryUsageMb: number;
  heapUsedMb: number;
  cpuUsagePercent: number;
  activeConnections: number;
  timestamp: string;
}

export interface NocServiceHealthDto {
  serviceName: string;
  health: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastActivity: string;
  processedEvents: number;
  errorCount: number;
  warningCount: number;
  restartCount: number;
}

export interface ErrorLogEntryDto {
  id: string;
  category: 'VALIDATION' | 'EXECUTION' | 'EXCHANGE' | 'WEBHOOK' | 'PIPELINE' | 'DECISION';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  stackTrace?: string | undefined;
  timestamp: string;
}

export interface TableDetailDto {
  table: string;
  count: number;
}

export interface DatabaseDiagnosticsDto {
  tablesCount: number;
  totalRecords: number;
  tableDetails: TableDetailDto[];
  slowQueriesCount: number;
  storageSizeMb: number;
}

export interface BackupInfoDto {
  id: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  status: 'SUCCESS' | 'RESTORED';
}

export interface DiagnosticsReportDto {
  generatedAt: string;
  overallStatus: 'HEALTHY' | 'DEGRADED';
  subsystemsChecked: number;
  passedChecks: number;
  failedChecks: number;
  details: string[];
}
