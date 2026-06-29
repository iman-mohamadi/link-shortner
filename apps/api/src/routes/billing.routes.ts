import { FastifyInstance } from 'fastify';
import { authenticate } from '../middlewares/auth.middleware';
import { createCheckoutHandler } from '../controllers/billing.controller';

export async function billingRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  fastify.post('/checkout', createCheckoutHandler);
}
