import { siteSettings } from '@/content/siteSettings';
import { announcementData } from '@/content/announcements';
import { heroData, marqueeKeywords, manifestoData } from '@/content/homePage';
import { capabilitiesData } from '@/content/capabilities';
import { projectsData } from '@/content/projects';
import { technologiesData } from '@/content/technologies';
import { experienceData } from '@/content/experience';
import { experimentsData } from '@/content/experiments';
import { notesData } from '@/content/notes';
import {
  SiteSettings,
  Announcement,
  HeroData,
  ManifestoData,
  CapabilityItem,
  Project,
  Technology,
  TechCategory,
  ExperienceItem,
  Experiment,
  Note,
} from '@/types';
import { fetchPublicationList, fetchPublicationOne, fetchGlobals, type ApiPublication } from '@/lib/api';

export async function getSiteSettings(): Promise<SiteSettings> {
  const globals = await fetchGlobals();
  const site = globals?.site?.data?.siteSettings;
  return site ?? siteSettings;
}

export async function getAnnouncement(): Promise<Announcement> {
  const globals = await fetchGlobals();
  const announcement = globals?.site?.data?.announcement;
  return announcement ?? announcementData;
}

function blockProps(blocks: any[] | undefined, type: string): Record<string, any> {
  return blocks?.find((b) => b.type === type && b.enabled !== false)?.props ?? {};
}

export async function getHomePageData(): Promise<{
  hero: HeroData;
  marquee: string[];
  manifesto: ManifestoData;
}> {
  const page = await fetchPublicationOne('page', 'home');
  const blocks = page?.data?.blocks;
  if (!blocks) {
    return { hero: heroData, marquee: marqueeKeywords, manifesto: manifestoData };
  }

  const hero = blockProps(blocks, 'hero_poster');
  const marquee = blockProps(blocks, 'marquee');
  const manifesto = blockProps(blocks, 'about_manifesto');

  return {
    hero: {
      eyebrow: hero.eyebrow ?? heroData.eyebrow,
      headlineLines: hero.headlineLines ?? heroData.headlineLines,
      intro: hero.intro ?? heroData.intro,
      primaryCta: hero.primaryCta ?? heroData.primaryCta,
      secondaryCta: hero.secondaryCta ?? heroData.secondaryCta,
      statusLabel: hero.statusLabel ?? heroData.statusLabel,
      bottomKeywords: hero.bottomKeywords ?? heroData.bottomKeywords,
      heroAccent: hero.heroAccent ?? heroData.heroAccent,
      featuredProjectId: hero.featuredProjectId ?? heroData.featuredProjectId,
      featuredProjectEnabled: hero.featuredProjectEnabled ?? heroData.featuredProjectEnabled,
    },
    marquee: marquee.keywords ?? marqueeKeywords,
    manifesto: {
      sectionLabel: manifesto.sectionLabel ?? manifestoData.sectionLabel,
      headline: manifesto.headline ?? manifestoData.headline,
      body: manifesto.body ?? manifestoData.body,
      chips: manifesto.chips ?? manifestoData.chips,
      ctaText: manifesto.ctaText ?? manifestoData.ctaText,
      ctaHref: manifesto.ctaHref ?? manifestoData.ctaHref,
    },
  };
}

function toCapability(p: ApiPublication, index: number): CapabilityItem {
  const d = p.data;
  return {
    id: p.id,
    order: d.order ?? index,
    code: d.code ?? p.slug ?? p.id,
    title: d.title ?? p.data.title ?? '',
    description: d.description ?? '',
    accent: d.accent ?? 'sun',
    iconKey: d.iconKey ?? d.icon ?? 'box',
    relatedWorkLink: d.relatedWorkLink,
  };
}

export async function getCapabilities(): Promise<CapabilityItem[]> {
  const list = await fetchPublicationList('capability');
  if (!list) return [...capabilitiesData].sort((a, b) => a.order - b.order);
  return list.map(toCapability).sort((a, b) => a.order - b.order);
}

const EMPTY_CASE_STUDY: Project['caseStudy'] = {
  overview: { product: '', targetUsers: '', timeline: '', role: '', status: '' },
  problem: '',
  contribution: [],
  approach: { summary: '', architecturePoints: [] },
  highlights: [],
  outcomes: [],
  lessons: [],
};

function toProject(p: ApiPublication, index: number): Project {
  const d = p.data;
  return {
    id: p.id,
    slug: p.slug ?? p.id,
    title: d.title ?? '',
    year: d.year ?? '',
    index: d.index ?? String(index + 1).padStart(2, '0'),
    category: d.category ?? 'Web Products',
    summary: d.summary ?? '',
    accent: d.accent ?? 'sun',
    tags: d.tags ?? d.techStack ?? [],
    status: d.status ?? 'Shipped',
    featured: d.featured ?? false,
    order: d.order ?? index,
    demoUrl: d.demoUrl ?? d.links?.find((l: any) => /demo|live/i.test(l.label ?? ''))?.url,
    repoUrl: d.repoUrl ?? d.links?.find((l: any) => /repo|github|source/i.test(l.label ?? ''))?.url,
    coverImage: d.coverImage,
    caseStudy: d.caseStudy ?? EMPTY_CASE_STUDY,
  };
}

