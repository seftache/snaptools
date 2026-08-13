"use client";

import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  accentColor?: string;
}

export function Button({ variant = 'primary', size = 'md', children, className = "", disabled, href, accentColor, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const sizeStyles = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg"
  };

  const variants = {
    primary: "bg-gradient-to-r from-[var(--accent-daily)] to-[var(--accent-media)] text-white shadow hover:opacity-90 border-0",
    secondary: "bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]"
  };

  const buttonStyle = `${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`;

  const MotionComponent = href ? motion(Link) : motion.button;
  const customProps = href ? { href, className: buttonStyle } : { className: buttonStyle, disabled, ...props };

  return (
    <MotionComponent
      whileTap={{ scale: 0.97 }}
      whileHover={{ 
        boxShadow: accentColor ? `0 0 15px ${accentColor}40` : variant === 'primary' ? '0 0 15px rgba(255,255,255,0.1)' : 'none'
      }}
      {...(customProps as any)}
    >
      {children}
    </MotionComponent>
  );
}
