"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label="RizO home">
      {/* Logomark — "R" on a rose gradient tile */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: -4 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className="relative flex size-8 items-center justify-center overflow-hidden rounded-xl"
        style={{
          background: "linear-gradient(145deg, var(--accent-hi) 0%, var(--accent) 55%, var(--accent-lo) 100%)",
          boxShadow: "0 4px 14px -4px rgba(124,58,237,0.55), 0 0 0 1px rgba(255,255,255,0.10) inset",
        }}
      >
        {/* Top-edge specular */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.28) 0%, transparent 55%)" }}
        />
        <span
          className="relative font-display font-black text-white"
          style={{ fontSize: 15, letterSpacing: "-0.05em", lineHeight: 1 }}
        >
          R
        </span>
      </motion.div>

      {/* Wordmark */}
      <span className="font-display text-[1.1rem] font-bold tracking-tight text-white">
        Riz
        <span style={{ color: "var(--accent)" }}>O</span>
      </span>
    </Link>
  )
}
