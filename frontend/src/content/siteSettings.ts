import { SiteSettings } from '@/types';

export const siteSettings: SiteSettings = {
  siteTitle: "Dat Nguyen — Developer & Builder",
  ownerName: "Dat Nguyen",
  tagline: "I build things that work.",
  description: "Independent developer and digital builder creating resilient web products, intelligent workflows, and reliable systems.",
  logoText: "DAT.BUILD",
  contactEmail: "contact@datnguyen.dev",
  resumeUrl: "/resume.pdf",
  contactEyebrow: "// INQUIRIES & COLLABORATION",
  contactHeading: "SAY HELLO.",
  contactIntro: "Have a project in mind, an architectural challenge to discuss, or just want to connect? Send a note below.",
  journeyEyebrow: "// 06. TIMELINE",
  journeyHeading: "THE JOURNEY SO FAR",
  journeyIntro: "Proven track record of shipping systems, rigorous research, and active open-source contribution.",
  journeyChapters: [
    { type: "Work", title: "WORK EXPERIENCE", subtitle: "Building things that matter.", accent: "lime" },
    { type: "Education", title: "EDUCATION", subtitle: "Where curiosity meets knowledge.", accent: "sky" },
    { type: "Research", title: "RESEARCH & INNOVATION", subtitle: "Probing what's next.", accent: "coral" },
    { type: "Community", title: "COMMUNITY", subtitle: "Giving back to the craft.", accent: "sun" },
    { type: "Milestone", title: "MILESTONES", subtitle: "Moments that mattered.", accent: "pink" },
  ],
  socialLinks: [
    {
      platform: "github",
      label: "GitHub",
      url: "https://github.com",
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com",
    },
    {
      platform: "twitter",
      label: "X / Twitter",
      url: "https://x.com",
    },
  ],
  seoDefaults: {
    ogImage: "/og-image.png",
    keywords: [
      "developer",
      "digital builder",
      "software engineer",
      "fullstack",
      "systems",
      "ai workflows",
      "neo-brutalism",
      "portfolio",
    ],
  },
};
