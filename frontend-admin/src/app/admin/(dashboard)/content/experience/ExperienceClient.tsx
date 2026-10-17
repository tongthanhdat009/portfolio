'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, Milestone, Calendar } from 'lucide-react';
import { CmsEntry, ExperienceData, ColorAccent } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { saveDraftAction, createEntryAction, deleteEntryAction, publishEntryAction } from '@/app/admin/actions';

interface ExperienceClientProps {
  initialExperience: CmsEntry<ExperienceData>[];
}

export default function ExperienceClient({ initialExperience }: ExperienceClientProps) {
  const [items, setItems] = useState(initialExperience);
  const [editingExp, setEditingExp] = useState<Partial<CmsEntry<ExperienceData>> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightsInput, setHighlightsInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleNew = () => {
    setEditingExp({
      type: 'experience',
      title: '',
      locale: 'en',
      sortOrder: items.length + 1,
      data: {
        year: '2026 — Present',
        startDate: '2026-01',
        endDate: 'Present',
        isCurrent: true,
        type: 'Work',
        organization: '',
        roleAtTime: '',
        description: '',
        highlights: [],
        accent: 'sun',
      },
    });
    setHighlightsInput('');
    setIsModalOpen(true);
  };

  const handleEdit = (exp: CmsEntry<ExperienceData>) => {
    setEditingExp(exp);
    setHighlightsInput((exp.data.highlights || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingExp || !editingExp.data) return;
    const highlights = highlightsInput.split('\n').map((h) => h.trim()).filter(Boolean);
    const data = { ...editingExp.data, highlights };
    const title = `${data.roleAtTime} @ ${data.organization}`;

    startTransition(async () => {
      if (editingExp._id) {
        await saveDraftAction(editingExp._id, { title, data });
        await publishEntryAction(editingExp._id);
      } else {
        const created = await createEntryAction({
          type: 'experience',
          title,
          locale: 'en',
          sortOrder: items.length + 1,
          status: 'published',
          references: [],
          seo: {},
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
      setItems(items.filter((i) => i._id !== id));
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
            JOURNEY & EXPERIENCE
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Chronological career milestones, research, leadership roles, and technical achievements.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleNew}>
          <Plus className="w-4 h-4" /> ADD MILESTONE
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((exp) => (
          <Card key={exp._id} variant="surface" shadow="md" borderWidth="2" className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-stone-100 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <Badge variant={exp.data.accent || 'sun'} size="sm">
                  {exp.data.type}
                </Badge>
                <h3 className="font-display font-black text-lg text-[var(--color-ink)]">
                  {exp.data.roleAtTime}{' '}
                  <span className="text-stone-500 font-normal">@ {exp.data.organization}</span>
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-stone-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {exp.data.year}
                </span>
                <button
                  onClick={() => handleEdit(exp)}
                  className="p-1.5 border border-black rounded hover:bg-stone-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(exp._id)}
                  className="p-1.5 border border-black rounded hover:bg-[var(--color-coral)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="font-body text-sm text-stone-700 mb-3">{exp.data.description}</p>

            {exp.data.highlights?.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-xs font-mono text-stone-600 bg-stone-50 p-3 rounded border border-stone-200">
                {exp.data.highlights.map((h, idx) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExp?._id ? 'EDIT MILESTONE' : 'NEW MILESTONE'}
      >
        {editingExp && editingExp.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Role Title"
                value={editingExp.data.roleAtTime || ''}
                onChange={(e) =>
                  setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data!, roleAtTime: e.target.value },
                  })
                }
                placeholder="e.g. Lead Systems Architect"
                required
              />
              <Input
                label="Organization / Company"
                value={editingExp.data.organization || ''}
                onChange={(e) =>
                  setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data!, organization: e.target.value },
                  })
                }
                placeholder="e.g. Vanguard Systems"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Year Display"
                value={editingExp.data.year || ''}
                onChange={(e) =>
                  setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data!, year: e.target.value },
                  })
                }
                placeholder="2024 — Present"
              />
              <Select
                label="Category Type"
                value={editingExp.data.type || 'Work'}
                onChange={(e) =>
                  setEditingExp({
                    ...editingExp,
                    data: { ...editingExp.data!, type: e.target.value as any },
                  })
                }
                options={[
                  { value: 'Work', label: 'Work' },
                  { value: 'Education', label: 'Education' },
                  { value: 'Research', label: 'Research' },
                  { value: 'Community', label: 'Community' },
                  { value: 'Milestone', label: 'Milestone' },
                ]}
              />
              <Select
                label="Accent"
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
                  { value: 'pink', label: 'Pink' },
                ]}
              />
            </div>

            <Textarea
              label="Summary Description"
              value={editingExp.data.description || ''}
              onChange={(e) =>
                setEditingExp({
                  ...editingExp,
                  data: { ...editingExp.data!, description: e.target.value },
                })
              }
              rows={3}
            />

            <Textarea
              label="Key Highlights (One per line)"
              value={highlightsInput}
              onChange={(e) => setHighlightsInput(e.target.value)}
              rows={3}
              placeholder="Migrated monolith to Go microservices&#10;Reduced latency by 65%"
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
