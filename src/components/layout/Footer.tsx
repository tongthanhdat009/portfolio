import React from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { SiteSettings } from '@/types';

interface FooterProps {
  settings: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="w-full bg-[#111111] text-[#FFF9E9] border-t-4 border-[#111111] pt-16 pb-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b-2 border-[#5B5751]">
          {/* Col 1: Wordmark & Statement */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link
              href="/"
              className="font-display font-extrabold text-3xl tracking-tight text-[#FFDB58] hover:text-[#FFFFFF] transition-colors inline-block"
            >
              {settings.logoText}
            </Link>
            <p className="text-[#E9DFC9] text-sm md:text-base max-w-sm font-medium leading-relaxed">
              {settings.description}
            </p>
            <div className="font-mono text-xs text-[#89CFF0] uppercase tracking-wider">
              ✦ Clean Neo-Brutal & Performance First
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="font-mono text-xs font-bold text-[#FFDB58] tracking-widest uppercase">
              // Navigation
            </h4>
            <div className="flex flex-col gap-2 font-display font-medium text-sm">
              <Link href="/work" className="hover:text-[#FFDB58] transition-colors">
                Work / Projects
              </Link>
              <Link href="/about" className="hover:text-[#FFDB58] transition-colors">
                About / Background
              </Link>
              <Link href="/lab" className="hover:text-[#FFDB58] transition-colors">
                Lab / Experiments
              </Link>
              <Link href="/notes" className="hover:text-[#FFDB58] transition-colors">
                Notes / Field Logs
              </Link>
              <Link href="/contact" className="hover:text-[#FFDB58] transition-colors">
                Contact & Inquiries
              </Link>
              <Link
                href="/admin"
                className="hover:text-[#C6F56A] transition-colors inline-flex items-center gap-1.5 opacity-60 hover:opacity-100 pt-1 font-mono text-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6F56A]" />
                <span>Admin Console</span>
              </Link>
            </div>
          </div>

          {/* Col 3: Social & Links */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <h4 className="font-mono text-xs font-bold text-[#FFDB58] tracking-widest uppercase">
              // Connect & Profiles
            </h4>
            <div className="flex flex-col gap-2 font-display font-medium text-sm">
              {settings.socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#89CFF0] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{social.label}</span>
                  <span className="text-xs">↗</span>
                </a>
              ))}
              <a
                href={`mailto:${settings.contactEmail}`}
                className="hover:text-[#C6F56A] transition-colors pt-2 font-mono text-xs"
              >
                {settings.contactEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#E9DFC9]">
          <div>
            © {new Date().getFullYear()} {settings.ownerName}. Built with Next.js & Tailwind CSS.
          </div>

          <a
            href="#main-content"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#5B5751] text-[#FFF9E9] hover:bg-[#FFDB58] hover:text-[#111111] transition-colors font-bold uppercase tracking-wider"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
};
