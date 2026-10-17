'use client';

import React, { useState, useTransition } from 'react';
import { History, Undo2, Clock, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { CmsEntry, CmsRevision } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { restoreRevisionAction } from '@/app/admin/actions';

interface HistoryClientProps {
  entries: CmsEntry[];
  initialRevisions: CmsRevision[];
}

export default function HistoryClient({
  entries,
  initialRevisions,
}: HistoryClientProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string>(entries[0]?._id || '');
  const [revisions, setRevisions] = useState(initialRevisions);
  const [selectedRev, setSelectedRev] = useState<CmsRevision | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  const currentEntry = entries.find((e) => e._id === selectedEntryId) || entries[0];
  const filteredRevisions = revisions.filter((r) => r.entryId === selectedEntryId);

  const handleRestore = (rev: CmsRevision) => {
    startTransition(async () => {
      try {
        const res = await restoreRevisionAction(rev.entryId, rev.revision);
        setStatusMsg(`Successfully restored snapshot from rev #${rev.revision} as new draft rev #${res.revision}.`);
        setSelectedRev(null);
        window.location.reload();
      } catch (err) {
        setStatusMsg(`Restore error: ${(err as Error).message}`);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-[var(--color-ink)] pb-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-sun)] px-2 py-0.5 border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
            VERSIONING & RECOVERY
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] mt-1">
            REVISION TIMELINE & ROLLBACK
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Trace changes, inspect past document snapshots, and safely restore previous revisions as new drafts.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-100 border-2 border-emerald-500 rounded font-mono text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          {statusMsg}
        </div>
      )}

      {/* Entry Picker */}
      <div className="bg-[var(--color-surface)] p-4 rounded-[var(--radius-md)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] flex items-center gap-4">
        <label className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] whitespace-nowrap">
          SELECT DOCUMENT:
        </label>
        <select
          value={selectedEntryId}
          onChange={(e) => setSelectedEntryId(e.target.value)}
          className="w-full max-w-md px-3 py-1.5 text-xs font-mono font-bold bg-stone-50 border-2 border-[var(--color-ink)] rounded-[var(--radius-sm)] cursor-pointer"
        >
          {entries.map((entry) => (
            <option key={entry._id} value={entry._id}>
              [{entry.type.toUpperCase()}] {entry.title} (current rev #{entry.revision})
            </option>
          ))}
        </select>
      </div>

      {/* Main Studio View: Left Timeline (7 Cols), Right Snapshot Inspector (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timeline list */}
        <div className="lg:col-span-7 space-y-3">
          <Card variant="surface" shadow="md" borderWidth="2" className="p-6">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-[var(--color-ink)] mb-4 border-b-2 border-stone-200 pb-2">
              REVISION LOG FOR: {currentEntry?.title}
            </h2>

            {filteredRevisions.length === 0 ? (
              <p className="text-xs font-mono text-stone-500 py-6 text-center">
                No past revisions recorded yet for this entry.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredRevisions.map((rev) => {
                  const isSelected = selectedRev?._id === rev._id;
                  return (
                    <div
                      key={rev._id}
                      onClick={() => setSelectedRev(rev)}
                      className={`p-3.5 rounded-[var(--radius-sm)] border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-500 bg-amber-50/50'
                          : 'border-stone-300 bg-white hover:border-black'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-black bg-[var(--color-sun)] px-1.5 py-0.2 border border-black rounded">
                            rev #{rev.revision}
                          </span>
                          <span className="font-mono text-xs font-bold uppercase text-stone-700">
                            {rev.action}
                          </span>
                          <span className="font-mono text-[10px] text-stone-400">
                            by {rev.actor}
                          </span>
                        </div>
                        <p className="font-body text-xs text-stone-800 truncate">
                          {rev.summary}
                        </p>
                        <span className="font-mono text-[10px] text-stone-500">
                          {new Date(rev.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(rev);
                        }}
                        className="px-2.5 py-1 text-xs font-mono font-bold bg-white border-2 border-black rounded hover:bg-[var(--color-sun)] shadow-[var(--shadow-neo-sm)] shrink-0 flex items-center gap-1 cursor-pointer"
                        title="Restore this revision as new draft"
                      >
                        <Undo2 className="w-3 h-3" /> RESTORE
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Snapshot Inspector */}
        <div className="lg:col-span-5">
          {selectedRev ? (
            <Card variant="surface" shadow="md" borderWidth="2" className="p-5 space-y-3">
              <div className="border-b-2 border-stone-200 pb-2">
                <span className="font-mono text-xs font-bold text-stone-500 uppercase">
                  SNAPSHOT VIEWER
                </span>
                <h3 className="font-display font-black text-base text-[var(--color-ink)]">
                  Revision #{selectedRev.revision} ({selectedRev.action})
                </h3>
                <span className="font-mono text-xs text-stone-400">
                  Created at {new Date(selectedRev.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="max-h-[460px] overflow-y-auto bg-stone-900 text-stone-100 p-3 rounded font-mono text-xs">
                <pre>{JSON.stringify(selectedRev.snapshot, null, 2)}</pre>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => handleRestore(selectedRev)}
                  isLoading={isPending}
                >
                  <Undo2 className="w-4 h-4 mr-1" /> RESTORE SNAPSHOT AS NEW DRAFT
                </Button>
              </div>
            </Card>
          ) : (
            <Card variant="surface" shadow="md" borderWidth="2" className="p-8 text-center text-stone-400 font-mono text-xs">
              Select a revision from the timeline to inspect its snapshot.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
