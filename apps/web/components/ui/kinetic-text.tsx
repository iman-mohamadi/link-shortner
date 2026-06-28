"use client"

import { motion } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"
import { wordUp, ease } from "@/lib/motion"

interface KineticTextProps {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  delay?: number
  once?: boolean
}

/** Word-by-word masked rise reveal for cinematic headings. */
export function KineticText({
  text,
  className,
  as = "h2",
  delay = 0,
  once = true,
}: KineticTextProps) {
  const Tag = motion[as]
  const words = text.split(" ")
  return (
    <Tag
      className={cn("font-display", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span variants={wordUp} className="inline-block">
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Single-line iridescent shimmer label. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: ease.out }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-mid)] backdrop-blur",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-iris" />
      {children}
    </motion.span>
  )
}
