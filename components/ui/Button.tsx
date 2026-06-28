'use client';

import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ children, className = '', href, variant = 'primary', ...props }: ButtonProps) {
  // Detect if children contains Bengali characters to prevent text distortion and letter-spacing breaks
  const hasBengali = typeof children === 'string' && /[\u0980-\u09FF]/.test(children);

  const baseStyles = `
    rounded-[4px] px-32px py-16px 
    text-small inline-flex items-center justify-center
    transition-all duration-300 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:scale-[1.02] active:scale-[0.98] hover:opacity-95
    ${hasBengali ? 'font-bengali font-bold tracking-normal' : 'font-bold uppercase tracking-widest'}
  `;

  const variants = {
    primary: 'bg-[#A31F24] text-white hover:bg-red-800',
    secondary: 'bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-gray-50',
    ghost: 'bg-transparent text-[#1A1A1A] hover:bg-gray-50',
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
