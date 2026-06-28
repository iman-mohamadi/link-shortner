"use client"

import { motion } from "framer-motion"
import { ClipboardPaste, SlidersHorizontal, Share2 } from "lucide-react"
import { KineticText, Eyebrow } from "@/components/ui/kinetic-text"
import { reveal, viewport } from "@/lib/motion"

const steps = [
  { n: "01", icon: ClipboardPaste, title: "Paste your URL", desc: "Drop any long link into the forge. We capture it instantly." },
  { n: "02", icon: SlidersHorizontal, title: "Shape it", desc: "Add a custom slug, a password, or an expiry date — your rules." },
  { n: "03", icon: Share2, title: "Share & track", desc: "Send the short link and watch live analytics roll in from every corner." },
]

export function HowItWorks() {
  return (
    <section id="how" className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36">
      <div className="mb-16 text-center">
        <Eyebrow className="mb-5">The flow</Eyebrow>
        <KineticText
          as="h2"
          text="Three moves to a smarter link."
          className="text-balance text-4xl font-semibold tracking-tight text-chrome sm:text-6xl"
        />
      </div>

      <div className="relative grid gap-6 md:grid-cols-3">
        <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            transition={{ delay: i * 0.12 }}
            className="glass refract relative rounded-[var(--r-xl)] p-7"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.05] text-[var(--iris-azure)]">
                <s.icon className="size-5" />
              </span>
              <span className="font-display text-4xl font-semibold text-white/10">{s.n}</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-white">{s.title}</h3>
            <p className="mt-2 text-sm text-[var(--text-mid)]">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
