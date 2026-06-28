import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';

export const promoteUserHandler = async (
  request: FastifyRequest<{ Params: { phone: string } }>,
  reply: FastifyReply
) => {
  const { phone } = request.params;

  try {
    // Validate phone format
    if (!/^09\d{9}$/.test(phone)) {
      return reply.status(400).send({ error: 'Invalid phone number format' });
    }

    const user = await prisma.user.update({
      where: { phone },
      data: { isPro: true }
    });

    return reply.status(200).send({
      message: `User ${phone} promoted to Pro successfully`,
      data: user
    });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.status(500).send({ error: 'Failed to promote user' });
  }
};

export const getUserStatsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const totalUsers = await prisma.user.count();
    const proUsers = await prisma.user.count({ where: { isPro: true } });
    const totalLinks = await prisma.link.count();
    const totalClicks = await prisma.link.aggregate({
      _sum: { clicks: true }
    });

    return reply.status(200).send({
      message: 'Platform stats retrieved',
      data: {
        totalUsers,
        proUsers,
        freeUsers: totalUsers - proUsers,
        totalLinks,
        totalClicks: totalClicks._sum.clicks || 0
      }
    });
  } catch (error: any) {
    return reply.status(500).send({ error: 'Failed to fetch stats' });
  }
};

export const getUserProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as any;
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: { links: true }
        }
      }
    });

    if (!userProfile) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.status(200).send({
      message: 'Profile retrieved successfully',
      data: userProfile
    });
  } catch (error: any) {
    return reply.status(500).send({ error: 'Failed to fetch profile' });
  }
};