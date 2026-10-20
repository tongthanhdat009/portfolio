'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Check, Copy, ArrowUpRight, FileText } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons';
import { SiteSettings } from '@/types';
import { Button } from '@/components/ui/Button';

interface ContactSectionProps {
  settings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(settings.contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      id="contact"
      aria-label="Contact and Collaboration"
      className="w-full bg-[#FFDB58] border-b-4 border-[#111111] py-20 md:py-32 relative overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl flex flex-col gap-6">
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#111111] text-[#FFDB58] rounded-sm font-mono text-xs font-bold uppercase tracking-wider">
              // 09. FINAL POSTER
            </span>
            <span className="font-mono text-xs font-bold text-[#111111] uppercase tracking-wider">
              GOT SOMETHING IN MIND?
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-display font-black text-[clamp(1.75rem,8vw,4.75rem)] whitespace-nowrap text-[#111111] uppercase tracking-tighter leading-[0.92]">
            LET&apos;S MAKE IT REAL.
          </h2>

          {/* Description */}
          <p className="text-lg md:text-2xl text-[#111111] font-medium max-w-2xl leading-relaxed">
            Questions, architecture discussions, collaborations, or an ambitious product build — reach out directly.
          </p>

          {/* Primary Actions Rail */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button
              href={`mailto:${settings.contactEmail}`}
              variant="secondary"
              size="lg"
              className="bg-[#FFFFFF] text-[#111111]"
            >
              <Mail size={18} />
              <span>Send an Email ↗</span>
            </Button>

            <button
              type="button"
              onClick={handleCopyEmail}
              aria-label="Copy email address to clipboard"
              className="px-6 py-3.5 font-display text-sm md:text-base font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-md bg-[#FFF9E9] text-[#111111] neo-btn-press inline-flex items-center gap-2 cursor-pointer select-none"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-[#176B3A]" />
                  <span>Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy Address</span>
                </>
              )}
            </button>

            <Link
              href="/contact"
              className="px-6 py-3.5 font-display text-sm md:text-base font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-md bg-[#89CFF0] text-[#111111] neo-btn-press inline-flex items-center gap-1.5"
            >
              <span>Contact Form</span>
              <ArrowUpRight size={18} />
            </Link>
          </div>

          {/* Secondary Links */}
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t-2 border-[#111111] font-mono text-xs md:text-sm font-bold text-[#111111]">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline decoration-2"
            >
              <GithubIcon size={16} />
              <span>GITHUB</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline decoration-2"
            >
              <LinkedinIcon size={16} />
              <span>LINKEDIN</span>
            </a>
            {settings.resumeUrl && (
              <a
                href={settings.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:underline decoration-2"
              >
                <FileText size={16} />
                <span>RESUME (PDF)</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Geometric Star SVG in Background */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute right-8 -bottom-12 select-none opacity-20 pointer-events-none"
      >
        <svg width="340" height="340" viewBox="0 0 100 100" fill="#111111">
          <polygon points="50,0 62,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 38,35" />
        </svg>
      </div>
    </section>
  );
};
