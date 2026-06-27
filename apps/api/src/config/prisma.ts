import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env;

// Construct the URL
const databaseUrl = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?schema=public`;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!globalForPrisma.prisma) {
  // 1. Create a native PostgreSQL connection pool
  const pool = new Pool({ connectionString: databaseUrl });
  
  // 2. Wrap the pool in the Prisma Adapter
  const adapter = new PrismaPg(pool);
  
  // 3. Instantiate Prisma using the modern adapter pattern
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;