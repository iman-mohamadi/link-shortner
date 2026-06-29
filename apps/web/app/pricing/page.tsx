"use client"

// Page-level SEO is handled by generateMetadata in a server component.
// This client page renders pricing UI; metadata is in the co-located metadata file.

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion"
import {
  ArrowRight,
  Building2,
  Check,
  Loader2,
  Minus,
  Sparkles,
  Zap,
} from "lucide-react"
import { LiquidBackground } from "@/components/three/liquid-background"
import { MarketingNav } from "@/components/layout/marketing-nav"
import { Footer } from "@/components/layout/footer"
import { toast } from "@/components/ui/toaster"
import { useHydratedAuth } from "@/lib/hooks/use-auth"
import { billingApi } from "@/lib/api/billing"

/* ─────────────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const

interface TableRow {
  label:    string
  free:     string | boolean
  pro:      string | boolean
  business: string | boolean
}

const TABLE_ROWS: TableRow[] = [
  { label: "Short links",                      free: "Up to 25",  pro: "Unlimited",  business: "Unlimited" },
  { label: "Clicks & redirects",               free: "Unlimited", pro: "Unlimited",  business: "Unlimited" },
  { label: "Real-time geo / device analytics", free: true,        pro: true,         business: true },
  { label: "Instant QR codes",                 free: true,        pro: true,         business: true },
  { label: "Auto title & favicon previews",    free: true,        pro: true,         business: true },
  { label: "Enable / pause links",             free: true,        pro: true,         business: true },
  { label: "Custom branded slugs",             free: false,       pro: true,         business: true },
  { label: "Password-protected links",         free: false,       pro: true,         business: true },
  { label: "Expiring / self-destruct links",   free: false,       pro: true,         business: true },
  { label: "Priority redirect edge",           free: false,       pro: true,         business: true },
  { label: "Team seats",                       free: false,       pro: false,        business: "Up to 10" },
  { label: "REST API access",                  free: false,       pro: false,        business: true },
  { label: "Custom domain",                    free: false,       pro: false,        business: true },
  { label: "White-label branding",             free: false,       pro: false,        business: true },
  { label: "Priority support & SLA",           free: false,       pro: false,        business: true },
]

const FREE_FEATURES  = ["Up to 25 short links", "Full real-time analytics", "QR codes & favicons", "Enable / pause links"]
const PRO_FEATURES   = ["Everything in Free", "Unlimited links", "Custom branded slugs", "Password-protected links", "Expiring / self-destruct links", "Priority redirect edge"]
const BIZ_FEATURES   = ["Everything in Pro", "Up to 10 team seats", "REST API access", "Custom domain", "White-label branding", "Priority support & SLA"]
const BIZ_SOON_SET   = new Set(["Up to 10 team seats", "REST API access", "Custom domain", "White-label branding"])

/* ─────────────────────────────────────────────────────────────────────────────
   BillingToggle
───────────────────────────────────────────────────────────────────────────── */
function BillingToggle({
  yearly,
  onChange,
}: {
  yearly: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.09] bg-white/[0.04] p-1.5">
      {(["monthly", "yearly"] as const).map((opt) => {
        const active = yearly === (opt === "yearly")
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt === "yearly")}
            className="relative h-9 rounded-full px-5 text-sm font-medium transition-colors duration-200"
            style={{ color: active ? "#fff" : "var(--text-lo)" }}
          >
            {active && (
              <motion.span
                layoutId="billing-pill"
                className="absolute inset-0 rounded-full bg-[var(--accent)]"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            )}
            <span className="relative z-10 capitalize">{opt}</span>
          </button>
        )
      })}
      <AnimatePresence>
        {yearly && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8, x: -6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -6 }}
            transition={{ duration: 0.28, ease }}
            className="mr-1 rounded-full bg-[var(--accent)]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-hi)]"
          >
            −17%
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   PriceDisplay — price number that flips on billing change
───────────────────────────────────────────────────────────────────────────── */
function PriceDisplay({ value }: { value: string }) {
  return (
    <div className="overflow-hidden" style={{ perspective: "400px" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, rotateX: -28, y: 10 }}
          animate={{ opacity: 1, rotateX: 0,   y: 0 }}
          exit={{   opacity: 0, rotateX:  28,   y: -10 }}
          transition={{ duration: 0.28, ease }}
          className="inline-block font-display text-5xl font-semibold tracking-[-0.04em] text-white"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TiltCard — 3-D perspective tilt following the cursor
───────────────────────────────────────────────────────────────────────────── */
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const sx = useSpring(rx, { stiffness: 110, damping: 14 })
  const sy = useSpring(ry, { stiffness: 110, damping: 14 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    rx.set(((e.clientY - r.top)  / r.height - 0.5) * -13)
    ry.set(((e.clientX - r.left) / r.width  - 0.5) *  13)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      style={{ perspective: 1100, rotateX: sx, rotateY: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TableCell
───────────────────────────────────────────────────────────────────────────── */
function Cell({ value }: { value: string | boolean }) {
  if (value === true)  return <Check className="size-4 text-[var(--iris-cyan)]" />
  if (value === false) return <Minus className="size-4 text-[var(--text-lo)]" />
  return <span className="text-sm text-[var(--text-mid)]">{value}</span>
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */
export default function PricingPage() {
  const router   = useRouter()
  const { isAuthed, user } = useHydratedAuth()
  const isPro    = Boolean(user?.isPro)

  const [yearly,    setYearly]    = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  /* Computed prices */
  const proMonthly  = yearly ? "$6.67" : "$8"
  const bizMonthly  = yearly ? "$20"   : "$24"
  const period      = yearly ? "/ mo, billed yearly" : "/ month"

  const handleUpgrade = async () => {
    if (!isAuthed) { router.push("/auth?next=/pricing"); return }
    if (isPro) return
    setUpgrading(true)
    try {
      const res = await billingApi.checkout()
      if (res.alreadyPro) toast.info("You're already on Pro")
      else { toast.success("Welcome to Pro ✨"); router.push("/dashboard") }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upgrade failed")
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <LiquidBackground intensity={0.42} />
      <MarketingNav />

      {/* ════════════════════════════════════════════════════════════════════
          Hero
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-5xl px-4 pt-40 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
          className="mb-5 text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--text-lo)]"
        >
          Pricing
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.75, ease }}
          className="font-display text-[clamp(2.75rem,7.5vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-chrome"
        >
          Cinematic power,{" "}
          <span className="text-iris">honest pricing.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.7, ease }}
          className="mx-auto mt-6 max-w-lg text-balance text-[1.0625rem] text-[var(--text-mid)]"
        >
          Start free with full analytics. Upgrade when you need branded slugs,
          locks and expiry.
        </motion.p>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.65, ease }}
          className="mt-10 flex justify-center"
        >
          <BillingToggle yearly={yearly} onChange={setYearly} />
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          Cards — architectural layout: compact | featured | compact
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto mt-14 grid max-w-5xl items-start gap-4 px-4 md:grid-cols-[0.88fr_1.12fr_0.88fr]">

        {/* ── FREE ── */}
        <TiltCard>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10, duration: 0.7, ease }}
            className="liquid-glass flex flex-col rounded-[var(--r-xl)] p-7 md:mt-5 md:p-8"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-semibold text-white">Free</h2>
                <p className="mt-1 text-sm text-[var(--text-mid)]">Everything to start.</p>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                <Zap className="size-4 text-[var(--text-mid)]" />
              </div>
            </div>

            <div className="mt-6 flex items-end gap-1.5">
              <span className="font-display text-5xl font-semibold tracking-[-0.04em] text-chrome">$0</span>
              <span className="mb-1.5 text-sm text-[var(--text-lo)]">/ forever</span>
            </div>

            <ul className="mt-7 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-mid)]">
                  <Check className="size-4 shrink-0 text-[var(--iris-cyan)]" /> {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <button
                type="button"
                disabled={isAuthed && !isPro}
                onClick={() => isAuthed ? router.push("/dashboard") : router.push("/auth?next=/create")}
                className="iris-border w-full rounded-full py-3 text-sm font-medium text-[var(--text-hi)] transition-colors hover:text-white disabled:cursor-default disabled:opacity-70"
              >
                {isAuthed && !isPro ? "Your current plan" : "Get started free"}
              </button>
            </div>
          </motion.div>
        </TiltCard>

        {/* ── PRO (featured — no top margin offset, full height) ── */}
        <TiltCard>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.7, ease }}
            className="relative flex h-full"
          >
            {/* Spinning conic-gradient border wrapper */}
            <div className="pro-border-glow relative flex h-full w-full flex-col rounded-[var(--r-xl)]">
              {/* Inner card — 1 px inset covers the gradient border */}
              <div className="relative m-px flex flex-col rounded-[calc(var(--r-xl)-1px)] bg-[var(--ink-800)] p-7 sm:p-8">
                {/* Ambient iris bloom inside card */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--accent)] opacity-[0.18] blur-[56px]"
                  style={{ animation: "iris-pulse 5s ease-in-out infinite" }}
                />

                <div className="relative flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-white">Pro</h2>
                    <p className="mt-1 text-sm text-[var(--text-mid)]">For people who ship.</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/20 px-3 py-1 text-[11px] font-semibold text-[var(--accent-hi)]">
                    <Sparkles className="size-3" /> Most loved
                  </span>
                </div>

                <div className="relative mt-6 flex items-end gap-1.5">
                  <PriceDisplay value={proMonthly} />
                  <span className="relative mb-1.5 text-sm text-[var(--text-lo)]">{period}</span>
                </div>

                <ul className="relative mt-7 space-y-3">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                      <Check className="size-4 shrink-0 text-[var(--iris-cyan)]" /> {f}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-auto pt-8">
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={upgrading || isPro}
                    className="w-full rounded-full bg-[var(--accent)] py-3.5 text-sm font-semibold text-white transition-[filter] duration-200 hover:brightness-110 disabled:opacity-60 glow-iris"
                  >
                    {isPro ? (
                      <>You&apos;re on Pro <Sparkles className="inline size-3.5 ml-1" /></>
                    ) : upgrading ? (
                      <Loader2 className="mx-auto size-4 animate-spin" />
                    ) : (
                      <>Upgrade to Pro <ArrowRight className="inline size-4 ml-1" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </TiltCard>

        {/* ── BUSINESS ── */}
        <TiltCard>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.7, ease }}
            className="liquid-glass flex flex-col rounded-[var(--r-xl)] p-7 md:mt-5 md:p-8"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-semibold text-white">Business</h2>
                <p className="mt-1 text-sm text-[var(--text-mid)]">For teams that scale.</p>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                <Building2 className="size-4 text-[var(--iris-cyan)]" />
              </div>
            </div>

            <div className="mt-6 flex items-end gap-1.5">
              <PriceDisplay value={bizMonthly} />
              <span className="mb-1.5 text-sm text-[var(--text-lo)]">{period}</span>
            </div>

            <ul className="mt-7 space-y-3">
              {BIZ_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-mid)]">
                  <Check className="size-4 shrink-0 text-[var(--iris-cyan)]" />
                  <span className="flex-1">{f}</span>
                  {BIZ_SOON_SET.has(f) && (
                    <span className="shrink-0 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--text-lo)]">
                      Soon
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => { window.location.href = "mailto:sales@rizo.link?subject=Business%20plan%20inquiry" }}
                className="iris-border w-full rounded-full py-3 text-sm font-medium text-[var(--text-hi)] transition-colors hover:text-white"
              >
                Contact sales
              </button>
            </div>
          </motion.div>
        </TiltCard>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          Comparison table
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto mt-20 max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="liquid-glass overflow-hidden rounded-[var(--r-xl)]"
        >
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-b border-white/[0.06] px-6 py-4 sm:gap-x-10">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.20em] text-[var(--text-lo)]">
              Feature
            </span>
            <span className="w-14 text-center text-[10.5px] font-semibold uppercase tracking-[0.20em] text-[var(--text-lo)]">Free</span>
            <span className="w-14 text-center text-[10.5px] font-semibold uppercase tracking-[0.20em] text-[var(--accent-hi)]">Pro</span>
            <span className="w-20 text-center text-[10.5px] font-semibold uppercase tracking-[0.20em] text-[var(--text-lo)]">Biz</span>
          </div>

          {TABLE_ROWS.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.025, duration: 0.5 }}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-b border-white/[0.04] px-6 py-3.5 last:border-0 sm:gap-x-10"
            >
              <span className="text-sm text-[var(--text-hi)]">{r.label}</span>
              <span className="flex w-14 justify-center"><Cell value={r.free} /></span>
              <span className="flex w-14 justify-center"><Cell value={r.pro} /></span>
              <span className="flex w-20 justify-center"><Cell value={r.business} /></span>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-5 text-center text-xs text-[var(--text-lo)]">
          Cancel anytime. Your links and analytics are always yours.
        </p>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          Contact footer
      ════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mx-auto mt-16 mb-24 max-w-2xl px-4 text-center"
      >
        <p className="text-sm text-[var(--text-lo)]">
          Questions?{" "}
          <a
            href="mailto:support@rizo.link"
            className="text-[var(--text-mid)] underline underline-offset-2 transition-colors hover:text-white"
          >
            Email us
          </a>{" "}
          — we reply within one business day.
        </p>
      </motion.section>

      <Footer />
    </main>
  )
}
