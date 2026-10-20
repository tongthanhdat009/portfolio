'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  FileCode2,
  Cpu,
  Wrench,
  Milestone,
  FlaskConical,
  BookOpen,
  Image as ImageIcon,
  Send,
  History,
  Sliders,
  User,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  draftCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  draftCount = 0,
}) => {
  const pathname = usePathname();
  const [contentOpen, setContentOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-sm)] font-display text-xs font-bold uppercase tracking-wider transition-all duration-100 ${
      active
        ? 'bg-[var(--color-sky)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]'
        : 'text-[var(--color-ink)] hover:bg-[var(--color-paper)] hover:border-2 hover:border-black/20 border-2 border-transparent'
    }`;

  const subNavItemClass = (active: boolean) =>
    `flex items-center justify-between px-3 py-1.5 rounded-[var(--radius-sm)] font-mono text-xs font-medium transition-all ${
      active
        ? 'bg-[var(--color-sun)] text-[var(--color-ink)] font-bold border border-[var(--color-ink)]'
        : 'text-stone-700 hover:bg-[var(--color-paper)] hover:text-black'
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[var(--color-surface)] border-r-3 border-[var(--color-ink)] flex flex-col transition-all duration-200 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`border-b-2 border-[var(--color-ink)] bg-[var(--color-paper)] ${
          isCollapsed
            ? 'flex flex-col items-center gap-2 py-3 px-2'
            : 'h-16 flex items-center justify-between px-4'
        }`}
      >
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-sun)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] flex items-center justify-center font-display font-extrabold text-sm">
              CMS
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-sm tracking-widest text-[var(--color-ink)]">
                DAT.ADMIN
              </span>
              <span className="font-mono text-[9px] text-[var(--color-muted-text)] font-semibold uppercase">
                NEO-BRUTAL CMS
              </span>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-sun)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] flex items-center justify-center font-display font-black text-sm">
              D
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-[var(--radius-sm)] border-2 border-transparent hover:border-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-all cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {/* Overview */}
        <Link
          href="/admin"
          className={navItemClass(isActive('/admin'))}
          title="Overview Dashboard"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>OVERVIEW</span>}
        </Link>

        {/* Content Group */}
        <div>
          <button
            onClick={() => setContentOpen(!contentOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius-sm)] font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-all cursor-pointer ${
              pathname.startsWith('/admin/content') ? 'bg-amber-100/60 font-black' : ''
            }`}
            title="Content Manager"
          >
            <div className="flex items-center gap-3">
              <FolderKanban className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>CONTENT</span>}
            </div>
            {!isCollapsed && (
              <span className="text-stone-500">
                {contentOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            )}
          </button>

          {/* Sub menu items */}
          {(!isCollapsed && contentOpen) && (
            <div className="pl-6 pr-1 py-1 space-y-1 mt-1 border-l-2 border-stone-200 ml-5">
              <Link
                href="/admin/content/pages/home"
                className={subNavItemClass(isActive('/admin/content/pages'))}
              >
                <span>↳ Home Page</span>
                <span className="text-[10px] text-stone-400">Builder</span>
              </Link>
              <Link
                href="/admin/content/projects"
                className={subNavItemClass(isActive('/admin/content/projects'))}
              >
                <span>↳ Projects</span>
                <Badge variant="sun" size="sm">Work</Badge>
              </Link>
              <Link
                href="/admin/content/capabilities"
                className={subNavItemClass(isActive('/admin/content/capabilities'))}
              >
                <span>↳ Capabilities</span>
              </Link>
              <Link
                href="/admin/content/skills"
                className={subNavItemClass(isActive('/admin/content/skills'))}
              >
                <span>↳ Toolbox</span>
              </Link>
              <Link
                href="/admin/content/experience"
                className={subNavItemClass(isActive('/admin/content/experience'))}
              >
                <span>↳ Journey</span>
              </Link>
              <Link
                href="/admin/content/experiments"
                className={subNavItemClass(isActive('/admin/content/experiments'))}
              >
                <span>↳ Lab</span>
              </Link>
              <Link
                href="/admin/content/notes"
                className={subNavItemClass(isActive('/admin/content/notes'))}
              >
                <span>↳ Notes</span>
              </Link>
            </div>
          )}
        </div>

        {/* Media */}
        <Link
          href="/admin/media"
          className={navItemClass(isActive('/admin/media'))}
          title="Media Library"
        >
          <ImageIcon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>ASSETS / MEDIA</span>}
        </Link>

        {/* Publishing */}
        <Link
          href="/admin/publishing"
          className={navItemClass(isActive('/admin/publishing'))}
          title="Publishing Hub"
        >
          <Send className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span>PUBLISHING</span>
              {draftCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[var(--color-sun)] border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
                  {draftCount}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* History */}
        <Link
          href="/admin/history"
          className={navItemClass(isActive('/admin/history'))}
          title="Revision History & Rollback"
        >
          <History className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>HISTORY</span>}
        </Link>

        {/* Settings */}
        <Link
          href="/admin/settings"
          className={navItemClass(isActive('/admin/settings'))}
          title="Site Settings & Navigation"
        >
          <Sliders className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>SETTINGS</span>}
        </Link>

        {/* Account */}
        <Link
          href="/admin/account"
          className={navItemClass(isActive('/admin/account'))}
          title="Account Profile"
        >
          <User className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>ACCOUNT</span>}
        </Link>
      </div>

      {/* Footer info */}
      <div className="p-3 border-t-2 border-[var(--color-ink)] bg-stone-50 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LOCAL / READY
              </span>
              <span className="font-semibold text-stone-700">v1.1</span>
            </div>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-paper)] border-2 border-[var(--color-ink)] text-xs font-display font-bold uppercase tracking-wider text-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:bg-[var(--color-sun)] transition-all"
            >
              <span>VIEW PORTFOLIO</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </>
        ) : (
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center p-2 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-[var(--color-sun)]"
            title="View Portfolio"
          >
            <ExternalLink className="w-4 h-4 text-[var(--color-ink)]" />
          </a>
        )}
      </div>
    </aside>
  );
};
