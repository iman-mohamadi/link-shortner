import { env } from '../config/env';
/**
 * Guards admin-only routes. Requires a valid JWT *and* a phone number present
 * in the ADMIN_PHONES allowlist. Without this, the promote/stats endpoints are
 * world-writable (anyone could grant themselves Pro).
 */
export const requireAdmin = async (request, reply) => {
    try {
        await request.jwtVerify();
    }
    catch {
        return reply.status(401).send({ error: 'Unauthorized. Please log in.' });
    }
    const user = request.user;
    if (env.adminPhones.length === 0) {
        request.log.error('Admin route hit but ADMIN_PHONES is not configured — denying.');
        return reply.status(403).send({ error: 'Admin access is not configured.' });
    }
    if (!user?.phone || !env.adminPhones.includes(user.phone)) {
        return reply.status(403).send({ error: 'Admin access required.' });
    }
};
//# sourceMappingURL=admin.middleware.js.map