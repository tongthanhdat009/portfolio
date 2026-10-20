'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, FlaskConical, ExternalLink } from 'lucide-react';
import { CmsEntry, ExperimentData, ColorAccent } from '@/types';
import type { PagedResult } from '@/lib/cms/service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { saveDraftAction, createEntryAction, deleteEntryAction, publishEntryAction } from '@/app/admin/actions';

interface ExperimentsClientProps {
  initialBundle: PagedResult<CmsEntry<ExperimentData>>;
}

export default function ExperimentsClient({ initialBundle }: ExperimentsClientProps) {
  const [bundle, setBundle] = useState(initialBundle);
  const items = bundle.items as CmsEntry<ExperimentData>[];
  const [editingExp, setEditingExp] = useState<Partial<CmsEntry<ExperimentData>> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleNew = () => {
    setEditingExp({
      type: 'experiment',
      title: '',
      slug: '',
      locale: 'en',
      sortOrder: items.length + 1,
      status: 'draft',
      data: {
        title: '',
        slug: '',
        summary: '',
        status: 'Prototype',
        accent: 'sun',
        tags: [],
        objective: '',
        howItWorks: '',
        limitations: '',
        takeaways: '',
      },
    });
    setTagsInput('');
    setIsModalOpen(true);
  };

  const handleEdit = (exp: CmsEntry<ExperimentData>) => {
    setEditingExp(exp);
    setTagsInput((exp.data.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingExp || !editingExp.data) return;
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const data = {
      ...editingExp.data,
      tags,
      title: editingExp.data.title,
      slug: editingExp.data.slug,
    };

    startTransition(async () => {
      if (editingExp._id) {
        await saveDraftAction(editingExp._id, {
          title: data.title,
          slug: data.slug,
          data,
        });
        await publishEntryAction(editingExp._id);
      } else {
        const created = await createEntryAction({
          type: 'experiment',
          title: data.title,
          slug: data.slug,
          locale: 'en',
          sortOrder: items.length + 1,
          status: 'published',
          references: [],
          seo: { title: data.title, description: data.summary },
          data,
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
      setBundle((b) => ({ ...b, items: b.items.filter((i) => i._id !== id), total: Math.max(0, b.total - 1) }));
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
            LAB & PROTOTYPES
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Exploratory technical experiments, proof of concepts, shaders, and novel algorithms.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleNew}>
          <Plus className="w-4 h-4" /> ADD EXPERIMENT
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((exp) => (
          <Card key={exp._id} variant="surface" shadow="md" borderWidth="2" className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b-2 border-stone-100 pb-2 mb-3">
                <Badge variant={exp.data.accent || 'sun'} size="sm">
                  {exp.data.status}
                </Badge>
                <span className="font-mono text-xs text-stone-500">/{exp.slug}</span>
              </div>

              <h3 className="font-display font-black text-lg text-[var(--color-ink)] mb-2">
                {exp.data.title}
              </h3>
              <p className="font-body text-xs text-stone-700 leading-relaxed mb-4">
                {exp.data.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {exp.data.tags?.map((t: string) => (
                  <span key={t} className="px-2 py-0.5 font-mono text-[10px] bg-stone-100 border border-stone-300 rounded font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="font-mono text-[11px] text-stone-500">
                rev #{exp.revision} · {new Date(exp.updatedAt).toLocaleDateString('en-US')}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleEdit(exp)}>
                  <Edit2 className="w-3.5 h-3.5" /> EDIT
                </Button>
                <button
                  onClick={() => handleDelete(exp._id)}
                  className="p-1.5 border border-black rounded hover:bg-[var(--color-coral)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Pagination page={bundle.page} totalPages={bundle.lastPage} total={bundle.total} perPage={bundle.perPage} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExp?._id ? 'EDIT EXPERIMENT' : 'NEW EXPERIMENT'}
        maxWidth="lg"
      >
        {editingExp && editingExp.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Title"
                maxLength={80}
                value={editingExp.data.title || ''}
                onChange={(e) =>
                  setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data!, title: e.target.value },
                  })
                }
                placeholder="e.g. Sub-millisecond Vector Quantizer"
                required
              />
              <Input
                label="URL Slug"
                maxLength={80}
                value={editingExp.data.slug || ''}
                onChange={(e) =>
                  setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data!, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') },
                  })
                }
                placeholder="e.g. sub-ms-vector-quantizer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Status"
                value={editingExp.data.status || 'Prototype'}
                onChange={(e) =>
                  setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data!, status: e.target.value as any },
                  })
                }
                options={[
                  { value: 'Prototype', label: 'Prototype' },
                  { value: 'Exploring', label: 'Exploring' },
                  { value: 'Shipped', label: 'Shipped' },
                  { value: 'Archived', label: 'Archived' },
                ]}
              />
              <Select
                label="Accent Color"
                value={editingExp.data.accent || 'sun'}
                onChange={(e) =>
                  setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data!, accent: e.target.value as ColorAccent },
                  })
                }
                options={[
                  { value: 'sun', label: 'Sun' },
                  { value: 'sky', label: 'Sky' },
                  { value: 'coral', label: 'Coral' },
                  { value: 'lime', label: 'Lime' },
                ]}
              />
            </div>

            <Textarea
              label="Short Summary"
                maxLength={300}
              value={editingExp.data.summary || ''}
              onChange={(e) =>
                setEditingExp({
                  ...editingExp,
                  data: { ...editingExp.data!, summary: e.target.value },
                })
              }
              rows={2}
            />

            <Textarea
              label="Objective & Research Hypothesis"
                maxLength={500}
              value={editingExp.data.objective || ''}
              onChange={(e) =>
                setEditingExp({
                  ...editingExp,
                  data: { ...editingExp.data!, objective: e.target.value },
                })
              }
              rows={2}
            />

            <Textarea
              label="How It Works (Technical Process)"
                maxLength={2000}
              value={editingExp.data.howItWorks || ''}
              onChange={(e) =>
                setEditingExp({
                  ...editingExp,
                  data: { ...editingExp.data!, howItWorks: e.target.value },
                })
              }
              rows={2}
            />

            <Input
              label="Tags (comma separated)"
                maxLength={300}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Rust, WebAssembly, Vector Search"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                CANCEL
              </Button>
              <Button variant="primary" onClick={handleSave} isLoading={isPending}>
                SAVE & PUBLISH
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
