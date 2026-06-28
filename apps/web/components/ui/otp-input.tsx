"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
}

/** Animated segmented one-time-code field. */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled,
  error,
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])
  const chars = value.split("")

  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  const setChar = (i: number, char: string) => {
    const next = value.split("")
    next[i] = char
    const joined = next.join("").slice(0, length)
    onChange(joined)
    if (char && joined.length === length && !joined.includes("")) {
      onComplete?.(joined)
    }
  }

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1)
    if (!digit) return
    setChar(i, digit)
    if (i < length - 1) focusAt(i + 1)
  }

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      if (chars[i]) {
        setChar(i, "")
      } else if (i > 0) {
        focusAt(i - 1)
        setChar(i - 1, "")
      }
    }
    if (e.key === "ArrowLeft") focusAt(i - 1)
    if (e.key === "ArrowRight") focusAt(i + 1)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (!pasted) return
    onChange(pasted)
    if (pasted.length === length) onComplete?.(pasted)
    focusAt(pasted.length)
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => {
        const filled = Boolean(chars[i])
        return (
          <motion.div
            key={i}
            animate={error ? { x: [0, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <input
              ref={(el) => {
                refs.current[i] = el
              }}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              disabled={disabled}
              value={chars[i] ?? ""}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              className={cn(
                "size-12 rounded-2xl border bg-white/[0.03] text-center font-display text-2xl text-[var(--text-hi)] transition-all duration-200 focus:outline-none sm:size-14",
                filled ? "border-transparent iris-border" : "border-white/10",
                error && "border-[var(--iris-magenta)]/60",
                "focus:[box-shadow:0_0_0_1px_rgba(91,140,255,0.6),0_10px_30px_-10px_rgba(155,107,255,0.5)]"
              )}
            />
            {filled && (
              <motion.span
                layoutId={`otp-glow-${i}`}
                className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-iris opacity-20 blur-md"
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
