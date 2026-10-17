'use client';

import React, { useState, useTransition } from 'react';
import {
  Upload,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  FileCode,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { MediaAsset } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { addMediaAction, deleteMediaAction } from '@/app/admin/actions';

interface MediaClientProps {
  initialMedia: MediaAsset[];
}

export default function MediaClient({ initialMedia }: MediaClientProps) {
  const [mediaList, setMediaList] = useState(initialMedia);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialMedia[0]?._id || '');
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');
  const [isPending, startTransition] = useTransition();

  // New asset form
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');

  const selectedAsset = mediaList.find((m) => m._id === selectedAssetId) || mediaList[0];

  const filtered = mediaList.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.filename.toLowerCase().includes(q) || m.alt.toLowerCase().includes(q);
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const newAsset = await addMediaAction({
        filename: uploadFilename,
        storageKey: `uploads/2026/10/${uploadFilename}`,
        url: uploadUrl,
        mimeType: uploadFilename.endsWith('.png') ? 'image/png' : 'image/jpeg',
        size: 345000,
        dimensions: { width: 1200, height: 675 },
        alt: uploadAlt,
      });

      setMediaList([newAsset, ...mediaList]);
      setSelectedAssetId(newAsset._id);
      setIsUploadOpen(false);
      setUploadFilename('');
      setUploadUrl('');
      setUploadAlt('');
    });
  };

  const handleDelete = (id: string) => {
    setBlockedReason('');
    startTransition(async () => {
      const res = await deleteMediaAction(id);
      if (res.success) {
        const remaining = mediaList.filter((m) => m._id !== id);
        setMediaList(remaining);
        if (selectedAssetId === id) {
          setSelectedAssetId(remaining[0]?._id || '');
        }
      } else if (res.blockedReason) {
        setBlockedReason(res.blockedReason);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-3 border-[var(--color-ink)] pb-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-sun)] px-2 py-0.5 border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
            ASSET MANAGEMENT
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] mt-1">
            MEDIA LIBRARY
          </h1>
          <p className="font-body text-sm text-[var(--color-muted-text)] mt-1">
            Object storage file registry, accessibility alt metadata, dimensions, and cross-entry reference tracking.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsUploadOpen(true)}>
          <Upload className="w-4 h-4" /> UPLOAD ASSET
        </Button>
      </div>

      {blockedReason && (
        <div className="p-4 bg-coral-100 border-2 border-[var(--color-negative)] rounded-[var(--radius-sm)] flex items-start gap-3 text-sm font-body text-stone-900">
          <ShieldAlert className="w-5 h-5 text-[var(--color-negative)] shrink-0 mt-0.5" />
          <div>
            <strong className="font-display uppercase">SAFEGUARD TRIGGERED:</strong>
            <p className="mt-0.5">{blockedReason}</p>
          </div>
        </div>
      )}

      {/* Main Studio View: Left Grid (8 Cols), Right Inspector (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Thumbnails Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between gap-4 bg-[var(--color-surface)] p-3 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search assets by filename or alt description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-body bg-stone-50 border border-black rounded"
              />
            </div>
            <span className="font-mono text-xs font-bold text-stone-600">
              {filtered.length} ASSETS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map((asset) => {
              const isSelected = asset._id === selectedAssetId;
              return (
                <div
                  key={asset._id}
                  onClick={() => setSelectedAssetId(asset._id)}
                  className={`p-2.5 rounded-[var(--radius-md)] border-2 transition-all cursor-pointer bg-white flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500 shadow-[var(--shadow-neo-md)]'
                      : 'border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)] hover:translate-x-[1px] hover:translate-y-[1px]'
                  }`}
                >
                  <div className="h-28 w-full bg-stone-100 border border-black rounded flex items-center justify-center overflow-hidden mb-2 relative">
                    <img
                      src={asset.url}
                      alt={asset.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                    <span className="text-[10px] font-mono text-stone-400 text-center px-2">
                      {asset.filename}
                    </span>
                  </div>

                  <div>
                    <span className="font-display font-bold text-xs truncate block text-[var(--color-ink)]">
                      {asset.filename}
                    </span>
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mt-1">
                      <span>{(asset.size / 1024).toFixed(0)} KB</span>
                      <span>
                        {asset.dimensions.width}×{asset.dimensions.height}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Asset Inspector */}
        <div className="lg:col-span-4">
          {selectedAsset ? (
            <Card variant="surface" shadow="md" borderWidth="2" className="p-5 space-y-4">
              <div className="border-b-2 border-stone-200 pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-500">
                  FILE INSPECTOR
                </span>
                <h3 className="font-display font-black text-base truncate text-[var(--color-ink)] mt-0.5">
                  {selectedAsset.filename}
                </h3>
              </div>

              {/* Image Preview */}
              <div className="h-44 w-full bg-stone-100 border-2 border-black rounded flex items-center justify-center overflow-hidden">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.alt}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as any).style.display = 'none';
                  }}
                />
              </div>

              {/* Alt Text Box */}
              <div className="space-y-1">
                <label className="font-display text-xs font-bold uppercase tracking-wider text-stone-700">
                  ACCESSIBLE ALT TEXT
                </label>
                <p className="text-xs font-body text-stone-800 bg-stone-50 p-2.5 rounded border border-stone-300">
                  {selectedAsset.alt || 'No alt text provided.'}
                </p>
              </div>

              {/* Metadata Details */}
              <div className="space-y-1.5 text-xs font-mono text-stone-600 bg-stone-50 p-3 rounded border border-stone-200">
                <div className="flex justify-between">
                  <span>MIME:</span>
                  <span className="font-bold text-black">{selectedAsset.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span>DIMENSIONS:</span>
                  <span className="font-bold text-black">
                    {selectedAsset.dimensions.width} × {selectedAsset.dimensions.height} px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SIZE:</span>
                  <span className="font-bold text-black">{(selectedAsset.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>STORAGE KEY:</span>
                  <span className="font-bold text-black truncate max-w-[160px]">{selectedAsset.storageKey}</span>
                </div>
              </div>

              {/* Usage References */}
              <div className="space-y-1.5">
                <label className="font-display text-xs font-bold uppercase tracking-wider text-stone-700">
                  CONTENT REFERENCES ({selectedAsset.usageReferences?.length || 0})
                </label>
                {selectedAsset.usageReferences?.length > 0 ? (
                  <div className="space-y-1">
                    {selectedAsset.usageReferences.map((ref, idx) => (
                      <div key={idx} className="p-2 bg-amber-50 border border-amber-300 rounded text-xs font-mono">
                        <span className="font-bold">{ref.entryTitle}</span> ({ref.field})
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-stone-500">Unused (Safe to remove)</p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  OPEN URL <ExternalLink className="w-3 h-3" />
                </a>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(selectedAsset._id)}
                  isLoading={isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" /> DELETE ASSET
                </Button>
              </div>
            </Card>
          ) : (
            <Card variant="surface" shadow="md" borderWidth="2" className="p-8 text-center text-stone-400 font-mono text-xs">
              No asset selected.
            </Card>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="REGISTER NEW MEDIA ASSET"
        description="Add asset metadata and cloud storage URL."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="File Name"
            value={uploadFilename}
            onChange={(e) => setUploadFilename(e.target.value)}
            placeholder="e.g. system-architecture.png"
            required
          />

          <Input
            label="Public Asset URL / Path"
            value={uploadUrl}
            onChange={(e) => setUploadUrl(e.target.value)}
            placeholder="e.g. /images/system-architecture.png"
            required
          />

          <Textarea
            label="Alt Description (Mandatory for informative images)"
            value={uploadAlt}
            onChange={(e) => setUploadAlt(e.target.value)}
            rows={2}
            placeholder="Describe what is visually communicated in the image..."
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button variant="secondary" onClick={() => setIsUploadOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" type="submit" isLoading={isPending}>
              REGISTER ASSET
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
