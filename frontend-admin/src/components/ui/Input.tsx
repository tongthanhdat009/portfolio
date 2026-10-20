import React, { useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const autoId = useId().replace(/:/g, '');
    const inputId = id || props.name || autoId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center justify-between">
            <span>{label}</span>
            {props.required && <span className="text-[var(--color-negative)] font-mono text-xs">*REQ</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2.5 bg-[var(--color-surface)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] rounded-[var(--radius-sm)] font-body text-sm placeholder:text-[var(--color-muted-text)] shadow-[var(--shadow-neo-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] disabled:bg-stone-100 disabled:opacity-60 transition-all',
              error && 'border-[var(--color-negative)] ring-1 ring-[var(--color-negative)]',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <span className="text-xs font-semibold text-[var(--color-negative)] font-mono flex items-center gap-1">
            ⚠ {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-[var(--color-muted-text)] font-body">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, rows = 4, ...props }, ref) => {
    const autoId = useId().replace(/:/g, '');
    const inputId = id || props.name || autoId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] flex items-center justify-between">
            <span>{label}</span>
            {props.required && <span className="text-[var(--color-negative)] font-mono text-xs">*REQ</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2.5 bg-[var(--color-surface)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] rounded-[var(--radius-sm)] font-body text-sm placeholder:text-[var(--color-muted-text)] shadow-[var(--shadow-neo-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] disabled:bg-stone-100 disabled:opacity-60 transition-all resize-y',
              error && 'border-[var(--color-negative)] ring-1 ring-[var(--color-negative)]',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <span className="text-xs font-semibold text-[var(--color-negative)] font-mono flex items-center gap-1">
            ⚠ {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-[var(--color-muted-text)] font-body">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, id, options, children, ...props }, ref) => {
    const autoId = useId().replace(/:/g, '');
    const inputId = id || props.name || autoId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2.5 bg-[var(--color-surface)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] rounded-[var(--radius-sm)] font-body text-sm shadow-[var(--shadow-neo-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] cursor-pointer transition-all',
              error && 'border-[var(--color-negative)]',
              className
            )
          )}
          {...props}
        >
          {options
            ? options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <span className="text-xs font-semibold text-[var(--color-negative)] font-mono">⚠ {error}</span>
        ) : helperText ? (
          <span className="text-xs text-[var(--color-muted-text)] font-body">{helperText}</span>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';
