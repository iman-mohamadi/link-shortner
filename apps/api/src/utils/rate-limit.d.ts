export interface RateLimitResult {
    allowed: boolean;
    /** Requests still permitted in the current window. */
    remaining: number;
    /** Seconds until the window resets. */
    resetSeconds: number;
}
/**
 * Fixed-window rate limiter backed by Redis. Keeps the app dependency-free
 * while giving us per-phone / per-IP throttling for sensitive endpoints.
 */
export declare function rateLimit(bucket: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
//# sourceMappingURL=rate-limit.d.ts.map