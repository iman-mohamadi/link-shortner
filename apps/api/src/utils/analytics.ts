import { FastifyRequest } from 'fastify';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import { prisma } from '../config/prisma';

export const captureAnalytics = async (request: FastifyRequest, linkId: string) => {
  const userAgent = request.headers['user-agent'];
  const referrer = request.headers['referer'] || 'Direct'; // Note: header is 'referer' (one r)
  
  // On local dev, IP might be ::1 or 127.0.0.1. 
  // In production, your proxy (Nginx/Cloudflare) will pass the real IP in 'x-forwarded-for'
  const ip = (request.headers['x-forwarded-for'] as string) || request.ip;

  // Parse Device/Browser info
  const parser = new UAParser(userAgent);
  const device = parser.getDevice().type || 'Desktop';
  const browser = parser.getBrowser().name || 'Unknown';

  // Parse Location info
  const geo = geoip.lookup(ip);
  const country = geo ? geo.country : 'Unknown';

  try {
    await prisma.analytics.create({
      data: {
        linkId,
        country,
        device,
        browser,
        referrer,
      },
    });
  } catch (err) {
    console.error('Failed to save analytics:', err);
  }
};