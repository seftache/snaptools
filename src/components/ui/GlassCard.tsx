"use client";

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  accentColor?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = "", accentColor, hover = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, boxShadow: accentColor ? `0 0 20px ${accentColor}33` : '0 8px 32px rgba(0,0,0,0.3)' } : undefined}
      className={`relative rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6 shadow-[var(--glass-shadow)] ${className}`}
      style={{
        ...(accentColor ? { borderTopColor: accentColor } : {}),
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
