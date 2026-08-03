import { ErrorLogEntryDto } from '@algoapp/shared';

let errorLogsStore: ErrorLogEntryDto[] = [
  {
    id: 'ERR-1',
    category: 'WEBHOOK',
    message: 'TradingView Webhook signature verified successfully.',
    severity: 'LOW',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ERR-2',
    category: 'EXCHANGE',
    message: 'Delta Exchange API rate limit budget check passed (180 req/min available).',
    severity: 'LOW',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
];

export class ErrorCenterService {
  public static async logError(
    category: ErrorLogEntryDto['category'],
    message: string,
    severity: ErrorLogEntryDto['severity'] = 'MEDIUM',
    stackTrace?: string
  ): Promise<ErrorLogEntryDto> {
    const err: ErrorLogEntryDto = {
      id: `ERR-${Date.now()}`,
      category,
      message,
      severity,
      stackTrace,
      timestamp: new Date().toISOString(),
    };

    errorLogsStore.unshift(err);
    return err;
  }

  public async getErrors(category?: string, severity?: string): Promise<ErrorLogEntryDto[]> {
    let result = errorLogsStore;
    if (category && category !== 'ALL') {
      result = result.filter((e) => e.category === category);
    }
    if (severity && severity !== 'ALL') {
      result = result.filter((e) => e.severity === severity);
    }
    return result;
  }

  public async exportErrorsCsv(): Promise<string> {
    const errors = await this.getErrors();
    const header = 'ErrorID,Category,Severity,Message,Timestamp\n';
    const rows = errors.map(
      (e) => `${e.id},${e.category},${e.severity},"${e.message.replace(/"/g, '""')}",${e.timestamp}`
    );
    return header + rows.join('\n');
  }
}
