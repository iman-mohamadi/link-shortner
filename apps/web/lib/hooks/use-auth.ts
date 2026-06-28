"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"
import { apiClient } from "@/lib/api/client"

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

/** Redirects to /auth when there is no session. */
export function useRequireAuth() {
  const router = useRouter()
  const { hydrated, token, user } = useHydratedAuth()

  useEffect(() => {
    if (hydrated && !token) router.replace("/auth")
  }, [hydrated, token, router])

  return { ready: hydrated && Boolean(token), user }
}
