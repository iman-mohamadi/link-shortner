import { promoteUserHandler, getUserStatsHandler } from '../controllers/admin.controller';
import { requireAdmin } from '../middlewares/admin.middleware';
export async function adminRoutes(fastify) {
    // Every admin route requires a valid JWT whose phone is in the allowlist.
    fastify.addHook('onRequest', requireAdmin);
    fastify.patch('/promote/:phone', promoteUserHandler);
    fastify.get('/stats', getUserStatsHandler);
}
//# sourceMappingURL=admin.routes.js.map