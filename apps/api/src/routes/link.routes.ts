import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createLinkHandler } from '../controllers/link.controller';
import { redirectHandler } from '../controllers/redirect.controller';
import { createLinkSchema } from '../schemas/link.schema';
import { authenticate } from '../middlewares/auth.middleware';

export async function linkRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Protected Route: the user must pass the `authenticate` guard to create a link
  app.post(
    '/create',
    {
      onRequest: [authenticate], // runs BEFORE the controller
      schema: { body: createLinkSchema },
    },
    createLinkHandler
  );
}

export async function publicRoutes(fastify: FastifyInstance) {
  // Public Route: High-speed redirect (No auth required)
  fastify.get('/:slug', redirectHandler);
}