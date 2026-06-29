import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { generateAndStoreOTP, getResendCooldown, verifyOTP } from '../utils/otp';
import { sendSMS } from '../services/sms.service';
import { rateLimit } from '../utils/rate-limit';
import { getClientIp } from '../utils/request';
import { env } from '../config/env';
import { SendOtpInput, VerifyOtpInput } from '../schemas/auth.schema';

export const requestOtpHandler = async (request: FastifyRequest<{ Body: SendOtpInput }>, reply: FastifyReply) => {
  try {
    const { phone } = request.body;
    const ip = getClientIp(request);

    // Throttle by IP to stop SMS bombing from a single source.
    const ipLimit = await rateLimit(`otp-send-ip:${ip}`, 20, 15 * 60);
    if (!ipLimit.allowed) {
      return reply.status(429).send({ error: 'Too many requests. Please try again later.', retryAfter: ipLimit.resetSeconds });
    }

    // Per-phone cooldown prevents rapid re-sends to the same number.
    const cooldown = await getResendCooldown(phone);
    if (cooldown > 0) {
      return reply.status(429).send({ error: `Please wait ${cooldown}s before requesting another code.`, retryAfter: cooldown });
    }

    // Per-phone window cap (defense in depth on top of the cooldown).
    const phoneLimit = await rateLimit(`otp-send-phone:${phone}`, 5, 60 * 60);
    if (!phoneLimit.allowed) {
      return reply.status(429).send({ error: 'Too many codes requested for this number. Try again later.', retryAfter: phoneLimit.resetSeconds });
    }

    const code = await generateAndStoreOTP(phone);

    try {
      await sendSMS(phone, code);
    } catch (smsError) {
      request.log.warn({ err: smsError }, `SMS failed for ${phone}`);
      if (env.isProd) {
        return reply.status(502).send({ error: 'Failed to send OTP. Please try again.' });
      }
    }

    return reply.status(200).send({
      message: 'OTP sent successfully',
      phone,
      ...(env.isDev && { code }), // only surfaced in development for demoing
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Failed to request OTP',
      details: env.isDev ? error.message : undefined,
    });
  }
};

export const verifyOtpHandler = async (request: FastifyRequest<{ Body: VerifyOtpInput }>, reply: FastifyReply) => {
  try {
    const { phone, code } = request.body;
    const ip = getClientIp(request);

    // Throttle verification to make brute-forcing the 6-digit space impractical.
    const ipLimit = await rateLimit(`otp-verify-ip:${ip}`, 30, 15 * 60);
    if (!ipLimit.allowed) {
      return reply.status(429).send({ error: 'Too many attempts. Please try again later.', retryAfter: ipLimit.resetSeconds });
    }

    const result = await verifyOTP(phone, code);

    if (!result.ok) {
      const messages: Record<string, string> = {
        expired: 'Code expired. Please request a new one.',
        invalid: 'Invalid code. Please try again.',
        too_many_attempts: 'Too many incorrect attempts. Please request a new code.',
      };
      return reply.status(401).send({ error: messages[result.reason] });
    }

    // Find or create the user, then issue a fresh token.
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone, isPro: false } });
    }

    const token = request.server.jwt.sign(
      { id: user.id, phone: user.phone, isPro: user.isPro },
      { expiresIn: '7d' }
    );

    return reply.status(200).send({
      message: 'Authenticated successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        isPro: user.isPro,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Authentication failed',
      details: env.isDev ? error.message : undefined,
    });
  }
};
