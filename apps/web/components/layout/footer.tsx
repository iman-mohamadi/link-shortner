import Link from "next/link"
import { Logo } from "./logo"

export function Footer() {
  return (
    <footer className="relative mx-auto max-w-6xl px-4 pb-12">
      <div className="glass refract rounded-[var(--r-xl)] px-6 py-10 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-[var(--text-mid)]">
              Links that bend light. A premium link engine for people who care
              about the details.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
            <Link href="#features" className="text-[var(--text-mid)] transition-colors hover:text-white">
              Features
            </Link>
            <Link href="#how" className="text-[var(--text-mid)] transition-colors hover:text-white">
              How it works
            </Link>
            <Link href="/pricing" className="text-[var(--text-mid)] transition-colors hover:text-white">
              Pricing
            </Link>
            <Link href="/auth" className="text-[var(--text-mid)] transition-colors hover:text-white">
              Sign in
            </Link>
            <Link href="/create" className="text-[var(--text-mid)] transition-colors hover:text-white">
              Create link
            </Link>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-[var(--text-lo)] sm:flex-row">
          <span>© {new Date().getFullYear()} Lumen. Crafted in the dark.</span>
          <span className="font-display tracking-[0.2em] text-iris">BEND THE LIGHT</span>
        </div>
      </div>
    </footer>
  )
}
