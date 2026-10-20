'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Save,
  Send,
  Eye,
  ArrowUp,
  ArrowDown,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Sliders,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { CmsEntry, PageSectionItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { saveDraftAction, publishEntryAction, seedHomeAction } from '@/app/admin/actions';
import { blocksToSections, sectionsToBlocks } from '@/lib/page-blocks';

interface HomePageBuilderProps {
  initialHomeEntry: CmsEntry | null;
  allProjects: Array<{ id: string; title: string; status: string }>;
}

export default function HomePageBuilderClient({
  initialHomeEntry,
  allProjects,
}: HomePageBuilderProps) {
  const [entry, setEntry] = useState<CmsEntry | null>(initialHomeEntry);
  const [sections, setSections] = useState<PageSectionItem[]>(() =>
    blocksToSections(initialHomeEntry?.data?.blocks)
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    () => blocksToSections(initialHomeEntry?.data?.blocks)?.[1]?.id || 'sec_hero'
  );
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-index orders
    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSections(updated);
    setSaveStatus('Unsaved section order');
  };

  const handleToggleEnable = (id: string) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSections(updated);
    setSaveStatus('Unsaved changes');
  };

  const handleUpdateProps = (id: string, propKey: string, value: any) => {
    const updated = sections.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          props: {
            ...s.props,
            [propKey]: value,
          },
        };
      }
      return s;
    });
    setSections(updated);
    setSaveStatus('Unsaved changes');
  };

  const handleSaveDraft = () => {
    if (!entry) return;
    startTransition(async () => {
      try {
        const data = { ...entry.data };
        delete data.sections;
        data.blocks = sectionsToBlocks(sections);
        const res = await saveDraftAction(
          entry._id,
          { data },
          entry.revision
        );
        setEntry(res.entry);
        setSaveStatus(`Saved rev #${res.revision} at ${new Date().toLocaleTimeString()}`);
      } catch (err) {
        setSaveStatus(`Error: ${(err as Error).message}`);
      }
    });
  };

  const handlePublish = () => {
    if (!entry) return;
    startTransition(async () => {
      try {
        const data = { ...entry.data };
        delete data.sections;
        data.blocks = sectionsToBlocks(sections);
        await saveDraftAction(
          entry._id,
          { data },
          entry.revision
        );
        const res = await publishEntryAction(entry._id);
        setEntry(res.entry);
        setIsPublishModalOpen(false);
        setSaveStatus(`Published live rev #${res.entry.revision}!`);
      } catch (err) {
        setSaveStatus(`Error: ${(err as Error).message}`);
      }
    });
  };

  // Preview container widths
  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto',
  };

  const [seedError, setSeedError] = useState('');
  const handleSeed = () => {
    startTransition(async () => {
      try {
        setSeedError('');
        await seedHomeAction();
        window.location.reload();
      } catch (err) {
        setSeedError(`Seed failed: ${(err as Error).message}`);
      }
    });
  };

  if (!entry) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <Card variant="surface" shadow="md" borderWidth="2" className="p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <p className="font-display font-black text-sm text-stone-800">HOME PAGE NOT FOUND</p>
          <p className="font-body text-xs text-stone-500 mt-1">
            No page entry with key &apos;home&apos; exists yet. Seed the default block
            layout (all sections enabled, content falls back to the public defaults),
            then edit and publish.
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" size="md" onClick={handleSeed} isLoading={isPending}>
              <Layers className="w-4 h-4" />
              SEED DEFAULT HOME PAGE
            </Button>
          </div>
          {seedError && (
            <p className="font-mono text-xs font-bold text-[var(--color-negative)] mt-2">
              {seedError}
            </p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-[var(--color-ink)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-sun)] px-2 py-0.5 border border-[var(--color-ink)] rounded-[var(--radius-sm)]">
              PAGE BUILDER
            </span>
            <span className="font-mono text-xs font-bold bg-stone-200 px-1.5 py-0.2 rounded border border-stone-400">
              rev #{entry.revision}
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-[var(--color-ink)]">
            HOMEPAGE SECTIONS BUILDER
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="font-mono text-xs font-bold text-stone-600">
              {saveStatus}
            </span>
          )}

          <Button variant="secondary" size="md" onClick={handleSaveDraft} isLoading={isPending}>
            <Save className="w-4 h-4" />
            SAVE DRAFT
          </Button>

          <Button variant="primary" size="md" onClick={() => setIsPublishModalOpen(true)}>
            <Send className="w-4 h-4" />
            PUBLISH HOMEPAGE
          </Button>
        </div>
      </div>

      {/* 3-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sections Outline (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card variant="surface" shadow="md" borderWidth="2" className="p-4">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-2 mb-3">
              <span className="font-display font-black text-xs uppercase tracking-wider text-[var(--color-ink)]">
                SECTIONS OUTLINE
              </span>
              <span className="font-mono text-[10px] text-stone-500">
                {sections.filter((s) => s.enabled).length}/{sections.length} ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              {sections.map((section, idx) => {
                const isSelected = section.id === selectedSectionId;
                return (
                  <div
                    key={section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`p-2.5 rounded-[var(--radius-sm)] border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[var(--color-sun)] border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]'
                        : section.enabled
                        ? 'bg-white border-stone-300 hover:border-black'
                        : 'bg-stone-100 border-dashed border-stone-300 opacity-60'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-stone-500 w-4">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <span className="font-display text-xs font-bold uppercase truncate block text-[var(--color-ink)]">
                          {section.name}
                        </span>
                        <span className="font-mono text-[9px] text-stone-500 uppercase">
                          {section.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-black/10 rounded disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="p-1 hover:bg-black/10 rounded disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleToggleEnable(section.id)}
                        className={`w-4 h-4 rounded-full border border-black cursor-pointer ml-1 ${
                          section.enabled ? 'bg-emerald-500' : 'bg-stone-300'
                        }`}
                        title={section.enabled ? 'Enabled' : 'Disabled'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Middle Column: Live Interactive Viewport Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Viewport Switcher */}
          <div className="flex items-center justify-between bg-stone-100 p-2 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)]">
            <span className="font-mono text-xs font-bold uppercase text-stone-600">
              VIEWPORT PREVIEW
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded border ${
                  viewport === 'desktop'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-white text-black border-stone-300'
                }`}
                title="Desktop 100%"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded border ${
                  viewport === 'tablet'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-white text-black border-stone-300'
                }`}
                title="Tablet 768px"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded border ${
                  viewport === 'mobile'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-white text-black border-stone-300'
                }`}
                title="Mobile 375px"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Device Mockup Frame */}
          <div className="bg-stone-300 p-3 rounded-[var(--radius-md)] border-3 border-[var(--color-ink)] shadow-[var(--shadow-neo-md)] overflow-hidden">
            <div className={`${viewportWidths[viewport]} bg-[var(--color-paper)] border-2 border-black rounded shadow transition-all duration-300 min-h-[500px] max-h-[680px] overflow-y-auto p-4 space-y-4`}>
              {sections
                .filter((s) => s.enabled)
                .map((sec) => (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`p-3 border-2 transition-all cursor-pointer rounded-[var(--radius-sm)] ${
                      sec.id === selectedSectionId
                        ? 'border-blue-600 ring-2 ring-blue-400 bg-white'
                        : 'border-black bg-white hover:border-amber-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-1 border-b border-stone-200 pb-1">
                      <span className="font-bold uppercase">{sec.name}</span>
                      <span>#{sec.order}</span>
                    </div>

                    {/* Section preview render */}
                    {sec.type === 'announcement' && (
                      <div className="p-2 bg-[var(--color-sun)] text-[11px] font-display font-bold border border-black text-center">
                        {sec.props?.label}: {sec.props?.message}
                      </div>
                    )}

                    {sec.type === 'hero_poster' && (
                      <div className="p-4 bg-[var(--color-sun)] border-2 border-black space-y-2">
                        <span className="text-[10px] font-mono font-bold block">{sec.props?.eyebrow}</span>
                        <h2 className="font-display font-black text-xl leading-none">
                          {(sec.props?.headlineLines || []).join(' ')}
                        </h2>
                        <p className="text-xs font-body">{sec.props?.intro}</p>
                        <div className="flex gap-2 pt-2">
                          <span className="px-2 py-1 bg-black text-white text-[10px] font-bold">
                            {sec.props?.primaryCta?.label || 'CTA'}
                          </span>
                        </div>
                      </div>
                    )}

                    {sec.type === 'marquee' && (
                      <div className="p-2 bg-stone-900 text-[var(--color-sun)] font-mono text-[11px] truncate font-bold">
                        ★ {(sec.props?.keywords || []).join(' ★ ')}
                      </div>
                    )}

                    {sec.type === 'about_manifesto' && (
                      <div className="p-3 bg-white border border-black space-y-1">
                        <span className="text-[9px] font-mono font-bold text-stone-500">{sec.props?.sectionLabel}</span>
                        <h3 className="font-display font-bold text-sm">{sec.props?.headline}</h3>
                        <p className="text-[11px] text-stone-700">{sec.props?.body}</p>
                      </div>
                    )}

                    {sec.type === 'featured_work' && (
                      <div className="p-3 bg-stone-50 border border-black space-y-2">
                        <span className="text-xs font-display font-bold">FEATURED WORK WALL</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          {(sec.props?.selectedProjectIds || []).map((pid: string) => (
                            <div key={pid} className="p-2 bg-white border border-stone-300 font-bold">
                              Project: {allProjects.find(p => p.id === pid)?.title || pid}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.type === 'contact_poster' && (
                      <div className="p-3 bg-[var(--color-coral)] text-white border-2 border-black space-y-1">
                        <span className="text-[9px] font-mono">{sec.props?.eyebrow}</span>
                        <h4 className="font-display font-black text-sm">{sec.props?.headline}</h4>
                        <p className="text-[11px]">{sec.props?.message}</p>
                      </div>
                    )}

                    {!['announcement', 'hero_poster', 'marquee', 'about_manifesto', 'featured_work', 'contact_poster'].includes(sec.type) && (
                      <div className="p-3 bg-stone-100 text-xs font-mono text-stone-600 text-center">
                        [{sec.name} Component Block]
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Block Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="surface" shadow="md" borderWidth="2" className="p-5">
            <div className="border-b-2 border-stone-200 pb-3 mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-500">
                BLOCK INSPECTOR
              </span>
              <h3 className="font-display font-black text-lg text-[var(--color-ink)]">
                {selectedSection.name}
              </h3>
            </div>

            {/* Inspector fields based on selected section type */}
            <div className="space-y-4">
              {selectedSection.type === 'announcement' && (
                <>
                  <Input
                    label="Label"
                maxLength={40}
                    value={selectedSection.props?.label || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'label', e.target.value)}
                  />
                  <Textarea
                    label="Announcement Message"
                maxLength={140}
                    value={selectedSection.props?.message || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'message', e.target.value)}
                    rows={2}
                  />
                  <Input
                    label="Target Link"
                maxLength={2048}
                    value={selectedSection.props?.linkUrl || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'linkUrl', e.target.value)}
                  />
                </>
              )}

              {selectedSection.type === 'hero_poster' && (
                <>
                  <Input
                    label="Eyebrow Tag"
                maxLength={40}
                    value={selectedSection.props?.eyebrow || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'eyebrow', e.target.value)}
                  />
                  <div className="space-y-2">
                    <label className="font-display text-xs font-bold uppercase tracking-wider">
                      Headline Lines (3 lines)
                    </label>
                    {[0, 1, 2].map((idx) => (
                      <Input
                        key={idx}
                        value={selectedSection.props?.headlineLines?.[idx] || ''}
                        onChange={(e) => {
                          const lines = [...(selectedSection.props?.headlineLines || ['', '', ''])];
                          lines[idx] = e.target.value;
                          handleUpdateProps(selectedSection.id, 'headlineLines', lines);
                        }}
                        placeholder={`Headline Line ${idx + 1}`}
                        maxLength={24}
                      />
                    ))}
                  </div>

                  <Textarea
                    label="Hero Narrative Intro"
                maxLength={200}
                    value={selectedSection.props?.intro || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'intro', e.target.value)}
                    rows={3}
                  />

                  <Select
                    label="Hero Accent"
                    value={selectedSection.props?.heroAccent || 'sun'}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'heroAccent', e.target.value)}
                    options={[
                      { value: 'sun', label: 'Sun Yellow' },
                      { value: 'sky', label: 'Electric Sky' },
                      { value: 'coral', label: 'Coral Neon' },
                      { value: 'lime', label: 'Acid Lime' },
                    ]}
                  />

                  <Select
                    label="Featured Project Teaser"
                    value={selectedSection.props?.featuredProjectId || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'featuredProjectId', e.target.value)}
                  >
                    <option value="">None</option>
                    {allProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.status})
                      </option>
                    ))}
                  </Select>
                </>
              )}

              {selectedSection.type === 'about_manifesto' && (
                <>
                  <Input
                    label="Section Eyebrow Label"
                maxLength={40}
                    value={selectedSection.props?.sectionLabel || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'sectionLabel', e.target.value)}
                  />
                  <Input
                    label="Manifesto Headline"
                maxLength={80}
                    value={selectedSection.props?.headline || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'headline', e.target.value)}
                  />
                  <Textarea
                    label="Manifesto Body"
                maxLength={2000}
                    value={selectedSection.props?.body || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'body', e.target.value)}
                    rows={4}
                  />
                  <Input
                    label="CTA Button Label"
                maxLength={24}
                    value={selectedSection.props?.ctaText || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'ctaText', e.target.value)}
                  />
                </>
              )}

              {selectedSection.type === 'featured_work' && (
                <>
                  <Select
                    label="Display Mode"
                    value={selectedSection.props?.mode || 'curated'}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'mode', e.target.value)}
                    options={[
                      { value: 'curated', label: 'Curated (Manual Selection)' },
                      { value: 'recent', label: 'Most Recently Updated' },
                    ]}
                  />

                  <div className="space-y-2">
                    <label className="font-display text-xs font-bold uppercase tracking-wider">
                      Selected Projects
                    </label>
                    {allProjects.map((p) => {
                      const isSelected = (selectedSection.props?.selectedProjectIds || []).includes(p.id);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 bg-stone-50 border border-stone-300 rounded text-xs"
                        >
                          <span className="font-semibold">{p.title}</span>
                          <button
                            onClick={() => {
                              const curr = selectedSection.props?.selectedProjectIds || [];
                              const updated = isSelected
                                ? curr.filter((id: string) => id !== p.id)
                                : [...curr, p.id];
                              handleUpdateProps(selectedSection.id, 'selectedProjectIds', updated);
                            }}
                            className={`px-2 py-0.5 rounded font-mono font-bold cursor-pointer ${
                              isSelected ? 'bg-black text-white' : 'bg-white border border-black'
                            }`}
                          >
                            {isSelected ? 'SELECTED' : 'SELECT'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {(selectedSection.type === 'experiment_grid' || selectedSection.type === 'notes_grid') && (
                <>
                  <Input
                    label="Section Eyebrow Label"
                maxLength={40}
                    value={selectedSection.props?.eyebrow || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'eyebrow', e.target.value)}
                  />
                  <Input
                    label="Section Headline"
                maxLength={80}
                    value={selectedSection.props?.headline || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'headline', e.target.value)}
                  />
                </>
              )}

              {selectedSection.type === 'contact_poster' && (                <>
                  <Input
                    label="Headline"
                maxLength={80}
                    value={selectedSection.props?.headline || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'headline', e.target.value)}
                  />
                  <Textarea
                    label="Message"
                maxLength={500}
                    value={selectedSection.props?.message || ''}
                    onChange={(e) => handleUpdateProps(selectedSection.id, 'message', e.target.value)}
                    rows={3}
                  />
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="PUBLISH HOMEPAGE TO LIVE SITE"
        description="This will update the live homepage layout and sections ordering."
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-stone-700">
            You are publishing <strong>{sections.filter((s) => s.enabled).length} active sections</strong> to the root URL (<code className="font-mono bg-stone-100 px-1 font-bold">/</code>).
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button variant="secondary" onClick={() => setIsPublishModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" onClick={handlePublish} isLoading={isPending}>
              CONFIRM PUBLISH
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
