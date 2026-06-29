"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight, Lock, Loader2, ShieldCheck } from "lucide-react"
import { LiquidBackground } from "@/components/three/liquid-background"
import { Logo } from "@/components/layout/logo"
import { Surface } from "@/components/ui/surface"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const ease = [0.16, 1, 0.3, 1] as const

function MagneticUnlock({ loading, disabled }: { loading: boolean; disabled: boolean }) {
  const ref = useRef<HTMLButtonElement>(null)
  const mx  = useMotionValue(0)
  const my  = useMotionValue(0)
  const sx  = useSpring(mx, { stiffness: 350, damping: 22 })
  const sy  = useSpring(my, { stiffness: 350, damping: 22 })

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left - r.width  / 2) * 0.35)
    my.set((e.clientY - r.top  - r.height / 2) * 0.35)
  }

  return (
    <motion.button
      ref={ref}
      type="submit"
      disabled={loading || disabled}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      className="mt-6 w-full rounded-full bg-[var(--accent)] py-3.5 text-sm font-semibold text-white glow-iris transition-[filter] hover:brightness-110 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="mx-auto size-4 animate-spin" />
      ) : (
        <span className="flex items-center justify-center gap-2">
          Unlock <ArrowRight className="size-4" />
        </span>
      )}
    </motion.button>
  )
}

function ProtectedPage() {
  const { slug }  = useParams<{ slug: string }>()
  const params    = useSearchParams()
  const hasError  = params.get("error") === "1"

  const [password, setPassword] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(hasError ? "Incorrect password. Try again." : null)
  const [focused,  setFocused]  = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/${encodeURIComponent(slug)}/unlock`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Incorrect password")
        setPassword("")
        return
      }
      // Redirect to the destination URL
      window.location.href = data.url
    } catch {
      setError("Could not reach the server. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-10">
      <LiquidBackground intensity={0.5} />

      <div className="absolute left-4 top-6 sm:left-8">
        <Logo />
      </div>

      <Surface
        variant="chrome"
        glow
        initial={{ opacity: 0, y: 32, filter: "blur(14px)" }}
        animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
        transition={{ duration: 0.85, ease }}
        className="w-full max-w-sm p-8 sm:p-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
          className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-[var(--accent)]/15"
        >
          <Lock className="size-6 text-[var(--accent-hi)]" />
        </motion.div>

        <h1 className="text-center font-display text-2xl font-semibold tracking-[-0.025em] text-white">
          Protected link
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--text-mid)]">
          Enter the password to continue to your destination.
        </p>

        <form onSubmit={submit} className="mt-8">
          {/* Password input */}
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${focused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.10)"}`,
              boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
            }}
          >
            <ShieldCheck className="size-4 shrink-0 text-[var(--text-lo)] transition-colors duration-300"
              style={{ color: focused ? "var(--accent-hi)" : undefined }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter password…"
              autoFocus
              className="w-full bg-transparent text-sm text-white placeholder:text-[var(--text-lo)] focus:outline-none"
            />
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key={error}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-3 text-center text-xs text-[var(--iris-magenta)]"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <MagneticUnlock loading={loading} disabled={!password.trim()} />
        </form>
      </Surface>

      <p className="relative mt-8 text-center text-xs text-[var(--text-lo)]">
        Secured by{" "}
        <span className="font-medium text-iris">RizO</span>
        {" "}· /{slug}
      </p>
    </main>
  )
}

export default function ProtectedLinkPage() {
  return (
    <Suspense fallback={null}>
      <ProtectedPage />
    </Suspense>
  )
}
