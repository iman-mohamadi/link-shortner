import { z } from 'zod';

export const updateLinkSchema = z.object({
  originalUrl: z.string().url().optional(),
  slug: z.string().min(3).max(20).optional(),
  password: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;