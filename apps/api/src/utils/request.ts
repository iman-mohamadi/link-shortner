import { FastifyRequest } from 'fastify';

/**
 * Resolves the real client IP. Behind a proxy (Nginx/Cloudflare) the original
 * IP arrives in `x-forwarded-for` as a comma-separated chain — the first entry
 * is the client. Passing the whole chain to geoip/rate-limiters is a bug, so we
 * always extract the leftmost address.
 */
export function getClientIp(request: FastifyRequest): string {
  const xff = request.headers['x-forwarded-for'];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  if (typeof raw === 'string' && raw.length > 0) {
    const first = raw.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.ip;
}
