import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ManifestoData } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface AboutSectionProps {
  data: ManifestoData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ data }) => {
  return (
    <section
      id="about"
      aria-label="About and Manifesto"
      className="w-full bg-[#FFF9E9] border-b-4 border-[#111111] py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751]">
              // 02. MANIFESTO
            </span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-[#111111] uppercase tracking-tight leading-none">
              {data.sectionLabel}
            </h2>
            <div className="w-16 h-2 bg-[#FF7661] border border-[#111111] mt-1" />
          </div>

          {/* Right Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h3 className="font-display font-bold text-2xl md:text-3xl text-[#111111] leading-tight">
              {data.headline}
            </h3>

            <p className="text-base md:text-xl text-[#111111] leading-relaxed font-normal">
              {data.body}
            </p>

            {/* Core Value Chips */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {data.chips.map((chip, idx) => (
                <Badge
                  key={chip}
                  accent={idx % 2 === 0 ? 'sun' : 'sky'}
                  size="md"
                >
                  <span className="font-bold">✦ {chip}</span>
                </Badge>
              ))}
            </div>

            {/* Read Story Link */}
            <div className="pt-4">
              <Link
                href={data.ctaHref}
                className="inline-flex items-center gap-2 font-display text-sm md:text-base font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF7661] underline underline-offset-8 decoration-3 transition-colors"
              >
                <span>{data.ctaText}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
