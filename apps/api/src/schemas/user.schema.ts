import { z } from 'zod';

export const updateLinkSchema = z.object({
  originalUrl: z.string().url().max(2000).optional(),
  // Slug rules match link creation: lowercase letters, numbers, hyphens, 3–50 chars.
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only').min(3).max(50).optional(),
  // `null` clears the field; a string sets it; omitted leaves it untouched.
  password: z.string().min(1).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
