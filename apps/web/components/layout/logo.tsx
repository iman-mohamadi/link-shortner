"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5">
      <motion.span
        whileHover={{ rotate: 90 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="relative flex size-8 items-center justify-center rounded-xl bg-iris glow-iris"
      >
        <span className="size-3 rounded-[5px] bg-[#06070c]" />
      </motion.span>
      <span className="font-display text-lg font-semibold tracking-tight text-white">
        Lumen
      </span>
    </Link>
  )
}
