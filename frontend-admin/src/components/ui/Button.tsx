'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'sun' | 'sky' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-display uppercase tracking-wider transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] gap-1.5',
      md: 'px-4 py-2 text-sm font-bold rounded-[var(--radius-sm)] gap-2',
      lg: 'px-6 py-3 text-base font-bold rounded-[var(--radius-md)] gap-2.5',
    };

    const variants = {
      primary: 'bg-[var(--color-sun)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[var(--shadow-neo-active)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
      sun: 'bg-[var(--color-sun)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[var(--shadow-neo-active)]',
      sky: 'bg-[var(--color-sky)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:translate-x-[1px] hover:translate-y-[1px]',
      lime: 'bg-[var(--color-lime)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:translate-x-[1px] hover:translate-y-[1px]',
      secondary: 'bg-[var(--color-surface)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:bg-[var(--color-paper)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[var(--shadow-neo-active)]',
      danger: 'bg-[var(--color-coral)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:bg-[#ff5a43] hover:translate-x-[1px] hover:translate-y-[1px]',
      ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper)] border border-transparent hover:border-[var(--color-ink)]',
      outline: 'bg-transparent text-[var(--color-ink)] border-2 border-[var(--color-ink)] hover:bg-[var(--color-surface)]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(base, sizes[size], variants[variant], className))}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
