import { DatabaseDiagnosticsDto } from '@algoapp/shared';

export class DatabaseInspectorService {
  public async getDiagnostics(): Promise<DatabaseDiagnosticsDto> {
    const tableDetails = [
      { table: 'strategy_profiles', count: 2 },
      { table: 'trade_ledger', count: 18 },
      { table: 'challenge_sessions', count: 1 },
      { table: 'wallet_states', count: 1 },
      { table: 'notifications', count: 14 },
      { table: 'trade_audit_timelines', count: 18 },
      { table: 'reconciliation_logs', count: 6 },
      { table: 'optimization_runs', count: 12 },
      { table: 'system_error_logs', count: 2 },
      { table: 'system_backup_records', count: 1 },
    ];

    const totalRecords = tableDetails.reduce((sum, t) => sum + t.count, 0);

    return {
      tablesCount: tableDetails.length,
      totalRecords,
      tableDetails,
      slowQueriesCount: 0,
      storageSizeMb: 4.8,
    };
  }
}
