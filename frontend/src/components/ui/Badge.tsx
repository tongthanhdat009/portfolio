import React from 'react';
import { ColorAccent } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  accent?: ColorAccent;
  size?: 'sm' | 'md';
  className?: string;
}

const accentBgMap: Record<ColorAccent, string> = {
  sun: 'bg-[#FFDB58]',
  sky: 'bg-[#89CFF0]',
  coral: 'bg-[#FF7661]',
  lime: 'bg-[#C6F56A]',
  pink: 'bg-[#F9A8D4]',
  paper: 'bg-[#FFF9E9]',
  surface: 'bg-[#FFFFFF]',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  accent = 'surface',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs md:text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-sm border-2 border-[#111111] text-[#111111] neo-shadow-sm select-none ${accentBgMap[accent]} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
