"use client"

import { useEffect, useRef, useState } from "react"
import { animate, motion, useInView } from "framer-motion"
import { Users, LinkIcon, MousePointerClick, Crown } from "lucide-react"
import { KineticText, Eyebrow } from "@/components/ui/kinetic-text"
import { adminApi, type PlatformStats } from "@/lib/api/admin"

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-20%" })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(Math.floor(v)),
    })
    return () => controls.stop()
  }, [inView, to])

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  )
}

export function Stats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    adminApi.getStats().then(setStats)
  }, [])

  const items = [
    { icon: LinkIcon, label: "Links forged", value: stats?.totalLinks ?? 0 },
    { icon: MousePointerClick, label: "Total clicks", value: stats?.totalClicks ?? 0 },
    { icon: Users, label: "Members", value: stats?.totalUsers ?? 0 },
    { icon: Crown, label: "Pro members", value: stats?.proUsers ?? 0 },
  ]

  return (
    <section id="stats" className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36">
      <div className="iris-border relative overflow-hidden rounded-[var(--r-xl)] bg-[var(--ink-800)] p-8 sm:p-14">
        <div className="pointer-events-none absolute -left-24 top-1/2 size-72 -translate-y-1/2 rounded-full bg-iris opacity-20 blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1.4fr]">
          <div>
            <Eyebrow className="mb-5">Live network</Eyebrow>
            <KineticText
              as="h2"
              text="A network that grows in real time."
              className="text-balance text-3xl font-semibold tracking-tight text-chrome sm:text-5xl"
            />
            <p className="mt-4 max-w-md text-[var(--text-mid)]">
              These numbers stream straight from the RizO API — no vanity
              metrics, just the live state of the platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {items.map((it, i) => (
              <motion.div
                key={it.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="glass refract rounded-2xl p-5"
              >
                <it.icon className="mb-3 size-5 text-[var(--iris-cyan)]" />
                <div className="font-display text-3xl font-semibold text-white sm:text-4xl">
                  <CountUp to={it.value} />
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-lo)]">
                  {it.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
