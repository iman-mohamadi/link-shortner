import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createLinkHandler } from '../controllers/link.controller';
import { redirectHandler, unlockHandler } from '../controllers/redirect.controller';
import { createLinkSchema } from '../schemas/link.schema';
import { authenticate } from '../middlewares/auth.middleware';

export async function linkRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/create',
    {
      onRequest: [authenticate],
      schema: { body: createLinkSchema },
    },
    createLinkHandler
  );
}

export async function publicRoutes(fastify: FastifyInstance) {
  // High-speed redirect — no auth.
  fastify.get('/:slug', redirectHandler);

  // Password verification for protected links (called by the /p/[slug] web page).
  fastify.post('/:slug/unlock', unlockHandler);
}