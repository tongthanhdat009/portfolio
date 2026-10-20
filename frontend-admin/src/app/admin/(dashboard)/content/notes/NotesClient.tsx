'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Clock, FileText } from 'lucide-react';
import { CmsEntry, NoteData } from '@/types';
import type { PagedResult } from '@/lib/cms/service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { saveDraftAction, createEntryAction, deleteEntryAction, publishEntryAction } from '@/app/admin/actions';

interface NotesClientProps {
  initialBundle: PagedResult<CmsEntry<NoteData>>;
}

export default function NotesClient({ initialBundle }: NotesClientProps) {
  const [bundle, setBundle] = useState(initialBundle);
  const notes = bundle.items as CmsEntry<NoteData>[];
  const [editingNote, setEditingNote] = useState<Partial<CmsEntry<NoteData>> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [markdownBody, setMarkdownBody] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleNew = () => {
    setEditingNote({
      type: 'note',
      title: '',
      slug: '',
      locale: 'en',
      sortOrder: notes.length + 1,
      status: 'draft',
      data: {
        title: '',
        slug: '',
        category: 'Architecture',
        readTime: '6 min read',
        excerpt: '',
        tags: [],
        content: [],
        markdownBody: '',
      },
    });
    setTagsInput('');
    setMarkdownBody('');
    setIsModalOpen(true);
  };

  const handleEdit = (note: CmsEntry<NoteData>) => {
    setEditingNote(note);
    setTagsInput((note.data.tags || []).join(', '));
    setMarkdownBody(note.data.markdownBody || note.data.content?.join('\n\n') || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingNote || !editingNote.data) return;
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const content = markdownBody.split('\n\n').filter(Boolean);
    const data: NoteData = {
      ...editingNote.data,
      title: editingNote.data.title,
      slug: editingNote.data.slug,
      tags,
      content,
      markdownBody,
    };

    startTransition(async () => {
      if (editingNote._id) {
        await saveDraftAction(editingNote._id, {
          title: data.title,
          slug: data.slug,
          data,
          seo: { title: data.title, description: data.excerpt },
        });
        await publishEntryAction(editingNote._id);
      } else {
        const created = await createEntryAction({
          type: 'note',
          title: data.title,
          slug: data.slug,
          locale: 'en',
          sortOrder: notes.length + 1,
          status: 'published',
          references: [],
          seo: { title: data.title, description: data.excerpt },
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
      setBundle((b) => ({ ...b, items: b.items.filter((n) => n._id !== id), total: Math.max(0, b.total - 1) }));
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
            TECHNICAL NOTES & ARTICLES
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Deep-dive technical writings, architecture reflections, and engineering logs.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleNew}>
          <Plus className="w-4 h-4" /> WRITE NEW NOTE
        </Button>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note._id} variant="surface" shadow="md" borderWidth="2" className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-stone-100 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <Badge variant="sky" size="sm">
                  {note.data.category || 'Article'}
                </Badge>
                <h3 className="font-display font-black text-lg text-[var(--color-ink)]">
                  {note.data.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={note.status}
                  hasUnpublishedChanges={note.hasUnpublishedChanges}
                />
                <button
                  onClick={() => handleEdit(note)}
                  className="p-1.5 border border-black rounded hover:bg-stone-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="p-1.5 border border-black rounded hover:bg-[var(--color-coral)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="font-body text-sm text-stone-700 mb-3">{note.data.excerpt}</p>

            <div className="flex items-center justify-between text-xs font-mono text-stone-500 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{note.data.readTime || '5 min read'}</span>
                <span>·</span>
                <span>/{note.slug}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {note.data.tags?.map((t: string) => (
                  <span key={t} className="px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded text-[10px]">
                    #{t}
                  </span>
                ))}
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
        title={editingNote?._id ? 'EDIT TECHNICAL NOTE' : 'NEW TECHNICAL NOTE'}
        maxWidth="xl"
      >
        {editingNote && editingNote.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Article Title"
                maxLength={80}
                value={editingNote.data.title || ''}
                onChange={(e) =>
                  setEditingNote({
                    ...editingNote,
                    data: { ...editingNote.data!, title: e.target.value },
                  })
                }
                placeholder="e.g. Designing Resilient Distributed Event Pipelines"
                required
              />
              <Input
                label="URL Slug"
                maxLength={80}
                value={editingNote.data.slug || ''}
                onChange={(e) =>
                  setEditingNote({
                    ...editingNote,
                    data: { ...editingNote.data!, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') },
                  })
                }
                placeholder="e.g. designing-resilient-event-pipelines"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Category"
                maxLength={40}
                value={editingNote.data.category || ''}
                onChange={(e) =>
                  setEditingNote({
                    ...editingNote,
                    data: { ...editingNote.data!, category: e.target.value },
                  })
                }
                placeholder="e.g. Architecture, Design Engineering"
              />
              <Input
                label="Reading Time Estimate"
                maxLength={20}
                value={editingNote.data.readTime || ''}
                onChange={(e) =>
                  setEditingNote({
                    ...editingNote,
                    data: { ...editingNote.data!, readTime: e.target.value },
                  })
                }
                placeholder="e.g. 8 min read"
              />
            </div>

            <Textarea
              label="Article Excerpt / Abstract"
                maxLength={300}
              value={editingNote.data.excerpt || ''}
              onChange={(e) =>
                setEditingNote({
                  ...editingNote,
                  data: { ...editingNote.data!, excerpt: e.target.value },
                })
              }
              rows={2}
              placeholder="1-2 sentences summarizing the article content..."
            />

            <Textarea
              label="Markdown Body Content"
              value={markdownBody}
              onChange={(e) => setMarkdownBody(e.target.value)}
              rows={8}
              placeholder="# Article Heading&#10;&#10;Write markdown content here..."
            />

            <Input
              label="Tags (comma separated)"
                maxLength={300}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Distributed Systems, Kafka, Architecture"
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
