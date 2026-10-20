import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clock } from 'lucide-react';
import { Note } from '@/types';
import { Card } from '@/components/ui/Card';

interface NotesSectionProps {
  notes: Note[];
  header?: { eyebrow: string; headline: string };
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  header = { eyebrow: '// 08. FIELD LOGS', headline: 'NOTES FROM THE BUILD' },
}) => {
  return (
    <section
      id="notes"
      aria-label="Technical Notes"
      className="w-full bg-[#FFF9E9] border-b-4 border-[#111111] py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b-3 border-[#111111] mb-12">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751] flex items-center gap-1.5">
              <BookOpen size={12} />
              <span>{header.eyebrow}</span>
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#111111] uppercase tracking-tight">
              {header.headline}
            </h2>
          </div>
          <Link
            href="/notes"
            className="inline-flex items-center gap-1.5 font-display text-sm md:text-base font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF7661] underline underline-offset-8 decoration-3 transition-colors"
          >
            <span>View all field notes</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.slice(0, 3).map((note) => (
            <Card
              key={note.id}
              accent="surface"
              border="md"
              shadow="md"
              interactive={true}
              className="p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Meta */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] mb-4 font-mono text-xs text-[#5B5751]">
                  <span className="px-2 py-0.5 bg-[#FFDB58] text-[#111111] font-bold rounded-xs border border-[#111111]">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{note.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-xl md:text-2xl text-[#111111] mb-3 leading-snug group-hover:text-[#FF7661] transition-colors">
                  <Link href={`/notes/${note.slug}`}>
                    {note.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-[#5B5751] leading-relaxed font-medium mb-6">
                  {note.excerpt}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t-2 border-[#111111] flex items-center justify-between font-mono text-xs">
                <span className="text-[#5B5751]">{note.publishedAt}</span>
                <Link
                  href={`/notes/${note.slug}`}
                  className="font-display font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#FF7661] inline-flex items-center gap-1"
                >
                  <span>Read article</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
