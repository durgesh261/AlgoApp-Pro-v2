export type LogCategory = 'APP' | 'EXECUTION' | 'AUDIT' | 'SECURITY';

export class StructuredLogger {
  public static log(category: LogCategory, message: string, details?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      category,
      message,
      ...(details ? { details } : {}),
    };
    console.log(JSON.stringify(payload));
  }

  public static info(message: string, details?: Record<string, unknown>): void {
    this.log('APP', message, details);
  }

  public static security(message: string, details?: Record<string, unknown>): void {
    this.log('SECURITY', message, details);
  }

  public static audit(message: string, details?: Record<string, unknown>): void {
    this.log('AUDIT', message, details);
  }

  public static execution(message: string, details?: Record<string, unknown>): void {
    this.log('EXECUTION', message, details);
  }
}
