import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { UpdateLinkInput } from '../schemas/user.schema';
import { hash } from 'bcrypt';
import { getCurrentUser } from '../utils/auth';
import { getBufferedClicks } from '../utils/click-buffer';
import { generateQRCode } from '../utils/qrcode';

const SLUG_REGEX = /^[a-z0-9-]+$/;

// 1. Fetch all links for the dashboard
export const getMyLinksHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const jwtUser = request.user as { id: string };

  try {
    const links = await prisma.link.findMany({
      where: { userId: jwtUser.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { analytics: true } } },
    });

    // Fold in clicks still buffered in Redis so the dashboard total is accurate.
    const withBuffered = await Promise.all(
      links.map(async (link) => ({
        ...link,
        clicks: link.clicks + (await getBufferedClicks(link.id)),
      }))
    );

    return reply.status(200).send({
      message: 'Links retrieved successfully',
      data: withBuffered,
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch links' });
  }
};

// 2. Update a link (edit destination/slug, toggle active, set or clear Pro fields)
export const updateLinkHandler = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateLinkInput }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const { slug, originalUrl, password, expiresAt, isActive } = request.body;

    const user = await getCurrentUser((request.user as { id: string }).id);
    if (!user) return reply.status(401).send({ error: 'User not found' });

    const link = await prisma.link.findUnique({ where: { id } });
    if (!link || link.userId !== user.id) {
      return reply.status(404).send({ error: 'Link not found or unauthorized' });
    }

    const updateData: Record<string, unknown> = {};

    if (originalUrl !== undefined) updateData.originalUrl = originalUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (slug !== undefined && slug !== link.slug) {
      if (!user.isPro) return reply.status(403).send({ error: 'Custom slugs are a Pro feature.' });
      if (!SLUG_REGEX.test(slug)) {
        return reply.status(400).send({ error: 'Slug may only contain lowercase letters, numbers, and hyphens.' });
      }
      updateData.slug = slug;
      updateData.customSlug = true;
    }

    // `null` clears the field; a string sets it (Pro-gated); `undefined` leaves it.
    if (password === null) {
      updateData.password = null;
    } else if (password !== undefined) {
      if (!user.isPro) return reply.status(403).send({ error: 'Password protection is a Pro feature.' });
      updateData.password = await hash(password, 10);
    }

    if (expiresAt === null) {
      updateData.expiresAt = null;
    } else if (expiresAt !== undefined) {
      if (!user.isPro) return reply.status(403).send({ error: 'Link expiration is a Pro feature.' });
      updateData.expiresAt = new Date(expiresAt);
    }

    if (Object.keys(updateData).length === 0) {
      return reply.status(400).send({ error: 'No changes provided.' });
    }

    const updatedLink = await prisma.link.update({ where: { id }, data: updateData });

    return reply.status(200).send({ message: 'Link updated successfully', data: updatedLink });
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
    const jwtUser = request.user as { id: string };

    const link = await prisma.link.findUnique({ where: { id } });
    if (!link || link.userId !== jwtUser.id) {
      return reply.status(404).send({ error: 'Link not found' });
    }

    await prisma.link.delete({ where: { id } });

    return reply.status(200).send({ message: 'Link deleted successfully' });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to delete link' });
  }
};

// 4. Get QR code for a link
export const getLinkQRHandler = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const jwtUser = request.user as { id: string };

    const link = await prisma.link.findUnique({ where: { id }, select: { id: true, slug: true, userId: true } });
    if (!link || link.userId !== jwtUser.id) {
      return reply.status(404).send({ error: 'Link not found' });
    }

    const qrCode = await generateQRCode(link.slug);
    return reply.status(200).send({ qrCode });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to generate QR code' });
  }
};

// 5. Get Link Stats (Pro Dashboard)
export const getLinkStatsHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const jwtUser = request.user as { id: string };

    const link = await prisma.link.findUnique({ where: { id } });
    if (!link || link.userId !== jwtUser.id) {
      return reply.status(404).send({ error: 'Link not found' });
    }

    // Aggregate in the DB and fetch only the latest activity — never load every
    // analytics row into memory.
    const [countries, cities, devices, browsers, referrers, recentActivity, buffered] = await Promise.all([
      prisma.analytics.groupBy({ by: ['country'],  where: { linkId: id }, _count: { country: true },  orderBy: { _count: { country: 'desc' } } }),
      prisma.analytics.groupBy({ by: ['city'],     where: { linkId: id, city: { not: null } }, _count: { city: true }, orderBy: { _count: { city: 'desc' } }, take: 10 }),
      prisma.analytics.groupBy({ by: ['device'],   where: { linkId: id }, _count: { device: true } }),
      prisma.analytics.groupBy({ by: ['browser'],  where: { linkId: id }, _count: { browser: true } }),
      prisma.analytics.groupBy({ by: ['referrer'], where: { linkId: id }, _count: { referrer: true }, orderBy: { _count: { referrer: 'desc' } }, take: 10 }),
      prisma.analytics.findMany({ where: { linkId: id }, orderBy: { timestamp: 'desc' }, take: 20,
        select: { id: true, country: true, city: true, region: true, device: true, browser: true, referrer: true, ip: true, timestamp: true },
      }),
      getBufferedClicks(id),
    ]);

    return reply.status(200).send({
      message: 'Stats retrieved successfully',
      data: {
        totalClicks: link.clicks + buffered,
        linkId: link.id,
        slug: link.slug,
        countries:      countries.map((c) => ({ country:  c.country  || 'Unknown', count: c._count.country })),
        cities:         cities.map((c)    => ({ city:     c.city     || 'Unknown', count: c._count.city })),
        devices:        devices.map((d)   => ({ device:   d.device   || 'Unknown', count: d._count.device })),
        browsers:       browsers.map((b)  => ({ browser:  b.browser  || 'Unknown', count: b._count.browser })),
        referrers:      referrers.map((r) => ({ referrer: r.referrer || 'Direct',  count: r._count.referrer })),
        recentActivity,
        createdAt: link.createdAt,
      },
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch stats' });
  }
};
