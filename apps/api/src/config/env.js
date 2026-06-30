import dotenv from 'dotenv';
dotenv.config();
const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProd = nodeEnv === 'production';
/**
 * Reads a required env var. In production a missing value throws on boot
 * (fail fast). In development a clearly-marked fallback is allowed so the app
 * still runs locally, but we warn loudly so it never ships by accident.
 */
function required(name, devFallback) {
    const value = process.env[name];
    if (value && value.trim().length > 0)
        return value;
    if (isProd) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    console.warn(`⚠️  ${name} is not set — using an insecure development fallback. Do NOT use in production.`);
    return devFallback;
}
function list(name, fallback = '') {
    return (process.env[name] ?? fallback)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}
const port = Number(process.env.PORT) || 5000;
export const env = {
    nodeEnv,
    isProd,
    isDev: !isProd,
    port,
    /** Secret used to sign JWTs. Required in production. */
    jwtSecret: required('JWT_SECRET', 'dev-only-insecure-secret-change-me'),
    /** Public origin that serves slug redirects + QR codes (no trailing slash). */
    publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`).replace(/\/+$/, ''),
    /** Browser origins allowed by CORS (comma separated). */
    webOrigins: list('WEB_ORIGIN', 'http://localhost:3000'),
    /** Phone numbers permitted to use admin endpoints (comma separated). */
    adminPhones: list('ADMIN_PHONES'),
    redisUrl: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
};
//# sourceMappingURL=env.js.map