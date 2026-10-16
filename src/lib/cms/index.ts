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
  ExperienceItem,
  Experiment,
  Note,
  TechCategory,
} from '@/types';

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}

export async function getAnnouncement(): Promise<Announcement> {
  return announcementData;
}

export async function getHomePageData(): Promise<{
  hero: HeroData;
  marquee: string[];
  manifesto: ManifestoData;
}> {
  return {
    hero: heroData,
    marquee: marqueeKeywords,
    manifesto: manifestoData,
  };
}

export async function getCapabilities(): Promise<CapabilityItem[]> {
  return [...capabilitiesData].sort((a, b) => a.order - b.order);
}

export async function getProjects(filter?: {
  category?: string;
  featured?: boolean;
}): Promise<Project[]> {
  let list = [...projectsData];
  if (filter?.category && filter.category !== 'All') {
    list = list.filter((p) => p.category.toLowerCase() === filter.category?.toLowerCase());
  }
  if (filter?.featured !== undefined) {
    list = list.filter((p) => p.featured === filter.featured);
  }
  return list.sort((a, b) => a.order - b.order);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const project = projectsData.find((p) => p.slug === slug);
  return project || null;
}

export async function getTechnologies(category?: TechCategory | 'All'): Promise<Technology[]> {
  let list = [...technologiesData];
  if (category && category !== 'All') {
    list = list.filter((t) => t.category === category);
  }
  return list.sort((a, b) => a.order - b.order);
}

export async function getExperience(): Promise<ExperienceItem[]> {
  return [...experienceData];
}

export async function getExperiments(status?: string): Promise<Experiment[]> {
  let list = [...experimentsData];
  if (status && status !== 'All') {
    list = list.filter((e) => e.status.toLowerCase() === status.toLowerCase());
  }
  return list;
}

export async function getExperimentBySlug(slug: string): Promise<Experiment | null> {
  const exp = experimentsData.find((e) => e.slug === slug);
  return exp || null;
}

export async function getNotes(category?: string): Promise<Note[]> {
  let list = [...notesData];
  if (category && category !== 'All') {
    list = list.filter((n) => n.category.toLowerCase() === category.toLowerCase());
  }
  return list;
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const note = notesData.find((n) => n.slug === slug);
  return note || null;
}