export async function getProjects(filter?: {
  category?: string;
  featured?: boolean;
}): Promise<Project[]> {
  const list = await fetchPublicationList('project');
  let projects = list
    ? list.map(toProject)
    : [...projectsData];
  if (filter?.category && filter.category !== 'All') {
    projects = projects.filter((p) => p.category.toLowerCase() === filter.category?.toLowerCase());
  }
  if (filter?.featured !== undefined) {
    projects = projects.filter((p) => p.featured === filter.featured);
  }
  return projects.sort((a, b) => a.order - b.order);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const pub = await fetchPublicationOne('project', slug);
  if (pub) return toProject(pub, 0);
  const project = projectsData.find((p) => p.slug === slug);
  return project || null;
}

function toTechnology(p: ApiPublication, index: number): Technology {
  const d = p.data;
  return {
    name: d.name ?? d.title ?? '',
    category: d.category ?? 'Tools',
    context: d.context,
    featured: d.featured ?? false,
    order: d.order ?? index,
  };
}

export async function getTechnologies(category?: TechCategory | 'All'): Promise<Technology[]> {
  const list = await fetchPublicationList('skill');
  let technologies = list ? list.map(toTechnology) : [...technologiesData];
  if (category && category !== 'All') {
    technologies = technologies.filter((t) => t.category === category);
  }
  return technologies.sort((a, b) => a.order - b.order);
}

function toExperience(p: ApiPublication, index: number): ExperienceItem {
  const d = p.data;
  return {
    id: p.id,
    year: d.year ?? '',
    startDate: d.startDate ?? '',
    endDate: d.endDate ?? '',
    type: d.type ?? 'Work',
    organization: d.organization ?? '',
    roleAtTime: d.roleAtTime ?? '',
    description: d.description ?? '',
    highlights: d.highlights ?? [],
    accent: d.accent,
  };
}

export async function getExperience(): Promise<ExperienceItem[]> {
  const list = await fetchPublicationList('experience');
  if (!list) return [...experienceData];
  return list.map(toExperience);
}

function toExperiment(p: ApiPublication): Experiment {
  const d = p.data;
  return {
    id: p.id,
    slug: p.slug ?? p.id,
    title: d.title ?? '',
    summary: d.summary ?? '',
    status: d.status ?? 'Exploring',
    accent: d.accent ?? 'lime',
    tags: d.tags ?? [],
    isWide: d.isWide,
    demoUrl: d.demoUrl,
    repoUrl: d.repoUrl,
    objective: d.objective ?? '',
    howItWorks: d.howItWorks ?? d.how_it_works ?? '',
    limitations: d.limitations ?? '',
    takeaways: d.takeaways ?? '',
  };
}

export async function getExperiments(status?: string): Promise<Experiment[]> {
  const list = await fetchPublicationList('experiment');
  let experiments = list ? list.map(toExperiment) : [...experimentsData];
  if (status && status !== 'All') {
    experiments = experiments.filter((e) => e.status.toLowerCase() === status.toLowerCase());
  }
  return experiments;
}

export async function getExperimentBySlug(slug: string): Promise<Experiment | null> {
  const pub = await fetchPublicationOne('experiment', slug);
  if (pub) return toExperiment(pub);
  const exp = experimentsData.find((e) => e.slug === slug);
  return exp || null;
}

function toNote(p: ApiPublication): Note {
  const d = p.data;
  const body = d.markdownBody ?? d.body ?? '';
  const content = Array.isArray(d.content) ? d.content : typeof body === 'string' && body !== '' ? [body] : [];
  return {
    id: p.id,
    slug: p.slug ?? p.id,
    title: d.title ?? '',
    category: d.category ?? 'General',
    publishedAt: p.publishedAt ?? '',
    readTime: d.readTime ?? d.readingTime ?? '',
    excerpt: d.excerpt ?? d.summary ?? '',
    tags: d.tags ?? [],
    content,
    toc: d.toc,
  };
}

export async function getNotes(category?: string): Promise<Note[]> {
  const list = await fetchPublicationList('note');
  let notes = list ? list.map(toNote) : [...notesData];
  if (category && category !== 'All') {
    notes = notes.filter((n) => n.category.toLowerCase() === category.toLowerCase());
  }
  return notes;
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const pub = await fetchPublicationOne('note', slug);
  if (pub) return toNote(pub);
  const note = notesData.find((n) => n.slug === slug);
  return note || null;
}
