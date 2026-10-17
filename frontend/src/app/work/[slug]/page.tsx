import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ExternalLink, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { GithubIcon } from '@/components/ui/Icons';
import { getProjectBySlug, getProjects } from '@/lib/cms';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} — Case Study`,
    description: project.summary,
    openGraph: {
      title: `${project.title} | Case Study`,
      description: project.summary,
      type: 'article',
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const allProjects = await getProjects();
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const nextProject =
    currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : allProjects[0];

  const { caseStudy } = project;

  return (
    <article className="w-full bg-[#FFF9E9] py-12 md:py-20">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#5B5751] hover:text-[#111111]"
          >
            <ArrowLeft size={16} />
            <span>Back to all projects</span>
          </Link>
        </div>

        {/* Case Study Header Poster */}
        <header className="p-6 md:p-10 rounded-xl neo-border-poster neo-shadow-lg bg-[#FFFFFF] mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-[#111111] mb-6">
            <span className="px-3 py-1 bg-[#111111] text-[#FFF9E9] rounded-xs font-mono text-xs font-bold uppercase">
              {project.category}
            </span>
            <div className="flex items-center gap-2 font-mono text-xs font-bold">
              <span className="text-[#5B5751]">YEAR: {project.year}</span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-[#C6F56A] border border-[#111111] rounded-xs">
                {project.status}
              </span>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-[#111111] uppercase tracking-tight leading-[1.05] mb-4">
            {project.title}
          </h1>

          <p className="text-base sm:text-xl text-[#111111] font-medium leading-relaxed mb-6">
            {project.summary}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((tag) => (
              <Badge key={tag} accent="sun" size="md">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t-2 border-[#111111]">
            {project.demoUrl && (
              <Button href={project.demoUrl} external variant="primary" size="md">
                <ExternalLink size={16} />
                <span>Live Interactive Demo</span>
              </Button>
            )}
            {project.repoUrl && (
              <Button href={project.repoUrl} external variant="secondary" size="md">
                <GithubIcon size={16} />
                <span>Source Repository</span>
              </Button>
            )}
          </div>
        </header>

        {/* 1. Overview Metadata Table */}
        <section aria-label="Project Overview" className="mb-12">
          <div className="p-6 rounded-lg neo-border neo-shadow-md bg-[#FFF9E9]">
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751] mb-4">
              // 01. SPECIFICATION & CONTEXT
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
              <div>
                <span className="text-[#5B5751] block mb-1">TARGET USERS</span>
                <p className="font-bold text-[#111111] text-sm">{caseStudy.overview.targetUsers}</p>
              </div>
              <div>
                <span className="text-[#5B5751] block mb-1">TIMELINE</span>
                <p className="font-bold text-[#111111] text-sm">{caseStudy.overview.timeline}</p>
              </div>
              <div>
                <span className="text-[#5B5751] block mb-1">ROLE IN PROJECT</span>
                <p className="font-bold text-[#111111] text-sm">{caseStudy.overview.role}</p>
              </div>
              <div>
                <span className="text-[#5B5751] block mb-1">OPERATIONAL STATUS</span>
                <p className="font-bold text-[#111111] text-sm">{caseStudy.overview.status}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Problem / Context */}
        <section aria-label="Problem Statement" className="mb-12">
          <div className="p-6 md:p-8 rounded-lg neo-border neo-shadow-md bg-[#FFFFFF]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 bg-[#FF7661] border border-[#111111]" />
              <h2 className="font-display font-bold text-2xl text-[#111111] uppercase tracking-wide">
                The Problem & Context
              </h2>
            </div>
            <p className="text-base md:text-lg text-[#111111] leading-relaxed font-normal">
              {caseStudy.problem}
            </p>
          </div>
        </section>

        {/* 3. Contribution */}
        <section aria-label="Contributions" className="mb-12">
          <div className="p-6 md:p-8 rounded-lg neo-border neo-shadow-md bg-[#89CFF0]">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-[#111111]" />
              <h2 className="font-display font-bold text-2xl text-[#111111] uppercase tracking-wide">
                Key Contributions
              </h2>
            </div>
            <ul className="space-y-3">
              {caseStudy.contribution.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-base text-[#111111] font-medium">
                  <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-[#111111]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. Approach & Architecture */}
        <section aria-label="Approach and Architecture" className="mb-12">
          <div className="p-6 md:p-8 rounded-lg neo-border neo-shadow-md bg-[#FFFFFF]">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={22} className="text-[#111111]" />
              <h2 className="font-display font-bold text-2xl text-[#111111] uppercase tracking-wide">
                Approach & Architecture
              </h2>
            </div>
            <p className="text-base text-[#111111] leading-relaxed mb-6 font-medium">
              {caseStudy.approach.summary}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-[#111111]">
              {caseStudy.approach.architecturePoints.map((point, idx) => (
                <div key={idx} className="p-4 rounded-md bg-[#FFF9E9] border-2 border-[#111111]">
                  <span className="font-mono text-xs font-bold text-[#FF7661] block mb-1">
                    0{idx + 1} // DECISION
                  </span>
                  <p className="text-xs md:text-sm text-[#111111] font-medium">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Implementation Highlights & 6. Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Highlights */}
          <div className="p-6 rounded-lg neo-border neo-shadow-md bg-[#FFDB58]">
            <h2 className="font-display font-bold text-xl text-[#111111] uppercase tracking-wide mb-4">
              Implementation Highlights
            </h2>
            <ul className="space-y-2.5">
              {caseStudy.highlights.map((h, i) => (
                <li key={i} className="text-sm text-[#111111] font-medium flex items-start gap-2">
                  <span className="font-bold">→</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Outcomes */}
          <div className="p-6 rounded-lg neo-border neo-shadow-md bg-[#C6F56A]">
            <h2 className="font-display font-bold text-xl text-[#111111] uppercase tracking-wide mb-4">
              Verified Outcomes
            </h2>
            <ul className="space-y-2.5">
              {caseStudy.outcomes.map((o, i) => (
                <li key={i} className="text-sm text-[#111111] font-medium flex items-start gap-2">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#176B3A]" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 7. Challenges & Lessons */}
        <section aria-label="Lessons Learned" className="mb-16">
          <div className="p-6 md:p-8 rounded-lg neo-border neo-shadow-md bg-[#FFFFFF]">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-[#FF7661]" />
              <h2 className="font-display font-bold text-xl md:text-2xl text-[#111111] uppercase tracking-wide">
                Challenges & Key Takeaways
              </h2>
            </div>
            <ul className="space-y-3">
              {caseStudy.lessons.map((lesson, idx) => (
                <li key={idx} className="p-3 bg-[#FFF9E9] border border-[#111111] rounded-sm text-sm text-[#111111] font-medium leading-relaxed">
                  <span className="font-bold font-mono text-xs text-[#FF7661] mr-2">LESSON #{idx + 1}:</span>
                  {lesson}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Navigation Footer */}
        <footer className="pt-8 border-t-4 border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-4 font-display">
          <Link
            href="/work"
            className="font-bold text-sm uppercase tracking-wider text-[#111111] hover:text-[#FF7661] inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>All Projects</span>
          </Link>

          {nextProject && (
            <Link
              href={`/work/${nextProject.slug}`}
              className="p-3 bg-[#FFDB58] rounded-md neo-border neo-shadow-sm font-bold text-sm uppercase tracking-wider text-[#111111] inline-flex items-center gap-2 neo-btn-press"
            >
              <span>Next: {nextProject.title}</span>
              <ArrowUpRight size={16} />
            </Link>
          )}
        </footer>
      </div>
    </article>
  );
}
