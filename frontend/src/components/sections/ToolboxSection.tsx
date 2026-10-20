'use client';

import React, { useState } from 'react';
import { Technology, TechCategory } from '@/types';
import { Card } from '@/components/ui/Card';

interface ToolboxSectionProps {
  technologies: Technology[];
}

const CATEGORIES: Array<TechCategory | 'All'> = [
  'All',
  'Languages',
  'Frontend',
  'Backend',
  'Data',
  'AI',
  'Tools',
];

export const ToolboxSection: React.FC<ToolboxSectionProps> = ({ technologies }) => {
  const [selectedCategory, setSelectedCategory] = useState<TechCategory | 'All'>('All');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filteredTechs =
    selectedCategory === 'All'
      ? technologies
      : technologies.filter((t) => t.category === selectedCategory);

  const totalPages = Math.max(1, Math.ceil(filteredTechs.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedTechs = filteredTechs.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const selectCategory = (cat: TechCategory | 'All') => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <section
      id="toolbox"
      aria-label="Technology and Tools"
      className="w-full bg-[#FFF9E9] border-b-4 border-[#111111] py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b-3 border-[#111111] mb-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751]">
              // 05. TOOLBOX & PLAYGROUND
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#111111] uppercase tracking-tight">
              ENGINEERING SHELF
            </h2>
          </div>
          <p className="font-mono text-xs md:text-sm text-[#5B5751] max-w-sm">
            Pragmatic technologies chosen for production reliability and team velocity — no fake skill percentages.
          </p>
        </div>

        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="Filter technologies by category"
          className="flex items-center gap-2 overflow-x-auto pl-1 pt-2 pb-4 mb-8 select-none"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isSelected}
                onClick={() => selectCategory(cat)}
                className={`px-4 py-2 font-display text-xs md:text-sm font-bold uppercase tracking-wider rounded-md border-2 border-[#111111] neo-btn-press whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFDB58] text-[#111111] neo-shadow-sm'
                    : 'bg-[#FFFFFF] text-[#5B5751] hover:text-[#111111]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Technology Cards Grid (5-6 cols on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pagedTechs.map((tech) => (
            <Card
              key={tech.name}
              accent="surface"
              border="sm"
              shadow="sm"
              interactive={true}
              className="p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E9DFC9] mb-2 font-mono text-[11px] font-bold text-[#5B5751]">
                  <span>{tech.category}</span>
                  {tech.featured && (
                    <span className="w-2 h-2 rounded-full bg-[#176B3A]" title="Primary stack" />
                  )}
                </div>
                <h4 className="font-display font-bold text-base md:text-lg text-[#111111] mb-1">
                  {tech.name}
                </h4>
              </div>

              {tech.context && (
                <p className="text-xs text-[#5B5751] font-medium leading-relaxed mt-2 pt-2 border-t border-[#E9DFC9]">
                  {tech.context}
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <span className="font-mono text-xs text-[#5B5751]">
              Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filteredTechs.length)} of {filteredTechs.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-[#111111] rounded-md bg-white disabled:opacity-30 disabled:cursor-not-allowed neo-btn-press cursor-pointer"
                aria-label="Previous page"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={p === safePage ? 'page' : undefined}
                  className={`px-3 py-1.5 font-mono text-xs font-bold border-2 border-[#111111] rounded-md cursor-pointer ${
                    p === safePage ? 'bg-[#111111] text-[#FFF9E9]' : 'bg-white hover:bg-[#FFDB58]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-[#111111] rounded-md bg-white disabled:opacity-30 disabled:cursor-not-allowed neo-btn-press cursor-pointer"
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
