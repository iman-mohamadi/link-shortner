"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { KineticText } from "@/components/ui/kinetic-text"
import { MagneticLink } from "@/components/ui/magnetic-button"
import { ease } from "@/lib/motion"

export function CTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-28 sm:py-40">
      <div className="relative flex flex-col items-center overflow-hidden rounded-[var(--r-xl)] px-6 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-iris opacity-[0.14] blur-2xl" />
        <div className="pointer-events-none absolute inset-0 -z-10 glass" />

        <KineticText
          as="h2"
          text="Ship your first light-bending link."
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-7xl"
        />
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: ease.out }}
          className="mt-6 max-w-md text-[var(--text-mid)]"
        >
          Free to start. No credit card. Pro features one tap away.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7, ease: ease.out }}
          className="mt-10"
        >
          <MagneticLink href="/auth" size="lg">
            Start shortening <ArrowRight className="size-4" />
          </MagneticLink>
        </motion.div>
      </div>
    </section>
  )
}
