'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
  ShieldCheck,
  Search,
  Bell,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminTopbarProps {
  onLogout: () => Promise<void>;
  hasUnsavedChanges?: boolean;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onLogout,
  hasUnsavedChanges = false,
}) => {
  const pathname = usePathname();

  // Generate breadcrumb items
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = '/' + pathSegments.slice(0, index + 1).join('/');
    const title = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { title, url, isLast: index === pathSegments.length - 1 };
  });

  return (
    <header className="h-16 bg-[var(--color-surface)] border-b-3 border-[var(--color-ink)] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="font-bold text-[var(--color-ink)] font-display tracking-wider">PORTFOLIO CMS</span>
        {breadcrumbs.map((bc, idx) => (
          <React.Fragment key={bc.url}>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            {bc.isLast ? (
              <span className="font-bold text-black uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded-[var(--radius-sm)] border border-stone-300">
                {bc.title}
              </span>
            ) : (
              <Link href={bc.url} className="text-stone-600 hover:text-black uppercase tracking-wider">
                {bc.title}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right: Actions, Unsaved Alert & User Account */}
      <div className="flex items-center gap-3">
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 border-2 border-amber-500 rounded-[var(--radius-sm)] text-xs font-mono font-bold text-amber-900 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            UNSAVED CHANGES
          </div>
        )}

        <Link href="/admin/content/projects/new">
          <Button variant="sun" size="sm" className="hidden sm:inline-flex">
            <Plus className="w-3.5 h-3.5" />
            NEW PROJECT
          </Button>
        </Link>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-[var(--color-surface)] hover:bg-[var(--color-paper)] text-xs font-display font-bold uppercase shadow-[var(--shadow-neo-sm)] transition-all"
        >
          <span>VIEW SITE</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* User & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l-2 border-stone-200">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-lime)] flex items-center justify-center font-display font-black text-xs text-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]">
            DN
          </div>
          <button
            onClick={() => onLogout()}
            className="p-1.5 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-white hover:bg-[var(--color-coral)] transition-colors cursor-pointer text-stone-700 hover:text-black"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
