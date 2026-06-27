'use client';

import { motion } from 'framer-motion';
import { GradientButton } from '../ui/gradient-button';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 to-indigo-900/30" />
      
      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Shorten Your First Link?
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Join thousands of creators and businesses who trust us with their links.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <GradientButton size="lg">
                Get Started Free
              </GradientButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
