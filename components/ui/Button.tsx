'use client';

import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ children, className = '', href, variant = 'primary', ...props }: ButtonProps) {
  const baseStyles = `
    rounded-[4px] px-32px py-16px 
    text-small font-bold uppercase tracking-widest 
    transition-colors duration-300 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    inline-flex items-center justify-center
  `;

  const variants = {
    primary: 'bg-[#A31F24] text-white hover:bg-[#800000]',
    secondary: 'bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-gray-100',
    ghost: 'bg-transparent text-[#1A1A1A] hover:bg-gray-100',
  };

  const styles = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} className={styles}>
      {children}
    </button>
  );
}

export default Button;
