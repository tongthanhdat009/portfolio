import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FFDB58] focus:text-[#111111] focus:font-bold focus:neo-border focus:neo-shadow-md"
    >
      Skip to main content
    </a>
  );
};
