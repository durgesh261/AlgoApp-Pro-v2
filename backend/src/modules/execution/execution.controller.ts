import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { submitExecutionSchema } from '@algoapp/shared';
import { ExecutionEngineService } from './services/executionEngine.service.js';

export const submitExecution = async (req: Request, res: Response): Promise<void> => {
  const validated = submitExecutionSchema.parse(req.body);
  const outcome = await ExecutionEngineService.submitExecution(validated);

  const response: ApiResponse<typeof outcome> = {
    success: true,
    data: outcome,
    meta: {
      requestId: (req as any).correlationId || 'req-submit-execution',
      timestamp: new Date().toISOString(),
    },
  };
  res.status(201).json(response);
};

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  const sessions = await ExecutionEngineService.getSessions();

  const response: ApiResponse<typeof sessions> = {
    success: true,
    data: sessions,
    meta: {
      requestId: (req as any).correlationId || 'req-execution-sessions',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getRequests = async (req: Request, res: Response): Promise<void> => {
  const requests = await ExecutionEngineService.getRequests();

  const response: ApiResponse<typeof requests> = {
    success: true,
    data: requests,
    meta: {
      requestId: (req as any).correlationId || 'req-execution-requests',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getResults = async (req: Request, res: Response): Promise<void> => {
  const results = await ExecutionEngineService.getResults();

  const response: ApiResponse<typeof results> = {
    success: true,
    data: results,
    meta: {
      requestId: (req as any).correlationId || 'req-execution-results',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getJournal = async (req: Request, res: Response): Promise<void> => {
  const journal = await ExecutionEngineService.getJournal();

  const response: ApiResponse<typeof journal> = {
    success: true,
    data: journal,
    meta: {
      requestId: (req as any).correlationId || 'req-execution-journal',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
