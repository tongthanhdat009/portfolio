import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, FlaskConical, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/ui/Icons';
import { Experiment } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface LabSectionProps {
  experiments: Experiment[];
}

const statusBadgeStyles: Record<string, string> = {
  Prototype: 'bg-[#FFDB58] text-[#111111]',
  Exploring: 'bg-[#89CFF0] text-[#111111]',
  Shipped: 'bg-[#C6F56A] text-[#111111]',
  Archived: 'bg-[#E9DFC9] text-[#5B5751]',
};

export const LabSection: React.FC<LabSectionProps> = ({ experiments }) => {
  return (
    <section
      id="lab"
      aria-label="Experimental Lab"
      className="w-full bg-[#FFF9E9] border-b-4 border-[#111111] py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b-3 border-[#111111] mb-12">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751] flex items-center gap-1.5">
              <FlaskConical size={14} />
              <span>// 07. EXPERIMENTS</span>
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#111111] uppercase tracking-tight">
              THE DIGITAL LAB
            </h2>
          </div>
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 font-display text-sm md:text-base font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF7661] underline underline-offset-8 decoration-3 transition-colors"
          >
            <span>Explore all lab notes</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* Pinboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiments.map((exp) => (
            <Card
              key={exp.id}
              accent={exp.accent}
              border="md"
              shadow="md"
              interactive={true}
              className={`p-6 flex flex-col justify-between group ${
                exp.isWide ? 'lg:col-span-2' : 'lg:col-span-1'
              }`}
            >
              <div>
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] mb-4">
                  <span
                    className={`px-2 py-0.5 rounded-xs font-mono text-xs font-bold border border-[#111111] uppercase ${
                      statusBadgeStyles[exp.status] || 'bg-white'
                    }`}
                  >
                    {exp.status}
                  </span>
                  <Link
                    href={`/lab/${exp.slug}`}
                    className="text-[#111111] group-hover:text-[#FF7661] transition-colors"
                    aria-label={`View experiment: ${exp.title}`}
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-xl text-[#111111] mb-2 leading-snug">
                  {exp.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-[#111111] opacity-90 leading-relaxed font-medium mb-4">
                  {exp.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-6">
                  {exp.tags.map((tag) => (
                    <Badge key={tag} accent="surface" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="pt-3 border-t-2 border-[#111111] flex items-center justify-between font-mono text-xs">
                <Link
                  href={`/lab/${exp.slug}`}
                  className="font-bold underline decoration-1 hover:text-[#FF7661]"
                >
                  Tech breakdown →
                </Link>

                <div className="flex items-center gap-2">
                  {exp.demoUrl && (
                    <a
                      href={exp.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold hover:opacity-70 flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      <span>Live</span>
                    </a>
                  )}
                  {exp.repoUrl && (
                    <a
                      href={exp.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold hover:opacity-70 flex items-center gap-1"
                    >
                      <GithubIcon size={12} />
                      <span>Src</span>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
