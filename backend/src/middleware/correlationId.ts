import { Request, Response, NextFunction } from 'express';
import { cryptoNativeUuid } from '../utils/uuid.js';
import { config } from '../config/index.js';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingHeader = req.header(config.correlationHeader);
  const correlationId = existingHeader && existingHeader.trim().length > 0
    ? existingHeader
    : cryptoNativeUuid();

  req.headers[config.correlationHeader.toLowerCase()] = correlationId;
  res.setHeader(config.correlationHeader, correlationId);
  next();
}
