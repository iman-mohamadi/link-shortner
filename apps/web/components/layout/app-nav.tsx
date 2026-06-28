"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutDashboard, Plus, LogOut, Sparkles } from "lucide-react"
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

        <div className="flex items-center gap-3">
          {user?.isPro ? (
            <Badge tone="pro">
              <Sparkles className="size-3" /> PRO
            </Badge>
          ) : (
            <Link href="/create" className="hidden text-xs text-[var(--text-mid)] hover:text-white sm:block">
              {user?.phone}
            </Link>
          )}
          <button
            onClick={logout}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--text-mid)] transition-colors hover:border-white/25 hover:text-white"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </nav>
    </motion.header>
  )
}
