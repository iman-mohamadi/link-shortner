"use client"

import { create } from "zustand"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { ease } from "@/lib/motion"

type ToastKind = "success" | "error" | "info"
interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, "id">) => void
  dismiss: (id: number) => void
}

let counter = 1
const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = counter++
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
    }, 4200)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

export const toast = {
  success: (message: string) => useToastStore.getState().push({ kind: "success", message }),
  error: (message: string) => useToastStore.getState().push({ kind: "error", message }),
  info: (message: string) => useToastStore.getState().push({ kind: "info", message }),
}

const icons = {
  success: <CheckCircle2 className="size-4 text-[var(--iris-cyan)]" />,
  error: <AlertTriangle className="size-4 text-[var(--iris-magenta)]" />,
  info: <Info className="size-4 text-[var(--iris-azure)]" />,
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: ease.out }}
            className={cn(
              "glass-strong refract pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--text-hi)] glow-soft"
            )}
          >
            {icons[t.kind]}
            <span className="max-w-[70vw] sm:max-w-sm">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-1 text-[var(--text-lo)] transition-colors hover:text-white"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
