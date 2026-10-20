'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Archive,
  RefreshCw,
  ExternalLink,
  Star,
  Layers,
  CheckCircle2,
  Eye,
  Undo2,
  FileText,
} from 'lucide-react';
import { CmsEntry, ProjectData } from '@/types';
import type { PagedResult } from '@/lib/cms/service';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import {
  archiveEntryAction,
  deleteEntryAction,
  createEntryAction,
  publishEntryAction,
  restoreEntryAction,
  syncGithubAction,
  importCvAction,
} from '@/app/admin/actions';

interface ProjectsClientProps {
  initialBundle: PagedResult<CmsEntry<ProjectData>>;
  initialStatus: string;
  initialSearch: string;
  initialCategory: string;
}

const VALID_TABS = ['all', 'published', 'draft', 'archived'] as const;

export default function ProjectsClient({
  initialBundle,
  initialStatus,
  initialSearch,
  initialCategory,
}: ProjectsClientProps) {
  const [bundle, setBundle] = useState(initialBundle);
  const projects = bundle.items as CmsEntry<ProjectData>[];
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [deleteTarget, setDeleteTarget] = useState<CmsEntry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [syncMsg, setSyncMsg] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === '' || v === 'all') sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete('page');
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const debouncedSearch = useDebouncedValue(searchInput);
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (debouncedSearch !== current) {
      const sp = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) sp.set('q', debouncedSearch);
      else sp.delete('q');
      sp.delete('page');
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const setItems = (items: CmsEntry<ProjectData>[], totalDelta = 0) =>
    setBundle((b) => ({ ...b, items, total: b.total + totalDelta }));

  const handleDuplicate = (project: CmsEntry<ProjectData>) => {
    startTransition(async () => {
      const copy = {
        type: 'project' as const,
        title: `${project.title} (Copy)`,
        slug: `${project.slug}-copy-${Date.now().toString().slice(-4)}`,
        locale: project.locale,
        status: 'draft' as const,
        sortOrder: (project.sortOrder || 0) + 1,
        featured: false,
        references: [...(project.references || [])],
        seo: { ...project.seo, title: `${project.title} (Copy)` },
        data: {
          ...project.data,
          title: `${project.data.title} (Copy)`,
          slug: `${project.data.slug}-copy-${Date.now().toString().slice(-4)}`,
          featured: false,
        },
      };

      const created = await createEntryAction(copy);
      setItems([created as CmsEntry<ProjectData>, ...projects], 1);
      router.refresh();
    });
  };

  const handleSyncGithub = () => {
    startTransition(async () => {
      setSyncMsg('Syncing GitHub repositories…');
      try {
        const res = await syncGithubAction();
        const parts = [`${res.created} created`, `${res.updated} updated`, `${res.skipped} skipped`];
        if (res.privateSkipped > 0) {
          parts.push(`${res.privateSkipped} private skipped`);
        }
        if (res.coversUploaded > 0) {
          parts.push(`${res.coversUploaded} covers uploaded`);
        }
        if (res.failed.length > 0) {
          parts.push(`${res.failed.length} failed (${res.failed.map((f) => f.repo).join(', ')})`);
        }
        const updatedById = new Map(res.updatedEntries.map((e) => [e._id, e]));
        setItems(
          [...res.createdEntries, ...projects.map((p) => updatedById.get(p._id) ?? p)] as CmsEntry<ProjectData>[],
          res.createdEntries.length
        );
        setSyncMsg(`GitHub sync done: ${parts.join(', ')} — new entries saved as drafts.`);
        router.refresh();
      } catch (err) {
        setSyncMsg(`GitHub sync error: ${(err as Error).message}`);
      }
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const updated = await archiveEntryAction(id);
      setItems(projects.map((p) => (p._id === id ? updated : p)) as CmsEntry<ProjectData>[]);
      router.refresh();
    });
  };

  const handleRestore = (id: string) => {
    startTransition(async () => {
      const updated = await restoreEntryAction(id);
      setItems(projects.map((p) => (p._id === id ? updated : p)) as CmsEntry<ProjectData>[]);
      router.refresh();
    });
  };

  const handleImportCv = () => {
    startTransition(async () => {
      setSyncMsg('Importing CV data…');
      try {
        const res = await importCvAction();
        const parts = [
          `${res.projectsCreated} projects`,
          `${res.experienceCreated} experience`,
          `${res.skillsCreated} skills`,
        ];
        if (res.globalsUpdated) parts.push('site settings updated');
        if (res.failed.length > 0) {
          parts.push(`${res.failed.length} failed (${res.failed.map((f) => f.item).join(', ')})`);
        }
        setSyncMsg(`CV import done: ${parts.join(', ')} — all saved as drafts.`);
        router.refresh();
      } catch (err) {
        setSyncMsg(`CV import error: ${(err as Error).message}`);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteEntryAction(deleteTarget._id);
      setItems(projects.filter((p) => p._id !== deleteTarget._id), -1);
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const categories = [
    'all',
    'Web Products',
    'Backend & APIs',
    'Intelligent Workflows',
    'Developer Tools',
    'Systems & Architecture',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-[var(--color-ink)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-sun)] px-2 py-0.5 border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
              CONTENT MANAGER
            </span>
            <span className="font-mono text-xs text-stone-500">PROJECTS & CASE STUDIES</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)]">
            PROJECTS
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Manage case studies, work wall entries, links, and technical story breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleSyncGithub}
            isLoading={isPending}
          >
            <RefreshCw className="w-4 h-4" />
            SYNC GITHUB
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleImportCv}
            isLoading={isPending}
          >
            <FileText className="w-4 h-4" />
            IMPORT CV
          </Button>
          <Link href="/admin/content/projects/new">
            <Button variant="primary" size="lg">
              <Plus className="w-4 h-4" />
              NEW PROJECT
            </Button>
          </Link>
        </div>
      </div>

      {syncMsg && (
        <div className="p-3 bg-stone-100 border-2 border-stone-300 rounded-[var(--radius-sm)] font-mono text-xs font-bold text-stone-700 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          {syncMsg}
        </div>
      )}

      {/* Filter and Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-[var(--radius-md)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {VALID_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => pushParams({ status: tab })}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                initialStatus === tab
                  ? 'bg-[var(--color-sun)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-active)]'
                  : 'text-stone-600 hover:bg-[var(--color-paper)] border-2 border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search title, slug, tags..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-body bg-stone-50 border-2 border-[var(--color-ink)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <select
            value={initialCategory}
            onChange={(e) => pushParams({ category: e.target.value })}
            className="px-3 py-1.5 text-xs font-body font-semibold bg-stone-50 border-2 border-[var(--color-ink)] rounded-[var(--radius-sm)] cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Table / Card List */}
      <Card variant="surface" shadow="md" borderWidth="2" className="overflow-hidden">
        {projects.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-paper)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] flex items-center justify-center mx-auto text-xl">
              📂
            </div>
            <h3 className="font-display font-bold text-base text-[var(--color-ink)]">
              NO PROJECTS FOUND
            </h3>
            <p className="font-body text-xs text-[var(--color-muted-text)] max-w-sm mx-auto">
              No entries match the active filter or search query. Try clearing filters or create a new project.
            </p>
          <Link href="/admin/content/projects/new">
              <Button variant="primary" size="sm" className="mt-2">
                CREATE FIRST PROJECT
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[var(--color-ink)] bg-[var(--color-paper)] text-xs font-mono uppercase tracking-wider text-[var(--color-ink)]">
                  <th className="py-3 px-4 font-bold">PROJECT / TITLE</th>
                  <th className="py-3 px-4 font-bold">CATEGORY</th>
                  <th className="py-3 px-4 font-bold">STATUS</th>
                  <th className="py-3 px-4 font-bold">REVISION</th>
                  <th className="py-3 px-4 font-bold">UPDATED</th>
                  <th className="py-3 px-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-stone-100 text-sm font-body">
                {projects.map((project) => (
                  <tr key={project._id} className="hover:bg-amber-50/40 transition-colors">
                    {/* Title & info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-paper)] border-2 border-[var(--color-ink)] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-[var(--shadow-neo-sm)]">
                          {project.data?.index || '01'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/content/projects/${project._id}`}
                              className="font-display font-bold text-sm text-[var(--color-ink)] hover:underline truncate"
                            >
                              {project.title}
                            </Link>
                            {project.featured && (
                              <Badge variant="sun" size="sm" className="gap-1">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                FEATURED
                              </Badge>
                            )}
                          </div>
                          <span className="font-mono text-xs text-stone-500 block truncate">
                            /{project.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-stone-100 rounded border border-stone-300">
                        {project.data?.category || 'General'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={project.status}
                        hasUnpublishedChanges={project.hasUnpublishedChanges}
                      />
                    </td>

                    {/* Revision */}
                    <td className="py-3.5 px-4 font-mono text-xs text-stone-600">
                      rev #{project.revision}
                    </td>

                    {/* Updated */}
                    <td className="py-3.5 px-4 font-mono text-xs text-stone-500">
                      {new Date(project.updatedAt).toLocaleDateString('en-US')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/content/projects/${project._id}`}>
                          <button
                            className="p-1.5 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-white hover:bg-[var(--color-sun)] transition-all cursor-pointer"
                            title="Edit project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDuplicate(project)}
                          className="p-1.5 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-white hover:bg-[var(--color-sky)] transition-all cursor-pointer"
                          title="Duplicate as draft"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {project.status !== 'archived' ? (
                          <button
                            onClick={() => handleArchive(project._id)}
                            className="p-1.5 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-white hover:bg-stone-200 transition-all cursor-pointer"
                            title="Archive project"
                          >
                            <Archive className="w-3.5 h-3.5 text-stone-600" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(project._id)}
                              className="p-1.5 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-white hover:bg-[var(--color-lime)] transition-all cursor-pointer"
                              title="Restore to draft"
                            >
                              <Undo2 className="w-3.5 h-3.5 text-stone-700" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(project)}
                              className="p-1.5 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-white hover:bg-[var(--color-coral)] transition-all cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[var(--color-negative)]" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {projects.length > 0 && (
          <div className="px-4 pb-4">
            <Pagination
              page={bundle.page}
              totalPages={bundle.lastPage}
              total={bundle.total}
              perPage={bundle.perPage}
            />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="PERMANENTLY DELETE ENTRY"
        description="This action cannot be undone. Public routes and references will be purged."
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-stone-700">
            Are you sure you want to permanently delete project{' '}
            <strong className="text-[var(--color-ink)] font-mono">{deleteTarget?.title}</strong>?
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              CANCEL
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isPending}>
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
