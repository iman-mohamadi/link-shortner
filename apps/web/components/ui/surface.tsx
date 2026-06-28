"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"

type Variant = "glass" | "chrome" | "iris"

interface SurfaceProps extends HTMLMotionProps<"div"> {
  variant?: Variant
  refract?: boolean
  glow?: boolean
}

/**
 * The base material of the product — a refractive glass/chrome panel.
 */
export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant = "glass", refract = true, glow = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative rounded-[var(--r-xl)]",
          variant === "glass" && "glass",
          variant === "chrome" && "glass-strong",
          variant === "iris" && "iris-border bg-[var(--ink-800)]",
          refract && "refract",
          glow && "glow-soft",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Surface.displayName = "Surface"
