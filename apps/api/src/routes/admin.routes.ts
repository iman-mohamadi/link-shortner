import { FastifyInstance } from 'fastify';
import { promoteUserHandler } from '../controllers/admin.controller';

export async function adminRoutes(fastify: FastifyInstance) {
  // Note: In a production app, you would add an admin middleware guard here
  // so regular users can't hit this endpoint.
  fastify.patch('/promote/:phone', promoteUserHandler);
}