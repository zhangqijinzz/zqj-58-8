import { useState } from 'react';
import { Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReportModal } from './ReportModal';
import type { ReportableContentType } from '../types';

interface ReportButtonProps {
  targetType: ReportableContentType;
  targetId: string;
  targetContent?: {
    title?: string;
    content?: string;
    authorId?: string;
    authorName?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost';
}

export function ReportButton({
  targetType,
  targetId,
  targetContent,
  size = 'md',
  variant = 'default',
}: ReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  };

  const variantClasses = {
    default: 'bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50',
    ghost: 'hover:bg-red-500/20 text-slate-500 hover:text-red-400',
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className={`rounded-lg transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]}`}
        title="举报内容"
      >
        <Flag size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <ReportModal
            onClose={() => setIsModalOpen(false)}
            targetType={targetType}
            targetId={targetId}
            targetContent={targetContent}
          />
        )}
      </AnimatePresence>
    </>
  );
}
