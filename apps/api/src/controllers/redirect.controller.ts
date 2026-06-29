import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { captureAnalytics } from '../utils/analytics';
import { incrementClickCount } from '../utils/click-buffer';
import { compare } from 'bcrypt';
import { env } from '../config/env';

const webOrigin = () => (env.webOrigins[0] ?? 'http://localhost:3000').replace(/\/$/, '');

export const redirectHandler = async (
  request: FastifyRequest<{ Params: { slug: string }; Querystring: { pw?: string } }>,
  reply: FastifyReply
) => {
  const { slug } = request.params;
  const { pw }   = request.query;

  const link = await prisma.link.findUnique({ where: { slug } });

  if (!link) {
    return reply.redirect(`${webOrigin()}/not-found?slug=${encodeURIComponent(slug)}`);
  }

  if (link.expiresAt && new Date() > link.expiresAt) {
    return reply.redirect(`${webOrigin()}/expired?slug=${encodeURIComponent(slug)}`);
  }

  if (!link.isActive) {
    return reply.redirect(`${webOrigin()}/disabled?slug=${encodeURIComponent(slug)}`);
  }

  // Password-protected: bounce the browser to the unlock page (no raw JSON).
  if (link.password) {
    if (!pw) {
      return reply.redirect(`${webOrigin()}/p/${encodeURIComponent(slug)}`);
    }
    const valid = await compare(pw, link.password);
    if (!valid) {
      return reply.redirect(`${webOrigin()}/p/${encodeURIComponent(slug)}?error=1`);
    }
  }

  incrementClickCount(link.id).catch(console.error);
  captureAnalytics(request, link.id).catch(console.error);

  return reply.redirect(link.originalUrl);
};

/** Called by the /p/[slug] web page to verify a password and get the destination URL. */
export const unlockHandler = async (
  request: FastifyRequest<{ Params: { slug: string }; Body: { password: string } }>,
  reply: FastifyReply
) => {
  const { slug } = request.params;
  const { password } = request.body as { password?: string };

  if (!password) {
    return reply.status(400).send({ error: 'Password is required' });
  }

  const link = await prisma.link.findUnique({ where: { slug } });

  if (!link) return reply.status(404).send({ error: 'Link not found' });
  if (link.expiresAt && new Date() > link.expiresAt) return reply.status(410).send({ error: 'Link has expired' });
  if (!link.isActive) return reply.status(403).send({ error: 'Link is disabled' });
  if (!link.password) return reply.status(400).send({ error: 'Link is not password protected' });

  const valid = await compare(password, link.password);
  if (!valid) return reply.status(403).send({ error: 'Incorrect password' });

  incrementClickCount(link.id).catch(console.error);
  captureAnalytics(request, link.id).catch(console.error);

  return reply.status(200).send({ url: link.originalUrl });
};
