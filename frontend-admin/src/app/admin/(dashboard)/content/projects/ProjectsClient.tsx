'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { CmsEntry, ProjectData } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  archiveEntryAction,
  deleteEntryAction,
  createEntryAction,
  publishEntryAction,
} from '@/app/admin/actions';

interface ProjectsClientProps {
  initialProjects: CmsEntry<ProjectData>[];
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<CmsEntry | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Filter logic
  const filtered = projects.filter((p) => {
    if (activeTab === 'published' && p.status !== 'published') return false;
    if (activeTab === 'draft' && p.status !== 'draft') return false;
    if (activeTab === 'archived' && p.status !== 'archived') return false;
    if (activeTab === 'all' && p.status === 'archived') return false; // Hide archived by default on 'all'

    if (category !== 'all' && p.data?.category !== category) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSlug = p.slug?.toLowerCase().includes(q);
      const matchTags = p.data?.tags?.some((t: string) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSlug && !matchTags) return false;
    }

    return true;
  });

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
      setProjects([created, ...projects]);
      router.refresh();
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      const updated = await archiveEntryAction(id);
      setProjects(projects.map((p) => (p._id === id ? updated : p)));
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteEntryAction(deleteTarget._id);
      setProjects(projects.filter((p) => p._id !== deleteTarget._id));
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

        <Link href="/admin/content/projects/new">
          <Button variant="primary" size="lg">
            <Plus className="w-4 h-4" />
            NEW PROJECT
          </Button>
        </Link>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-[var(--radius-md)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'published', 'draft', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-body bg-stone-50 border-2 border-[var(--color-ink)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
        {filtered.length === 0 ? (
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
                {filtered.map((project) => (
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
                      {new Date(project.updatedAt).toLocaleDateString()}
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
                          <button
                            onClick={() => setDeleteTarget(project)}
                            className="p-1.5 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-white hover:bg-[var(--color-coral)] transition-all cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[var(--color-negative)]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
