import React from 'react';
import { Briefcase, GraduationCap, Microscope, Users, Award } from 'lucide-react';
import { ExperienceItem } from '@/types';
import { Card } from '@/components/ui/Card';

interface JourneySectionProps {
  items: ExperienceItem[];
}

const typeIconMap: Record<string, React.ReactNode> = {
  Work: <Briefcase size={16} />,
  Education: <GraduationCap size={16} />,
  Research: <Microscope size={16} />,
  Community: <Users size={16} />,
  Milestone: <Award size={16} />,
};

export const JourneySection: React.FC<JourneySectionProps> = ({ items }) => {
  return (
    <section
      id="journey"
      aria-label="Experience and Journey"
      className="w-full bg-[#FFF9E9] border-b-4 border-[#111111] py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b-3 border-[#111111] mb-12">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751]">
              // 06. TIMELINE
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#111111] uppercase tracking-tight">
              THE JOURNEY SO FAR
            </h2>
          </div>
          <p className="font-mono text-xs md:text-sm text-[#5B5751] max-w-sm">
            Proven track record of shipping systems, rigorous research, and active open-source contribution.
          </p>
        </div>

        {/* Timeline List */}
        <div className="relative pl-6 md:pl-0 border-l-3 md:border-l-0 border-[#111111]">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="relative mb-10 last:mb-0 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start"
            >
              {/* Year Column (Cols 1-3 on desktop) */}
              <div className="md:col-span-3 flex md:flex-col items-baseline md:items-end justify-between md:justify-start gap-2">
                <span className="font-mono text-base md:text-lg font-black text-[#111111]">
                  {item.year}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-[#111111] text-[#FFF9E9] font-mono text-xs font-bold uppercase">
                  {typeIconMap[item.type] || <Briefcase size={12} />}
                  <span>{item.type}</span>
                </span>
              </div>

              {/* Center Dot for Desktop */}
              <div
                aria-hidden="true"
                className="hidden md:flex absolute left-[25%] -ml-2.5 top-2 w-5 h-5 rounded-full bg-[#FFDB58] border-3 border-[#111111] z-10 items-center justify-center"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
              </div>

              {/* Milestone Card (Cols 4-12 on desktop) */}
              <div className="md:col-span-9">
                <Card
                  accent={item.accent || (idx % 2 === 0 ? 'surface' : 'paper')}
                  border="md"
                  shadow="md"
                  className="p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b-2 border-[#111111] mb-4">
                    <h3 className="font-display font-bold text-xl md:text-2xl text-[#111111]">
                      {item.organization}
                    </h3>
                    <span className="font-mono text-xs font-bold text-[#5B5751]">
                      {item.roleAtTime}
                    </span>
                  </div>

                  <p className="text-sm md:text-base text-[#111111] leading-relaxed font-medium mb-4">
                    {item.description}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-[#E9DFC9]">
                    {item.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="text-xs md:text-sm text-[#111111] flex items-start gap-2">
                        <span className="font-bold text-[#FF7661]">→</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
