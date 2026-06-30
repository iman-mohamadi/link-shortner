import { FastifyReply, FastifyRequest } from 'fastify';
/**
 * Guards admin-only routes. Requires a valid JWT *and* a phone number present
 * in the ADMIN_PHONES allowlist. Without this, the promote/stats endpoints are
 * world-writable (anyone could grant themselves Pro).
 */
export declare const requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
//# sourceMappingURL=admin.middleware.d.ts.map