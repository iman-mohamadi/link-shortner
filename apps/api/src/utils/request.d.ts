import { FastifyRequest } from 'fastify';
/**
 * Resolves the real client IP. Behind a proxy (Nginx/Cloudflare) the original
 * IP arrives in `x-forwarded-for` as a comma-separated chain — the first entry
 * is the client. Passing the whole chain to geoip/rate-limiters is a bug, so we
 * always extract the leftmost address.
 */
export declare function getClientIp(request: FastifyRequest): string;
//# sourceMappingURL=request.d.ts.map