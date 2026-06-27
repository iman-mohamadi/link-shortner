import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { nanoid } from 'nanoid';
import { fetchMetadata } from '../utils/metadata';
import { generateQRCode } from '../utils/qrcode';

export const createLinkHandler = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
  try {
    const { originalUrl, customSlug, password, expiresAt } = request.body;
    const user = request.user;

    // Pro validation for Custom Slugs
    if (customSlug && !user.isPro) {
      return reply.status(403).send({ error: 'Upgrade to Pro for custom slugs' });
    }

    const slug = customSlug || nanoid(6);
    
    // Fetch Metadata & QR in parallel.
    // We attach a .catch to fetchMetadata so a bad target URL doesn't crash creation.
    const [metadata, qrCode] = await Promise.all([
      fetchMetadata(originalUrl).catch(err => {
        request.log.warn(`Metadata fetch failed for ${originalUrl}: ${err.message}`);
        return { title: null, description: null, favicon: null }; // Fallback defaults
      }),
      generateQRCode(slug)
    ]);

    const link = await prisma.link.create({
      data: {
        originalUrl,
        slug,
        ...metadata,
        password: user.isPro ? password : null,
        expiresAt: user.isPro && expiresAt ? new Date(expiresAt) : null,
        userId: user.id,
        customSlug: !!customSlug
      }
    });

    return reply.send({
      message: 'Link created',
      shortUrl: `http://localhost:5000/${link.slug}`,
      qrCode, 
      data: link
    });

  } catch (error: any) {
    request.log.error(error);

    // Handle Prisma unique constraint violation (Custom Slug already exists)
    if (error.code === 'P2002') {
      return reply.status(409).send({ error: 'This slug is already in use. Please try another.' });
    }

    // Generic fallback for unhandled exceptions
    return reply.status(500).send({ 
      error: 'An internal server error occurred while generating your link.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};