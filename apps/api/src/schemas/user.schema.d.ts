import { z } from 'zod';
export declare const updateLinkSchema: z.ZodObject<{
    originalUrl: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    expiresAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
//# sourceMappingURL=user.schema.d.ts.map