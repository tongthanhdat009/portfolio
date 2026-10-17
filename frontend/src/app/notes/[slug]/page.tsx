import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Tag, ArrowUpRight } from 'lucide-react';
import { getNoteBySlug, getNotes } from '@/lib/cms';
import { Badge } from '@/components/ui/Badge';

interface NoteDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const notes = await getNotes();
  return notes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: NoteDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);

  if (!note) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${note.title} — Field Note`,
    description: note.excerpt,
  };
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  const allNotes = await getNotes();
  const currentIndex = allNotes.findIndex((n) => n.slug === slug);
  const nextNote =
    currentIndex >= 0 && currentIndex < allNotes.length - 1
      ? allNotes[currentIndex + 1]
      : allNotes[0];

  return (
    <article className="w-full bg-[#FFF9E9] py-12 md:py-20">
      <div className="max-w-[800px] mx-auto px-4 md:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#5B5751] hover:text-[#111111]"
          >
            <ArrowLeft size={16} />
            <span>Back to all notes</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="p-6 md:p-10 rounded-xl neo-border-poster neo-shadow-lg bg-[#FFFFFF] mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-[#111111] mb-6 font-mono text-xs font-bold text-[#5B5751]">
            <span className="px-2.5 py-1 bg-[#FFDB58] text-[#111111] border border-[#111111] rounded-xs uppercase">
              {note.category}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{note.publishedAt}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{note.readTime}</span>
              </span>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#111111] uppercase tracking-tight leading-[1.08] mb-6">
            {note.title}
          </h1>

          <p className="text-base sm:text-xl text-[#5B5751] font-medium leading-relaxed mb-6">
            {note.excerpt}
          </p>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E9DFC9]">
            {note.tags.map((tag) => (
              <Badge key={tag} accent="paper" size="sm">
                <Tag size={10} className="inline mr-1" />
                <span>{tag}</span>
              </Badge>
            ))}
          </div>
        </header>

        {/* Table of Contents */}
        {note.toc && note.toc.length > 0 && (
          <aside
            aria-label="Table of Contents"
            className="p-6 rounded-lg neo-border neo-shadow-sm bg-[#89CFF0] mb-12"
          >
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111] mb-3">
              TABLE OF CONTENTS
            </h2>
            <nav className="flex flex-col gap-2 font-display text-sm font-bold">
              {note.toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="hover:text-[#FF7661] transition-colors flex items-center gap-2"
                >
                  <span className="font-mono text-xs font-normal">→</span>
                  <span>{item.text}</span>
                </a>
              ))}
            </nav>
          </aside>
        )}

        {/* Article Body Content */}
        <div className="prose prose-lg max-w-none text-[#111111] font-normal leading-relaxed space-y-6 text-base md:text-lg">
          {note.content.map((paragraph, idx) => {
            const matchingHeading = note.toc && note.toc[idx];
            return (
              <div key={idx} className="space-y-3">
                {matchingHeading && (
                  <h2
                    id={matchingHeading.id}
                    className="font-display font-extrabold text-2xl md:text-3xl text-[#111111] pt-6 pb-2 border-b-2 border-[#111111] mt-8"
                  >
                    {matchingHeading.text}
                  </h2>
                )}
                <p className="leading-relaxed font-body text-[#111111]">
                  {paragraph}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <footer className="mt-16 pt-8 border-t-4 border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-4 font-display">
          <Link
            href="/notes"
            className="font-bold text-sm uppercase tracking-wider text-[#111111] hover:text-[#FF7661] inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>All Field Notes</span>
          </Link>

          {nextNote && (
            <Link
              href={`/notes/${nextNote.slug}`}
              className="p-3 bg-[#FFDB58] rounded-md neo-border neo-shadow-sm font-bold text-sm uppercase tracking-wider text-[#111111] inline-flex items-center gap-2 neo-btn-press"
            >
              <span>Next: {nextNote.title}</span>
              <ArrowUpRight size={16} />
            </Link>
          )}
        </footer>
      </div>
    </article>
  );
}
