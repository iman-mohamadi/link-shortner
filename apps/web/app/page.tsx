"use client"

import React, { useRef, useState, useId } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion"
import {
  ArrowRight,
  BarChart2,
  ChevronDown,
  Clock,
  Link2,
  Lock,
  PauseCircle,
  QrCode,
  Sparkles,
  Zap,
} from "lucide-react"
import { LiquidBackground } from "@/components/three/liquid-background"
import { MarketingNav } from "@/components/layout/marketing-nav"
import { Footer } from "@/components/layout/footer"

/* ─────────────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const

const HEADLINE = ["Short", "links.", "Big", "results."]

interface Feature {
  icon: React.ElementType
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    icon: BarChart2,
    title: "Real-time analytics",
    desc: "Watch every click travel the world live. Country, device and browser breakdowns with zero latency.",
  },
  {
    icon: QrCode,
    title: "Instant QR codes",
    desc: "Every short link arrives with a downloadable QR code. Scan-ready in seconds, no extra tools.",
  },
  {
    icon: Zap,
    title: "Sub-50ms redirects",
    desc: "Edge-optimised routing. Every redirect is faster than the average human blink.",
  },
  {
    icon: Lock,
    title: "Password protection",
    desc: "Gate any link behind a password. Perfect for client previews, private drops and staged releases.",
  },
  {
    icon: Clock,
    title: "Expiring links",
    desc: "Schedule a time limit. Links self-destruct exactly on schedule — no manual cleanup required.",
  },
  {
    icon: PauseCircle,
    title: "Enable / pause",
    desc: "Toggle any link without deleting it. History and analytics stay intact; re-enable at any moment.",
  },
]

const STATS = [
  { value: "2.4M+", label: "Links forged" },
  { value: "180+", label: "Countries reached" },
  { value: "<50ms", label: "Redirect latency" },
  { value: "99.9%", label: "Uptime SLA" },
]

const FAQ = [
  {
    q: "What is RizO?",
    a: "RizO is a premium URL shortener that turns any long URL into a short, trackable link. Every link comes with real-time analytics, a downloadable QR code, and optional features like custom branded slugs, password protection, and automatic expiry.",
  },
  {
    q: "Is RizO free to use?",
    a: "Yes. The free plan gives you up to 25 short links with full real-time analytics, QR codes, and enable/pause controls — no credit card needed. The Pro plan ($8/month) removes all limits and adds custom slugs, password protection, and expiring links.",
  },
  {
    q: "How fast are RizO redirects?",
    a: "RizO redirects complete in under 50ms at the edge. Click counts are buffered in Redis so analytics tracking never blocks the redirect — your visitor arrives at their destination before the database write finishes.",
  },
  {
    q: "Can I see who clicked my links?",
    a: "Every click records the country, city, device, browser, and referring source. The analytics dashboard shows geographic maps, device breakdowns, top cities, traffic sources, and a live activity table with anonymized IP addresses.",
  },
  {
    q: "How does password protection work?",
    a: "Pro users can add a passphrase to any link. Visitors are redirected to a branded unlock page to enter the password. Passwords are bcrypt-hashed before storage — RizO never stores or sees the plaintext.",
  },
  {
    q: "Do links expire automatically?",
    a: "Yes. Pro users can schedule an exact expiry date and time. When the deadline passes, the link deactivates and visitors see a branded 'link expired' page. All analytics data is preserved.",
  },
] as const

const HOW = [
  {
    n: "01",
    title: "Paste your URL",
    desc: "Drop any destination URL — no matter how long or utterly unwieldy.",
  },
  {
    n: "02",
    title: "Customise",
    desc: "Set a branded slug, add a password, or schedule expiry. Pro features, your way.",
  },
  {
    n: "03",
    title: "Share & track",
    desc: "Your short link is live the moment you forge it. Analytics begin immediately.",
  },
]

/* ─────────────────────────────────────────────────────────────────────────────
   MagneticSubmit — physics-based pull toward the cursor
───────────────────────────────────────────────────────────────────────────── */
function MagneticSubmit({ loading }: { loading: boolean }) {
  const ref = useRef<HTMLButtonElement>(null)
  const mx  = useMotionValue(0)
  const my  = useMotionValue(0)
  const sx  = useSpring(mx, { stiffness: 350, damping: 22, mass: 0.5 })
  const sy  = useSpring(my, { stiffness: 350, damping: 22, mass: 0.5 })

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left - r.width  / 2) * 0.38)
    my.set((e.clientY - r.top  - r.height / 2) * 0.38)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <motion.button
      ref={ref}
      type="submit"
      disabled={loading}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="shrink-0 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-white transition-[filter] duration-200 hover:brightness-110 disabled:opacity-60 glow-iris"
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <>Shorten <ArrowRight className="size-4" /></>
      )}
    </motion.button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   FeatureCard — glass panel with 3-D tilt on hover
