'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, Cpu, Save } from 'lucide-react';
import { CmsEntry, CapabilityData, ColorAccent } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { saveDraftAction, createEntryAction, deleteEntryAction, publishEntryAction } from '@/app/admin/actions';

interface CapabilitiesClientProps {
  initialCapabilities: CmsEntry<CapabilityData>[];
}

export default function CapabilitiesClient({ initialCapabilities }: CapabilitiesClientProps) {
  const [capabilities, setCapabilities] = useState(initialCapabilities);
  const [editingCap, setEditingCap] = useState<Partial<CmsEntry<CapabilityData>> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (cap: CmsEntry<CapabilityData>) => {
    setEditingCap(cap);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingCap({
      type: 'capability',
      title: '',
      locale: 'en',
      sortOrder: capabilities.length + 1,
      data: {
        code: `0${capabilities.length + 1}`,
        title: '',
        description: '',
        accent: 'sun',
        iconKey: 'layout',
        order: capabilities.length + 1,
      },
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingCap || !editingCap.data) return;
    const data = editingCap.data;
    startTransition(async () => {
      if (editingCap._id) {
        await saveDraftAction(editingCap._id, {
          title: data.title,
          data: data,
        });
        await publishEntryAction(editingCap._id);
      } else {
        const created = await createEntryAction({
          type: 'capability',
          title: data.title,
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
      setCapabilities(capabilities.filter((c) => c._id !== id));
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
            CAPABILITIES BOARD (WHAT I BUILD)
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            High-level architectural capability pillars displayed on the homepage.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleNew}>
          <Plus className="w-4 h-4" /> ADD CAPABILITY
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map((cap) => (
          <Card key={cap._id} variant="surface" shadow="md" borderWidth="2" className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b-2 border-stone-100 pb-2">
                <span className="font-mono font-black text-sm px-2 py-0.5 bg-stone-100 border border-stone-300 rounded">
                  {cap.data.code}
                </span>
                <Badge variant={cap.data.accent || 'sun'} size="sm">
                  {cap.data.accent || 'sun'}
                </Badge>
              </div>

              <h3 className="font-display font-black text-lg text-[var(--color-ink)] mb-2">
                {cap.data.title}
              </h3>
              <p className="font-body text-xs text-stone-600 leading-relaxed mb-4">
                {cap.data.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <Button variant="secondary" size="sm" onClick={() => handleEdit(cap)}>
                <Edit2 className="w-3.5 h-3.5" /> EDIT
              </Button>
              <button
                onClick={() => handleDelete(cap._id)}
                className="p-1.5 border-2 border-[var(--color-ink)] rounded hover:bg-[var(--color-coral)] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCap?._id ? 'EDIT CAPABILITY' : 'NEW CAPABILITY'}
      >
        {editingCap && editingCap.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Capability Code"
                value={editingCap.data.code || ''}
                onChange={(e) =>
                  setEditingCap({
                    ...editingCap,
                    data: { ...editingCap.data!, code: e.target.value },
                  })
                }
                placeholder="01"
              />
              <Select
                label="Accent Color"
                value={editingCap.data.accent || 'sun'}
                onChange={(e) =>
                  setEditingCap({
                    ...editingCap,
                    data: { ...editingCap.data!, accent: e.target.value as ColorAccent },
                  })
                }
                options={[
                  { value: 'sun', label: 'Sun Yellow' },
                  { value: 'sky', label: 'Electric Sky' },
                  { value: 'coral', label: 'Coral Neon' },
                  { value: 'lime', label: 'Acid Lime' },
                  { value: 'pink', label: 'Pink' },
                  { value: 'paper', label: 'Paper' },
                ]}
              />
            </div>

            <Input
              label="Capability Title"
              value={editingCap.data.title || ''}
              onChange={(e) =>
                setEditingCap({
                  ...editingCap,
                  data: { ...editingCap.data!, title: e.target.value },
                })
              }
              placeholder="e.g. Distributed Systems & APIs"
            />

            <Textarea
              label="Description"
              value={editingCap.data.description || ''}
              onChange={(e) =>
                setEditingCap({
                  ...editingCap,
                  data: { ...editingCap.data!, description: e.target.value },
                })
              }
              rows={3}
              placeholder="High-level engineering strengths and scope..."
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
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
