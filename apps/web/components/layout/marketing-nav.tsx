"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"
import { Logo } from "./logo"
import { useHydratedAuth } from "@/lib/hooks/use-auth"
import { MagneticLink } from "@/components/ui/magnetic-button"

const sections = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#stats", label: "Network" },
]

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const { isAuthed } = useHydratedAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-6xl px-4"
    >
      <nav
        className={cn(
          "flex items-center justify-between rounded-full px-3 py-2 pl-5 transition-all duration-500",
          scrolled ? "glass-strong refract glow-soft" : "border border-transparent"
        )}
      >
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-full px-4 py-2 text-sm text-[var(--text-mid)] transition-colors hover:text-white"
            >
              {s.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <MagneticLink href="/dashboard" size="sm">
              Dashboard
            </MagneticLink>
          ) : (
            <>
              <Link
                href="/auth"
                className="hidden rounded-full px-4 py-2 text-sm text-[var(--text-mid)] transition-colors hover:text-white sm:block"
              >
                Sign in
              </Link>
              <MagneticLink href="/auth" size="sm">
                Get started
              </MagneticLink>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
