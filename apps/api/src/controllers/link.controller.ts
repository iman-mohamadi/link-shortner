import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateLinkType } from '@repo/types';
import { prisma } from '../config/prisma';
import { nanoid } from 'nanoid';
import { generateQRCode } from '../utils/qrcode';
import { hash } from 'bcrypt';

const VALID_URL_REGEX = /^https?:\/\/.+\..+/;

export const createLinkHandler = async (
  request: FastifyRequest<{ Body: CreateLinkType }>,
  reply: FastifyReply
) => {
  try {
    const { original_url, custom_alias, expires_at, password, metadata } = request.body;
    const user = request.user as any;

    // Validate URL format
    if (!VALID_URL_REGEX.test(original_url)) {
      return reply.status(400).send({ error: 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.' });
    }

    // Validate URL length
    if (original_url.length > 2000) {
      return reply.status(400).send({ error: 'URL is too long (max 2000 characters).' });
    }

    // Pro validation for Custom Slugs
    if (custom_alias && !user.isPro) {
      return reply.status(403).send({ error: 'Upgrade to Pro for custom slugs' });
    }

    // Validate custom alias
    if (custom_alias) {
      if (!/^[a-z0-9-]+$/.test(custom_alias)) {
        return reply.status(400).send({ error: 'Custom alias can only contain lowercase letters, numbers, and hyphens' });
      }
      if (custom_alias.length > 50) {
        return reply.status(400).send({ error: 'Custom alias must be 50 characters or less' });
      }
    }

    // Pro validation for expiration
    if (expires_at && !user.isPro) {
      return reply.status(403).send({ error: 'Link expiration is a Pro feature' });
    }

    // Pro validation for password
    if (password && !user.isPro) {
      return reply.status(403).send({ error: 'Password protection is a Pro feature' });
    }

    const shortCode = custom_alias || nanoid(6);

    // Generate QR Code
    const qrCode = await generateQRCode(shortCode);

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await hash(password, 10);
    }

    const link = await prisma.link.create({
      data: {
        originalUrl: original_url,
        slug: shortCode,
        expiresAt: expires_at ? new Date(expires_at) : null,
        password: hashedPassword,
        userId: user?.id,
        customSlug: !!custom_alias,
      },
    });

    return reply.status(201).send({
      message: 'Link created successfully',
      shortUrl: `http://localhost:5000/${link.slug}`,
      qrCode,
      data: link
    });

  } catch (error: any) {
    request.log.error(error);

    // Handle Prisma unique constraint violation (Custom Slug already exists)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      if (field === 'slug') {
        return reply.status(409).send({ error: 'This slug is already in use. Please try another.' });
      }
      return reply.status(409).send({ error: `${field} already exists. Please try another.` });
    }

    // Generic fallback for unhandled exceptions
    return reply.status(500).send({
      error: 'An internal server error occurred while generating your link.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};