'use client';

import React, { useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Edit2, Trash2, Wrench, Star } from 'lucide-react';
import { CmsEntry, TechnologyData, TechCategory } from '@/types';
import type { PagedResult } from '@/lib/cms/service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { saveDraftAction, createEntryAction, deleteEntryAction, publishEntryAction } from '@/app/admin/actions';
import { Pagination } from '@/components/ui/Pagination';

interface SkillsClientProps {
  initialBundle: PagedResult<CmsEntry<TechnologyData>>;
  initialCategory: string;
}

const CATEGORIES: TechCategory[] = ['Languages', 'Frontend', 'Backend', 'Data', 'AI', 'Tools'];

export default function SkillsClient({ initialBundle, initialCategory }: SkillsClientProps) {
  const [bundle, setBundle] = useState(initialBundle);
  const skills = bundle.items as CmsEntry<TechnologyData>[];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editingSkill, setEditingSkill] = useState<Partial<CmsEntry<TechnologyData>> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const setCategoryParam = (cat: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (!cat || cat === 'All') sp.delete('category');
    else sp.set('category', cat);
    sp.delete('page');
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleNew = () => {
    setEditingSkill({
      type: 'skill',
      title: '',
      locale: 'en',
      sortOrder: skills.length + 1,
      data: {
        name: '',
        category: (initialCategory === 'All' ? 'Languages' : initialCategory) as TechCategory,
        featured: true,
        order: skills.length + 1,
        context: '',
      },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (skill: CmsEntry<TechnologyData>) => {
    setEditingSkill(skill);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingSkill || !editingSkill.data) return;
    const data = editingSkill.data;
    startTransition(async () => {
      if (editingSkill._id) {
        await saveDraftAction(editingSkill._id, {
          title: data.name,
          data: data,
        });
        await publishEntryAction(editingSkill._id);
      } else {
        const created = await createEntryAction({
          type: 'skill',
          title: data.name,
          locale: 'en',
          sortOrder: data.order,
          status: 'published',
          references: [],
          seo: {},
          data: data,
        });
        await publishEntryAction(created._id);
      }
      setIsModalOpen(false);
      window.location.reload();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteEntryAction(id);
      setBundle((b) => ({ ...b, items: b.items.filter((s) => s._id !== id), total: Math.max(0, b.total - 1) }));
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-[var(--color-ink)] pb-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-sun)] px-2 py-0.5 border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
            CONTENT MANAGER
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] mt-1">
            TOOLBOX & SKILLS
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Manage technologies, frameworks, infrastructure engines, and priority tags.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleNew}>
          <Plus className="w-4 h-4" /> ADD TECHNOLOGY
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setCategoryParam('All')}
          className={`px-3 py-1.5 rounded-[var(--radius-sm)] font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            initialCategory === 'All'
              ? 'bg-[var(--color-sun)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]'
              : 'bg-white border-2 border-stone-300 text-stone-700'
          }`}
        >
          ALL
        </button>
        {CATEGORIES.map((cat) => {
          return (
            <button
              key={cat}
              onClick={() => setCategoryParam(cat)}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                initialCategory === cat
                  ? 'bg-[var(--color-sun)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]'
                  : 'bg-white border-2 border-stone-300 text-stone-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <Card key={skill._id} variant="surface" shadow="sm" borderWidth="2" className="p-4 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-[var(--color-ink)] truncate">
                  {skill.data.name}
                </span>
                {skill.data.featured && (
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                )}
              </div>
              <span className="font-mono text-[10px] text-stone-500 uppercase block">
                {skill.data.category} · order {skill.data.order}
              </span>
              {skill.data.context && (
                <p className="text-xs text-stone-600 font-body truncate mt-1">
                  {skill.data.context}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={() => handleEdit(skill)}
                className="p-1.5 border border-black rounded hover:bg-stone-100 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(skill._id)}
                className="p-1.5 border border-black rounded hover:bg-[var(--color-coral)] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Pagination page={bundle.page} totalPages={bundle.lastPage} total={bundle.total} perPage={bundle.perPage} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill?._id ? 'EDIT TECHNOLOGY' : 'NEW TECHNOLOGY'}
      >
        {editingSkill && editingSkill.data && (
          <div className="space-y-4">
            <Input
              label="Technology Name"
                maxLength={40}
              value={editingSkill.data.name || ''}
              onChange={(e) =>
                setEditingSkill({
                  ...editingSkill,
                  data: { ...editingSkill.data!, name: e.target.value },
                })
              }
              placeholder="e.g. Next.js 16"
              required
            />

            <Select
              label="Category"
              value={editingSkill.data.category || 'Languages'}
              onChange={(e) =>
                setEditingSkill({
                  ...editingSkill,
                  data: { ...editingSkill.data!, category: e.target.value as TechCategory },
                })
              }
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <Input
              label="Usage Context / Subtitle"
                maxLength={120}
              value={editingSkill.data.context || ''}
              onChange={(e) =>
                setEditingSkill({
                  ...editingSkill,
                  data: { ...editingSkill.data!, context: e.target.value },
                })
              }
              placeholder="e.g. High-throughput microservices & network daemons"
            />

            <div className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-300 rounded">
              <input
                type="checkbox"
                id="featSkill"
                checked={editingSkill.data.featured}
                onChange={(e) =>
                  setEditingSkill({
                    ...editingSkill,
                    data: { ...editingSkill.data!, featured: e.target.checked },
                  })
                }
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="featSkill" className="text-xs font-bold uppercase cursor-pointer">
                FEATURED IN TOOLBOX STRIP
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                CANCEL
              </Button>
              <Button variant="primary" onClick={handleSave} isLoading={isPending}>
                SAVE
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
