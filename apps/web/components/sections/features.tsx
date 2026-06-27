'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '../ui/glass-card';
import { BarChart3, Globe, Lock, Zap, QrCode, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Redirects happen in milliseconds with our global CDN infrastructure.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Track clicks, devices, locations, and referrers with beautiful visualizations.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Password-protect links and control who accesses your content.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Servers in 50+ countries ensure your links work everywhere.',
  },
  {
    icon: QrCode,
    title: 'QR Codes',
    description: 'Generate beautiful QR codes instantly for offline marketing.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Perfect experience on any device with responsive design.',
  },
];

export function Features() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Powerful features designed for modern businesses and creators.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard variant="gradient" className="h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
