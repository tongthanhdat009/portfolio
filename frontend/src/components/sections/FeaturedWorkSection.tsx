import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ExternalLink, Sparkles } from 'lucide-react';
import { GithubIcon } from '@/components/ui/Icons';
import { Project } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface FeaturedWorkSectionProps {
  projects: Project[];
}

export const FeaturedWorkSection: React.FC<FeaturedWorkSectionProps> = ({ projects }) => {
  const featuredHero = projects.find((p) => p.featured) || projects[0];
  const gridProjects = projects.filter((p) => p.id !== featuredHero.id).slice(0, 4);

  return (
    <section
      id="work"
      aria-label="Selected Work"
      className="w-full bg-[#FFF9E9] border-b-4 border-[#111111] py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b-3 border-[#111111] mb-12">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751]">
              // 04. CASE STUDIES
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#111111] uppercase tracking-tight">
              SELECTED WORK
            </h2>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 font-display text-sm md:text-base font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF7661] underline underline-offset-8 decoration-3 transition-colors"
          >
            <span>View all projects</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* 12-Column Hero Feature Project Card */}
        {featuredHero && (
          <Card
            accent={featuredHero.accent}
            border="poster"
            shadow="lg"
            className="p-6 md:p-8 mb-12 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column (7 cols): Visual Architecture / Mockup Box */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-[#111111] text-[#FFF9E9] p-6 rounded-md neo-border neo-shadow-sm font-mono text-xs overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-[#5B5751] mb-4">
                    <span className="text-[#FFDB58] font-bold">
                      // {featuredHero.category}
                    </span>
                    <span className="text-[#89CFF0]">{featuredHero.year}</span>
                  </div>
                  <div className="space-y-2 text-[#E9DFC9] leading-relaxed">
                    <p className="text-[#C6F56A] font-bold text-sm">
                      $ architecture --inspect &quot;{featuredHero.slug}&quot;
                    </p>
                    <p>
                      → Mode: <span className="text-white">Deterministic State Pipeline</span>
                    </p>
                    <p>
                      → Verification:{' '}
                      <span className="text-[#89CFF0]">Cryptographic Idempotency Tokens</span>
                    </p>
                    <p>
                      → Status:{' '}
                      <span className="bg-[#176B3A] text-white px-1.5 py-0.5 rounded-xs">
                        {featuredHero.status}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#5B5751] flex items-center justify-between text-[11px] text-[#5B5751]">
                    <span>OUTCOME: 2.4M+ EXECUTIONS ZERO DRIFT</span>
                    <Sparkles size={14} className="text-[#FFDB58]" />
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Content & CTAs */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="flex items-center justify-between font-mono text-xs font-bold text-[#111111]">
                  <span>FEATURED BUILD</span>
                  <span>{featuredHero.year}</span>
                </div>

                <h3 className="font-display font-extrabold text-2xl md:text-3xl text-[#111111] leading-tight">
                  {featuredHero.title}
                </h3>

                <p className="text-sm md:text-base text-[#111111] leading-relaxed font-medium">
                  {featuredHero.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {featuredHero.tags.map((tag) => (
                    <Badge key={tag} accent="surface" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t-2 border-[#111111]">
                  <Button href={`/work/${featuredHero.slug}`} variant="primary" size="md">
                    <span>Read Case Study</span>
                    <ArrowUpRight size={16} />
                  </Button>
                  {featuredHero.demoUrl && (
                    <Button href={featuredHero.demoUrl} external variant="secondary" size="md">
                      <ExternalLink size={14} />
                      <span>Live Demo</span>
                    </Button>
                  )}
                  {featuredHero.repoUrl && (
                    <Button href={featuredHero.repoUrl} external variant="secondary" size="md">
                      <GithubIcon size={14} />
                      <span>Code</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 2 Cols x 2 Rows Grid for Remaining Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {gridProjects.map((project) => (
            <Card
              key={project.id}
              accent={project.accent}
              border="md"
              shadow="md"
              interactive={true}
              className="p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Meta Bar */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] mb-4 font-mono text-xs font-bold text-[#111111]">
                  <span className="px-2 py-0.5 bg-[#111111] text-[#FFF9E9] rounded-xs">
                    {project.index} / {project.category}
                  </span>
                  <span>{project.year}</span>
                </div>

                {/* Project Title */}
                <h4 className="font-display font-bold text-xl md:text-2xl text-[#111111] mb-2 leading-snug group-hover:text-[#111111] transition-colors">
                  {project.title}
                </h4>

                {/* Summary */}
                <p className="text-sm text-[#111111] opacity-90 leading-relaxed font-medium mb-4">
                  {project.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map((tag) => (
                    <Badge key={tag} accent="surface" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t-2 border-[#111111] flex items-center justify-between">
                <Link
                  href={`/work/${project.slug}`}
                  className="font-display text-xs md:text-sm font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF7661] inline-flex items-center gap-1"
                >
                  <span>Case Study</span>
                  <ArrowUpRight size={14} />
                </Link>

                <div className="flex items-center gap-3">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-[#111111] hover:opacity-70 font-bold inline-flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      <span>Demo</span>
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-[#111111] hover:opacity-70 font-bold inline-flex items-center gap-1"
                    >
                      <GithubIcon size={12} />
                      <span>Repo</span>
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
