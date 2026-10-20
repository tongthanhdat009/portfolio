'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, GraduationCap, Microscope, Users, Award } from 'lucide-react';
import { ExperienceItem, ColorAccent, SiteSettings } from '@/types';
import { Card } from '@/components/ui/Card';

interface JourneySectionProps {
  items: ExperienceItem[];
  settings?: SiteSettings;
}

const typeIconMap: Record<string, React.ReactNode> = {
  Work: <Briefcase size={16} />,
  Education: <GraduationCap size={16} />,
  Research: <Microscope size={16} />,
  Community: <Users size={16} />,
  Milestone: <Award size={16} />,
};

interface ChapterMeta {
  title: string;
  subtitle: string;
  accent: ColorAccent;
}

const CHAPTER_META: Record<string, ChapterMeta> = {
  Work: { title: 'WORK EXPERIENCE', subtitle: 'Building things that matter.', accent: 'lime' },
  Education: { title: 'EDUCATION', subtitle: 'Where curiosity meets knowledge.', accent: 'sky' },
  Research: { title: 'RESEARCH & INNOVATION', subtitle: "Probing what's next.", accent: 'coral' },
  Community: { title: 'COMMUNITY', subtitle: 'Giving back to the craft.', accent: 'sun' },
  Milestone: { title: 'MILESTONES', subtitle: 'Moments that mattered.', accent: 'pink' },
};

const VALID_ACCENTS: ColorAccent[] = ['sun', 'sky', 'coral', 'lime', 'pink', 'paper', 'surface'];

function metaFor(type: string, settings?: SiteSettings): ChapterMeta {
  const fallback = CHAPTER_META[type] || { title: type.toUpperCase(), subtitle: '', accent: 'paper' as ColorAccent };
  const override = settings?.journeyChapters?.find((c) => c.type === type);
  if (!override) return fallback;
  return {
    title: override.title || fallback.title,
    subtitle: override.subtitle ?? fallback.subtitle,
    accent: VALID_ACCENTS.includes(override.accent as ColorAccent)
      ? (override.accent as ColorAccent)
      : fallback.accent,
  };
}

interface Chapter {
  type: string;
  meta: ChapterMeta;
  items: ExperienceItem[];
  /** index (in panels) where this chapter's title card starts */
  startPanel: number;
  /** panels in this chapter = 1 title card + item cards */
  panels: number;
}

