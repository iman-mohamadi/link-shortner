import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { generateAndStoreOTP, verifyOTP } from '../utils/otp';
import { sendSMS } from '../services/sms.service';
import { SendOtpInput, VerifyOtpInput } from '../schemas/auth.schema';

export const requestOtpHandler = async (request: FastifyRequest<{ Body: SendOtpInput }>, reply: FastifyReply) => {
  try {
    const { phone } = request.body;

    // Check if user exists (optional - can be used for rate limiting per user)
    const existingUser = await prisma.user.findUnique({ where: { phone } });

    const code = await generateAndStoreOTP(phone);

    try {
      await sendSMS(phone, code);
    } catch (smsError) {
      // Log SMS error but don't block - useful for development
      request.log.warn(`SMS failed for ${phone}:`, smsError);
      // In production, you'd want to handle this differently
      if (process.env.NODE_ENV === 'production') {
        return reply.status(500).send({ error: 'Failed to send OTP. Please try again.' });
      }
    }

    return reply.status(200).send({
      message: 'OTP sent successfully',
      phone,
      ...(process.env.NODE_ENV === 'development' && { code }) // Only in dev
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Failed to request OTP',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const verifyOtpHandler = async (request: FastifyRequest<{ Body: VerifyOtpInput }>, reply: FastifyReply) => {
  try {
    const { phone, code } = request.body;

    const isValid = await verifyOTP(phone, code);

    if (!isValid) {
      return reply.status(401).send({ error: 'Invalid or expired OTP' });
    }

    // Find or Create User
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: { phone, isPro: false }
      });
    }

    // Issue JWT with proper payload
    const token = request.server.jwt.sign({
      id: user.id,
      phone: user.phone,
      isPro: user.isPro
    }, { expiresIn: '7d' });

    return reply.status(200).send({
      message: 'Authenticated successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        isPro: user.isPro,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};