import { LiquidBackground } from "@/components/three/liquid-background"
import { MarketingNav } from "@/components/layout/marketing-nav"
import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Stats } from "@/components/sections/stats"
import { CTA } from "@/components/sections/cta"
import { Footer } from "@/components/layout/footer"

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <LiquidBackground />
      <MarketingNav />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <CTA />
      <Footer />
    </main>
  )
}
