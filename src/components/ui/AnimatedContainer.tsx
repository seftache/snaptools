"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function AnimatedContainer({ children, className = "", delay = 0, direction = 'up' }: AnimatedContainerProps) {
  const getVariants = () => {
    switch (direction) {
      case 'up': return { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
      case 'down': return { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } };
      case 'left': return { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } };
      case 'right': return { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };
      default: return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={getVariants()}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
