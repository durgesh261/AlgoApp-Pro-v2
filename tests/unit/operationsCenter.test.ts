import { describe, it, expect } from 'vitest';
import { NocTelemetryService } from '../../backend/src/modules/operations-center/services/nocTelemetry.service';
import { ErrorCenterService } from '../../backend/src/modules/operations-center/services/errorCenter.service';
import { DatabaseInspectorService } from '../../backend/src/modules/operations-center/services/databaseInspector.service';
import { BackupRecoveryManagerService } from '../../backend/src/modules/operations-center/services/backupRecoveryManager.service';
import { DiagnosticsReportGeneratorService } from '../../backend/src/modules/operations-center/services/diagnosticsReportGenerator.service';

describe('Professional Operations Center (NOC) Test Suite', () => {
  const errorService = new ErrorCenterService();
  const dbInspector = new DatabaseInspectorService();
  const backupManager = new BackupRecoveryManagerService();

  it('1. NocTelemetryService - returns real-time health for all 15 core services and system metrics', async () => {
    const services = await NocTelemetryService.getServiceHealthList();
    const metrics = await NocTelemetryService.getSystemMetrics();

    expect(services).toHaveLength(15);
    expect(services.every((s) => s.health === 'HEALTHY')).toBe(true);
    expect(metrics).toHaveProperty('eventsPerSecond');
    expect(metrics.memoryUsageMb).toBeGreaterThan(0);
  });

  it('2. ErrorCenterService - logs errors, filters by category, and exports CSV', async () => {
    await ErrorCenterService.logError('PIPELINE', 'Pipeline stage latency warning', 'MEDIUM');

    const allErrors = await errorService.getErrors();
    expect(allErrors.length).toBeGreaterThan(0);

    const pipelineErrors = await errorService.getErrors('PIPELINE');
    expect(pipelineErrors.every((e) => e.category === 'PIPELINE')).toBe(true);

    const csv = await errorService.exportErrorsCsv();
    expect(csv).toContain('ErrorID,Category,Severity');
  });

  it('3. DatabaseInspectorService - returns table record counts and storage diagnostics', async () => {
    const diagnostics = await dbInspector.getDiagnostics();

    expect(diagnostics).toBeDefined();
    expect(diagnostics.tablesCount).toBeGreaterThan(0);
    expect(diagnostics.storageSizeMb).toBeGreaterThan(0);
  });

  it('4. BackupRecoveryManagerService - creates backup and simulates restore', async () => {
    const backup = await backupManager.createBackup();

    expect(backup).toHaveProperty('id');
    expect(backup.filename).toContain('algoapp_config_backup');

    const restoreRes = await backupManager.simulateRestore(backup.id);
    expect(restoreRes.success).toBe(true);
    expect(restoreRes.message).toContain('completed cleanly');
  });

  it('5. DiagnosticsReportGeneratorService - generates one-click health report for all 15 subsystems', async () => {
    const report = await DiagnosticsReportGeneratorService.generateReport();

    expect(report.overallStatus).toBe('HEALTHY');
    expect(report.subsystemsChecked).toBe(15);
    expect(report.passedChecks).toBe(15);
  });
});
