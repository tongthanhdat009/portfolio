import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'accent-sky' | 'accent-lime' | 'accent-coral' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#FFDB58] text-[#111111] hover:bg-[#FFE37A]',
  secondary: 'bg-[#FFFFFF] text-[#111111] hover:bg-[#89CFF0]',
  'accent-sky': 'bg-[#89CFF0] text-[#111111] hover:bg-[#A3DCF5]',
  'accent-lime': 'bg-[#C6F56A] text-[#111111] hover:bg-[#D5F88A]',
  'accent-coral': 'bg-[#FF7661] text-[#111111] hover:bg-[#FF8D7D]',
  ghost: 'bg-transparent text-[#111111] hover:bg-[#FFF9E9] border-none shadow-none',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-bold neo-border-sm neo-shadow-sm',
  md: 'px-5 py-2.5 text-sm font-bold neo-border neo-shadow-md',
  lg: 'px-7 py-3.5 text-base font-bold neo-border neo-shadow-md',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  href,
  external = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = `inline-flex items-center justify-center gap-2 font-display uppercase tracking-wider rounded-md neo-btn-press select-none cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
};
