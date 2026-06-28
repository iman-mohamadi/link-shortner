"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  icon?: React.ReactNode
  hint?: string
  error?: string
  suffix?: React.ReactNode
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, icon, hint, error, suffix, className, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-mid)]"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "group relative flex items-center gap-3 rounded-2xl border bg-white/[0.03] px-4 transition-all duration-300",
            "border-white/10 focus-within:border-transparent focus-within:bg-white/[0.05]",
            "focus-within:[box-shadow:0_0_0_1px_rgba(91,140,255,0.5),0_8px_30px_-10px_rgba(91,140,255,0.45)]",
            error && "border-[var(--iris-magenta)]/50",
            className
          )}
        >
          {icon && <span className="text-[var(--text-lo)] transition-colors group-focus-within:text-[var(--iris-azure)]">{icon}</span>}
          <input
            id={inputId}
            ref={ref}
            className="h-13 w-full bg-transparent py-3.5 text-[15px] text-[var(--text-hi)] placeholder:text-[var(--text-lo)] focus:outline-none"
            {...props}
          />
          {suffix}
        </div>
        {(hint || error) && (
          <p className={cn("mt-1.5 text-xs", error ? "text-[var(--iris-magenta)]" : "text-[var(--text-lo)]")}>
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)
Field.displayName = "Field"
