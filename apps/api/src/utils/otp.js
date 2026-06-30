import { redis } from '../config/redis';
const OTP_TTL = 120; // seconds a code stays valid
const MAX_ATTEMPTS = 5; // verify attempts before the code is burned
const RESEND_COOLDOWN = 60; // seconds between code requests
const otpKey = (phone) => `otp:${phone}`;
const attemptsKey = (phone) => `otp:attempts:${phone}`;
const cooldownKey = (phone) => `otp:cooldown:${phone}`;
/** Remaining cooldown (seconds) before another code may be requested. */
export const getResendCooldown = async (phone) => {
    const ttl = await redis.ttl(cooldownKey(phone));
    return ttl > 0 ? ttl : 0;
};
/**
 * Generates a 6-digit code, stores it for OTP_TTL, resets the attempt counter
 * and opens a resend cooldown — all in one round trip.
 */
export const generateAndStoreOTP = async (phone) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await redis
        .pipeline()
        .set(otpKey(phone), code, 'EX', OTP_TTL)
        .del(attemptsKey(phone))
        .set(cooldownKey(phone), '1', 'EX', RESEND_COOLDOWN)
        .exec();
    return code;
};
/**
 * Validates a code. On success the code is burned immediately (anti-replay).
 * Brute force is capped at MAX_ATTEMPTS, after which the code is invalidated and
 * the user must request a new one.
 */
export const verifyOTP = async (phone, code) => {
    const stored = await redis.get(otpKey(phone));
    if (!stored)
        return { ok: false, reason: 'expired' };
    const attempts = await redis.incr(attemptsKey(phone));
    if (attempts === 1)
        await redis.expire(attemptsKey(phone), OTP_TTL);
    if (attempts > MAX_ATTEMPTS) {
        await redis.del(otpKey(phone));
        return { ok: false, reason: 'too_many_attempts' };
    }
    if (stored !== code)
        return { ok: false, reason: 'invalid' };
    // Success — burn the code and related keys so it can never be replayed.
    await redis.del(otpKey(phone), attemptsKey(phone), cooldownKey(phone));
    return { ok: true };
};
//# sourceMappingURL=otp.js.map