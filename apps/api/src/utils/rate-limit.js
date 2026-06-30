import { redis } from '../config/redis';
/**
 * Fixed-window rate limiter backed by Redis. Keeps the app dependency-free
 * while giving us per-phone / per-IP throttling for sensitive endpoints.
 */
export async function rateLimit(bucket, limit, windowSeconds) {
    const key = `rl:${bucket}`;
    const count = await redis.incr(key);
    // Set the expiry only on the first hit so the window is fixed.
    if (count === 1) {
        await redis.expire(key, windowSeconds);
    }
    let ttl = await redis.ttl(key);
    if (ttl < 0) {
        // Key exists without a TTL (e.g. process crashed between INCR/EXPIRE) — heal it.
        await redis.expire(key, windowSeconds);
        ttl = windowSeconds;
    }
    return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetSeconds: ttl,
    };
}
//# sourceMappingURL=rate-limit.js.map