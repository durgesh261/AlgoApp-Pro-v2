export class DeltaRetryPolicy {
  public static async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 200
  ): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await fn();
      } catch (err) {
        attempt += 1;
        if (attempt >= maxRetries) {
          throw err;
        }
        const jitter = Math.random() * 50;
        const delay = Math.pow(2, attempt) * baseDelayMs + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }
}
