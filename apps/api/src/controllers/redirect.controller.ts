import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/prisma';
import { captureAnalytics } from '../utils/analytics';
import { incrementClickCount } from '../utils/click-buffer';
import { compare } from 'bcrypt';

export const redirectHandler = async (request: FastifyRequest<{ Params: { slug: string }; Querystring: { pw?: string } }>, reply: FastifyReply) => {
  const { slug } = request.params;
  const { pw } = request.query;

  const link = await prisma.link.findUnique({ where: { slug } });

  if (!link) return reply.status(404).send({ error: 'Link not found' });

  // 1. Check Expiration (Pro Feature)
  if (link.expiresAt && new Date() > link.expiresAt) {
    return reply.status(410).send({ error: 'This link has expired' });
  }

  // 2. Check if inactive
  if (!link.isActive) {
    return reply.status(403).send({ error: 'This link has been disabled' });
  }

  // 3. Check Password (Pro Feature) - with bcrypt comparison
  if (link.password) {
    if (!pw) {
      return reply.status(403).send({
        message: 'Protected link',
        isProtected: true,
        title: link.title,
        favicon: link.favicon
      });
    }

    const isPasswordValid = await compare(pw, link.password);
    if (!isPasswordValid) {
      return reply.status(403).send({ error: 'Invalid password' });
    }
  }

  // 4. High-Speed Redirect with Analytics
  // Buffer the click in Redis instead of direct Prisma increment
  incrementClickCount(link.id).catch(console.error);

  captureAnalytics(request, link.id).catch(console.error);

  return reply.redirect(link.originalUrl);
};