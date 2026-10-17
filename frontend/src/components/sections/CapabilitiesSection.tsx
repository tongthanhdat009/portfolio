import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Layout, Server, Bot, Cpu, Wrench, FlaskConical } from 'lucide-react';
import { CapabilityItem } from '@/types';
import { Card } from '@/components/ui/Card';

interface CapabilitiesSectionProps {
  items: CapabilityItem[];
}

const iconMap: Record<string, React.ReactNode> = {
  layout: <Layout size={24} className="stroke-[2.5]" />,
  server: <Server size={24} className="stroke-[2.5]" />,
  bot: <Bot size={24} className="stroke-[2.5]" />,
  cpu: <Cpu size={24} className="stroke-[2.5]" />,
  wrench: <Wrench size={24} className="stroke-[2.5]" />,
  flask: <FlaskConical size={24} className="stroke-[2.5]" />,
};

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({ items }) => {
  return (
    <section
      id="capabilities"
      aria-label="What I Build"
      className="w-full bg-[#FFF9E9] border-b-4 border-[#111111] py-16 md:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-10 border-b-3 border-[#111111] mb-12">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#5B5751]">
              // 03. CAPABILITIES
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-[#111111] uppercase tracking-tight">
              WHAT I BUILD & SHIP
            </h2>
          </div>
          <p className="font-mono text-xs md:text-sm text-[#5B5751] max-w-sm">
            Focusing on utility, resilience, and user outcome rather than rigid job title boxes.
          </p>
        </div>

        {/* 3 cols x 2 rows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              accent={item.accent}
              border="md"
              shadow="md"
              interactive={true}
              className="p-6 flex flex-col justify-between min-h-[260px] group"
            >
              <div>
                {/* Header: Number & Icon */}
                <div className="flex items-center justify-between pb-4 border-b-2 border-[#111111] mb-4">
                  <span className="font-mono text-2xl font-black text-[#111111]">
                    {item.code}
                  </span>
                  <div className="w-10 h-10 rounded-md bg-[#111111] text-[#FFF9E9] flex items-center justify-center border border-[#111111] group-hover:bg-[#FFDB58] group-hover:text-[#111111] transition-colors">
                    {iconMap[item.iconKey] || <Layout size={24} />}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-display font-bold text-xl md:text-2xl text-[#111111] mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-[#111111] opacity-90 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              {/* Bottom Action Link */}
              {item.relatedWorkLink && (
                <div className="pt-4 mt-4 border-t border-[#111111]/30">
                  <Link
                    href={item.relatedWorkLink}
                    className="inline-flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#FF7661] transition-colors"
                  >
                    <span>Explore related work</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
