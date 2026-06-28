"use client"

import * as React from "react"
import { animate, motion, useInView } from "framer-motion"
import { Check, Copy } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "./toaster"

/* -------------------------------- CountUp --------------------------------- */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15%" })
  const [val, setVal] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(Math.floor(v)),
    })
    return () => controls.stop()
  }, [inView, to])

  return (
    <span ref={ref} className={className}>
      {val.toLocaleString()}
    </span>
  )
}

/* ---------------------------------- Badge --------------------------------- */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode
  tone?: "neutral" | "iris" | "pro" | "danger"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        tone === "neutral" && "border border-white/10 bg-white/[0.04] text-[var(--text-mid)]",
        tone === "iris" && "bg-iris-soft text-[var(--iris-cyan)] border border-[var(--iris-azure)]/30",
        tone === "pro" && "bg-iris text-[#06070c]",
        tone === "danger" && "border border-[var(--iris-magenta)]/30 bg-[var(--iris-magenta)]/10 text-[var(--iris-magenta)]",
        className
      )}
    >
      {children}
    </span>
  )
}

/* -------------------------------- Skeleton -------------------------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl bg-white/[0.04]", className)} />
}

/* ------------------------------- CopyButton ------------------------------- */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Could not copy")
    }
  }
  return (
    <button
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[var(--text-mid)] transition-colors hover:text-white hover:border-white/25",
        className
      )}
    >
      {copied ? <Check className="size-3.5 text-[var(--iris-cyan)]" /> : <Copy className="size-3.5" />}
      {label ?? (copied ? "Copied" : "Copy")}
    </button>
  )
}

/* --------------------------------- Marquee -------------------------------- */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const doubled = [...items, ...items]
  return (
    <div className={cn("relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]", className)}>
      <div className="marquee-track gap-12 py-2">
        {doubled.map((it, i) => (
          <span key={i} className="text-sm uppercase tracking-[0.25em] text-[var(--text-lo)]">
            {it}
            <span className="ml-12 text-[var(--iris-violet)]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------- StatTile -------------------------------- */
export function StatTile({
  value,
  label,
  icon,
}: {
  value: React.ReactNode
  label: string
  icon?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass refract rounded-2xl p-5"
    >
      <div className="mb-2 flex items-center gap-2 text-[var(--text-lo)]">
        {icon}
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className="font-display text-3xl text-chrome">{value}</div>
    </motion.div>
  )
}
