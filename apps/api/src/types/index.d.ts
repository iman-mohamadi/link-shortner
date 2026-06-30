import { z } from 'zod';
export declare const CreateLinkSchema: z.ZodObject<{
    original_url: z.ZodString;
    custom_alias: z.ZodOptional<z.ZodString>;
    expires_at: z.ZodOptional<z.ZodDate>;
    password: z.ZodOptional<z.ZodString>;
    max_clicks: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateLinkType = z.infer<typeof CreateLinkSchema>;
export declare const SendOTPSchema: z.ZodObject<{
    phone: z.ZodString;
}, z.core.$strip>;
export type SendOTPType = z.infer<typeof SendOTPSchema>;
export declare const VerifyOTPSchema: z.ZodObject<{
    phone: z.ZodString;
    code: z.ZodString;
}, z.core.$strip>;
export type VerifyOTPType = z.infer<typeof VerifyOTPSchema>;
//# sourceMappingURL=index.d.ts.map