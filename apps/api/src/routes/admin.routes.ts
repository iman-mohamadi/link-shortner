import { FastifyInstance } from 'fastify';
import { promoteUserHandler, getUserStatsHandler } from '../controllers/admin.controller';

export async function adminRoutes(fastify: FastifyInstance) {
  // TODO: Add admin middleware guard in production
  // fastify.addHook('onRequest', adminGuard);

  fastify.patch('/promote/:phone', promoteUserHandler);
  fastify.get('/stats', getUserStatsHandler);
}