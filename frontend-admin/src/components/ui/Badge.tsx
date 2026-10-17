import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sun' | 'sky' | 'coral' | 'lime' | 'pink' | 'paper' | 'surface' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'paper',
  size = 'md',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center font-mono font-semibold uppercase tracking-wider border-2 border-[var(--color-ink)] select-none';

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px] rounded-[var(--radius-sm)]',
    md: 'px-2.5 py-1 text-xs rounded-[var(--radius-sm)]',
  };

  const variants = {
    sun: 'bg-[var(--color-sun)] text-[var(--color-ink)]',
    sky: 'bg-[var(--color-sky)] text-[var(--color-ink)]',
    coral: 'bg-[var(--color-coral)] text-[var(--color-ink)]',
    lime: 'bg-[var(--color-lime)] text-[var(--color-ink)]',
    pink: 'bg-[var(--color-pink)] text-[var(--color-ink)]',
    paper: 'bg-[var(--color-paper)] text-[var(--color-ink)]',
    surface: 'bg-[var(--color-surface)] text-[var(--color-ink)]',
    neutral: 'bg-stone-200 text-stone-800 border-stone-800',
  };

  return (
    <span className={twMerge(clsx(base, sizes[size], variants[variant], className))} {...props}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: 'draft' | 'published' | 'archived';
  hasUnpublishedChanges?: boolean;
}> = ({ status, hasUnpublishedChanges }) => {
  if (status === 'archived') {
    return (
      <Badge variant="neutral" size="sm" className="gap-1.5">
        <span className="w-2 h-2 rounded-full bg-stone-500" />
        Archived
      </Badge>
    );
  }

  if (status === 'published') {
    if (hasUnpublishedChanges) {
      return (
        <Badge variant="sun" size="sm" className="gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Live (Draft Changes)
        </Badge>
      );
    }
    return (
      <Badge variant="lime" size="sm" className="gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
        Live
      </Badge>
    );
  }

  return (
    <Badge variant="paper" size="sm" className="gap-1.5">
      <span className="w-2 h-2 rounded-full bg-amber-400" />
      Draft
    </Badge>
  );
};
