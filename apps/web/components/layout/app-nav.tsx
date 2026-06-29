"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { LayoutDashboard, Plus, LogOut, Sparkles, Menu, X } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { authApi } from "@/lib/api/auth"
import { useHydratedAuth } from "@/lib/hooks/use-auth"
import { Logo } from "./logo"
import { Badge } from "@/components/ui/bits"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create", icon: Plus },
]

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useHydratedAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = () => {
    authApi.logout()
    router.replace("/")
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-4 z-40 mx-auto w-full max-w-6xl px-4"
    >
      <nav className="glass-strong refract flex items-center justify-between rounded-full px-3 py-2 pl-5 glow-soft">
        <Logo />

        {/* Desktop links */}
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                  active ? "text-white" : "text-[var(--text-mid)] hover:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.07] iris-border"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <l.icon className="size-4" />
                {l.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user?.isPro ? (
            <Badge tone="pro">
              <Sparkles className="size-3" /> PRO
            </Badge>
          ) : (
            <Link
              href="/pricing"
              className="hidden rounded-full border border-[var(--iris-azure)]/30 bg-iris-soft px-3 py-1.5 text-xs font-medium text-[var(--iris-cyan)] transition-colors hover:border-[var(--iris-azure)]/60 sm:block"
            >
              Upgrade
            </Link>
          )}
          <button
            onClick={logout}
            className="hidden size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--text-mid)] transition-colors hover:border-white/25 hover:text-white sm:flex"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--text-mid)] transition-colors hover:text-white sm:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass-strong refract mt-2 flex flex-col gap-1 rounded-3xl p-3 sm:hidden"
          >
            {links.map((l) => {
              const active = pathname.startsWith(l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                    active ? "bg-white/[0.07] text-white" : "text-[var(--text-mid)] hover:text-white"
                  )}
                >
                  <l.icon className="size-4" />
                  {l.label}
                </Link>
              )
            })}
            {!user?.isPro && (
              <Link
                href="/pricing"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--iris-cyan)] transition-colors hover:text-white"
              >
                <Sparkles className="size-4" /> Upgrade to Pro
              </Link>
            )}
            <button
              onClick={() => {
                setMenuOpen(false)
                logout()
              }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-[var(--text-mid)] transition-colors hover:text-white"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
