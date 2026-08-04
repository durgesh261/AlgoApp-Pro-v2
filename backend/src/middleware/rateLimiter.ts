import { Request, Response, NextFunction } from 'express';

interface RequestBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RequestBucket>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 120;   // 120 requests per minute limit

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const bucket = buckets.get(clientIp) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }

  bucket.count += 1;
  buckets.set(clientIp, bucket);

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - bucket.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));

  if (bucket.count > MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS: Rate limit exceeded. Please try again later.',
      meta: {
        requestId: (req as any).correlationId || 'req-ratelimited',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next();
};
