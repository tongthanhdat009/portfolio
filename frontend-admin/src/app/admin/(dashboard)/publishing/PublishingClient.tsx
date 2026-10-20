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
  Undo2,
} from 'lucide-react';
import { CmsEntry, ContentHealthIssue } from '@/types';
import type { PagedResult } from '@/lib/cms/service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import {
  publishEntryAction,
  unpublishEntryAction,
  revalidatePublicCacheAction,
} from '@/app/admin/actions';

interface PublishingClientProps {
  bundle: PagedResult<CmsEntry>;
  activeTab: 'drafts' | 'live';
  healthIssues: ContentHealthIssue[];
}

export default function PublishingClient({
  bundle,
  activeTab,
  healthIssues,
}: PublishingClientProps) {
  const entries = bundle.items;
  const [selectedEntry, setSelectedEntry] = useState<CmsEntry | null>(null);
  const [revalidateMsg, setRevalidateMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  const handlePublish = (entry: CmsEntry) => {
    startTransition(async () => {
      await publishEntryAction(entry._id);
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

      {/* Queue Tabs + Lists */}
      <div className="flex items-center gap-1.5">
        {(
          [
            { id: 'drafts', label: 'PENDING DRAFTS' },
            { id: 'live', label: 'LIVE PUBLICATIONS' },
          ] as const
        ).map((t) => (
          <Link
            key={t.id}
            href={t.id === 'drafts' ? '/admin/publishing' : '/admin/publishing?tab=live'}
            className={`px-3 py-1.5 rounded-[var(--radius-sm)] font-display text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === t.id
                ? 'bg-[var(--color-sun)] text-[var(--color-ink)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]'
                : 'bg-white border-2 border-stone-300 text-stone-700 hover:border-[var(--color-ink)]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Main List - Full Width */}
      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="space-y-4">
          <Card variant="surface" shadow="md" borderWidth="2" className="p-6">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-black text-base uppercase tracking-wider text-[var(--color-ink)]">
                  {activeTab === 'live' ? 'LIVE PUBLICATIONS CATALOG' : 'PENDING PUBLICATION QUEUE'} ({bundle.total})
                </h2>
              </div>
              <span className="font-mono text-xs text-stone-500">
                {activeTab === 'live' ? 'Snapshots live on the public site' : 'Snapshots ready to go live'}
              </span>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-display font-bold text-sm text-stone-900">
                  {activeTab === 'live' ? 'NOTHING LIVE YET' : 'ALL CONTENT UP TO DATE'}
                </h3>
                <p className="font-body text-xs text-stone-500 mt-1">
                  {activeTab === 'live'
                    ? 'Publish a draft to create a live snapshot.'
                    : 'There are no unpublished drafts. Public portfolio is in sync.'}
                </p>
              </div>
            ) : (
              <div className="divide-y-2 divide-stone-100">
                {entries.map((entry) => (
                  <div key={entry._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {activeTab === 'live' ? (
                          <Badge variant="lime" size="sm">
                            LIVE
                          </Badge>
                        ) : (
                          <Badge variant="sun" size="sm">
                            {entry.type}
                          </Badge>
                        )}
                        <span className="font-mono text-xs font-bold text-stone-400">
                          rev #{entry.revision}
                        </span>
                      </div>
                      <h4 className="font-display font-black text-base text-[var(--color-ink)]">
                        {entry.title}
                      </h4>
                      <span className="font-mono text-xs text-stone-500">
                        {activeTab === 'live'
                          ? `published rev #${entry.lastPublishedRevision || entry.revision} · /${entry.slug || entry.key}`
                          : `Last modified: ${new Date(entry.updatedAt).toLocaleTimeString('en-US')} · ${new Date(entry.updatedAt).toLocaleDateString('en-US')}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {activeTab === 'live' ? (
                        <button
                          onClick={() => handleUnpublish(entry._id)}
                          className="px-2.5 py-1.5 text-xs font-mono font-bold border-2 border-stone-300 rounded-[var(--radius-sm)] hover:bg-stone-100 hover:border-black cursor-pointer"
                        >
                          UNPUBLISH
                        </button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Send className="w-3.5 h-3.5" /> PUBLISH
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination
              page={bundle.page}
              totalPages={bundle.lastPage}
              total={bundle.total}
              perPage={bundle.perPage}
            />
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
