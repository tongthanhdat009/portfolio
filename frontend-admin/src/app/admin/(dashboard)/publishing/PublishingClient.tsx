'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Send,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Undo2,
} from 'lucide-react';
import { CmsEntry, ContentHealthIssue } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  publishEntryAction,
  unpublishEntryAction,
  revalidatePublicCacheAction,
} from '@/app/admin/actions';

interface PublishingClientProps {
  drafts: CmsEntry[];
  publishedEntries: CmsEntry[];
  healthIssues: ContentHealthIssue[];
}

export default function PublishingClient({
  drafts,
  publishedEntries,
  healthIssues,
}: PublishingClientProps) {
  const [activeDrafts, setActiveDrafts] = useState(drafts);
  const [selectedEntry, setSelectedEntry] = useState<CmsEntry | null>(null);
  const [revalidateMsg, setRevalidateMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  const handlePublish = (entry: CmsEntry) => {
    startTransition(async () => {
      await publishEntryAction(entry._id);
      setActiveDrafts(activeDrafts.filter((d) => d._id !== entry._id));
      setSelectedEntry(null);
      window.location.reload();
    });
  };

  const handleUnpublish = (id: string) => {
    startTransition(async () => {
      await unpublishEntryAction(id);
      window.location.reload();
    });
  };

  const handleRevalidateCache = () => {
    startTransition(async () => {
      const res = await revalidatePublicCacheAction();
      setRevalidateMsg(res.message);
      setTimeout(() => setRevalidateMsg(''), 4000);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-[var(--color-ink)] pb-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-sun)] px-2 py-0.5 border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
            PUBLISHING HUB
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] mt-1">
            RELEASE & CACHE CONTROL
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Review drafts, execute preflight validations, publish public snapshots, and purge ISR caches.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleRevalidateCache}
          isLoading={isPending}
        >
          <RefreshCw className="w-4 h-4" /> REVALIDATE ALL CACHES
        </Button>
      </div>

      {revalidateMsg && (
        <div className="p-3 bg-emerald-100 border-2 border-emerald-500 rounded font-mono text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          {revalidateMsg}
        </div>
      )}

      {/* Grid: Left Drafts Queue (8 Cols), Right Health & Status (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pending Releases Queue */}
        <div className="lg:col-span-8 space-y-4">
          <Card variant="surface" shadow="md" borderWidth="2" className="p-6">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-black text-base uppercase tracking-wider text-[var(--color-ink)]">
                  PENDING PUBLICATION QUEUE ({activeDrafts.length})
                </h2>
              </div>
              <span className="font-mono text-xs text-stone-500">
                Snapshots ready to go live
              </span>
            </div>

            {activeDrafts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-display font-bold text-sm text-stone-900">
                  ALL CONTENT UP TO DATE
                </h3>
                <p className="font-body text-xs text-stone-500 mt-1">
                  There are no unpublished drafts or pending revisions. Public portfolio is completely in sync.
                </p>
              </div>
            ) : (
              <div className="divide-y-2 divide-stone-100">
                {activeDrafts.map((entry) => (
                  <div key={entry._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="sun" size="sm">
                          {entry.type}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-stone-400">
                          rev #{entry.revision}
                        </span>
                      </div>
                      <h4 className="font-display font-black text-base text-[var(--color-ink)]">
                        {entry.title}
                      </h4>
                      <span className="font-mono text-xs text-stone-500">
                        Last modified: {new Date(entry.updatedAt).toLocaleTimeString()} · {new Date(entry.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <Send className="w-3.5 h-3.5" /> PUBLISH
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Currently Published Live Entries */}
          <Card variant="surface" shadow="md" borderWidth="2" className="p-6">
            <h2 className="font-display font-black text-base uppercase tracking-wider text-[var(--color-ink)] mb-4 border-b-2 border-stone-200 pb-3">
              LIVE PUBLICATIONS CATALOG ({publishedEntries.length})
            </h2>

            <div className="divide-y-2 divide-stone-100">
              {publishedEntries.map((entry) => (
                <div key={entry._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="lime" size="sm">
                        LIVE
                      </Badge>
                      <span className="font-display font-bold text-sm text-[var(--color-ink)] truncate">
                        {entry.title}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-stone-400">
                      published rev #{entry.lastPublishedRevision || entry.revision} · /{entry.slug || entry.key}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUnpublish(entry._id)}
                      className="px-2.5 py-1 text-xs font-mono font-bold border-2 border-stone-300 rounded hover:bg-stone-100 hover:border-black cursor-pointer"
                    >
                      UNPUBLISH
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="paper" shadow="md" borderWidth="2" className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="font-display font-bold text-sm uppercase">
                PUBLISHING INTEGRITY
              </h3>
            </div>
            <p className="text-xs font-body text-stone-700 leading-relaxed">
              When an item is published, an immutable snapshot is copied to <code className="bg-stone-200 px-1 font-mono">cms_publications</code>. Draft edits do not mutate the public site until explicitly published.
            </p>
            <p className="text-xs font-body text-stone-700 leading-relaxed">
              Cache invalidation issues do not break database state; operations are idempotent and auditable.
            </p>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title="CONFIRM PUBLICATION"
        description="Verify snapshot before releasing to live website."
      >
        {selectedEntry && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs font-mono space-y-1">
              <div><strong>ENTRY:</strong> {selectedEntry.title}</div>
              <div><strong>TYPE:</strong> {selectedEntry.type}</div>
              <div><strong>REVISION:</strong> rev #{selectedEntry.revision}</div>
              <div><strong>ROUTE:</strong> /{selectedEntry.slug || selectedEntry.key}</div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
              <Button variant="secondary" onClick={() => setSelectedEntry(null)}>
                CANCEL
              </Button>
              <Button
                variant="primary"
                onClick={() => handlePublish(selectedEntry)}
                isLoading={isPending}
              >
                RELEASE SNAPSHOT
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
