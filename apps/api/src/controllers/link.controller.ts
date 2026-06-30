import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateLinkType } from '../types/index.js';
import { prisma } from '../config/prisma.js';
import { nanoid } from 'nanoid';
import { hash } from 'bcrypt';
import { generateQRCode } from '../utils/qrcode';
import { fetchMetadata } from '../utils/metadata';
import { getCurrentUser } from '../utils/auth';
import { limitsFor } from '../config/plans';
import { env } from '../config/env';

const VALID_URL_REGEX = /^https?:\/\/.+\..+/;
const CUSTOM_ALIAS_REGEX = /^[a-z0-9-]+$/;


export const createLinkHandler = async (
  request: FastifyRequest<{ Body: CreateLinkType }>,
  reply: FastifyReply
) => {
  try {
    const { original_url, custom_alias, expires_at, password } = request.body;

    // Always check the live plan from the DB — never trust the 7-day-old token.
    const user = await getCurrentUser((request.user as { id: string }).id);
    if (!user) return reply.status(401).send({ error: 'User not found' });
    const limits = limitsFor(user.isPro);

    if (!VALID_URL_REGEX.test(original_url)) {
      return reply.status(400).send({ error: 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.' });
    }
    if (original_url.length > 2000) {
      return reply.status(400).send({ error: 'URL is too long (max 2000 characters).' });
    }

    // Enforce the free-plan link cap.
    if (Number.isFinite(limits.maxLinks)) {
      const count = await prisma.link.count({ where: { userId: user.id } });
      if (count >= limits.maxLinks) {
        return reply.status(403).send({
          error: `Free plan is limited to ${limits.maxLinks} links. Upgrade to Pro for unlimited links.`,
          code: 'LINK_LIMIT_REACHED',
        });
      }
    }

    if (custom_alias && !limits.customSlug) {
      return reply.status(403).send({ error: 'Custom slugs are a Pro feature.' });
    }
    if (custom_alias) {
      if (!CUSTOM_ALIAS_REGEX.test(custom_alias)) {
        return reply.status(400).send({ error: 'Custom alias can only contain lowercase letters, numbers, and hyphens' });
      }
      if (custom_alias.length < 3 || custom_alias.length > 50) {
        return reply.status(400).send({ error: 'Custom alias must be between 3 and 50 characters' });
      }
    }

    if (expires_at && !limits.expiry) {
      return reply.status(403).send({ error: 'Link expiration is a Pro feature.' });
    }
    if (expires_at && new Date(expires_at).getTime() <= Date.now()) {
      return reply.status(400).send({ error: 'Expiration must be in the future.' });
    }

    if (password && !limits.password) {
      return reply.status(403).send({ error: 'Password protection is a Pro feature.' });
    }

    const shortCode = custom_alias || nanoid(6);
    const hashedPassword = password ? await hash(password, 10) : null;

    const link = await prisma.link.create({
      data: {
        originalUrl: original_url,
        slug: shortCode,
        expiresAt: expires_at ? new Date(expires_at) : null,
        password: hashedPassword,
        userId: user.id,
        customSlug: !!custom_alias,
      },
    });

    // Enrich title/description/favicon in the background so create stays fast.
    void enrichMetadata(link.id, original_url);

    const qrCode = await generateQRCode(link.slug);

    return reply.status(201).send({
      message: 'Link created successfully',
      shortUrl: `${env.publicBaseUrl}/${link.slug}`,
      qrCode,
      data: link,
    });
  } catch (error: any) {
    request.log.error(error);

    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      if (field === 'slug') {
        return reply.status(409).send({ error: 'This slug is already in use. Please try another.' });
      }
      return reply.status(409).send({ error: `${field} already exists. Please try another.` });
    }

    return reply.status(500).send({
      error: 'An internal server error occurred while generating your link.',
      details: env.isDev ? error.message : undefined,
    });
  }
};

/** Fire-and-forget page metadata enrichment; failures are swallowed. */
async function enrichMetadata(linkId: string, url: string) {
  try {
    const meta = await fetchMetadata(url);
    const data: { title?: string; description?: string; favicon?: string } = {};
    if (meta.title) data.title = meta.title;
    if (meta.description) data.description = meta.description;
    if (meta.favicon) data.favicon = meta.favicon;
    if (Object.keys(data).length > 0) {
      await prisma.link.update({ where: { id: linkId }, data });
    }
  } catch {
    // best-effort only
  }
}
