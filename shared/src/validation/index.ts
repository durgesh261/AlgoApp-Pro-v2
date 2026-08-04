import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const UpdateSystemSettingsSchema = z.object({
  defaultCurrency: z.string().min(3).max(5).default('USD'),
  timezone: z.string().default('UTC'),
  maxStaleSignalSeconds: z.number().int().min(5).max(300).default(60),
  isKillSwitchActive: z.boolean().default(false),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type UpdateSystemSettingsInput = z.infer<typeof UpdateSystemSettingsSchema>;
