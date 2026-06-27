import { z } from 'zod';

export const createLinkSchema = z.object({
  originalUrl: z.string().url('Please provide a valid URL'),
  // Optional: Only allowed for Pro users
  customSlug: z.string().min(3).max(20).optional(),
  password: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>