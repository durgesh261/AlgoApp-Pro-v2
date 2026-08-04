import { z } from 'zod';

export const explainDecisionSchema = z.object({
  decisionId: z.string().min(1, 'Decision ID is required'),
});

export type ExplainDecisionInput = z.infer<typeof explainDecisionSchema>;
