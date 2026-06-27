import { z } from 'zod';

// Strictly snake_case for backend payloads
export const CreateLinkSchema = z.object({
  original_url: z.string().url(),
  custom_alias: z.string().optional(),
  expires_at: z.string().datetime().optional(),
  password: z.string().optional(),
  metadata: z.any().optional(),
});

// Infer the TypeScript type from the schema
export type CreateLinkType = z.infer<typeof CreateLinkSchema>;

// Example Auth Schema
export const LoginSchema = z.object({
  phone_number: z.string(),
  verification_code: z.string()
});

export type LoginType = z.infer<typeof LoginSchema>;