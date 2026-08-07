import { Request, Response } from 'express';
import { SystemStatus, SystemHealthStatus, ApiResponse, getIsoUtcTimestamp } from '@algoapp/shared';
import { config } from '../../config/index.js';
import { prisma } from '../../db.js';

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
  public static async hardReset(req: Request, res: Response): Promise<void> {
    const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';

    try {
      const tableNames = await prisma.$queryRaw<Array<{name: string}>>`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations'`;
      for (const {name} of tableNames) {
        await prisma.$executeRawUnsafe(`DELETE FROM "${name}"`);
      }
      
      const response: ApiResponse<{ message: string; timestamp: string }> = {
        success: true,
        data: {
          message: 'All application data has been successfully wiped.',
          timestamp: getIsoUtcTimestamp(),
        },
        meta: {
          requestId,
          timestamp: getIsoUtcTimestamp(),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const errorResponse = {
        success: false as const,
        error: {
          code: 'SYSTEM_ERROR',
          message: 'Failed to reset database.',
          requestId,
          details: [{ message: error.message }],
        },
        meta: {
          requestId,
          timestamp: getIsoUtcTimestamp(),
        },
      };

      res.status(500).json(errorResponse);
    }
  }
}
