import { z } from 'zod';
export declare const sendOtpSchema: z.ZodObject<{
    phone: z.ZodString;
}, z.core.$strip>;
export declare const verifyOtpSchema: z.ZodObject<{
    phone: z.ZodString;
    code: z.ZodString;
}, z.core.$strip>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
//# sourceMappingURL=auth.schema.d.ts.map