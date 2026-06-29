import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { getCurrentUser } from '../utils/auth';

/**
 * Self-serve upgrade endpoint.
 *
 * In development this simulates a successful checkout so the Pro experience can
 * be demoed end to end. In production it returns 501 until a real payment
 * provider is wired up — so it can never be used to self-grant Pro on a live
 * deployment.
 */
export const createCheckoutHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const current = await getCurrentUser((request.user as { id: string }).id);
  if (!current) return reply.status(401).send({ error: 'User not found' });

  if (current.isPro) {
    return reply.status(200).send({ message: 'You are already on Pro.', alreadyPro: true });
  }

  if (env.isProd) {
    return reply.status(501).send({ error: 'Online checkout is coming soon. Please contact us to upgrade.' });
  }

  const user = await prisma.user.update({ where: { id: current.id }, data: { isPro: true } });

  // Re-issue the token so it carries the new plan immediately.
  const token = request.server.jwt.sign(
    { id: user.id, phone: user.phone, isPro: user.isPro },
    { expiresIn: '7d' }
  );

  return reply.status(200).send({
    message: 'Welcome to Pro',
    token,
    user: { id: user.id, phone: user.phone, isPro: user.isPro, createdAt: user.createdAt },
  });
};
