import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Terminal, Code, Cpu, ShieldCheck } from 'lucide-react';
import { getSiteSettings, getExperience } from '@/lib/cms';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About & Background',
  description: 'The story, engineering principles, and systems philosophy of Dat Nguyen.',
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const experience = await getExperience();

  return (
    <div className="w-full bg-[#FFF9E9] py-12 md:py-20">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
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

        {/* Header Poster */}
        <header className="p-6 md:p-12 rounded-xl neo-border-poster neo-shadow-lg bg-[#FFDB58] mb-12">
          <span className="px-3 py-1 bg-[#111111] text-[#FFDB58] rounded-xs font-mono text-xs font-bold uppercase tracking-wider">
            // EXTENDED STORY & PHILOSOPHY
          </span>

          <h1 className="font-display font-black text-[clamp(1.375rem,6vw,3.75rem)] whitespace-nowrap text-[#111111] uppercase tracking-tight mt-4 mb-4 leading-none">
            BUILD LOUD. THINK CLEAR.
          </h1>

          <p className="text-lg md:text-2xl text-[#111111] font-medium max-w-2xl leading-relaxed mb-6">
            I am a builder and systems developer. I care deeply about making software reliable, delightful, and immediately usable.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t-2 border-[#111111]">
            <Button href="/contact" variant="secondary" size="md">
              <span>Work Together</span>
              <ArrowUpRight size={16} />
            </Button>
            {settings.resumeUrl && (
              <Button href={settings.resumeUrl} external variant="ghost" size="md" className="font-mono text-xs underline">
                <span>View Full Resume (PDF) ↗</span>
              </Button>
            )}
          </div>
        </header>

        {/* Narrative Section */}
        <section className="p-6 md:p-10 rounded-xl neo-border neo-shadow-md bg-[#FFFFFF] mb-12 space-y-6">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[#111111] uppercase pb-3 border-b-2 border-[#111111]">
            The Builder Mindset
          </h2>
          <p className="text-base md:text-lg text-[#111111] leading-relaxed font-normal">
            I started building software because I love taking vague, messy problems and turning them into systems that work reliably every time. Over the years, I have gravitated away from rigid corporate silos and toward end-to-end technical craftsmanship: knowing how to design an accessible button state, how to trace distributed database queries, and how to structure a deterministic agent pipeline.
          </p>
          <p className="text-base md:text-lg text-[#111111] leading-relaxed font-normal">
            I believe that software should be honest. Interfaces should have tactile feedback and high contrast. Codebases should be well-typed and easy to navigate. And above all, engineering solutions should serve people rather than resume-driven complexity.
          </p>
        </section>

        {/* Core Principles */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751]">
              // HOW I WORK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card accent="sky" border="md" shadow="md" className="p-6">
              <div className="w-10 h-10 rounded-md bg-[#111111] text-white flex items-center justify-center mb-4">
                <Code size={20} />
              </div>
              <h3 className="font-display font-bold text-xl text-[#111111] mb-2 uppercase">
                Systems Over Hacks
              </h3>
              <p className="text-sm text-[#111111] leading-relaxed font-medium">
                Designing explicit state machines, type contracts, and reproducible pipelines that don&apos;t depend on heroic firefighting.
              </p>
            </Card>

            <Card accent="sun" border="md" shadow="md" className="p-6">
              <div className="w-10 h-10 rounded-md bg-[#111111] text-white flex items-center justify-center mb-4">
                <Cpu size={20} />
              </div>
              <h3 className="font-display font-bold text-xl text-[#111111] mb-2 uppercase">
                Utility-First UX
              </h3>
              <p className="text-sm text-[#111111] leading-relaxed font-medium">
                Focus on fast load times, accessible WCAG 2.2 contrast, snappy keyboard navigation, and zero fake loading spinners.
              </p>
            </Card>

            <Card accent="lime" border="md" shadow="md" className="p-6">
              <div className="w-10 h-10 rounded-md bg-[#111111] text-white flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-display font-bold text-xl text-[#111111] mb-2 uppercase">
                Continuous Craft
              </h3>
              <p className="text-sm text-[#111111] leading-relaxed font-medium">
                Constant curiosity into emerging tools, performance metrics, and open-source contributions with verified production outcomes.
              </p>
            </Card>
          </div>
        </section>

        {/* Experience Summary */}
        <section className="p-6 md:p-10 rounded-xl neo-border neo-shadow-md bg-[#FFFFFF] mb-12">
          <h2 className="font-display font-bold text-2xl text-[#111111] uppercase pb-3 border-b-2 border-[#111111] mb-6">
            Career Milestones & Roles
          </h2>
          <div className="space-y-6">
            {experience.map((exp) => (
              <div key={exp.id} className="pb-6 border-b border-[#E9DFC9] last:border-b-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 font-mono text-xs">
                  <span className="font-bold text-[#FF7661] text-sm">{exp.organization}</span>
                  <span className="text-[#5B5751]">{exp.year}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#111111] mb-1">
                  {exp.roleAtTime}
                </h3>
                <p className="text-sm text-[#5B5751] font-medium leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA Rail */}
        <div className="p-8 rounded-xl bg-[#89CFF0] neo-border neo-shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-extrabold text-2xl text-[#111111] uppercase">
              Want to build something together?
            </h3>
            <p className="text-sm text-[#111111] font-medium mt-1">
              I am open to collaborations, technical advisories, and ambitious product builds.
            </p>
          </div>
          <Button href="/contact" variant="primary" size="lg" className="shrink-0">
            <span>Get In Touch ↗</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
