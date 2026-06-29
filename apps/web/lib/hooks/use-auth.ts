"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"
import { apiClient } from "@/lib/api/client"
import { authApi } from "@/lib/api/auth"

/** Tracks zustand-persist hydration so we never flash the wrong UI. */
export function useHydratedAuth() {
  const [hydrated, setHydrated] = useState(false)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    setHydrated(true)
    // Keep the api client token in sync with the persisted store.
    if (token) apiClient.setToken(token)
  }, [token])

  return { hydrated, token, user, isAuthed: hydrated && Boolean(token) }
}

/** Redirects to /auth when there is no session, and syncs plan status from /me. */
export function useRequireAuth() {
  const router = useRouter()
  const { hydrated, token, user } = useHydratedAuth()
  const refreshed = useRef(false)

  useEffect(() => {
    if (!hydrated) return
    if (!token) {
      // Preserve where the user was headed (incl. query) so they land back
      // here after signing in — this powers the "paste a URL, then sign in to
      // forge it" onboarding path.
      const dest =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/dashboard"
      router.replace(`/auth?next=${encodeURIComponent(dest)}`)
      return
    }
    // Refresh the live profile once per mount so an upgrade reflects immediately.
    if (!refreshed.current) {
      refreshed.current = true
      void authApi.refreshProfile()
    }
  }, [hydrated, token, router])

  return { ready: hydrated && Boolean(token), user }
}
