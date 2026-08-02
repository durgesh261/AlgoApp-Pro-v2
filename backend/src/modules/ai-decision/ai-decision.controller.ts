import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { explainDecisionSchema } from '@algoapp/shared';
import { AIDecisionCenterService } from './services/aiDecisionCenter.service.js';

export const explainDecision = async (req: Request, res: Response): Promise<void> => {
  const validated = explainDecisionSchema.parse(req.body);
  const explanation = await AIDecisionCenterService.explainDecision(validated.decisionId);

  const response: ApiResponse<typeof explanation> = {
    success: true,
    data: explanation,
    meta: {
      requestId: (req as any).correlationId || 'req-explain-decision',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
