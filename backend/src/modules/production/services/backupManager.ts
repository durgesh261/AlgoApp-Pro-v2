import { BackupStatusDto } from '@algoapp/shared';

let lastBackupAt = new Date().toISOString();

export class BackupManager {
  public static async getBackupStatus(): Promise<BackupStatusDto> {
    return {
      databaseBackupAt: lastBackupAt,
      journalBackupAt: lastBackupAt,
      replayBackupAt: lastBackupAt,
      configBackupAt: lastBackupAt,
      totalBackupSizeMb: 42.5,
      status: 'SUCCESS',
    };
  }

  public static async triggerBackup(): Promise<BackupStatusDto> {
    lastBackupAt = new Date().toISOString();
    return this.getBackupStatus();
  }
}
