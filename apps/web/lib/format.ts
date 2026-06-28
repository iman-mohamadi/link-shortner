const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

/** The public origin that serves slug redirects (the API host). */
export const SHORT_ORIGIN = API_BASE_URL.replace(/\/$/, "")

/** Build the public short URL for a slug. */
export function shortUrl(slug: string): string {
  return `${SHORT_ORIGIN}/${slug}`
}

/** Display form without the protocol, e.g. "lumen.io/abc123". */
export function shortDisplay(slug: string): string {
  return shortUrl(slug).replace(/^https?:\/\//, "")
}

/** Normalize the API QR field — it may be a full data URL or raw base64. */
export function qrSrc(qr?: string | null): string | null {
  if (!qr) return null
  return qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`
}

/** Strip protocol/query for compact display of a long URL. */
export function prettyUrl(url: string, max = 48): string {
  const clean = url.replace(/^https?:\/\//, "").replace(/\/$/, "")
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}
