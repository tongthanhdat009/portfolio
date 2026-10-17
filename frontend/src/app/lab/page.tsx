import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, FlaskConical, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/ui/Icons';
import { getExperiments } from '@/lib/cms';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Digital Lab & Experiments',
  description: 'Interactive prototypes, technical benchmarks, and exploratory tools tested in isolation.',
};

const statusStyles: Record<string, string> = {
  Prototype: 'bg-[#FFDB58] text-[#111111]',
  Exploring: 'bg-[#89CFF0] text-[#111111]',
  Shipped: 'bg-[#C6F56A] text-[#111111]',
  Archived: 'bg-[#E9DFC9] text-[#5B5751]',
};

export default async function LabPage() {
  const experiments = await getExperiments();

  return (
    <div className="w-full bg-[#FFF9E9] py-12 md:py-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#5B5751] hover:text-[#111111]"
          >
            <ArrowLeft size={14} />
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Title */}
        <div className="pb-8 border-b-4 border-[#111111] mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#C6F56A] bg-[#111111] px-2 py-0.5 rounded-xs inline-flex items-center gap-1.5">
            <FlaskConical size={12} />
            <span>// EXPERIMENTAL LAB</span>
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#111111] uppercase tracking-tight mt-2 mb-4">
            PROTOTYPES & BENCHMARKS
          </h1>
          <p className="text-base md:text-xl text-[#111111] max-w-2xl font-medium leading-relaxed">
            Exploratory experiments, interface sandboxes, and architectural benchmarks testing the edges of the modern stack.
          </p>
        </div>

        {/* Experiments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiments.map((exp) => (
            <Card
              key={exp.id}
              accent={exp.accent}
              border="md"
              shadow="md"
              interactive={true}
              className="p-6 md:p-8 flex flex-col justify-between group"
            >
              <div>
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] mb-4 font-mono text-xs font-bold">
                  <span
                    className={`px-2 py-0.5 rounded-xs border border-[#111111] uppercase ${
                      statusStyles[exp.status] || 'bg-white'
                    }`}
                  >
                    STATUS: {exp.status}
                  </span>
                  <Link
                    href={`/lab/${exp.slug}`}
                    className="hover:text-[#FF7661] transition-colors"
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>

                {/* Title */}
                <h2 className="font-display font-bold text-2xl text-[#111111] mb-3 leading-snug">
                  <Link
                    href={`/lab/${exp.slug}`}
                    className="hover:underline decoration-3 underline-offset-4"
                  >
                    {exp.title}
                  </Link>
                </h2>

                {/* Summary */}
                <p className="text-sm md:text-base text-[#111111] opacity-90 leading-relaxed font-medium mb-6">
                  {exp.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {exp.tags.map((tag) => (
                    <Badge key={tag} accent="surface" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t-2 border-[#111111] flex items-center justify-between font-display text-sm">
                <Link
                  href={`/lab/${exp.slug}`}
                  className="font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF7661] inline-flex items-center gap-1"
                >
                  <span>Experiment Details</span>
                  <ArrowUpRight size={16} />
                </Link>

                <div className="flex items-center gap-3">
                  {exp.demoUrl && (
                    <a
                      href={exp.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-bold text-[#111111] hover:opacity-70 flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {exp.repoUrl && (
                    <a
                      href={exp.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-bold text-[#111111] hover:opacity-70 flex items-center gap-1"
                    >
                      <GithubIcon size={12} />
                      <span>Code</span>
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
