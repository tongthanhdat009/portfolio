import React from 'react';
import Link from 'next/link';
import { Announcement } from '@/types';

interface AnnouncementStripProps {
  data: Announcement;
}

export const AnnouncementStrip: React.FC<AnnouncementStripProps> = ({ data }) => {
  if (!data.enabled) return null;

  return (
    <aside
      aria-label="Announcement"
      className="w-full bg-[#FFDB58] border-b-3 border-[#111111] px-4 py-1.5 md:py-2 text-[#111111] text-xs md:text-sm font-mono flex flex-wrap items-center justify-between gap-2 z-40 relative"
    >
      <div className="flex items-center gap-2 max-w-4xl truncate">
        <span className="font-bold px-1.5 py-0.5 bg-[#111111] text-[#FFDB58] rounded-xs text-[11px] tracking-wider uppercase shrink-0">
          {data.label}
        </span>
        <span className="truncate font-medium">{data.message}</span>
      </div>

      {data.linkUrl && (
        <Link
          href={data.linkUrl}
          className="font-bold underline decoration-2 underline-offset-4 hover:text-[#111111] hover:opacity-80 shrink-0"
        >
          {data.linkLabel}
        </Link>
      )}
    </aside>
  );
};
