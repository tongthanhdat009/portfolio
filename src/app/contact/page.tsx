'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Copy, Check, Send, FileText, Sparkles } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/Icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '', honeypot: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailAddress = 'contact@datnguyen.dev';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) {
      // Spam detected
      return;
    }
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="w-full bg-[#FFF9E9] py-12 md:py-20">
      <div className="max-w-[900px] mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#5B5751] hover:text-[#111111]"
          >
            <ArrowLeft size={14} />
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Title Poster */}
        <div className="pb-8 border-b-4 border-[#111111] mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF7661]">
            // INQUIRIES & COLLABORATION
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-[#111111] uppercase tracking-tight mt-2 mb-4">
            SAY HELLO.
          </h1>
          <p className="text-base md:text-xl text-[#111111] max-w-2xl font-medium leading-relaxed">
            Have a project in mind, an architectural challenge to discuss, or just want to connect? Send a note below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column (5 cols): Direct Info & Quick Copy */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card accent="sun" border="md" shadow="md" className="p-6">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111] block mb-2">
                DIRECT INBOX
              </span>
              <a
                href={`mailto:${emailAddress}`}
                className="font-display font-bold text-lg md:text-xl text-[#111111] hover:underline block break-all mb-4"
              >
                {emailAddress}
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full py-2.5 font-display text-xs font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-sm bg-[#FFFFFF] text-[#111111] neo-btn-press inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-[#176B3A]" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Email Address</span>
                  </>
                )}
              </button>
            </Card>

            <Card accent="surface" border="md" shadow="md" className="p-6">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#5B5751] block mb-3">
                CHANNELS & PROFILES
              </span>
              <div className="flex flex-col gap-3 font-display font-bold text-sm">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-md hover:bg-[#FFF9E9] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <GithubIcon size={16} />
                    <span>GitHub Profile</span>
                  </span>
                  <span>↗</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-md hover:bg-[#FFF9E9] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LinkedinIcon size={16} />
                    <span>LinkedIn Network</span>
                  </span>
                  <span>↗</span>
                </a>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-md hover:bg-[#FFF9E9] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Resume (PDF)</span>
                  </span>
                  <span>↗</span>
                </a>
              </div>
            </Card>
          </div>

          {/* Right Column (7 cols): Accessible Contact Form */}
          <div className="lg:col-span-7">
            <Card accent="surface" border="poster" shadow="lg" className="p-6 md:p-8">
              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#C6F56A] border-3 border-[#111111] flex items-center justify-center neo-shadow-sm">
                    <Sparkles size={28} className="text-[#111111]" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#111111] uppercase">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-[#5B5751] max-w-sm font-medium">
                    Thank you for reaching out. I typically reply within 24–48 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', message: '', honeypot: '' });
                    }}
                    className="mt-4 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider rounded-md neo-border bg-[#FFDB58] neo-btn-press"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <h2 className="font-display font-bold text-xl md:text-2xl text-[#111111] uppercase pb-2 border-b-2 border-[#111111]">
                    Send a Direct Message
                  </h2>

                  {/* Honeypot anti-spam */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="honeypot"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.honeypot}
                      onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    />
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="p-3 bg-[#FF7661] text-[#111111] border-2 border-[#111111] rounded-md font-mono text-xs font-bold"
                    >
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111111] mb-1.5"
                    >
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Alex Taylor"
                      className="w-full px-4 py-3 rounded-md border-2 border-[#111111] font-body text-sm text-[#111111] bg-[#FFF9E9] focus:outline-none focus:border-[#0A54E8] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111111] mb-1.5"
                    >
                      Your Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full px-4 py-3 rounded-md border-2 border-[#111111] font-body text-sm text-[#111111] bg-[#FFF9E9] focus:outline-none focus:border-[#0A54E8] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111111] mb-1.5"
                    >
                      Message or Project Brief *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about what you're building, the timeline, and where I can help..."
                      className="w-full px-4 py-3 rounded-md border-2 border-[#111111] font-body text-sm text-[#111111] bg-[#FFF9E9] focus:outline-none focus:border-[#0A54E8] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 font-display text-sm md:text-base font-bold uppercase tracking-wider rounded-md neo-border neo-shadow-md bg-[#FFDB58] text-[#111111] neo-btn-press inline-flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <Send size={16} />
                    <span>Send Message ↗</span>
                  </button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
