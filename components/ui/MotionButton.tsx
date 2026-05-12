'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function MotionButton({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'px-32px py-16px text-small font-bold uppercase tracking-widest flex items-center justify-center transition-colors';

  const variants = {
    primary: 'bg-loomra-red text-loomra-white hover:bg-red-800',
    outline: 'border border-loomra-black text-loomra-black hover:bg-loomra-surface',
    ghost: 'bg-transparent text-loomra-black hover:text-loomra-red'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
    >
      {children}
    </motion.button>
  );
}
