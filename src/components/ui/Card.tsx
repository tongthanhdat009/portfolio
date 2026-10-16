import React from 'react';
import { ColorAccent } from '@/types';

interface CardProps {
  children: React.ReactNode;
  accent?: ColorAccent;
  interactive?: boolean;
  border?: 'sm' | 'md' | 'poster';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
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

const borderMap = {
  sm: 'neo-border-sm',
  md: 'neo-border',
  poster: 'neo-border-poster',
};

const shadowMap = {
  sm: 'neo-shadow-sm',
  md: 'neo-shadow-md',
  lg: 'neo-shadow-lg',
  xl: 'neo-shadow-xl',
};

export const Card: React.FC<CardProps> = ({
  children,
  accent = 'surface',
  interactive = false,
  border = 'md',
  shadow = 'md',
  className = '',
}) => {
  return (
    <div
      className={`rounded-lg ${borderMap[border]} ${shadowMap[shadow]} ${accentBgMap[accent]} ${
        interactive ? 'neo-card-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
