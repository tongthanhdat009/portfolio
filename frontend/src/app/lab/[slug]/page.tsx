import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ExternalLink, Target, Cpu, AlertTriangle, Lightbulb } from 'lucide-react';
import { GithubIcon } from '@/components/ui/Icons';
import { getExperimentBySlug, getExperiments } from '@/lib/cms';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ExperimentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const experiments = await getExperiments();
  return experiments.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: ExperimentDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const exp = await getExperimentBySlug(slug);

  if (!exp) {
    return {
      title: 'Experiment Not Found',
    };
  }

  return {
    title: `${exp.title} — Lab Experiment`,
    description: exp.summary,
  };
}

export default async function ExperimentDetailPage({ params }: ExperimentDetailPageProps) {
  const { slug } = await params;
  const exp = await getExperimentBySlug(slug);

  if (!exp) {
    notFound();
  }

  const allExperiments = await getExperiments();
  const currentIndex = allExperiments.findIndex((e) => e.slug === slug);
  const nextExp =
    currentIndex >= 0 && currentIndex < allExperiments.length - 1
      ? allExperiments[currentIndex + 1]
      : allExperiments[0];

  return (
    <article className="w-full bg-[#FFF9E9] py-12 md:py-20">
      <div className="max-w-[900px] mx-auto px-4 md:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/lab"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#5B5751] hover:text-[#111111]"
          >
            <ArrowLeft size={16} />
            <span>Back to Lab</span>
          </Link>
        </div>

        {/* Experiment Header */}
        <header className="p-6 md:p-10 rounded-xl neo-border-poster neo-shadow-lg bg-[#FFFFFF] mb-12">
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#111111] mb-6 font-mono text-xs font-bold">
            <span className="px-3 py-1 bg-[#111111] text-[#C6F56A] rounded-xs uppercase">
              EXPERIMENT LOG
            </span>
            <span className="px-2.5 py-1 bg-[#FFDB58] border border-[#111111] rounded-xs uppercase">
              STATUS: {exp.status}
            </span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#111111] uppercase tracking-tight mb-4">
            {exp.title}
          </h1>

          <p className="text-base sm:text-lg text-[#111111] font-medium leading-relaxed mb-6">
            {exp.summary}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {exp.tags.map((tag) => (
              <Badge key={tag} accent="lime" size="md">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t-2 border-[#111111]">
            {exp.demoUrl && (
              <Button href={exp.demoUrl} external variant="primary" size="md">
                <ExternalLink size={16} />
                <span>Interactive Prototype</span>
              </Button>
            )}
            {exp.repoUrl && (
              <Button href={exp.repoUrl} external variant="secondary" size="md">
                <GithubIcon size={16} />
                <span>View Experiment Source</span>
              </Button>
            )}
          </div>
        </header>

        {/* Section 1: Objective */}
        {exp.objective && (
          <section className="p-6 md:p-8 rounded-lg neo-border neo-shadow-md bg-[#FFF9E9] mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Target size={22} className="text-[#111111]" />
              <h2 className="font-display font-bold text-2xl text-[#111111] uppercase">
                The Objective
              </h2>
            </div>
            <p className="text-base text-[#111111] leading-relaxed font-medium">
              {exp.objective}
            </p>
          </section>
        )}

        {/* Section 2: How It Works */}
        {exp.howItWorks && (
          <section className="p-6 md:p-8 rounded-lg neo-border neo-shadow-md bg-[#FFFFFF] mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={22} className="text-[#111111]" />
              <h2 className="font-display font-bold text-2xl text-[#111111] uppercase">
                How It Works Under the Hood
              </h2>
            </div>
            <p className="text-base text-[#111111] leading-relaxed font-medium">
              {exp.howItWorks}
            </p>
          </section>
        )}

        {/* Section 3: Limitations & Section 4: Takeaways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {exp.limitations && (
            <div className="p-6 rounded-lg neo-border neo-shadow-md bg-[#FF7661] text-[#111111]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} />
                <h3 className="font-display font-bold text-xl uppercase">Known Limitations</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                {exp.limitations}
              </p>
            </div>
          )}

          {exp.takeaways && (
            <div className="p-6 rounded-lg neo-border neo-shadow-md bg-[#C6F56A] text-[#111111]">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={20} />
                <h3 className="font-display font-bold text-xl uppercase">Key Takeaways</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                {exp.takeaways}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <footer className="pt-8 border-t-4 border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-4 font-display">
          <Link
            href="/lab"
            className="font-bold text-sm uppercase tracking-wider text-[#111111] hover:text-[#FF7661] inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>All Experiments</span>
          </Link>

          {nextExp && (
            <Link
              href={`/lab/${nextExp.slug}`}
              className="p-3 bg-[#FFDB58] rounded-md neo-border neo-shadow-sm font-bold text-sm uppercase tracking-wider text-[#111111] inline-flex items-center gap-2 neo-btn-press"
            >
              <span>Next Experiment: {nextExp.title}</span>
              <ArrowUpRight size={16} />
            </Link>
          )}
        </footer>
      </div>
    </article>
  );
}
