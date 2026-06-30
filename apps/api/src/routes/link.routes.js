import { createLinkHandler } from '../controllers/link.controller';
import { redirectHandler, unlockHandler } from '../controllers/redirect.controller';
import { createLinkSchema } from '../schemas/link.schema';
import { authenticate } from '../middlewares/auth.middleware';
export async function linkRoutes(fastify) {
    const app = fastify.withTypeProvider();
    app.post('/create', {
        onRequest: [authenticate],
        schema: { body: createLinkSchema },
    }, createLinkHandler);
}
export async function publicRoutes(fastify) {
    // High-speed redirect — no auth.
    fastify.get('/:slug', redirectHandler);
    // Password verification for protected links (called by the /p/[slug] web page).
    fastify.post('/:slug/unlock', unlockHandler);
}
//# sourceMappingURL=link.routes.js.map