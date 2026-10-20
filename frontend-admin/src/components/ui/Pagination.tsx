'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  /** Query param holding the page number (for pages with multiple lists). */
  param?: string;
}

export function Pagination({ page, totalPages, total, perPage, param = 'page' }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(param, String(p));
    return `${pathname}?${sp.toString()}`;
  };

  const numbers: Array<number | 'ellipsis'> = [];
  for (const p of [1, page - 1, page, page + 1, totalPages]) {
    if (p < 1 || p > totalPages || numbers.includes(p)) continue;
    if (numbers.length > 0 && p - (numbers[numbers.length - 1] as number) > 1) {
      numbers.push('ellipsis');
    }
    numbers.push(p);
  }

  const btn =
    'px-2.5 py-1.5 rounded-[var(--radius-sm)] font-mono text-xs font-bold border-2 transition-all';
  const idle = 'border-[var(--color-ink)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-sun)]';
  const active = 'border-[var(--color-ink)] bg-[var(--color-ink)] text-white';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <span className="font-mono text-xs text-stone-500">
        Showing {total === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <Link href={href(page - 1)} className={`${btn} ${idle}`} aria-label="Previous page">
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className={`${btn} border-stone-200 text-stone-300 cursor-not-allowed`} aria-hidden>
            <ChevronLeft className="w-3.5 h-3.5" />
          </span>
        )}
        {numbers.map((n, i) =>
          n === 'ellipsis' ? (
            <span key={`e${i}`} className="font-mono text-xs text-stone-400 px-1">
              …
            </span>
          ) : (
            <Link key={n} href={href(n)} className={`${btn} ${n === page ? active : idle}`}>
              {n}
            </Link>
          )
        )}
        {page < totalPages ? (
          <Link href={href(page + 1)} className={`${btn} ${idle}`} aria-label="Next page">
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className={`${btn} border-stone-200 text-stone-300 cursor-not-allowed`} aria-hidden>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
