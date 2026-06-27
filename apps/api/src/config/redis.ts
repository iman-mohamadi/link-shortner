import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to your local Redis instance
export const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

redis.on('connect', () => {
  console.log('🛑 Redis: Connected and ready for OTP storage');
});

redis.on('error', (err) => {
  console.error('Redis Connection Error:', err);
});