import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ExternalLink, ArrowLeft } from 'lucide-react';
import { GithubIcon } from '@/components/ui/Icons';
import { getProjects } from '@/lib/cms';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Work & Projects',
  description: 'Detailed case studies and engineering projects spanning web systems, distributed backends, and AI workflows.',
};

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <div className="w-full bg-[#FFF9E9] py-12 md:py-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#5B5751] hover:text-[#111111]"
          >
            <ArrowLeft size={14} />
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Page Title & Intro */}
        <div className="pb-8 border-b-4 border-[#111111] mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF7661]">
            // ARCHIVE & CASE STUDIES
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#111111] uppercase tracking-tight mt-2 mb-4">
            ALL PROJECTS
          </h1>
          <p className="text-base md:text-xl text-[#111111] max-w-2xl font-medium leading-relaxed">
            In-depth case studies detailing problem definitions, architectural trade-offs, and verifiable production outcomes.
          </p>
        </div>

        {/* Projects List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <Card
              key={project.id}
              accent={project.accent}
              border="md"
              shadow="md"
              interactive={true}
              className="p-6 md:p-8 flex flex-col justify-between group"
            >
              <div>
                {/* Meta */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] mb-4 font-mono text-xs font-bold">
                  <span className="px-2 py-0.5 bg-[#111111] text-[#FFF9E9] rounded-xs">
                    {project.index} // {project.category}
                  </span>
                  <span className="px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] rounded-xs">
                    {project.status}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-display font-bold text-2xl md:text-3xl text-[#111111] mb-3 leading-snug">
                  <Link
                    href={`/work/${project.slug}`}
                    className="hover:text-[#111111] group-hover:underline decoration-3 underline-offset-4"
                  >
                    {project.title}
                  </Link>
                </h2>

                {/* Summary */}
                <p className="text-sm md:text-base text-[#111111] opacity-90 leading-relaxed font-medium mb-6">
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

              {/* Footer Links */}
              <div className="pt-4 border-t-2 border-[#111111] flex items-center justify-between font-display text-sm">
                <Link
                  href={`/work/${project.slug}`}
                  className="font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF7661] inline-flex items-center gap-1"
                >
                  <span>Read Full Study</span>
                  <ArrowUpRight size={16} />
                </Link>

                <div className="flex items-center gap-3">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-bold text-[#111111] hover:opacity-70 flex items-center gap-1"
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
                      className="font-mono text-xs font-bold text-[#111111] hover:opacity-70 flex items-center gap-1"
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
    </div>
  );
}
