import { z } from 'zod';

export const sendOtpSchema = z.object({
  // Validates Iranian mobile numbers (starts with 09 and has 11 digits)
  phone: z.string().regex(/^09\d{9}$/, 'Invalid Iranian phone number format'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'Invalid Iranian phone number format'),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
});

// Create types from the schemas to use in our routes
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;