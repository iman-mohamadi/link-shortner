import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { generateAndStoreOTP, verifyOTP } from '../utils/otp';
import { sendSMS } from '../services/sms.service';
import { SendOtpInput, VerifyOtpInput } from '../schemas/auth.schema';

export const requestOtpHandler = async (request: FastifyRequest<{ Body: SendOtpInput }>, reply: FastifyReply) => {
  const { phone } = request.body;

  const code = await generateAndStoreOTP(phone);
  await sendSMS(phone, code);

  return reply.send({ message: 'OTP sent successfully', phone });
};

export const verifyOtpHandler = async (request: FastifyRequest<{ Body: VerifyOtpInput }>, reply: FastifyReply) => {
  const { phone, code } = request.body;

  const isValid = await verifyOTP(phone, code);

  if (!isValid) {
    return reply.status(400).send({ error: 'Invalid or expired OTP' });
  }

  // Find or Create User
  let user = await prisma.user.findUnique({ where: { phone } });
  
  if (!user) {
    user = await prisma.user.create({
      data: { phone, isPro: false }
    });
  }

  // Issue JWT
  const token = request.server.jwt.sign({ 
    id: user.id, 
    phone: user.phone, 
    isPro: user.isPro 
  });

  return reply.send({ 
    message: 'Authenticated successfully', 
    token, 
    user: { phone: user.phone, isPro: user.isPro } 
  });
};