export type ColorAccent = 'sun' | 'sky' | 'coral' | 'lime' | 'pink' | 'paper' | 'surface';

export type ContentType = 
  | 'page'
  | 'project'
  | 'capability'
  | 'skill'
  | 'experience'
  | 'experiment'
  | 'note';

export type EntryStatus = 'draft' | 'published' | 'archived';

export interface SeoMetadata {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface CmsEntry<T = any> {
  _id: string;
  type: ContentType;
  key?: string; // For singleton entries like 'home', 'about', 'contact'
  slug?: string;
  locale: string;
  title: string;
  status: EntryStatus;
  data: T;
  seo: SeoMetadata;
  references: string[];
  featured?: boolean;
  sortOrder: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  publishedAt?: string;
  lastPublishedRevision?: number;
  hasUnpublishedChanges?: boolean;
  archivedAt?: string;
}

export interface CmsPublication<T = any> {
  _id: string;
  entryId: string;
  type: ContentType;
  slug?: string;
  locale: string;
  key?: string;
  publicData: T;
  publicSeo: SeoMetadata;
  publishedAt: string;
  sourceRevision: number;
  referencedIds: string[];
  schemaVersion: number;
}

export interface CmsRevision {
  _id: string;
  entryId: string;
  revision: number;
  action: 'created' | 'saved' | 'published' | 'unpublished' | 'restored';
  actor: string;
  summary: string;
  snapshot: any;
  createdAt: string;
}

export interface MediaAsset {
  _id: string;
  filename: string;
  storageKey: string;
  url: string;
  mimeType: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  alt: string;
  caption?: string;
  usageReferences: Array<{
    entryId: string;
    entryTitle: string;
    field: string;
  }>;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actor: string;
  action: 'create' | 'update' | 'publish' | 'unpublish' | 'restore' | 'delete' | 'upload';
  targetType: string;
  targetId: string;
  targetTitle: string;
  details?: string;
  createdAt: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  isExternal: boolean;
  order: number;
}

export interface SiteSettings {
  siteTitle: string;
  ownerName: string;
  tagline: string;
  description: string;
  logoText: string;
  contactEmail: string;
  resumeUrl: string;
  socialLinks: Array<{
    platform: string;
    label: string;
    url: string;
  }>;
  seoDefaults: {
    ogImage: string;
    keywords: string[];
    siteTitleTemplate: string;
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

export interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  permanent: boolean;
  createdAt: string;
}

export interface CmsGlobals {
  siteSettings: SiteSettings;
  announcement: Announcement;
  navigation: NavLink[];
  appearance: {
    accentPreset: ColorAccent;
    sectionVariant?: string;
  };
  redirects: RedirectRule[];
}

// Section types for Page Builder
export type PageSectionType = 
  | 'announcement'
  | 'hero_poster'
  | 'marquee'
  | 'about_manifesto'
  | 'capability_grid'
  | 'featured_work'
  | 'toolbox'
  | 'journey'
  | 'experiment_grid'
  | 'notes_grid'
  | 'contact_poster';

export interface PageSectionItem {
  id: string;
  type: PageSectionType;
  name: string;
  enabled: boolean;
  order: number;
  props: Record<string, any>;
  references?: string[];
  visualVariant?: string;
}

export interface HomePageData {
  sections: PageSectionItem[];
}

// Specific content models
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

export interface ProjectData {
  title: string;
  slug: string;
  year: string;
  index: string;
  category: 'Web Products' | 'Backend & APIs' | 'Intelligent Workflows' | 'Developer Tools' | 'Systems & Architecture';
  summary: string;
  accent: ColorAccent;
  tags: string[];
  status: 'Shipped' | 'In Production' | 'Open Source' | 'Prototype';
  featured: boolean;
  demoUrl?: string;
  repoUrl?: string;
  coverImage?: string;
  coverMediaId?: string;
  galleryMediaIds?: string[];
  caseStudy: ProjectCaseStudy;
}

export interface CapabilityData {
  code: string;
  title: string;
  description: string;
  accent: ColorAccent;
  iconKey: string;
  relatedWorkLink?: string;
  order: number;
}

export type TechCategory = 'Languages' | 'Frontend' | 'Backend' | 'Data' | 'AI' | 'Tools';

export interface TechnologyData {
  name: string;
  category: TechCategory;
  context?: string;
  featured: boolean;
  order: number;
}

export interface ExperienceData {
  year: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  type: 'Work' | 'Education' | 'Research' | 'Community' | 'Milestone';
  organization: string;
  roleAtTime: string;
  description: string;
  highlights: string[];
  accent?: ColorAccent;
  links?: Array<{ label: string; url: string }>;
}

export interface ExperimentData {
  title: string;
  slug: string;
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

export interface NoteData {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  content: string[]; // Or markdown body string
  markdownBody?: string;
  coverMediaId?: string;
}

export interface ContentHealthIssue {
  id: string;
  level: 'blocker' | 'warning' | 'suggestion';
  title: string;
  description: string;
  targetType: ContentType;
  targetId: string;
  targetTitle: string;
  fixAction?: string;
}
