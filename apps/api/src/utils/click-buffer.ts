import { prisma } from '../config/prisma';
import { redis } from '../config/redis';

const FLUSH_INTERVAL = 10000; // 10 seconds

// Called by the redirect controller on every click
export const incrementClickCount = async (linkId: string) => {
  const key = `clicks:${linkId}`;
  await redis.incr(key);
};

// Starts the background job to flush Redis to Postgres
export const startClickBufferWorker = () => {
  setInterval(async () => {
    try {
      // 1. Find all active click keys in Redis
      const keys = await redis.keys('clicks:*');
      if (keys.length === 0) return;

      // 2. Fetch all current counts
      const pipeline = redis.pipeline();
      keys.forEach((key) => pipeline.get(key));
      
      const results = await pipeline.exec();
      if (!results) return;

      const updates: any[] = [];
      const deletePipeline = redis.pipeline();

      // 3. Prepare Prisma database updates
      results.forEach((result, index) => {
        const [err, countStr] = result as [Error | null, string | null];
        if (!err && countStr) {
          const count = parseInt(countStr, 10);
          const linkId = keys[index].split(':')[1];
          
          if (count > 0) {
            updates.push(
              prisma.link.update({
                where: { id: linkId },
                data: { clicks: { increment: count } },
              })
            );
            // Queue this key for deletion once we know we've processed it
            deletePipeline.del(keys[index]);
          }
        }
      });

      // 4. Execute all database writes in a single, fast transaction
      if (updates.length > 0) {
        await prisma.$transaction(updates);
        await deletePipeline.exec();
        console.log(`⚡ Flushed clicks for ${updates.length} links to database.`);
      }
    } catch (error) {
      console.error('Failed to flush click buffer to database:', error);
    }
  }, FLUSH_INTERVAL);
};