───────────────────────────────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  delay,
}: {
  icon: React.ElementType
  title: string
  desc: string
  delay: number
}) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const sx = useSpring(rx, { stiffness: 130, damping: 16 })
  const sy = useSpring(ry, { stiffness: 130, damping: 16 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    rx.set(((e.clientY - r.top)  / r.height - 0.5) * -12)
    ry.set(((e.clientX - r.left) / r.width  - 0.5) *  12)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ delay, duration: 0.72, ease }}
      style={{ perspective: 900, rotateX: sx, rotateY: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="liquid-glass flex flex-col gap-5 rounded-[var(--r-xl)] p-7 transition-shadow duration-300 hover:shadow-[0_16px_64px_rgba(0,0,0,0.4)]"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/15">
        <Icon className="size-5 text-[var(--accent-hi)]" />
      </div>
      <div>
        <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-mid)]">{desc}</p>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   FAQ accordion item — AEO: visible answers for AI assistants + voice search
───────────────────────────────────────────────────────────────────────────── */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  const id = `faq-${index}`
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.6, ease }}
      className="border-b border-white/[0.06] last:border-0"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-base font-semibold tracking-[-0.02em] text-white">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 text-[var(--text-lo)]"
        >
          <ChevronDown className="size-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[0.9375rem] leading-relaxed text-[var(--text-mid)]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */
