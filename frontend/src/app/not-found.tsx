import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full bg-[#FFF9E9] min-h-[60vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full p-8 rounded-xl neo-border-poster neo-shadow-xl bg-[#FFFFFF] text-center">
        <span className="px-3 py-1 bg-[#FF7661] text-[#111111] rounded-xs font-mono text-xs font-bold uppercase tracking-wider inline-block mb-4">
          404 // NOT FOUND
        </span>

        <h1 className="font-display font-black text-6xl text-[#111111] uppercase tracking-tight mb-2">
          PAGE MISSING
        </h1>

        <p className="text-sm md:text-base text-[#5B5751] font-medium leading-relaxed mb-8">
          The requested coordinate or project slug does not exist or has been archived.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 w-full font-display text-sm font-bold uppercase tracking-wider bg-[#FFDB58] text-[#111111] rounded-md neo-border neo-shadow-md neo-btn-press"
        >
          <Home size={16} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
