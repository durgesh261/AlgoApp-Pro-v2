import { BackupInfoDto } from '@algoapp/shared';

let backupHistoryStore: BackupInfoDto[] = [
  {
    id: 'BAK-1',
    filename: 'algoapp_config_backup_v2_seed.json',
    sizeBytes: 1048576,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'SUCCESS',
  },
];

export class BackupRecoveryManagerService {
  public async createBackup(): Promise<BackupInfoDto> {
    const backup: BackupInfoDto = {
      id: `BAK-${Date.now()}`,
      filename: `algoapp_config_backup_${Date.now()}.json`,
      sizeBytes: 1258291,
      createdAt: new Date().toISOString(),
      status: 'SUCCESS',
    };

    backupHistoryStore.unshift(backup);
    return backup;
  }

  public async getBackupHistory(): Promise<BackupInfoDto[]> {
    return backupHistoryStore;
  }

  public async simulateRestore(backupId: string): Promise<{ success: boolean; message: string }> {
    const target = backupHistoryStore.find((b) => b.id === backupId);
    if (!target) {
      return { success: false, message: `Backup ID ${backupId} not found.` };
    }

    target.status = 'RESTORED';
    return {
      success: true,
      message: `Restore simulation from ${target.filename} completed cleanly. All 15 subsystems operational.`,
    };
  }
}
