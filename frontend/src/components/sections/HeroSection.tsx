import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, Terminal } from 'lucide-react';
import { HeroData, Project } from '@/types';
import { Button } from '@/components/ui/Button';

interface HeroSectionProps {
  data: HeroData;
  featuredProject?: Project | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  data,
  featuredProject,
}) => {
  return (
    <section
      aria-label="Hero poster"
      className="relative w-full border-b-4 border-[#111111] bg-[#FFF9E9] overflow-hidden pt-8 md:pt-12 pb-8 md:pb-10"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Desktop 12-Column Asymmetric Poster Canvas */}
        <div className="hidden lg:grid grid-cols-12 gap-x-6 gap-y-4 items-start relative min-h-[580px]">
          {/* H01 — Eyebrow Tag (Col 1–6, Row 1) */}
          <div className="col-span-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#89CFF0] border-2 border-[#111111] rounded-sm font-mono text-xs font-bold uppercase tracking-wider text-[#111111] neo-shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />
              {data.eyebrow}
            </span>
          </div>

          {/* H02 — Micro-status Sticker (Col 8–12, Row 1) */}
          <div className="col-span-6 flex justify-end">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFDB58] border-2 border-[#111111] rounded-md font-mono text-xs font-bold text-[#111111] neo-shadow-sm rotate-2 hover:rotate-0 transition-transform">
              <Sparkles size={14} className="text-[#111111]" />
              <span>{data.statusLabel}</span>
            </div>
          </div>

          {/* H03 — Massive Headline Poster (Col 1–10, Row 2) */}
          <div className="col-span-12 xl:col-span-10 pt-2 select-none relative z-10">
            <h1 className="font-display font-extrabold uppercase tracking-tight text-[#111111] leading-[0.92] text-6xl md:text-8xl xl:text-9xl">
              {data.headlineLines.map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </div>

          {/* H04 — Decorative SVG Starburst Mark (Col 11–12, Row 2) */}
          <div className="col-span-2 hidden xl:flex flex-col items-center justify-start pt-6 z-0">
            <svg
              className="w-28 h-28 text-[#111111] animate-spin-slow hover:text-[#FF7661] transition-colors"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-hidden="true"
            >
              <polygon points="50,0 62,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 38,35" />
            </svg>
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-[#5B5751] mt-2">
              EST. 2026
            </span>
          </div>

          {/* H05 — Short Intro + H07 CTA Rail (Col 1–7, Row 3) */}
          <div className="col-span-7 flex flex-col gap-6 pt-4 z-10">
            <p className="text-lg md:text-xl font-medium text-[#111111] leading-relaxed max-w-xl">
              {data.intro}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button href={data.primaryCta.href} variant="primary" size="lg">
                <span>{data.primaryCta.label}</span>
              </Button>
              <Button href={data.secondaryCta.href} variant="secondary" size="lg">
                <span>{data.secondaryCta.label}</span>
              </Button>
            </div>
          </div>

          {/* H06 — Featured Project Mini-card / Sticker (Col 8–12, Row 3) */}
          {data.featuredProjectEnabled && featuredProject && (
            <div className="col-span-5 flex justify-end z-20">
              <div className="w-full max-w-sm p-4 bg-[#FFFFFF] border-3 border-[#111111] rounded-lg neo-shadow-md hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between pb-2 border-b-2 border-[#111111] mb-3">
                  <span className="font-mono text-xs font-bold uppercase text-[#5B5751]">
                    Featured Build // 01
                  </span>
                  <span className="px-2 py-0.5 bg-[#C6F56A] border border-[#111111] rounded-xs font-mono text-[10px] font-bold uppercase">
                    {featuredProject.status}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-[#111111] leading-tight mb-1">
                  {featuredProject.title}
                </h3>
                <p className="text-xs text-[#5B5751] line-clamp-2 mb-3">
                  {featuredProject.summary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E9DFC9]">
                  <div className="flex flex-wrap gap-1">
                    {featuredProject.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] px-1.5 py-0.5 bg-[#FFF9E9] border border-[#111111] rounded-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/work/${featuredProject.slug}`}
                    className="font-display text-xs font-bold uppercase text-[#111111] hover:text-[#FF7661] inline-flex items-center gap-0.5"
                  >
                    <span>Read Study</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* H08 — Bottom Index & Keywords (Col 1–12, Row 4) */}
          <div className="col-span-12 pt-8 mt-6 border-t-2 border-[#111111] flex flex-wrap items-center justify-between gap-4 font-mono text-xs font-bold text-[#5B5751]">
            <div className="flex items-center gap-6">
              {data.bottomKeywords.map((kw, i) => (
                <span key={i} className="hover:text-[#111111] transition-colors">
                  {kw}
                </span>
              ))}
            </div>
            <div className="text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <Terminal size={14} />
              <span>CLEAN NEO-BRUTALISM</span>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Reflow Layout */}
        <div className="lg:hidden flex flex-col gap-6">
          {/* Eyebrow & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#89CFF0] border-2 border-[#111111] rounded-sm font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
              <span className="w-2 h-2 rounded-full bg-[#111111]" />
              {data.eyebrow}
            </span>
            <span className="px-2.5 py-1 bg-[#FFDB58] border-2 border-[#111111] rounded-sm font-mono text-xs font-bold text-[#111111]">
              {data.statusLabel}
            </span>
          </div>

          {/* Mobile Headline */}
          <h1 className="font-display font-extrabold uppercase tracking-tight text-[#111111] leading-[0.95] text-5xl sm:text-7xl">
            {data.headlineLines.map((line, idx) => (
              <span key={idx} className="block">
                {line}
              </span>
            ))}
          </h1>

          {/* Mobile Intro */}
          <p className="text-base sm:text-lg font-medium text-[#111111] leading-relaxed">
            {data.intro}
          </p>

          {/* Mobile CTA Rail */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button href={data.primaryCta.href} variant="primary" size="lg" className="w-full sm:w-auto">
              <span>{data.primaryCta.label}</span>
            </Button>
            <Button href={data.secondaryCta.href} variant="secondary" size="lg" className="w-full sm:w-auto">
              <span>{data.secondaryCta.label}</span>
            </Button>
          </div>

          {/* Mobile Featured Project Card */}
          {data.featuredProjectEnabled && featuredProject && (
            <div className="p-4 bg-[#FFFFFF] border-3 border-[#111111] rounded-lg neo-shadow-sm mt-2">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#111111] mb-2 font-mono text-xs font-bold">
                <span className="text-[#5B5751]">Featured Build // 01</span>
                <span className="px-2 py-0.5 bg-[#C6F56A] border border-[#111111] rounded-xs text-[10px]">
                  {featuredProject.status}
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-[#111111] mb-1">
                {featuredProject.title}
              </h3>
              <p className="text-xs text-[#5B5751] mb-3">
                {featuredProject.summary}
              </p>
              <Link
                href={`/work/${featuredProject.slug}`}
                className="font-display text-xs font-bold uppercase text-[#111111] underline underline-offset-4 flex items-center gap-1"
              >
                <span>Read Case Study</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          )}

          {/* Mobile Scroll Cue */}
          <div className="pt-4 border-t-2 border-[#111111] flex items-center justify-between font-mono text-xs font-bold text-[#5B5751]">
            <span>01 / WORK</span>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
};
