/** Remaining cooldown (seconds) before another code may be requested. */
export declare const getResendCooldown: (phone: string) => Promise<number>;
/**
 * Generates a 6-digit code, stores it for OTP_TTL, resets the attempt counter
 * and opens a resend cooldown — all in one round trip.
 */
export declare const generateAndStoreOTP: (phone: string) => Promise<string>;
export type VerifyResult = {
    ok: true;
} | {
    ok: false;
    reason: 'expired' | 'invalid' | 'too_many_attempts';
};
/**
 * Validates a code. On success the code is burned immediately (anti-replay).
 * Brute force is capped at MAX_ATTEMPTS, after which the code is invalidated and
 * the user must request a new one.
 */
export declare const verifyOTP: (phone: string, code: string) => Promise<VerifyResult>;
//# sourceMappingURL=otp.d.ts.map