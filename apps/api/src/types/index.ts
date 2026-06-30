import { z } from 'zod';

// Link creation schema
export const CreateLinkSchema = z.object({
  original_url: z.string().url('Invalid URL'),
  custom_alias: z.string().min(3).max(50).optional(),
  expires_at: z.date().optional(),
  password: z.string().optional(),
  max_clicks: z.number().int().positive().optional(),
});

export type CreateLinkType = z.infer<typeof CreateLinkSchema>;

// OTP schema
export const SendOTPSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'Invalid Iranian phone number'),
});

export type SendOTPType = z.infer<typeof SendOTPSchema>;

// Verify OTP schema
export const VerifyOTPSchema = z.object({
  phone: z.string(),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export type VerifyOTPType = z.infer<typeof VerifyOTPSchema>;
