import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';

export const promoteUserHandler = async (
  request: FastifyRequest<{ Params: { phone: string } }>, 
  reply: FastifyReply
) => {
  const { phone } = request.params;
  
  try {
    const user = await prisma.user.update({
      where: { phone },
      data: { isPro: true }
    });

    return reply.send({ 
      message: `Success! User ${phone} is now a Pro member.`, 
      user 
    });
  } catch (err) {
    return reply.status(404).send({ error: 'User not found' });
  }
};