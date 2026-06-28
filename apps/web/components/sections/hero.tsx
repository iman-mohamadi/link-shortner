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

  const launch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    const target = trimmed ? `/create?url=${encodeURIComponent(trimmed)}` : "/create"
    router.push(target)
  }

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pt-28 text-center">
      <Eyebrow className="mb-7">
        <Sparkles className="size-3 text-[var(--iris-cyan)]" /> The premium link engine
      </Eyebrow>

      <h1 className="font-display text-[clamp(3rem,11vw,9rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
        <span className="sr-only">Links that bend light.</span>
        <span aria-hidden className="flex flex-wrap justify-center gap-x-[0.25em]">
          {HEADLINE.map((word, i) => (
            <span key={i} className="overflow-hidden pb-[0.08em]">
              <motion.span
                initial="hidden"
                animate="show"
                variants={wordUp}
                transition={{ delay: 0.15 + i * 0.09, duration: 0.9, ease: ease.liquid }}
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
        transition={{ delay: 0.6, duration: 0.8, ease: ease.out }}
        className="mt-7 max-w-xl text-balance text-base text-[var(--text-mid)] sm:text-lg"
      >
        Forge short links with custom slugs, passwords and expiry — then watch
        every click travel the world in real time.
      </motion.p>

      <motion.form
        onSubmit={launch}
        initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.75, duration: 0.9, ease: ease.out }}
        className="glass-strong refract glow-soft mt-10 flex w-full max-w-xl items-center gap-2 rounded-full p-2 pl-5"
      >
        <Link2 className="size-5 shrink-0 text-[var(--text-lo)]" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a long, unwieldy URL…"
          className="h-11 w-full bg-transparent text-[15px] text-white placeholder:text-[var(--text-lo)] focus:outline-none"
        />
        <MagneticButton type="submit" size="md" className="shrink-0">
          Shorten <ArrowRight className="size-4" />
        </MagneticButton>
      </motion.form>

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
