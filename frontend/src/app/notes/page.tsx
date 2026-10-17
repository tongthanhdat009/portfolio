import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen, Clock } from 'lucide-react';
import { getNotes } from '@/lib/cms';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Field Notes & Writing',
  description: 'Technical notes, architectural lessons, and build logs on software design and applied AI systems.',
};

export default async function NotesPage() {
  const notes = await getNotes();

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
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF7661]">
            // TECHNICAL NOTES & WRITING
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#111111] uppercase tracking-tight mt-2 mb-4">
            NOTES FROM THE BUILD
          </h1>
          <p className="text-base md:text-xl text-[#111111] max-w-2xl font-medium leading-relaxed">
            Practical reflections on software engineering trade-offs, agent architectures, and resilient interface design.
          </p>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {notes.map((note) => (
            <Card
              key={note.id}
              accent="surface"
              border="md"
              shadow="md"
              interactive={true}
              className="p-6 md:p-8 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] mb-4 font-mono text-xs text-[#5B5751]">
                  <span className="px-2 py-0.5 bg-[#FFDB58] text-[#111111] font-bold rounded-xs border border-[#111111]">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1 font-bold">
                    <Clock size={12} />
                    <span>{note.readTime}</span>
                  </div>
                </div>

                <h2 className="font-display font-bold text-2xl text-[#111111] mb-3 leading-snug group-hover:text-[#FF7661] transition-colors">
                  <Link href={`/notes/${note.slug}`}>
                    {note.title}
                  </Link>
                </h2>

                <p className="text-sm md:text-base text-[#5B5751] leading-relaxed font-medium mb-6">
                  {note.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-[#111111] flex items-center justify-between font-mono text-xs">
                <span className="text-[#5B5751] font-bold">{note.publishedAt}</span>
                <Link
                  href={`/notes/${note.slug}`}
                  className="font-display font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#FF7661] inline-flex items-center gap-1"
                >
                  <span>Read Article</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
