"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Link2, Sparkles } from "lucide-react"
import { Eyebrow } from "@/components/ui/kinetic-text"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { Marquee } from "@/components/ui/bits"
import { wordUp, ease } from "@/lib/motion"

const HEADLINE = ["Links", "that", "bend", "light."]

export function Hero() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [focused, setFocused] = useState(false)

  const launch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    const target = trimmed ? `/create?url=${encodeURIComponent(trimmed)}` : "/create"
    router.push(target)
  }

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pt-28 text-center">
      {/* Ambient iris bloom behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[720px] -translate-x-1/2 -translate-y-[55%] rounded-full bg-[var(--accent)] opacity-[0.07] blur-[120px]"
      />

      <Eyebrow className="mb-7">
        <Sparkles className="size-3 text-[var(--iris-cyan)]" /> The premium link engine
      </Eyebrow>

      <h1 className="font-display text-[clamp(3.25rem,11.5vw,9.5rem)] font-semibold leading-[0.90] tracking-[-0.045em]">
        <span className="sr-only">Links that bend light.</span>
        <span aria-hidden className="flex flex-wrap justify-center gap-x-[0.22em]">
          {HEADLINE.map((word, i) => (
            <span key={i} className="overflow-hidden pb-[0.06em]">
              <motion.span
                initial="hidden"
                animate="show"
                variants={wordUp}
                transition={{ delay: 0.12 + i * 0.09, duration: 0.95, ease: ease.liquid }}
                className={i >= 2 ? "inline-block text-iris" : "inline-block text-chrome"}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58, duration: 0.9, ease: ease.out }}
        className="mt-8 max-w-lg text-balance text-[1.0625rem] leading-relaxed text-[var(--text-mid)] sm:text-lg"
      >
        Forge short links with custom slugs, passwords and expiry — then watch
        every click travel the world in real time.
      </motion.p>

      {/*
        Liquid glass input pill.
        The focus ring is rendered as a separate motion.div so it can
        animate independently without affecting layout.
      */}
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.75, duration: 0.9, ease: ease.out }}
        className="relative mt-10 w-full max-w-xl"
      >
        {/* Iris focus halo — fades in when the field has focus */}
        <motion.div
          aria-hidden
          animate={{
            opacity: focused ? 1 : 0,
            scale: focused ? 1 : 0.92,
          }}
          transition={{ duration: 0.35, ease: ease.out }}
          className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[var(--accent)] opacity-0 blur-[28px]"
          style={{ opacity: focused ? 0.18 : 0 }}
        />

        <form
          onSubmit={launch}
          className="liquid-glass-pill flex w-full items-center gap-2 rounded-full p-2 pl-5 transition-shadow duration-300"
        >
          <Link2
            className="size-5 shrink-0 transition-colors duration-200"
            style={{ color: focused ? "var(--accent-hi)" : "var(--text-lo)" }}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Paste a long, unwieldy URL…"
            className="h-11 w-full bg-transparent text-[15px] text-white placeholder:text-[var(--text-lo)] focus:outline-none"
          />
          <MagneticButton type="submit" size="md" className="shrink-0">
            Shorten <ArrowRight className="size-4" />
          </MagneticButton>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="mt-16 w-full max-w-3xl"
      >
        <Marquee
          items={["Custom slugs", "Password locks", "Expiring links", "Live geo analytics", "Instant QR", "Device insights"]}
        />
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/15 p-1.5">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="size-1.5 rounded-full bg-iris"
          />
        </div>
      </motion.div>
    </section>
  )
}
