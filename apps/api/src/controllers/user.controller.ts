import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { UpdateLinkInput } from '../schemas/user.schema';

// 1. Fetch all links for the dashboard
export const getMyLinksHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user;

  const links = await prisma.link.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { analytics: true }
      }
    }
  });

  return reply.send(links);
};

// 2. Update a link
export const updateLinkHandler = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateLinkInput }>, 
  reply: FastifyReply
) => {
  const { id } = request.params;
  const { slug, originalUrl } = request.body;
  const user = request.user;

  const link = await prisma.link.findUnique({ where: { id } });

  if (!link || link.userId !== user.id) {
    return reply.status(404).send({ error: 'Link not found or unauthorized' });
  }

  if (slug && slug !== link.slug && !user.isPro) {
    return reply.status(403).send({ error: 'Custom slugs are a Pro feature.' });
  }

  const updatedLink = await prisma.link.update({
    where: { id },
    data: request.body,
  });

  return reply.send({ message: 'Link updated', data: updatedLink });
};

// 3. Delete a link
export const deleteLinkHandler = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const { id } = request.params;
  const user = request.user;

  const link = await prisma.link.findUnique({ where: { id } });

  if (!link || link.userId !== user.id) {
    return reply.status(404).send({ error: 'Link not found' });
  }

  await prisma.link.delete({ where: { id } });
  
  return reply.send({ message: 'Link deleted forever' });
};

// 4. Get Link Stats (Pro Dashboard)
export const getLinkStatsHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>, 
  reply: FastifyReply
) => {
  const { id } = request.params;
  const user = request.user;

  const link = await prisma.link.findUnique({ 
    where: { id },
    include: { analytics: true }
  });

  if (!link || link.userId !== user.id) {
    return reply.status(404).send({ error: 'Link not found' });
  }

  const countries = await prisma.analytics.groupBy({
    by: ['country'],
    where: { linkId: id },
    _count: { country: true },
  });

  const devices = await prisma.analytics.groupBy({
    by: ['device'],
    where: { linkId: id },
    _count: { device: true },
  });

  return reply.send({
    totalClicks: link.clicks,
    countries,
    devices,
    recentActivity: link.analytics.slice(-10),
  });
};