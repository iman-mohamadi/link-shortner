import { redis } from '../config/redis';

/**
 * Generates a 6-digit code and saves it to Redis with a 2-minute expiration.
 * Key format: "otp:phone_number"
 */
export const generateAndStoreOTP = async (phone: string): Promise<string> => {
  // Generate a random 6-digit number
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Save to Redis: Key, Value, 'EX' (Expiration), Seconds (120s = 2 mins)
  await redis.set(`otp:${phone}`, code, 'EX', 120);
  
  return code;
};

/**
 * Validates the code provided by the user against the one in Redis.
 */
export const verifyOTP = async (phone: string, code: string): Promise<boolean> => {
  const storedCode = await redis.get(`otp:${phone}`);
  return storedCode === code;
};