export const JourneySection: React.FC<JourneySectionProps> = ({ items, settings }) => {
  const eyebrow = settings?.journeyEyebrow || '// 06. TIMELINE';
  const heading = settings?.journeyHeading || 'THE JOURNEY SO FAR';
  const intro =
    settings?.journeyIntro ||
    'Proven track record of shipping systems, rigorous research, and active open-source contribution.';
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const chapters: Chapter[] = useMemo(() => {
    const list: Chapter[] = [];
    for (const item of items) {
      const t = item.type || 'Other';
      const existing = list.find((g) => g.type === t);
      if (existing) existing.items.push(item);
      else list.push({ type: t, meta: metaFor(t, settings), items: [item], startPanel: 0, panels: 0 });
    }
    let cursor = 0;
    for (const ch of list) {
      ch.startPanel = cursor;
      ch.panels = 1 + ch.items.length;
      cursor += ch.panels;
    }
    return list;
  }, [items, settings]);

  const totalPanels = chapters.reduce((n, ch) => n + ch.panels, 0);

  const activeChapter = useMemo(() => {
    if (chapters.length === 0) return 0;
    let active = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (progress * totalPanels >= chapters[i].startPanel - 0.001) active = i;
    }
    return active;
  }, [progress, chapters, totalPanels]);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!outer || !track) return;

    const update = () => {
      rafRef.current = 0;
      const rect = outer.getBoundingClientRect();
      const scrollable = outer.offsetHeight - window.innerHeight;
      const raw = scrollable > 0 ? -rect.top / scrollable : 0;
      const p = Math.min(1, Math.max(0, raw));
      setProgress(p);
      const maxX = track.scrollWidth - window.innerWidth;
      track.style.transform = `translate3d(${-p * Math.max(0, maxX)}px, 0, 0)`;
    };

    const onScroll = () => {
      if (rafRef.current === 0) rafRef.current = window.requestAnimationFrame(update);
    };
    update();
    if (document.fonts?.ready) document.fonts.ready.then(update).catch(() => {});
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null;
    if (ro && track) ro.observe(track);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (ro) ro.disconnect();
      if (rafRef.current !== 0) window.cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, isMobile, items.length]);

  const jumpToChapter = (idx: number) => {
    const outer = outerRef.current;
    if (!outer || chapters.length === 0) return;
    const start = outer.offsetTop + (chapters[idx].startPanel / Math.max(1, totalPanels)) * (outer.offsetHeight - window.innerHeight);
    window.scrollTo({ top: Math.max(0, start + 2), behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  if (reducedMotion || isMobile) {
    return (
      <section
        id="journey"
        aria-label="Experience and Journey"
        className="w-full bg-[#FFF9E9] border-b-4 border-[#111111] py-16 md:py-24"
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col gap-2 pb-8 border-b-3 border-[#111111] mb-8">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751]">
              {eyebrow}
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#111111] uppercase tracking-tight">
              {heading}
            </h2>
            <p className="font-mono text-xs md:text-sm text-[#5B5751] max-w-xl">{intro}</p>
          </div>
          {chapters.map((ch) => (
            <div key={ch.type} className="mb-10 last:mb-0">
              <ChapterHeading chapter={ch} index={chapters.indexOf(ch)} />
              <div className="space-y-6">
                {ch.items.map((item, idx) => (
                  <JourneyCard key={item.id} item={item} chapter={chapters.indexOf(ch)} index={idx} total={ch.items.length} accent={ch.meta.accent} className="w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const current = chapters[activeChapter];

  return (
    <section
      id="journey"
      aria-label="Experience and Journey"
      className="w-full bg-[#FFF9E9] border-b-4 border-[#111111]"
    >
      <div ref={outerRef} style={{ height: `${Math.max(1, totalPanels) * 100}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 w-full mb-4 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751]">
                {eyebrow} — SCROLL TO TRAVEL
              </span>
              <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#111111] uppercase tracking-tight">
                {heading}
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-[#5B5751] tabular-nums whitespace-nowrap">
              CH {String(activeChapter + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
            </span>
          </div>

          {/* Sticky chapter info */}
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 w-full mb-6 flex items-center gap-4" aria-live="polite">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111111] text-[#FFF9E9] font-mono text-xs font-bold uppercase tracking-wider rounded-xs whitespace-nowrap">
              {typeIconMap[current.type] || <Briefcase size={12} />}
              <span key={current.type}>CHAPTER {String(activeChapter + 1).padStart(2, '0')} — {current.meta.title}</span>
            </span>
            {current.meta.subtitle && (
              <span className="font-mono text-xs md:text-sm text-[#5B5751] truncate">{current.meta.subtitle}</span>
            )}
          </div>

          <div ref={trackRef} className="flex items-stretch gap-6 md:gap-10 px-4 md:px-8 will-change-transform">
            {chapters.map((ch, chIdx) => (
              <React.Fragment key={ch.type}>
                <ChapterTitleCard chapter={ch} index={chIdx} />
                {ch.items.map((item, idx) => (
                  <JourneyCard
                    key={item.id}
                    item={item}
                    chapter={chIdx}
                    index={idx}
                    total={ch.items.length}
                    accent={ch.meta.accent}
                  />
                ))}
              </React.Fragment>
            ))}
            <div aria-hidden="true" className="w-[8vw] md:w-[6vw] shrink-0" />
          </div>

          {/* Segmented chapter progress (clickable) */}
          <div className="max-w-[1280px] mx-auto px-4 md:px-8 w-full mt-8">
            <span className="sr-only" role="status">
              Chapter {activeChapter + 1} of {chapters.length},{' '}
              {Math.round(progress * 100)}% travelled
            </span>
            <div className="flex gap-2" role="group" aria-label="Jump to chapter">
              {chapters.map((ch, chIdx) => {
                const segStart = ch.startPanel / Math.max(1, totalPanels);
                const segEnd = (ch.startPanel + ch.panels) / Math.max(1, totalPanels);
                const fill = Math.min(1, Math.max(0, (progress - segStart) / Math.max(0.0001, segEnd - segStart)));
                const isActive = chIdx === activeChapter;
                return (
                  <button
                    key={ch.type}
                    type="button"
                    onClick={() => jumpToChapter(chIdx)}
                    aria-label={`Jump to ${ch.meta.title}`}
                    className={`h-10 flex-1 rounded-xs border-2 border-[#111111] overflow-hidden cursor-pointer transition-colors ${
                      isActive ? 'bg-white' : 'bg-white/60 hover:bg-white'
                    }`}
                  >
                    <span className="flex h-full items-center gap-1.5 px-1.5">
                      <span className="h-full bg-[#FFDB58] border-r-2 border-[#111111]" style={{ width: `${fill * 100}%` }} />
                      <span className={`font-mono text-xs font-bold uppercase truncate ${isActive ? 'text-[#111111]' : 'text-[#5B5751]'}`}>
                        {ch.meta.title}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ChapterHeading: React.FC<{ chapter: Chapter; index: number }> = ({ chapter, index }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111111] text-[#FFF9E9] font-mono text-xs font-bold uppercase tracking-wider rounded-xs whitespace-nowrap">
      {typeIconMap[chapter.type] || <Briefcase size={12} />}
      <span>
        CHAPTER {String(index + 1).padStart(2, '0')} — {chapter.meta.title}
      </span>
    </span>
    {chapter.meta.subtitle && (
      <span className="font-mono text-xs md:text-sm text-[#5B5751] truncate">{chapter.meta.subtitle}</span>
    )}
    <span aria-hidden="true" className="flex-1 border-t-2 border-[#111111]" />
  </div>
);

const ChapterTitleCard: React.FC<{ chapter: Chapter; index: number }> = ({ chapter, index }) => (
  <div className="w-[70vw] md:w-[26vw] shrink-0 flex flex-col justify-center gap-3 pr-2">
    <span className="font-display font-black text-6xl md:text-8xl text-[#111111] uppercase leading-none">
      {String(index + 1).padStart(2, '0')}
      <span className="text-[#FF7661]">.</span>
    </span>
    <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 bg-[#111111] text-[#FFF9E9] font-mono text-xs font-bold uppercase tracking-wider rounded-xs">
      {typeIconMap[chapter.type] || <Briefcase size={12} />}
      <span>{chapter.meta.title}</span>
    </span>
    {chapter.meta.subtitle && (
      <p className="font-mono text-xs md:text-sm text-[#5B5751] max-w-[26ch]">{chapter.meta.subtitle}</p>
    )}
  </div>
);

interface JourneyCardProps {
  item: ExperienceItem;
  chapter: number;
  index: number;
  total: number;
  accent: ColorAccent;
  className?: string;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ item, chapter, index, total, accent, className }) => (
  <article className={className || 'w-[80vw] md:w-[38vw] shrink-0'}>
    <Card accent={accent} border="md" shadow="md" className="p-6 h-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="font-mono text-xs font-bold text-[#5B5751] tabular-nums whitespace-nowrap">
          {String(chapter + 1).padStart(2, '0')} · {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-[#111111] text-[#FFF9E9] font-mono text-xs font-bold uppercase">
          {typeIconMap[item.type] || <Briefcase size={12} />}
          <span>{item.type}</span>
        </span>
      </div>
      <p className="font-mono text-base md:text-lg font-black text-[#FF7661] mb-1">{item.year}</p>
      <h3 className="font-display font-bold text-xl md:text-2xl text-[#111111] mb-1">{item.organization}</h3>
      <p className="font-mono text-xs font-bold text-[#5B5751] mb-3">{item.roleAtTime}</p>
      <p className="text-sm md:text-base text-[#111111] leading-relaxed font-medium mb-4">{item.description}</p>
      <ul className="space-y-1.5 pt-2 border-t border-[#E9DFC9]">
        {item.highlights.slice(0, 3).map((h, hIdx) => (
          <li key={hIdx} className="text-xs md:text-sm text-[#111111] flex items-start gap-2">
            <span className="font-bold text-[#FF7661]">→</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </Card>
  </article>
);
