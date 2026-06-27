import { motion } from 'framer-motion';
import { cn } from '@workspace/ui/lib/utils';

interface GradientInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export function GradientInput({ label, error, icon, className, ...props }: GradientInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-white/80"
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
        <motion.input
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileFocus={{ scale: 1.02 }}
          className={cn(
            'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3',
            'text-white placeholder:text-white/30',
            'backdrop-blur-xl transition-all duration-300',
            'focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            icon && 'pl-12',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
