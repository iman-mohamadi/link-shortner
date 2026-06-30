import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from './config/env';
import { authRoutes } from './routes/auth.routes';
import { linkRoutes, publicRoutes } from './routes/link.routes';
import { userRoutes } from './routes/user.routes';
import { adminRoutes } from './routes/admin.routes';
import { billingRoutes } from './routes/billing.routes';
import { startClickBufferWorker, stopClickBufferWorker } from './utils/click-buffer';
import { redis } from './config/redis';
import { prisma } from './config/prisma';
console.log(env);
const fastify = Fastify({
    trustProxy: true, // honor x-forwarded-* from our reverse proxy
    logger: env.isDev
        ? { transport: { target: 'pino-pretty' } }
        : { level: 'info' },
}).withTypeProvider();
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);
// Restrict CORS to known web origins instead of reflecting any origin.
fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
});
fastify.register(jwt, { secret: env.jwtSecret });
// Baseline security headers (no extra dependency required).
fastify.addHook('onSend', async (_request, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'no-referrer');
    reply.header('X-DNS-Prefetch-Control', 'off');
    return payload;
});
// Lightweight liveness/readiness probe.
fastify.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));
// Register Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(linkRoutes, { prefix: '/api/links' });
fastify.register(userRoutes, { prefix: '/api/user' });
fastify.register(adminRoutes, { prefix: '/api/admin' });
fastify.register(billingRoutes, { prefix: '/api/billing' });
fastify.register(publicRoutes);
let shuttingDown = false;
const shutdown = async (signal) => {
    if (shuttingDown)
        return;
    shuttingDown = true;
    fastify.log.info(`Received ${signal}, shutting down gracefully…`);
    try {
        await stopClickBufferWorker(); // flush buffered clicks one last time
        await fastify.close();
        await redis.quit();
        await prisma.$disconnect();
        process.exit(0);
    }
    catch (err) {
        fastify.log.error(err, 'Error during shutdown');
        process.exit(1);
    }
};
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
const start = async () => {
    try {
        startClickBufferWorker();
        await fastify.listen({ port: env.port, host: '0.0.0.0' });
        fastify.log.info(`🚀 Raya API is gliding on ${env.publicBaseUrl}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map