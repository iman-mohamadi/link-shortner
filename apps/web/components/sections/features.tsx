"use client"

import { motion } from "framer-motion"
import { BarChart3, Globe, Lock, Zap, QrCode, Clock, Wand2 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { KineticText, Eyebrow } from "@/components/ui/kinetic-text"
import { reveal, viewport } from "@/lib/motion"

interface Cell {
  icon: React.ElementType
  title: string
  desc: string
  className: string
  accent?: boolean
}

const cells: Cell[] = [
  {
    icon: BarChart3,
    title: "Cinematic analytics",
    desc: "Every click broken down by country, device and browser — rendered in real time.",
    className: "md:col-span-2 md:row-span-2",
    accent: true,
  },
  { icon: Wand2, title: "Custom slugs", desc: "Claim memorable, branded short codes.", className: "md:col-span-1" },
  { icon: Lock, title: "Password locks", desc: "Gate sensitive links behind a passphrase.", className: "md:col-span-1" },
  { icon: Clock, title: "Expiring links", desc: "Set a self-destruct date and time.", className: "md:col-span-1" },
  { icon: QrCode, title: "Instant QR", desc: "A crisp, scannable code for every link.", className: "md:col-span-1" },
  { icon: Zap, title: "Millisecond redirects", desc: "Buffered click-counting keeps hops instant.", className: "md:col-span-1" },
  { icon: Globe, title: "Worldwide", desc: "Geo-aware insights from the first scan.", className: "md:col-span-1" },
]

export function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-4 py-28 sm:py-36">
      <div className="mb-14 max-w-2xl">
        <Eyebrow className="mb-5">Capabilities</Eyebrow>
        <KineticText
          as="h2"
          text="A control room for every link you ship."
          className="text-balance text-4xl font-semibold tracking-tight text-chrome sm:text-6xl"
        />
      </div>

      <div className="grid auto-rows-[minmax(160px,1fr)] grid-cols-1 gap-4 md:grid-cols-4">
        {cells.map((c, i) => (
          <motion.article
            key={c.title}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            transition={{ delay: (i % 4) * 0.05 }}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden rounded-[var(--r-xl)] p-6",
              c.accent ? "iris-border bg-[var(--ink-800)]" : "glass refract",
              c.className
            )}
          >
            {c.accent && <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-iris opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-30" />}
            <div className={cn("flex size-11 items-center justify-center rounded-xl", c.accent ? "bg-iris text-[#06070c]" : "bg-white/[0.05] text-[var(--iris-azure)]")}>
              <c.icon className="size-5" />
            </div>
            <div className="relative mt-6">
              <h3 className={cn("font-display font-semibold tracking-tight", c.accent ? "text-2xl sm:text-3xl text-white" : "text-lg text-white")}>
                {c.title}
              </h3>
              <p className={cn("mt-2 text-[var(--text-mid)]", c.accent ? "max-w-sm text-base" : "text-sm")}>{c.desc}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
