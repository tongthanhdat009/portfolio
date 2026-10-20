'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  Eye,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';
import { CmsEntry, ProjectData, ColorAccent } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  saveDraftAction,
  createEntryAction,
  publishEntryAction,
} from '@/app/admin/actions';

interface ProjectEditorClientProps {
  initialEntry?: CmsEntry<ProjectData> | null;
  isNew?: boolean;
}

export default function ProjectEditorClient({
  initialEntry,
  isNew = false,
}: ProjectEditorClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'story' | 'media' | 'links' | 'seo'>('overview');
  const [isPending, startTransition] = useTransition();
  const [isPublishPending, startPublishTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [slug, setSlug] = useState(initialEntry?.slug || '');
  const [year, setYear] = useState(initialEntry?.data?.year || '2026');
  const [indexNum, setIndexNum] = useState(initialEntry?.data?.index || '01');
  const [category, setCategory] = useState<any>(initialEntry?.data?.category || 'Web Products');
  const [status, setStatus] = useState<any>(initialEntry?.data?.status || 'In Production');
  const [accent, setAccent] = useState<ColorAccent>(initialEntry?.data?.accent || 'sun');
  const [featured, setFeatured] = useState<boolean>(initialEntry?.featured ?? false);
  const [summary, setSummary] = useState(initialEntry?.data?.summary || '');
  const [tagsInput, setTagsInput] = useState((initialEntry?.data?.tags || []).join(', '));

  // Case study story
  const [product, setProduct] = useState(initialEntry?.data?.caseStudy?.overview?.product || '');
  const [targetUsers, setTargetUsers] = useState(initialEntry?.data?.caseStudy?.overview?.targetUsers || '');
  const [timeline, setTimeline] = useState(initialEntry?.data?.caseStudy?.overview?.timeline || '');
  const [role, setRole] = useState(initialEntry?.data?.caseStudy?.overview?.role || '');
  const [problem, setProblem] = useState(initialEntry?.data?.caseStudy?.problem || '');
  const [approachSummary, setApproachSummary] = useState(initialEntry?.data?.caseStudy?.approach?.summary || '');

  // Contribution bullet points
  const [contributions, setContributions] = useState<string[]>(
    initialEntry?.data?.caseStudy?.contribution?.length ? initialEntry.data.caseStudy.contribution : ['']
  );

  // Highlights
  const [highlights, setHighlights] = useState<string[]>(
    initialEntry?.data?.caseStudy?.highlights?.length ? initialEntry.data.caseStudy.highlights : ['']
  );

  // Outcomes
  const [outcomes, setOutcomes] = useState<string[]>(
    initialEntry?.data?.caseStudy?.outcomes?.length ? initialEntry.data.caseStudy.outcomes : ['']
  );

  // Lessons
  const [lessons, setLessons] = useState<string[]>(
    initialEntry?.data?.caseStudy?.lessons?.length ? initialEntry.data.caseStudy.lessons : ['']
  );

  // Media & Links
  const [coverImage, setCoverImage] = useState(initialEntry?.data?.coverImage || '');
  const [coverAlt, setCoverAlt] = useState((initialEntry?.data as any)?.coverAlt || '');
  const [demoUrl, setDemoUrl] = useState(initialEntry?.data?.demoUrl || '');
  const [repoUrl, setRepoUrl] = useState(initialEntry?.data?.repoUrl || '');

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialEntry?.seo?.title || '');
  const [seoDescription, setSeoDescription] = useState(initialEntry?.seo?.description || '');

  // Feedback states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed' | 'unsaved'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [currentRev, setCurrentRev] = useState(initialEntry?.revision || 1);

  // Mark unsaved on change
  const markDirty = () => {
    if (saveStatus !== 'unsaved') {
      setSaveStatus('unsaved');
    }
  };

  const handleSaveDraft = () => {
    setSaveStatus('saving');
    startTransition(async () => {
      try {
        const payloadData: ProjectData = {
          title,
          slug,
          year,
          index: indexNum,
          category,
          status,
          accent,
          featured,
          summary,
          tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
          demoUrl: demoUrl || undefined,
          repoUrl: repoUrl || undefined,
          coverImage: coverImage || undefined,
          caseStudy: {
            overview: {
              product: product || title,
              targetUsers,
              timeline,
              role,
              status,
            },
            problem,
            contribution: contributions.filter(Boolean),
            approach: {
              summary: approachSummary,
              architecturePoints: [],
            },
            highlights: highlights.filter(Boolean),
            outcomes: outcomes.filter(Boolean),
            lessons: lessons.filter(Boolean),
          },
        };

        const seoPayload = {
          title: seoTitle || title,
          description: seoDescription || summary,
        };

        if (isNew) {
          const created = await createEntryAction({
            type: 'project',
            slug,
            title,
            locale: 'en',
            status: 'draft',
            sortOrder: 1,
            featured,
            references: [],
            seo: seoPayload,
            data: payloadData,
          });
          setSaveStatus('saved');
          router.push(`/admin/content/projects/${created._id}`);
          router.refresh();
        } else {
          const res = await saveDraftAction(
            initialEntry!._id,
            {
              title,
              slug,
              featured,
              seo: seoPayload,
              data: {
                ...payloadData,
                coverAlt,
              } as any,
            },
            currentRev
          );
          setCurrentRev(res.revision);
          setSaveStatus('saved');
          setSaveMessage(`Saved rev #${res.revision} at ${new Date().toLocaleTimeString()}`);
        }
      } catch (err) {
        setSaveStatus('failed');
        setSaveMessage((err as Error).message);
      }
    });
  };

  const handlePublish = () => {
    if (isNew || !initialEntry) return;
    startPublishTransition(async () => {
      try {
        // Save latest state first
        await saveDraftAction(
          initialEntry._id,
          {
            title,
            slug,
            featured,
            seo: { title: seoTitle || title, description: seoDescription || summary },
            data: {
              title,
              slug,
              year,
              index: indexNum,
              category,
              status,
              accent,
              featured,
              summary,
              tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
              demoUrl: demoUrl || undefined,
              repoUrl: repoUrl || undefined,
              coverImage: coverImage || undefined,
              coverAlt,
              caseStudy: {
                overview: { product, targetUsers, timeline, role, status },
                problem,
                contribution: contributions.filter(Boolean),
                approach: { summary: approachSummary, architecturePoints: [] },
                highlights: highlights.filter(Boolean),
                outcomes: outcomes.filter(Boolean),
                lessons: lessons.filter(Boolean),
              },
            } as any,
          },
          currentRev
        );

        const res = await publishEntryAction(initialEntry._id);
        setCurrentRev(res.entry.revision);
        setIsPublishModalOpen(false);
        setSaveStatus('saved');
        setSaveMessage(`Successfully published rev #${res.entry.revision}!`);
        router.refresh();
      } catch (err) {
        setSaveMessage((err as Error).message);
      }
    });
  };

  const tabs = [
    { key: 'overview', label: '1. OVERVIEW' },
    { key: 'story', label: '2. STORY & ARCHITECTURE' },
    { key: 'media', label: '3. MEDIA & ASSETS' },
    { key: 'links', label: '4. EXTERNAL LINKS' },
    { key: 'seo', label: '5. SEO METADATA' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-[var(--color-ink)] pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/content/projects">
            <button className="p-2 rounded-[var(--radius-sm)] border-2 border-[var(--color-ink)] bg-white hover:bg-[var(--color-paper)] transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-500">
                PROJECT EDITOR
              </span>
              {!isNew && (
                <span className="font-mono text-xs font-bold bg-stone-200 px-1.5 py-0.2 rounded border border-stone-400">
                  rev #{currentRev}
                </span>
              )}
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-[var(--color-ink)]">
              {title ? title : 'Untitled Project'}
            </h1>
          </div>
        </div>

        {/* Status indicator and action buttons */}
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="font-mono text-xs font-bold text-amber-600 flex items-center gap-1.5 animate-pulse">
              <Clock className="w-3.5 h-3.5" /> SAVING DRAFT...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="font-mono text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage || 'SAVED'}
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="font-mono text-xs font-bold text-stone-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> UNSAVED CHANGES
            </span>
          )}
          {saveStatus === 'failed' && (
            <span className="font-mono text-xs font-bold text-[var(--color-negative)] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> SAVE FAILED
            </span>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={handleSaveDraft}
            isLoading={isPending}
          >
            <Save className="w-4 h-4" />
            SAVE DRAFT
          </Button>

          {!isNew && (
            <>
              <a
                href={`http://localhost:3000/work/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex"
              >
                <Button variant="outline" size="md">
                  <Eye className="w-4 h-4" />
                  PREVIEW
                </Button>
              </a>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsPublishModalOpen(true)}
              >
                <Send className="w-4 h-4" />
                PUBLISH
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-stone-200 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer rounded-t-[var(--radius-sm)] ${
              activeTab === t.key
                ? 'bg-[var(--color-sun)] text-[var(--color-ink)] border-2 border-b-0 border-[var(--color-ink)] shadow-[var(--shadow-neo-sm)]'
                : 'text-stone-600 hover:text-black hover:bg-[var(--color-paper)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <Card variant="surface" shadow="md" borderWidth="2" className="p-6">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Project Title"
                maxLength={80}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                required
                placeholder="e.g. AeroSync Cloud Engine"
              />

              <Input
                label="Public URL Slug"
                maxLength={80}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                  markDirty();
                }}
                required
                placeholder="e.g. aerosync-cloud"
                helperText="Route will be /work/[slug]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="Year"
                maxLength={12}
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  markDirty();
                }}
                placeholder="2026"
              />

              <Input
                label="Card Index No."
                maxLength={4}
                value={indexNum}
                onChange={(e) => {
                  setIndexNum(e.target.value);
                  markDirty();
                }}
                placeholder="01"
              />

              <Select
                label="Category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  markDirty();
                }}
                options={[
                  { value: 'Web Products', label: 'Web Products' },
                  { value: 'Backend & APIs', label: 'Backend & APIs' },
                  { value: 'Intelligent Workflows', label: 'Intelligent Workflows' },
                  { value: 'Developer Tools', label: 'Developer Tools' },
                  { value: 'Systems & Architecture', label: 'Systems & Architecture' },
                ]}
              />

              <Select
                label="Accent Color"
                value={accent}
                onChange={(e) => {
                  setAccent(e.target.value as any);
                  markDirty();
                }}
                options={[
                  { value: 'sun', label: 'Sun Yellow' },
                  { value: 'sky', label: 'Electric Sky' },
                  { value: 'coral', label: 'Coral Neon' },
                  { value: 'lime', label: 'Acid Lime' },
                  { value: 'pink', label: 'Vibrant Pink' },
                  { value: 'paper', label: 'Paper Cream' },
                ]}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-stone-50 border-2 border-stone-200 rounded-[var(--radius-sm)]">
              <input
                type="checkbox"
                id="featuredCheck"
                checked={featured}
                onChange={(e) => {
                  setFeatured(e.target.checked);
                  markDirty();
                }}
                className="w-5 h-5 accent-black cursor-pointer"
              />
              <label htmlFor="featuredCheck" className="text-sm font-display font-bold uppercase cursor-pointer">
                FEATURE ON HOMEPAGE WORK WALL
              </label>
            </div>

            <Textarea
              label="Short Elevator Summary"
                maxLength={300}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                markDirty();
              }}
              rows={3}
              placeholder="1-2 sentences summarizing problem solved and high-level architectural value."
              helperText="Cards show ~2 lines — keep under 300 characters."
            />

            <Input
              label="Technology Tags (comma separated)"
                maxLength={300}
              value={tagsInput}
              onChange={(e) => {
                setTagsInput(e.target.value);
                markDirty();
              }}
              placeholder="e.g. Distributed Systems, Go, Kafka, Redis, Kubernetes"
            />
          </div>
        )}

        {/* Tab 2: Story & Architecture */}
        {activeTab === 'story' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Target Users"
                maxLength={120}
                value={targetUsers}
                onChange={(e) => {
                  setTargetUsers(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. Autonomous drone fleets"
              />
              <Input
                label="Timeline / Duration"
                maxLength={60}
                value={timeline}
                onChange={(e) => {
                  setTimeline(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. 6 months"
              />
              <Input
                label="Your Actual Role in Project"
                maxLength={120}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. Lead Systems Architect"
              />
            </div>

            <Textarea
              label="The Core Problem & Context"
                maxLength={500}
              value={problem}
              onChange={(e) => {
                setProblem(e.target.value);
                markDirty();
              }}
              rows={3}
              placeholder="What bottlenecks, scaling failures, or architectural challenges necessitated this system?"
            />

            {/* Key Contributions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  YOUR KEY ARCHITECTURAL CONTRIBUTIONS
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setContributions([...contributions, '']);
                    markDirty();
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> ADD POINT
                </Button>
              </div>
              {contributions.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={c}
                    onChange={(e) => {
                      const updated = [...contributions];
                      updated[i] = e.target.value;
                      setContributions(updated);
                      markDirty();
                    }}
                    placeholder={`Contribution item ${i + 1}`}
                    maxLength={220}
                  />
                  <button
                    onClick={() => {
                      setContributions(contributions.filter((_, idx) => idx !== i));
                      markDirty();
                    }}
                    className="p-2 border-2 border-[var(--color-ink)] bg-stone-100 hover:bg-[var(--color-coral)] rounded-[var(--radius-sm)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Textarea
              label="Approach & Technical Design Summary"
                maxLength={800}
              value={approachSummary}
              onChange={(e) => {
                setApproachSummary(e.target.value);
                markDirty();
              }}
              rows={3}
              placeholder="Technical approach, data flow choices, and engineering tradeoffs."
            />

            {/* Highlights & Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  HIGHLIGHTS & KEY METRICS
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setHighlights([...highlights, '']);
                    markDirty();
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> ADD METRIC
                </Button>
              </div>
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={h}
                    onChange={(e) => {
                      const updated = [...highlights];
                      updated[i] = e.target.value;
                      setHighlights(updated);
                      markDirty();
                    }}
                    placeholder="e.g. 120,000 events/sec sustained load in production"
                    maxLength={220}
                  />
                  <button
                    onClick={() => {
                      setHighlights(highlights.filter((_, idx) => idx !== i));
                      markDirty();
                    }}
                    className="p-2 border-2 border-[var(--color-ink)] bg-stone-100 hover:bg-[var(--color-coral)] rounded-[var(--radius-sm)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Outcomes & Lessons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-display text-xs font-bold uppercase tracking-wider">
                    OUTCOMES & IMPACT
                  </label>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setOutcomes([...outcomes, '']);
                      markDirty();
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD
                  </Button>
                </div>
                {outcomes.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={o}
                      onChange={(e) => {
                        const updated = [...outcomes];
                        updated[i] = e.target.value;
                        setOutcomes(updated);
                        markDirty();
                      }}
                      placeholder="Outcome point"
                      maxLength={220}
                    />
                    <button
                      onClick={() => setOutcomes(outcomes.filter((_, idx) => idx !== i))}
                      className="p-2 border-2 border-[var(--color-ink)] bg-stone-100 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-display text-xs font-bold uppercase tracking-wider">
                    LESSONS LEARNED
                  </label>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setLessons([...lessons, '']);
                      markDirty();
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD
                  </Button>
                </div>
                {lessons.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={l}
                      onChange={(e) => {
                        const updated = [...lessons];
                        updated[i] = e.target.value;
                        setLessons(updated);
                        markDirty();
                      }}
                      placeholder="Lesson learned"
                      maxLength={220}
                    />
                    <button
                      onClick={() => setLessons(lessons.filter((_, idx) => idx !== i))}
                      className="p-2 border-2 border-[var(--color-ink)] bg-stone-100 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Media & Assets */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <Input
              label="Cover Image URL / Path"
                maxLength={2048}
              value={coverImage}
              onChange={(e) => {
                setCoverImage(e.target.value);
                markDirty();
              }}
              placeholder="/images/aerosync.png or storage URL"
              helperText="Main preview image on cards and case study hero."
            />

            <Input
              label="Cover Image Alt Description (Mandatory for accessibility)"
                maxLength={125}
              value={coverAlt}
              onChange={(e) => {
                setCoverAlt(e.target.value);
                markDirty();
              }}
              required={!!coverImage}
              placeholder="Descriptive explanation of the visual asset"
              helperText="Audit warning triggered if cover image lacks alt text."
            />

            {coverImage && (
              <div className="p-4 border-2 border-[var(--color-ink)] rounded-[var(--radius-sm)] bg-[var(--color-paper)]">
                <span className="font-display text-xs font-bold uppercase block mb-2">IMAGE PREVIEW:</span>
                <div className="h-44 w-full max-w-md bg-stone-200 border-2 border-black flex items-center justify-center font-mono text-xs overflow-hidden">
                  <img
                    src={coverImage}
                    alt={coverAlt || 'Preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                    }}
                  />
                  <span className="text-stone-500">[Asset Image: {coverImage}]</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Links */}
        {activeTab === 'links' && (
          <div className="space-y-5">
            <Input
              label="Live Production / Demo URL"
                maxLength={2048}
              value={demoUrl}
              onChange={(e) => {
                setDemoUrl(e.target.value);
                markDirty();
              }}
              placeholder="https://demo.example.com"
            />

            <Input
              label="Source Code Repository URL"
                maxLength={2048}
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                markDirty();
              }}
              placeholder="https://github.com/datnguyen/repo"
            />
          </div>
        )}

        {/* Tab 5: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <Input
              label="SEO Title Override"
                maxLength={60}
              value={seoTitle}
              onChange={(e) => {
                setSeoTitle(e.target.value);
                markDirty();
              }}
              placeholder={title ? `${title} — Case Study` : 'Project SEO Title'}
              helperText="Recommended length: 40-60 characters."
            />

            <Textarea
              label="SEO Meta Description"
                maxLength={160}
              value={seoDescription}
              onChange={(e) => {
                setSeoDescription(e.target.value);
                markDirty();
              }}
              rows={3}
              placeholder="Concise overview for search engine result snippets (120-160 chars)."
            />
          </div>
        )}
      </Card>

      {/* Publish Modal with Preflight Check */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="PUBLISH TO LIVE PORTFOLIO"
        description="Verify preflight checks and create a fresh public snapshot."
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-[var(--radius-sm)] space-y-2">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-amber-900">
              PREFLIGHT AUDIT SUMMARY
            </h4>
            <ul className="text-xs font-mono space-y-1 text-amber-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Title: {title}
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Route: /work/{slug}
              </li>
              <li className="flex items-center gap-1.5">
                {coverImage && !coverAlt ? (
                  <span className="text-[var(--color-negative)] flex items-center gap-1">
                    ⚠ Warning: Cover alt text is missing.
                  </span>
                ) : (
                  <span className="text-emerald-700 flex items-center gap-1">
                    ✓ Cover Alt verified
                  </span>
                )}
              </li>
            </ul>
          </div>

          <p className="text-xs font-body text-stone-600">
            Publishing will increment the revision to <strong>rev #{currentRev + 1}</strong>, generate an immutable snapshot in <code className="bg-stone-100 px-1 font-mono">cms_publications</code>, and trigger Next.js cache revalidation on the public route.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <Button variant="secondary" onClick={() => setIsPublishModalOpen(false)}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              onClick={handlePublish}
              isLoading={isPublishPending}
            >
              CONFIRM & PUBLISH NOW
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
