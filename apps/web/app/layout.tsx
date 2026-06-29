import type { Metadata } from "next"
import { Geist_Mono, Figtree, Space_Grotesk } from "next/font/google"

import "@workspace/ui/globals.css"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SmoothScroll } from "@/components/providers/smooth-scroll"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@workspace/ui/lib/utils"

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" })
const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Lumen — links that bend light",
  description:
    "A premium link shortener. Forge short links, protect them, and watch them travel the world in real time.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark antialiased",
        fontMono.variable,
        figtree.variable,
        display.variable
      )}
    >
      <body className="font-sans">
        <ThemeProvider>
          <SmoothScroll />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
