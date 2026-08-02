import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ErrorCode, ApiErrorResponse, getIsoUtcTimestamp } from '@algoapp/shared';
import { logger } from '../logger/index.js';
import { config } from '../config/index.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';

  logger.error({
    err,
    requestId,
    url: req.originalUrl,
    method: req.method,
  }, 'Unhandled request error');

  if (err instanceof ZodError) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Request parameter validation failed',
        requestId,
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      },
      meta: {
        requestId,
        timestamp: getIsoUtcTimestamp(),
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env['NODE_ENV'] === 'production'
        ? 'An internal server error occurred'
        : err.message,
      requestId,
    },
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };

  res.status(500).json(errorResponse);
}
