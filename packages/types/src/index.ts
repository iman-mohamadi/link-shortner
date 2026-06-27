import { Type, Static } from '@sinclair/typebox';

// Strictly snake_case for backend payloads
export const CreateLinkSchema = Type.Object({
  original_url: Type.String({ format: 'uri' }),
  custom_alias: Type.Optional(Type.String()),
  expires_at: Type.Optional(Type.String({ format: 'date-time' })),
  password: Type.Optional(Type.String()),
  metadata: Type.Optional(Type.Any()),
});

// Infer the TypeScript type from the schema
export type CreateLinkType = Static<typeof CreateLinkSchema>;

// Example Auth Schema
export const LoginSchema = Type.Object({
  phone_number: Type.String(),
  verification_code: Type.String()
});

export type LoginType = Static<typeof LoginSchema>;