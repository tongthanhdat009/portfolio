import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'paper' | 'sun' | 'sky';
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  borderWidth?: '2' | '3' | '4';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'surface', shadow = 'md', borderWidth = '2', children, ...props }, ref) => {
    const base = 'rounded-[var(--radius-md)] transition-all';

    const variants = {
      surface: 'bg-[var(--color-surface)] text-[var(--color-ink)]',
      paper: 'bg-[var(--color-paper)] text-[var(--color-ink)]',
      sun: 'bg-[var(--color-sun)] text-[var(--color-ink)]',
      sky: 'bg-[var(--color-sky)] text-[var(--color-ink)]',
    };

    const shadows = {
      none: '',
      sm: 'shadow-[var(--shadow-neo-sm)]',
      md: 'shadow-[var(--shadow-neo-md)]',
      lg: 'shadow-[var(--shadow-neo-lg)]',
    };

    const borders = {
      '2': 'border-2 border-[var(--color-ink)]',
      '3': 'border-[3px] border-[var(--color-ink)]',
      '4': 'border-4 border-[var(--color-ink)]',
    };

    return (
      <div
        ref={ref}
        className={twMerge(clsx(base, variants[variant], borders[borderWidth], shadows[shadow], className))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
