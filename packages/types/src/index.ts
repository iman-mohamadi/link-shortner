import { z } from 'zod';

// Strictly snake_case for backend payloads.
// Title/description/favicon are fetched server-side from the destination, so
// the client never sends metadata.
export const CreateLinkSchema = z.object({
  original_url: z.string().url(),
  custom_alias: z.string().optional(),
  expires_at: z.string().datetime().optional(),
  password: z.string().optional(),
});

// Infer the TypeScript type from the schema
export type CreateLinkType = z.infer<typeof CreateLinkSchema>;