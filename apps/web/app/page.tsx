import { HeroBackground } from '@/components/three/hero-background';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { CTA } from '@/components/sections/cta';

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0f0f1a]">
      <HeroBackground />
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
