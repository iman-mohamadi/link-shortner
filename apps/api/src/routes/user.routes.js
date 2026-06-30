import { getMyLinksHandler, updateLinkHandler, deleteLinkHandler, getLinkQRHandler, getLinkStatsHandler, } from '../controllers/user.controller';
import { getUserProfileHandler } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { updateLinkSchema } from '../schemas/user.schema';
export async function userRoutes(fastify) {
    // Add the guard to the entire scope of these routes
    fastify.addHook('onRequest', authenticate);
    fastify.get('/me', getUserProfileHandler);
    fastify.get('/me/links', getMyLinksHandler);
    fastify.patch('/links/:id', { schema: { body: updateLinkSchema } }, updateLinkHandler);
    fastify.delete('/links/:id', deleteLinkHandler);
    fastify.get('/links/:id/qr', getLinkQRHandler);
    fastify.get('/links/:id/stats', getLinkStatsHandler);
}
//# sourceMappingURL=user.routes.js.map