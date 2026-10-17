'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full ${maxWidths[maxWidth]} z-10`}>
        <Card variant="surface" shadow="lg" borderWidth="3" className="overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--color-ink)] bg-[var(--color-paper)]">
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[var(--color-ink)]">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-[var(--color-muted-text)] font-body mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-white hover:bg-[var(--color-coral)] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 text-[var(--color-ink)]" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t-2 border-[var(--color-ink)] bg-stone-50">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
