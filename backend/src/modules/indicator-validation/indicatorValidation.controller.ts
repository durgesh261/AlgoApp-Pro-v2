import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { IndicatorValidationService } from './services/indicatorValidation.service.js';

const validationService = new IndicatorValidationService();

export const runValidation = async (req: Request, res: Response): Promise<void> => {
  const result = await validationService.runValidation(req.body);

  const response: ApiResponse<typeof result> = {
    success: true,
    data: result,
    meta: {
      requestId: (req as any).correlationId || 'req-indicator-validation-run',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  const history = await validationService.getHistory();

  const response: ApiResponse<typeof history> = {
    success: true,
    data: history,
    meta: {
      requestId: (req as any).correlationId || 'req-indicator-validation-history',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const getReportById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const report = await validationService.getReportById(id || '');

  const response: ApiResponse<typeof report> = {
    success: true,
    data: report,
    meta: {
      requestId: (req as any).correlationId || 'req-indicator-validation-report',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const exportCsv = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const csv = await validationService.exportValidationCsv(id || '');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="indicator_validation_${id || 'report'}.csv"`);
  res.status(200).send(csv);
};
