"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Loader2, Minus, Sparkles } from "lucide-react"
import { LiquidBackground } from "@/components/three/liquid-background"
import { MarketingNav } from "@/components/layout/marketing-nav"
import { Footer } from "@/components/layout/footer"
import { Surface } from "@/components/ui/surface"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { Eyebrow } from "@/components/ui/kinetic-text"
import { Badge } from "@/components/ui/bits"
import { toast } from "@/components/ui/toaster"
import { useHydratedAuth } from "@/lib/hooks/use-auth"
import { billingApi } from "@/lib/api/billing"
import { reveal, viewport } from "@/lib/motion"

interface Row {
  label: string
  free: string | boolean
  pro: string | boolean
}

const rows: Row[] = [
  { label: "Short links", free: "Up to 25", pro: "Unlimited" },
  { label: "Clicks & redirects", free: "Unlimited", pro: "Unlimited" },
  { label: "Real-time geo / device analytics", free: true, pro: true },
  { label: "Instant QR codes", free: true, pro: true },
  { label: "Auto title & favicon previews", free: true, pro: true },
  { label: "Enable / pause links", free: true, pro: true },
  { label: "Custom branded slugs", free: false, pro: true },
  { label: "Password-protected links", free: false, pro: true },
  { label: "Expiring / self-destruct links", free: false, pro: true },
  { label: "Priority redirect edge", free: false, pro: true },
]

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="size-4 text-[var(--iris-cyan)]" />
  if (value === false) return <Minus className="size-4 text-[var(--text-lo)]" />
  return <span className="text-sm text-[var(--text-mid)]">{value}</span>
}

export default function PricingPage() {
  const router = useRouter()
  const { isAuthed, user } = useHydratedAuth()
  const isPro = Boolean(user?.isPro)
  const [upgrading, setUpgrading] = useState(false)

  const upgrade = async () => {
    if (!isAuthed) {
      router.push("/auth?next=/pricing")
      return
    }
    if (isPro) return
    setUpgrading(true)
    try {
      const res = await billingApi.checkout()
      if (res.alreadyPro) {
        toast.info("You're already on Pro")
      } else {
        toast.success("Welcome to Pro ✨")
        router.push("/dashboard")
      }
    } catch (err: any) {
      toast.error(err.message || "Upgrade failed")
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <LiquidBackground intensity={0.5} />
      <MarketingNav />

      <section className="relative mx-auto max-w-5xl px-4 pt-36 text-center">
        <Eyebrow className="mb-6 justify-center">
          <Sparkles className="size-3 text-[var(--iris-cyan)]" /> Pricing
        </Eyebrow>
        <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-chrome">
          Cinematic power,
          <br />
          <span className="text-iris">honest pricing.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-[var(--text-mid)] sm:text-lg">
          Start free with full analytics and 25 links. Upgrade when you need
          branded slugs, locks and expiry — no feature held hostage behind
          fake limits.
        </p>
      </section>

      {/* Plan cards */}
      <section className="relative mx-auto mt-16 grid max-w-4xl gap-5 px-4 sm:grid-cols-2">
        {/* Free */}
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewport}>
          <Surface variant="glass" className="flex h-full flex-col p-7 sm:p-9">
            <h2 className="font-display text-2xl font-semibold text-white">Free</h2>
            <p className="mt-1 text-sm text-[var(--text-mid)]">For getting started.</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="font-display text-5xl font-semibold text-chrome">$0</span>
              <span className="mb-1.5 text-sm text-[var(--text-lo)]">/forever</span>
            </div>
            <ul className="mt-7 space-y-3 text-sm">
              {["Up to 25 links", "Full real-time analytics", "QR codes & favicons", "Enable / pause links"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[var(--text-mid)]">
                  <Check className="size-4 shrink-0 text-[var(--iris-cyan)]" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <MagneticButton
                variant="outline"
                size="lg"
                className="w-full"
                disabled={isAuthed && !isPro}
                onClick={() => (isAuthed ? router.push("/dashboard") : router.push("/auth?next=/create"))}
              >
                {isAuthed && !isPro ? "Your current plan" : "Get started free"}
              </MagneticButton>
            </div>
          </Surface>
        </motion.div>

        {/* Pro */}
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewport} transition={{ delay: 0.08 }}>
          <Surface variant="iris" glow className="relative flex h-full flex-col overflow-hidden p-7 sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-iris opacity-25 blur-3xl" />
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-white">Pro</h2>
              <Badge tone="pro">
                <Sparkles className="size-3" /> Most loved
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--text-mid)]">For people who ship.</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="font-display text-5xl font-semibold text-white">$8</span>
              <span className="mb-1.5 text-sm text-[var(--text-lo)]">/month</span>
            </div>
            <ul className="mt-7 space-y-3 text-sm">
              {[
                "Everything in Free",
                "Unlimited links",
                "Custom branded slugs",
                "Password-protected links",
                "Expiring / self-destruct links",
                "Priority redirect edge",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-white">
                  <Check className="size-4 shrink-0 text-[var(--iris-cyan)]" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <MagneticButton size="lg" className="w-full" onClick={upgrade} disabled={upgrading || isPro}>
                {isPro ? (
                  <>You&apos;re on Pro <Sparkles className="size-4" /></>
                ) : upgrading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>Upgrade to Pro <Sparkles className="size-4" /></>
                )}
              </MagneticButton>
            </div>
          </Surface>
        </motion.div>
      </section>

      {/* Comparison table */}
      <section className="relative mx-auto mt-20 max-w-3xl px-4">
        <Surface variant="glass" className="overflow-hidden p-2">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 px-5 py-4 text-xs uppercase tracking-[0.16em] text-[var(--text-lo)] sm:gap-x-12">
            <span>Feature</span>
            <span className="w-16 text-center">Free</span>
            <span className="w-16 text-center">Pro</span>
          </div>
          {rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 border-t border-white/[0.05] px-5 py-3.5 sm:gap-x-12"
            >
              <span className="text-sm text-[var(--text-hi)]">{r.label}</span>
              <span className="flex w-16 justify-center"><Cell value={r.free} /></span>
              <span className="flex w-16 justify-center"><Cell value={r.pro} /></span>
            </div>
          ))}
        </Surface>
        <p className="mt-4 text-center text-xs text-[var(--text-lo)]">
          Cancel anytime. Your links and analytics are always yours.
        </p>
      </section>

      <div className="mt-24">
        <Footer />
      </div>
    </main>
  )
}
