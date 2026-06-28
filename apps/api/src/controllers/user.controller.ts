import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { UpdateLinkInput } from '../schemas/user.schema';
import { hash } from 'bcrypt';

// 1. Fetch all links for the dashboard
export const getMyLinksHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as any;

  try {
    const links = await prisma.link.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { analytics: true }
        }
      }
    });

    return reply.status(200).send({
      message: 'Links retrieved successfully',
      data: links
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch links' });
  }
};

// 2. Update a link
export const updateLinkHandler = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateLinkInput }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { slug, originalUrl, password, expiresAt } = request.body;
    const user = request.user as any;

    const link = await prisma.link.findUnique({ where: { id } });

    if (!link || link.userId !== user.id) {
      return reply.status(404).send({ error: 'Link not found or unauthorized' });
    }

    // Pro feature validation
    if (slug && slug !== link.slug && !user.isPro) {
      return reply.status(403).send({ error: 'Custom slugs are a Pro feature.' });
    }

    if (password && !user.isPro) {
      return reply.status(403).send({ error: 'Password protection is a Pro feature.' });
    }

    if (expiresAt && !user.isPro) {
      return reply.status(403).send({ error: 'Link expiration is a Pro feature.' });
    }

    // Hash password if provided
    let updateData: any = {};
    if (originalUrl) updateData.originalUrl = originalUrl;
    if (slug) updateData.slug = slug;
    if (expiresAt) updateData.expiresAt = new Date(expiresAt);
    if (password) updateData.password = await hash(password, 10);

    const updatedLink = await prisma.link.update({
      where: { id },
      data: updateData,
    });

    return reply.status(200).send({
      message: 'Link updated successfully',
      data: updatedLink
    });
  } catch (error: any) {
    request.log.error(error);

    if (error.code === 'P2002') {
      return reply.status(409).send({ error: 'This slug is already in use.' });
    }

    return reply.status(500).send({ error: 'Failed to update link' });
  }
};

// 3. Delete a link
export const deleteLinkHandler = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const user = request.user as any;

    const link = await prisma.link.findUnique({ where: { id } });

    if (!link || link.userId !== user.id) {
      return reply.status(404).send({ error: 'Link not found' });
    }

    await prisma.link.delete({ where: { id } });

    return reply.status(200).send({ message: 'Link deleted successfully' });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to delete link' });
  }
};

// 4. Get Link Stats (Pro Dashboard)
export const getLinkStatsHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const user = request.user as any;

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

    const browsers = await prisma.analytics.groupBy({
      by: ['browser'],
      where: { linkId: id },
      _count: { browser: true },
    });

    return reply.status(200).send({
      message: 'Stats retrieved successfully',
      data: {
        totalClicks: link.clicks,
        linkId: link.id,
        slug: link.slug,
        countries: countries.map(c => ({ country: c.country || 'Unknown', count: c._count.country })),
        devices: devices.map(d => ({ device: d.device || 'Unknown', count: d._count.device })),
        browsers: browsers.map(b => ({ browser: b.browser || 'Unknown', count: b._count.browser })),
        recentActivity: link.analytics.slice(-10).reverse(),
        createdAt: link.createdAt
      }
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch stats' });
  }
};