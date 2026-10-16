'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '@/types';

interface HeaderProps {
  settings: SiteSettings;
}

const NAV_ITEMS = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Lab', href: '/lab' },
  { label: 'Notes', href: '/notes' },
  { label: 'Contact', href: '/contact' },
];

export const Header: React.FC<HeaderProps> = ({ settings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF9E9] border-b-3 border-[#111111]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-18 md:h-20 flex items-center justify-between">
        {/* Left: Wordmark */}
        <Link
          href="/"
          className="font-display font-extrabold text-xl md:text-2xl tracking-tighter text-[#111111] hover:text-[#FF7661] transition-colors flex items-center gap-2 group"
          aria-label="Home page"
        >
          <span className="w-4 h-4 bg-[#111111] border-2 border-[#111111] group-hover:bg-[#FFDB58] transition-colors" />
          <span>{settings.logoText}</span>
        </Link>

        {/* Center: Desktop Nav */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 lg:gap-2"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 font-display text-sm font-bold uppercase tracking-wider transition-colors hover:text-[#111111] ${
                  isActive
                    ? 'text-[#111111]'
                    : 'text-[#5B5751] hover:text-[#111111]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-3 right-3 h-[3px] bg-[#111111]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/contact"
            className="px-4 py-2 font-display text-sm font-bold uppercase tracking-wider bg-[#FFDB58] text-[#111111] rounded-md neo-border neo-shadow-sm neo-btn-press"
          >
            Say Hello ↗
          </Link>
        </div>

        {/* Mobile: Menu Toggle Button */}
        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-11 h-11 flex items-center justify-center bg-[#FFFFFF] border-2 border-[#111111] rounded-md neo-shadow-sm neo-btn-press text-[#111111]"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer / Panel */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="md:hidden fixed inset-x-0 top-[75px] bottom-0 bg-[#FFF9E9] border-b-4 border-[#111111] z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-top-2 duration-150"
        >
          <nav className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-4 rounded-lg neo-border text-lg font-display font-bold uppercase tracking-wider neo-shadow-sm ${
                    isActive ? 'bg-[#FFDB58]' : 'bg-[#FFFFFF] hover:bg-[#89CFF0]'
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowUpRight size={20} />
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t-2 border-[#111111] flex flex-col gap-3">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 text-center font-display font-bold text-base uppercase bg-[#FFDB58] text-[#111111] rounded-lg neo-border neo-shadow-md neo-btn-press"
            >
              Get In Touch ↗
            </Link>
            <div className="flex items-center justify-center gap-4 text-xs font-mono text-[#5B5751] pt-2">
              <span>{settings.tagline}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
