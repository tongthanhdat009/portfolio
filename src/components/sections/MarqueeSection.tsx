import React from 'react';

interface MarqueeSectionProps {
  items: string[];
}

export const MarqueeSection: React.FC<MarqueeSectionProps> = ({ items }) => {
  const displayItems = [...items, ...items, ...items];

  return (
    <section
      aria-label="Skill and Capability Marquee"
      className="marquee-container w-full bg-[#FFDB58] border-b-3 border-[#111111] overflow-hidden py-3 md:py-4 select-none"
    >
      <div className="animate-neo-marquee flex items-center whitespace-nowrap">
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-center mx-4 md:mx-6">
            <span className="font-display font-black text-lg md:text-2xl text-[#111111] tracking-wider uppercase">
              {item}
            </span>
            <span className="ml-4 md:ml-6 text-base md:text-xl text-[#111111] select-none" aria-hidden="true">
              ✦
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
