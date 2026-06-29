import axios from 'axios';
import * as cheerio from 'cheerio';
import dns from 'node:dns/promises';

export interface LinkMetadata {
  title: string | null;
  description: string | null;
  favicon: string | null;
}

const EMPTY: LinkMetadata = { title: null, description: null, favicon: null };

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 500;

/** True for loopback, private, link-local and other non-routable addresses. */
function isPrivateIp(ip: string): boolean {
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80')) return true; // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local
  if (lower.startsWith('::ffff:')) return isPrivateIp(lower.slice('::ffff:'.length)); // mapped v4
  return false;
}

/**
 * Validates that a URL is safe to fetch server-side: http(s) only, and every
 * resolved address must be public. This blocks SSRF against internal services
 * (cloud metadata endpoints, localhost, private networks).
 */
async function assertPublicUrl(rawUrl: string): Promise<void> {
  const url = new URL(rawUrl);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Unsupported protocol');
  }
  const records = await dns.lookup(url.hostname, { all: true });
  if (records.length === 0) throw new Error('Host did not resolve');
  for (const { address } of records) {
    if (isPrivateIp(address)) throw new Error('Refusing to fetch a private address');
  }
}

function clamp(value: string | undefined, max: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/**
 * Best-effort fetch of a page's title/description/favicon. Always resolves —
 * any failure (SSRF block, timeout, redirect, oversized body) yields empty
 * metadata rather than throwing.
 */
export const fetchMetadata = async (rawUrl: string): Promise<LinkMetadata> => {
  try {
    await assertPublicUrl(rawUrl);

    const { data } = await axios.get<string>(rawUrl, {
      timeout: 5000,
      maxRedirects: 0, // a redirect could point at an internal host — don't follow it
      maxContentLength: 512 * 1024,
      responseType: 'text',
      headers: { 'User-Agent': 'LumenBot/1.0 (+https://lumen.link link preview)' },
      validateStatus: (s) => s >= 200 && s < 300,
    });

    const $ = cheerio.load(data);

    const title = clamp(
      $('meta[property="og:title"]').attr('content') || $('title').first().text(),
      MAX_TITLE
    );
    const description = clamp(
      $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content'),
      MAX_DESCRIPTION
    );

    let favicon: string | null = null;
    const faviconHref =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href');
    if (faviconHref) {
      try {
        favicon = new URL(faviconHref, rawUrl).toString();
      } catch {
        favicon = null;
      }
    }

    return { title, description, favicon };
  } catch {
    return EMPTY;
  }
};
