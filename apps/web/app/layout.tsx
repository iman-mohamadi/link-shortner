import type { Metadata, Viewport } from "next"
import { Geist_Mono, Figtree, Space_Grotesk } from "next/font/google"
import Script from "next/script"

import "@workspace/ui/globals.css"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SmoothScroll } from "@/components/providers/smooth-scroll"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@workspace/ui/lib/utils"

/* ─────────────────────────────────────────────────────────────────────────────
   Fonts
───────────────────────────────────────────────────────────────────────────── */
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" })
const figtree  = Figtree({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

/* ─────────────────────────────────────────────────────────────────────────────
   Site constants — change SITE_URL to your production domain
───────────────────────────────────────────────────────────────────────────── */
const SITE_URL  = "https://rizo.link"
const SITE_NAME = "RizO"
const TAGLINE   = "Forge Short Links That Convert"
const DESCRIPTION =
  "RizO is a premium URL shortener with real-time analytics, QR code generation, custom branded slugs, password-protected links, and expiry scheduling. Sub-50ms edge redirects. Free forever with 25 links."

/* ─────────────────────────────────────────────────────────────────────────────
   Viewport
───────────────────────────────────────────────────────────────────────────── */
export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
}

/* ─────────────────────────────────────────────────────────────────────────────
   Root Metadata (SEO + Open Graph + Twitter)
───────────────────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — ${TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,

  keywords: [
    "URL shortener",
    "link shortener",
    "short link",
    "custom short link",
    "link analytics",
    "QR code generator",
    "branded links",
    "password protected links",
    "expiring links",
    "link tracking",
    "click analytics",
    "RizO",
  ],

  authors: [{ name: "RizO", url: SITE_URL }],
  creator:  "RizO",
  publisher: "RizO",

  /* ── Open Graph ── */
  openGraph: {
    type:        "website",
    url:          SITE_URL,
    siteName:     SITE_NAME,
    title:        `${SITE_NAME} — ${TAGLINE}`,
    description:  DESCRIPTION,
    locale:       "en_US",
    images: [
      {
        url:    `${SITE_URL}/opengraph-image`,
        width:  1200,
        height: 630,
        alt:    `${SITE_NAME} — ${TAGLINE}`,
      },
    ],
  },

  /* ── Twitter / X ── */
  twitter: {
    card:        "summary_large_image",
    title:       `${SITE_NAME} — ${TAGLINE}`,
    description:  DESCRIPTION,
    images:      [`${SITE_URL}/opengraph-image`],
    creator:     "@rizo_link",
  },

  /* ── Robots ── */
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  /* ── Canonical & alternates ── */
  alternates: {
    canonical: SITE_URL,
  },

  /* ── App metadata ── */
  applicationName: SITE_NAME,
  category: "Technology",

  /* ── Verification (replace with real tokens) ── */
  verification: {
    google: "REPLACE_WITH_GOOGLE_SITE_VERIFICATION",
  },
}

/* ─────────────────────────────────────────────────────────────────────────────
   JSON-LD Structured Data
   • WebApplication  — tells search engines what the product does
   • Organization    — entity definition for GEO
   • FAQPage         — AEO: feeds AI assistants and voice search
   • SoftwareApplication — app store-style entity
───────────────────────────────────────────────────────────────────────────── */
const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "RizO",
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "USD",
      description: "Up to 25 short links, full analytics, QR codes, enable/pause controls.",
    },
    {
      "@type": "Offer",
      name: "Pro Plan",
      price: "8",
      priceCurrency: "USD",
      priceValidUntil: "2026-12-31",
      billingPeriod: "P1M",
      description: "Unlimited links, custom branded slugs, password protection, expiring links.",
    },
    {
      "@type": "Offer",
      name: "Business Plan",
      price: "24",
      priceCurrency: "USD",
      priceValidUntil: "2026-12-31",
      billingPeriod: "P1M",
      description: "Everything in Pro plus team seats, REST API access, and custom domain.",
    },
  ],
  featureList: [
    "Real-time click analytics",
    "Country, city, device, and browser tracking",
    "Instant QR code generation",
    "Custom branded slugs",
    "Password-protected links",
    "Expiring / self-destruct links",
    "Sub-50ms edge redirects",
    "Enable and pause links",
    "Traffic source / referrer tracking",
    "Anonymized IP geolocation",
  ],
  screenshot: `${SITE_URL}/opengraph-image`,
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RizO",
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description:
    "RizO provides premium URL shortening with advanced analytics, QR code generation, and enterprise-grade security features.",
  foundingDate: "2024",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@rizo.link",
    contactType: "customer support",
    availableLanguage: ["English", "Persian"],
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is RizO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RizO is a premium URL shortener that turns any long URL into a short, trackable link. Every link includes real-time analytics, a QR code, and optional features like custom branded slugs, password protection, and automatic expiry.",
      },
    },
    {
      "@type": "Question",
      name: "Is RizO free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. RizO's free plan includes up to 25 short links, unlimited clicks, real-time analytics, QR codes, and enable/pause controls — no credit card required. The Pro plan ($8/month) removes all link limits and adds custom slugs, password protection, and expiring links.",
      },
    },
    {
      "@type": "Question",
      name: "How fast are RizO redirects?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RizO processes redirects in under 50 milliseconds at the edge. Click counts are buffered in Redis so tracking never blocks the redirect — visitors arrive at the destination before the analytics write completes.",
      },
    },
    {
      "@type": "Question",
      name: "Can I see who clicked my links?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every click records the country, city, device type, browser, and traffic source (referrer). The analytics dashboard shows geographic breakdowns with flag emojis, a device donut chart, browser breakdown, top cities, traffic sources, and a live activity table. IP addresses are anonymized (last octet masked) before storage.",
      },
    },
    {
      "@type": "Question",
      name: "How does password protection work in RizO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pro users can set a passphrase on any link. Visitors are redirected to a branded unlock page where they enter the password. Passwords are hashed with bcrypt before storage — RizO never stores plaintext passwords.",
      },
    },
    {
      "@type": "Question",
      name: "Do RizO links expire automatically?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Pro users can schedule an exact expiry date and time on any link. When the deadline passes, the link deactivates and visitors see a branded 'link expired' page. Analytics for the link are preserved indefinitely.",
      },
    },
    {
      "@type": "Question",
      name: "Does RizO generate QR codes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every short link created with RizO automatically gets a QR code, available in the creation confirmation and on the dashboard. QR codes can be downloaded as PNG files directly from the dashboard.",
      },
    },
    {
      "@type": "Question",
      name: "What is a custom branded slug in RizO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A custom branded slug is a human-readable path on your short link, such as rizo.link/my-launch instead of a random code. Custom slugs are a Pro feature and must be lowercase alphanumeric characters or hyphens, between 3 and 50 characters.",
      },
    },
  ],
}

/* ─────────────────────────────────────────────────────────────────────────────
   Root Layout
───────────────────────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark antialiased",
        fontMono.variable,
        figtree.variable,
        display.variable,
      )}
    >
      <head>
        {/* Structured data for SEO, AEO, and GEO */}
        <Script
          id="schema-web-application"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
        <Script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="schema-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <SmoothScroll />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
