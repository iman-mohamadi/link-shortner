"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"

type Variant = "primary" | "ghost" | "outline"
type Size = "sm" | "md" | "lg"

interface BaseProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
}

function classesFor(variant: Variant, size: Size, className?: string) {
  return cn(
    "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-tight transition-colors duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
    sizes[size],
    variant === "primary" && "text-white glow-iris",
    variant === "outline" && "iris-border text-[var(--text-hi)] hover:text-white",
    variant === "ghost" && "text-[var(--text-mid)] hover:text-white",
    className
  )
}

function Inner({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  return (
    <>
      {variant === "primary" && (
        <span className="absolute inset-0 bg-iris transition-colors duration-200 group-hover:brightness-110" />
      )}
      {variant === "ghost" && (
        <span className="absolute inset-0 rounded-full bg-white/0 transition-colors duration-200 group-hover:bg-white/5" />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  )
}

interface ButtonProps extends BaseProps, Omit<React.ComponentProps<"button">, "ref" | "children"> {}

export function MagneticButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={classesFor(variant, size, className)} {...props}>
      <Inner variant={variant}>{children}</Inner>
    </button>
  )
}

interface LinkButtonProps extends BaseProps {
  href: string
}

export function MagneticLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: LinkButtonProps) {
  return (
    <Link href={href} className={classesFor(variant, size, className)}>
      <Inner variant={variant}>{children}</Inner>
    </Link>
  )
}
