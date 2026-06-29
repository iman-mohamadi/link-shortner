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
  const city    = geo?.city    || null;
  const region  = geo?.region  || null;

  // Anonymize IP: mask last octet of IPv4, last 80 bits of IPv6.
  let anonIp: string | null = null;
  if (ip) {
    if (ip.includes(':')) {
      // IPv6 — keep first 48 bits (3 groups), mask the rest
      const parts = ip.split(':');
      anonIp = parts.slice(0, 3).join(':') + ':xxxx:xxxx:xxxx:xxxx:xxxx';
    } else {
      // IPv4 — mask last octet
      anonIp = ip.replace(/\.\d+$/, '.x');
    }
  }

  try {
    await prisma.analytics.create({
      data: { linkId, country, city, region, device, browser, referrer, ip: anonIp },
    });
  } catch (err) {
    console.error('Failed to save analytics:', err);
  }
};