export default function Page() {
  const router  = useRouter()
  const [url,     setUrl]     = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    router.push(`/create?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <LiquidBackground intensity={1.0} />
      <MarketingNav />

      {/* ════════════════════════════════════════════════════════════════════
          Hero
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pt-28 text-center">
        {/* Ambient iris bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[46%] -z-10 h-[520px] w-[740px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.085] blur-[110px]"
        />

        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-5 py-2"
        >
          <span className="size-1.5 shrink-0 rounded-full bg-[var(--iris-cyan)]" style={{ boxShadow: "0 0 6px 2px rgba(124,58,237,0.6)" }} />
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-lo)]">
            The premium link shortener
          </span>
        </motion.div>

        {/* ── Headline — word mask-reveal ── */}
        <h1 className="font-display text-[clamp(3.25rem,11.5vw,9.5rem)] font-semibold leading-[0.88] tracking-[-0.045em]">
          <span className="sr-only">Links that bend light.</span>
          <span aria-hidden className="flex flex-wrap justify-center gap-x-[0.20em]">
            {HEADLINE.map((word, i) => (
              <span key={word} className="overflow-hidden pb-[0.07em]">
                <motion.span
                  initial={{ y: "112%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    delay:    0.20 + i * 0.105,
                    duration: 1.05,
                    ease,
                  }}
                  className={`inline-block ${i >= 1 && i <= 1 ? "text-iris" : i === 3 ? "text-iris" : "text-chrome"}`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68, duration: 0.95, ease }}
          className="mt-8 max-w-[28rem] text-balance text-[1.0625rem] leading-[1.65] text-[var(--text-mid)]"
        >
          Turn any URL into a powerful short link with real-time analytics, QR codes,
          and custom slugs. Built for speed — redirects under 50ms.
        </motion.p>

        {/* ── Ultra-premium glass pill shortener ── */}
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
          transition={{ delay: 0.85, duration: 1.05, ease }}
          className="relative mt-11 w-full max-w-[34rem]"
        >
          {/* Focus halo — bleeds below the pill */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-4 -bottom-3 -z-10 h-12 rounded-full transition-opacity duration-500"
            style={{
              opacity:    focused ? 1 : 0,
              background: "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(99,102,241,0.28) 0%, transparent 70%)",
              filter:     "blur(12px)",
            }}
          />

          <form
            onSubmit={submit}
            className="flex w-full items-center gap-2 rounded-full py-2 pl-6 pr-2"
            style={{
              background:           "rgba(255,255,255,0.08)",
              backdropFilter:       "blur(56px) saturate(230%) brightness(1.08)",
              WebkitBackdropFilter: "blur(56px) saturate(230%) brightness(1.08)",
              border:               "1px solid rgba(255,255,255,0.16)",
              boxShadow: [
                "inset 0 1.5px 0 rgba(255,255,255,0.46)",
                "inset 0 -1px   0 rgba(0,0,0,0.10)",
                "0 12px 56px rgba(0,0,0,0.36)",
                "0  3px 10px rgba(0,0,0,0.20)",
                focused
                  ? "0 0 0 3px rgba(99,102,241,0.22), 0 0 0 1px rgba(99,102,241,0.12)"
                  : "0 0 0 1px rgba(99,102,241,0.07)",
              ].join(", "),
              transition: "box-shadow 0.35s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <Link2
              className="size-5 shrink-0 transition-colors duration-300"
              style={{ color: focused ? "var(--accent-hi)" : "var(--text-lo)" }}
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Paste a long, unwieldy URL…"
              className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-[var(--text-lo)] focus:outline-none"
            />
            <MagneticSubmit loading={loading} />
          </form>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.9 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-5"
          aria-label="RizO platform statistics"
        >
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15 + i * 0.07, duration: 0.6, ease }}
              className="flex flex-col items-center gap-1"
            >
              <span className="font-display text-2xl font-semibold tracking-[-0.035em] text-white">
                {value}
              </span>
              <span className="text-[10.5px] uppercase tracking-[0.20em] text-[var(--text-lo)]">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/[0.14] p-1.5">
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
              className="size-1.5 rounded-full bg-iris"
            />
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          Features
      ════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative mx-auto max-w-6xl px-4 py-28">
        {/* Section label */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-5 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--text-lo)]"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07, duration: 0.75, ease }}
            className="font-display text-4xl font-semibold tracking-[-0.035em] text-chrome sm:text-5xl"
          >
            Everything you need,
            <br />
            nothing you don&apos;t.
          </motion.h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.07} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          How it works
      ════════════════════════════════════════════════════════════════════ */}
      <section id="how" className="relative mx-auto max-w-5xl px-4 py-12 pb-28">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease }}
            className="font-display text-4xl font-semibold tracking-[-0.035em] text-chrome sm:text-5xl"
          >
            Three steps to
            <br />
            bend light.
          </motion.h2>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          {HOW.map(({ n, title, desc }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.13, duration: 0.72, ease }}
              className="relative overflow-hidden rounded-[var(--r-xl)] p-9"
            >
              {/* Large watermark numeral */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-6 left-4 select-none font-display text-[9rem] font-semibold leading-none"
                style={{ color: "rgba(255,255,255,0.028)", letterSpacing: "-0.04em" }}
              >
                {n}
              </span>
              <p className="relative mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-iris">
                {n}
              </p>
              <h3 className="relative font-display text-xl font-semibold tracking-[-0.025em] text-white">
                {title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-[var(--text-mid)]">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          Stats — full-width liquid glass panel
      ════════════════════════════════════════════════════════════════════ */}
      <section id="stats" className="relative mx-auto max-w-5xl px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease }}
          className="liquid-glass rounded-[var(--r-xl)] px-8 py-14"
        >
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="font-display text-[2.75rem] font-semibold leading-none tracking-[-0.04em] text-white">
                  {value}
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.20em] text-[var(--text-lo)]">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FAQ — AEO & GEO: structured answers for AI assistants + voice search
      ════════════════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="relative mx-auto max-w-3xl px-4 pb-20"
      >
        <div className="mb-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-lo)]"
          >
            FAQ
          </motion.p>
          <motion.h2
            id="faq-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07, duration: 0.7, ease }}
            className="font-display text-3xl font-semibold tracking-[-0.03em] text-chrome sm:text-4xl"
          >
            Everything you need to know.
          </motion.h2>
        </div>

        <div className="glass rounded-[var(--r-xl)] px-7 py-2 sm:px-10">
          {FAQ.map((item, i) => (
            <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-4xl px-4 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease }}
          className="liquid-glass relative overflow-hidden rounded-[var(--r-xl)] px-8 py-20 sm:px-16"
        >
          {/* Inner bloom */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[var(--accent)] opacity-[0.14] blur-[72px]"
          />
          <Sparkles className="relative mx-auto mb-6 size-8 text-[var(--iris-cyan)]" />
          <h2 className="relative font-display text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            Start shortening
            <br />
            links for free.
          </h2>
          <p className="relative mt-4 text-[var(--text-mid)]">
            RizO is free forever for 25 links. No credit card, no catch.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease }}
            className="relative mt-9"
          >
            <Link
              href="/create"
              className="inline-flex items-center gap-2.5 rounded-full bg-[var(--accent)] px-9 py-4 text-base font-medium text-white glow-iris transition-[filter] duration-200 hover:brightness-110"
            >
              Forge a link <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
