import { FastifyInstance } from 'fastify';
import { createLinkHandler } from '../controllers/link.controller';
import { redirectHandler } from '../controllers/redirect.controller';
import { createLinkSchema } from '../schemas/link.schema';
import { authenticate } from '../middlewares/auth.middleware';

export async function linkRoutes(fastify: FastifyInstance) {
  // Protected Route: The user must pass the `authenticate` guard to create a link
  fastify.post(
    '/create', 
    { 
      onRequest: [authenticate], // This runs BEFORE the controller
      schema: { body: createLinkSchema } 
    }, 
    createLinkHandler
  );
}

export async function publicRoutes(fastify: FastifyInstance) {
  // Public Route: High-speed redirect (No auth required)
  fastify.get('/:slug', redirectHandler);
}