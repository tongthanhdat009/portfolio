export type ColorAccent = 'sun' | 'sky' | 'coral' | 'lime' | 'pink' | 'paper' | 'surface';

export interface SiteSettings {
  siteTitle: string;
  ownerName: string;
  tagline: string;
  description: string;
  logoText: string;
  contactEmail: string;
  resumeUrl: string;
  contactEyebrow?: string;
  contactHeading?: string;
  contactIntro?: string;
  journeyEyebrow?: string;
  journeyHeading?: string;
  journeyIntro?: string;
  journeyChapters?: Array<{
    type: string;
    title: string;
    subtitle: string;
    accent: string;
  }>;
  socialLinks: Array<{
    platform: string;
    label: string;
    url: string;
  }>;
  seoDefaults: {
    ogImage: string;
    keywords: string[];
  };
}

export interface Announcement {
  enabled: boolean;
  label: string;
  message: string;
  linkLabel: string;
  linkUrl: string;
  statusType: 'active' | 'notice' | 'open';
}

export interface HeroData {
  eyebrow: string;
  headlineLines: [string, string, string];
  intro: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  statusLabel: string;
  bottomKeywords: string[];
  heroAccent: ColorAccent;
  featuredProjectId: string;
  featuredProjectEnabled: boolean;
}

export interface ManifestoData {
  sectionLabel: string;
  headline: string;
  body: string;
  chips: string[];
  ctaText: string;
  ctaHref: string;
}

export interface CapabilityItem {
  id: string;
  order: number;
  code: string;
  title: string;
  description: string;
  accent: ColorAccent;
  iconKey: string;
  relatedWorkLink?: string;
}

export interface ProjectCaseStudy {
  overview: {
    product: string;
    targetUsers: string;
    timeline: string;
    role: string;
    status: string;
  };
  problem: string;
  contribution: string[];
  approach: {
    summary: string;
    architecturePoints: string[];
  };
  highlights: string[];
  outcomes: string[];
  lessons: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  year: string;
  index: string;
  category: 'Web Products' | 'Backend & APIs' | 'Intelligent Workflows' | 'Developer Tools' | 'Systems & Architecture';
  summary: string;
  accent: ColorAccent;
  tags: string[];
  status: 'Shipped' | 'In Production' | 'Open Source' | 'Prototype';
  featured: boolean;
  order: number;
  demoUrl?: string;
  repoUrl?: string;
  coverImage?: string;
  caseStudy: ProjectCaseStudy;
}

export type TechCategory = 'Languages' | 'Frontend' | 'Backend' | 'Data' | 'AI' | 'Tools';

export interface Technology {
  name: string;
  category: TechCategory;
  context?: string;
  featured: boolean;
  order: number;
}

export interface ExperienceItem {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  type: 'Work' | 'Education' | 'Research' | 'Community' | 'Milestone';
  organization: string;
  roleAtTime: string;
  description: string;
  highlights: string[];
  accent?: ColorAccent;
}

export interface Experiment {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: 'Prototype' | 'Exploring' | 'Archived' | 'Shipped';
  accent: ColorAccent;
  tags: string[];
  isWide?: boolean;
  demoUrl?: string;
  repoUrl?: string;
  objective: string;
  howItWorks: string;
  limitations: string;
  takeaways: string;
}

export interface Note {
  id: string;
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  content: string[];
  toc?: Array<{ id: string; text: string; level: number }>;
}
