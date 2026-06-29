"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Link2Off, ArrowRight } from "lucide-react"
import { LiquidBackground } from "@/components/three/liquid-background"
import { Logo } from "@/components/layout/logo"
import { Surface } from "@/components/ui/surface"

const ease = [0.16, 1, 0.3, 1] as const

function NotFoundContent() {
  const slug = useSearchParams().get("slug") ?? ""
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4">
      <LiquidBackground intensity={0.3} />
      <div className="absolute left-4 top-6 sm:left-8"><Logo /></div>
      <Surface
        variant="chrome"
        initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease }}
        className="w-full max-w-sm p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.12 }}
          className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-[var(--iris-magenta)]/10"
        >
          <Link2Off className="size-6 text-[var(--iris-magenta)]" />
        </motion.div>
        <h1 className="font-display text-2xl font-semibold text-white">Link not found</h1>
        <p className="mt-3 text-sm text-[var(--text-mid)]">
          {slug ? (
            <><span className="font-mono text-[var(--iris-cyan)]">/{slug}</span> doesn&apos;t exist</>
          ) : (
            "This short link doesn’t exist"
          )}{" "}
          or may have been removed.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white glow-iris transition-[filter] hover:brightness-110"
        >
          Forge a new link <ArrowRight className="size-4" />
        </Link>
      </Surface>
    </main>
  )
}

export default function NotFoundPage() {
  return <Suspense fallback={null}><NotFoundContent /></Suspense>
}
