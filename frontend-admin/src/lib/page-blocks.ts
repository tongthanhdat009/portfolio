import type { PageSectionItem, PageSectionType } from '@/types';

/**
 * Canonical page-block shape shared by the backend (`data.blocks`,
 * validated against SchemaRegistry::BLOCK_TYPES) and the public site
 * (`getHomePageData` reads `blocks[].{type,enabled,props}`).
 */
export interface PageBlock {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  props: Record<string, any>;
  references?: string[];
  visualVariant?: string;
}

const SECTION_NAMES: Record<string, string> = {
  announcement: 'Announcement Strip',
  hero_poster: 'Hero Poster',
  marquee: 'Skills Marquee',
  about_manifesto: 'About Manifesto',
  capability_grid: 'Capability Grid',
  featured_work: 'Featured Work',
  toolbox: 'Toolbox',
  journey: 'Journey Timeline',
  experiment_grid: 'Experiment Grid',
  notes_grid: 'Notes Grid',
  contact_poster: 'Contact Poster',
};

const DEFAULT_ORDER = [
  'announcement',
  'hero_poster',
  'marquee',
  'about_manifesto',
  'capability_grid',
  'featured_work',
  'toolbox',
  'journey',
  'experiment_grid',
  'notes_grid',
  'contact_poster',
];

/** Backend blocks -> builder sections (adds display-only `name`). */
export function blocksToSections(blocks?: PageBlock[] | null): PageSectionItem[] {
  if (!Array.isArray(blocks)) return [];
  return [...blocks]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((b, i) => ({
      id: b.id,
      type: b.type as PageSectionType,
      name: SECTION_NAMES[b.type] ?? b.type,
      enabled: b.enabled !== false,
      order: b.order ?? i + 1,
      props: b.props ?? {},
      ...(b.references?.length ? { references: b.references } : {}),
      ...(b.visualVariant ? { visualVariant: b.visualVariant } : {}),
    }));
}

/**
 * Builder sections -> backend blocks. Drops the display-only `name` (and any
 * legacy `sections` key at the call site) so the payload conforms to the
 * store validation rules.
 */
export function sectionsToBlocks(sections: PageSectionItem[]): PageBlock[] {
  return sections.map((s, i) => ({
    id: s.id,
    type: s.type,
    enabled: s.enabled,
    order: s.order ?? i + 1,
    props: s.props ?? {},
    ...(s.references?.length ? { references: s.references } : {}),
    ...(s.visualVariant ? { visualVariant: s.visualVariant } : {}),
  }));
}

/** Seed content: all canonical blocks enabled with empty props (public falls back per-field to local content). */
export function defaultHomeBlocks(): PageBlock[] {
  return DEFAULT_ORDER.map((type, i) => ({
    id: `sec_${type}`,
    type,
    enabled: true,
    order: i + 1,
    props: {},
  }));
}
