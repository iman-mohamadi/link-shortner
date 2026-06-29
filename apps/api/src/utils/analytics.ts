import { FastifyRequest } from 'fastify';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import { prisma } from '../config/prisma';
import { getClientIp } from './request';

export const captureAnalytics = async (request: FastifyRequest, linkId: string) => {
  const userAgent = request.headers['user-agent'];

  const referer = request.headers['referer'];
  // Store only the referring host, not the full URL (privacy + cleaner grouping).
  let referrer = 'Direct';
  if (typeof referer === 'string' && referer.length > 0) {
    try {
      referrer = new URL(referer).hostname;
    } catch {
      referrer = 'Direct';
    }
  }

  // getClientIp extracts the leftmost x-forwarded-for entry; geoip needs a
  // single address, not the whole proxy chain.
  const ip = getClientIp(request);

  const parser = new UAParser(userAgent);
  const device = parser.getDevice().type || 'desktop';
  const browser = parser.getBrowser().name || 'Unknown';

  const geo = geoip.lookup(ip);
  const country = geo?.country || 'Unknown';

  try {
    await prisma.analytics.create({
      data: { linkId, country, device, browser, referrer },
    });
  } catch (err) {
    console.error('Failed to save analytics:', err);
  }
};
