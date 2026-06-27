import { motion } from 'framer-motion';
import { cn } from '@workspace/ui/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'dark';
  hover?: boolean;
}

export function GlassCard({ children, className, variant = 'default', hover = true }: GlassCardProps) {
  const variants = {
    default: 'bg-white/5 backdrop-blur-xl border border-white/10',
    gradient: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20',
    dark: 'bg-black/40 backdrop-blur-xl border border-white/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl p-6 shadow-2xl',
        variants[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
