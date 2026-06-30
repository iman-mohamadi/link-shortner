import { authenticate } from '../middlewares/auth.middleware';
import { createCheckoutHandler } from '../controllers/billing.controller';
export async function billingRoutes(fastify) {
    fastify.addHook('onRequest', authenticate);
    fastify.post('/checkout', createCheckoutHandler);
}
//# sourceMappingURL=billing.routes.js.map