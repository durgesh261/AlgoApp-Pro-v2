import { Request, Response } from 'express';
import { SystemStatus, SystemHealthStatus, ApiResponse, getIsoUtcTimestamp } from '@algoapp/shared';
import { config } from '../../config/index.js';

const startTime = Date.now();

export class SystemController {
  public static getLiveness(req: Request, res: Response): void {
    const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';

    const healthStatus: SystemHealthStatus = {
      status: SystemStatus.HEALTHY,
      version: '2.0.0',
      timestamp: getIsoUtcTimestamp(),
      database: SystemStatus.HEALTHY,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    };

    const response: ApiResponse<SystemHealthStatus> = {
      success: true,
      data: healthStatus,
      meta: {
        requestId,
        timestamp: getIsoUtcTimestamp(),
      },
    };

    res.status(200).json(response);
  }

  public static getReadiness(req: Request, res: Response): void {
    const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';

    const response: ApiResponse<{ ready: boolean; timestamp: string }> = {
      success: true,
      data: {
        ready: true,
        timestamp: getIsoUtcTimestamp(),
      },
      meta: {
        requestId,
        timestamp: getIsoUtcTimestamp(),
      },
    };

    res.status(200).json(response);
  }
}
