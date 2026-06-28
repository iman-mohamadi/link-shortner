"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils"

type Variant = "primary" | "ghost" | "outline"
type Size = "sm" | "md" | "lg"

interface BaseProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
  magnetic?: boolean
}

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
}

function classesFor(variant: Variant, size: Size, className?: string) {
  return cn(
    "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-tight transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50",
    sizes[size],
    variant === "primary" && "text-[#06070c] glow-iris",
    variant === "outline" && "iris-border text-[var(--text-hi)] hover:text-white",
    variant === "ghost" && "text-[var(--text-mid)] hover:text-white",
    className
  )
}

function Inner({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  return (
    <>
      {variant === "primary" && (
        <span className="absolute inset-0 bg-iris transition-transform duration-500 group-hover:scale-110" />
      )}
      {variant === "ghost" && (
        <span className="absolute inset-0 rounded-full bg-white/0 transition-colors duration-300 group-hover:bg-white/5" />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  )
}

function useMagnet(enabled: boolean) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 250, damping: 18 })
  const sy = useSpring(y, { stiffness: 250, damping: 18 })

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }
  return { sx, sy, onMove, onLeave }
}

interface ButtonProps extends BaseProps, Omit<React.ComponentProps<typeof motion.button>, "ref" | "children"> {}

export function MagneticButton({
  variant = "primary",
  size = "md",
  magnetic = true,
  className,
  children,
  ...props
}: ButtonProps) {
  const { sx, sy, onMove, onLeave } = useMagnet(magnetic)
  return (
    <motion.button
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      className={classesFor(variant, size, className)}
      {...props}
    >
      <Inner variant={variant}>{children}</Inner>
    </motion.button>
  )
}

interface LinkButtonProps extends BaseProps {
  href: string
}

export function MagneticLink({
  href,
  variant = "primary",
  size = "md",
  magnetic = true,
  className,
  children,
}: LinkButtonProps) {
  const { sx, sy, onMove, onLeave } = useMagnet(magnetic)
  return (
    <motion.div style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-flex">
      <motion.div whileTap={{ scale: 0.96 }} className="inline-flex">
        <Link href={href} className={classesFor(variant, size, className)}>
          <Inner variant={variant}>{children}</Inner>
        </Link>
      </motion.div>
    </motion.div>
  )
}
