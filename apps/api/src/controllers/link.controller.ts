import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateLinkType } from '@repo/types';
import { prisma } from '../config/prisma';
import { nanoid } from 'nanoid';
import { generateQRCode } from '../utils/qrcode';

export const createLinkHandler = async (
  request: FastifyRequest<{ Body: CreateLinkType }>,
  reply: FastifyReply
) => {
  try {
    const { original_url, custom_alias, expires_at, password, metadata } = request.body;
    const user = request.user as any;

    // Pro validation for Custom Slugs
    if (custom_alias && !user.isPro) {
      return reply.status(403).send({ error: 'Upgrade to Pro for custom slugs' });
    }

    const shortCode = custom_alias || nanoid(6);
    
    // Generate QR Code
    const qrCode = await generateQRCode(shortCode);

    const link = await prisma.link.create({
      data: {
        originalUrl: original_url,
        slug: shortCode,
        expiresAt: expires_at ? new Date(expires_at) : null,
        password: password || null,
        userId: user?.id,
        customSlug: !!custom_alias,
      },
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