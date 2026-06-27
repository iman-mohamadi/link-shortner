import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform, ZodTypeProvider } from 'fastify-type-provider-zod';
import { authRoutes } from './routes/auth.routes';
import { linkRoutes, publicRoutes } from './routes/link.routes';
import { userRoutes } from './routes/user.routes';
import { adminRoutes } from './routes/admin.routes';
import { startClickBufferWorker } from './utils/click-buffer';

dotenv.config();

// 2. Add .withTypeProvider<ZodTypeProvider>()
const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
}).withTypeProvider<ZodTypeProvider>();

// 3. Set the Zod Compilers
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(cors, { origin: true });
fastify.register(jwt, { secret: process.env.JWT_SECRET || 'raya-secret' });

// Register Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(linkRoutes, { prefix: '/api/links' });
fastify.register(userRoutes, { prefix: '/api/user' });
fastify.register(adminRoutes, { prefix: '/api/admin' });
fastify.register(publicRoutes); 


const start = async () => {
  try {
    const port = Number(process.env.PORT) || 5000;
    
    startClickBufferWorker(); 

    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Raya API is gliding on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();