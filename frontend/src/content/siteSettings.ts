import { SiteSettings } from '@/types';

export const siteSettings: SiteSettings = {
  siteTitle: "Dat Nguyen — Developer & Builder",
  ownerName: "Dat Nguyen",
  tagline: "I build things that work.",
  description: "Independent developer and digital builder creating resilient web products, intelligent workflows, and reliable systems.",
  logoText: "DAT.BUILD",
  contactEmail: "contact@datnguyen.dev",
  resumeUrl: "/resume.pdf",
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
