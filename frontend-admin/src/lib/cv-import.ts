import fs from 'node:fs/promises';
import path from 'node:path';
import { createEntry, getEntries, getGlobals, updateGlobals } from './cms/service';
import type {
  CmsEntry,
  ExperienceData,
  ProjectData,
  SiteSettings,
  TechnologyData,
} from '@/types';

/**
 * One-shot CV import: parses `cv-en/roles/ai/sections/*.tex` from the sibling
 * `cv/` repo and creates CMS drafts (projects, experience, skills, site
 * settings). Rerun-safe: matches existing entries by slug/title/name and
 * only fills missing globals keys.
 */

export interface CvImportResult {
  reposSeen: number;
  projectsCreated: number;
  projectsSkipped: string[];
  experienceCreated: number;
  experienceSkipped: string[];
  skillsCreated: number;
  skillsSkipped: string[];
  globalsUpdated: boolean;
  failed: Array<{ item: string; error: string }>;
}

interface ParsedEntry {
  title: string;
  role: string;
  date: string;
  company: string;
  location: string;
  tech: string[];
  links: Array<{ label: string; url: string; text: string }>;
  bullets: string[];
}

async function findCvDir(): Promise<string | null> {
  const candidates = [
    process.env.CV_DIR || '',
    path.resolve(process.cwd(), '..', '..', 'cv'),
    path.resolve(process.cwd(), '..', 'cv'),
    path.resolve(process.cwd(), 'cv'),
  ].filter(Boolean);
  for (const dir of candidates) {
    try {
      await fs.access(path.join(dir, 'cv-en', 'roles', 'ai', 'sections', 'experience.tex'));
      return dir;
    } catch {
      // try next
    }
  }
  return null;
}

function stripLatex(s: string): string {
  return s
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '$1')
    .replace(/\\(textit|textbf|emph|skills|texorpdfstring)\{([^}]*)\}/g, '$2')
    .replace(/\\vs\.\s*/g, 'vs. ')
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\~/g, ' ')
    .replace(/---/g, ' — ')
    .replace(/\\\\/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitHrefs(item: string): Array<{ label: string; url: string; text: string }> {
  const out: Array<{ label: string; url: string; text: string }> = [];
  for (const seg of item.split('|')) {
    const re = /\\href\{([^}]*)\}\{([^}]*)\}/g;
    let m: RegExpExecArray | null;
    let first = true;
    while ((m = re.exec(seg)) !== null) {
      const before = first ? stripLatex(seg.slice(0, m.index)).replace(/:$/, '').trim() : '';
      out.push({ label: before || stripLatex(m[2]), url: m[1].trim(), text: stripLatex(m[2]) });
      first = false;
    }
  }
  return out;
}

const ROLE_WORDS = /developer|designer|tester|research|engineer/i;

function parseEntries(text: string): ParsedEntry[] {
  const lines = text.split('\n');
  const entries: ParsedEntry[] = [];
  let cur: (ParsedEntry & { commented: boolean }) | null = null;

  const flush = () => {
    if (cur && cur.bullets.length > 0 && !/ROLE \/ JOB [E-I]|In lobortis|Company [E-I]|somewhere/i.test(cur.title)) {
      entries.push(cur);
    }
    cur = null;
  };

  for (const raw of lines) {
    const commented = /^\s*%/.test(raw);
    const line = commented ? raw.replace(/^\s*%\s?/, '') : raw.trim();
    if (!line) continue;
    const sub = line.match(/\\subsection\{\\texorpdfstring\{(.+?)\\hfill\s*(.+?)\}\{/);
    if (sub) {
      flush();
      const left = sub[1].trim();
      const date = sub[2].trim();
      let title = left;
      let role = '';
      const parts = left.split(' / ');
      if (parts.length >= 2) {
        const [a, ...rest] = parts;
        const b = rest.join(' / ');
        if (ROLE_WORDS.test(a) && !ROLE_WORDS.test(b)) {
          title = b.replace(/\s*\(Team of \d+\)\s*$/i, '').trim();
          role = a.trim();
        } else {
          title = a.trim();
          role = b.trim();
        }
      } else if (/figma/i.test(left)) {
        title = 'Sporting Goods UX Prototype';
        role = 'UX/UI Designer';
      }
      title = title.replace(/\s*\.\s*$/, '');
      if (!title || /^(ROLE|In lobortis)/i.test(title)) {
        cur = null;
        continue;
      }
      cur = { title, role, date, company: '', location: '', tech: [], links: [], bullets: [], commented };
      continue;
    }
    if (!cur) continue;
    if (!commented && cur.commented) continue;
    if (commented && !cur.commented) continue;
    const st = line.match(/\\subtext\{(.+?)\\hfill\s*(.+?)\}/);
    if (st) {
      cur.company = stripLatex(st[1]);
      cur.location = stripLatex(st[2]);
      continue;
    }
    const it = line.match(/\\item\s+(.*)/);
    if (it) {
      const rawItem = it[1].trim();
      for (const l of splitHrefs(rawItem)) {
        if (/^https?:/.test(l.url)) cur.links.push(l);
      }
      const tech = rawItem.match(/^(Tech Stack|Technologies)\s*:\s*(.*)$/);
      if (tech) {
        cur.tech.push(
          ...tech[2]
            .split(',')
            .map((t) => stripLatex(t).replace(/\.$/, '').trim())
            .filter(Boolean)
        );
        continue;
      }
      const residue = rawItem
        .replace(/\\href\{[^}]*\}\{[^}]*\}/g, '')
        .replace(/[|\s]/g, '');
      if (/^([^:]*:)+$/.test(residue)) continue;
      const text = stripLatex(rawItem);
      if (text) cur.bullets.push(text);
    }
  }
  flush();
  return entries;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function projectCategory(title: string, tech: string[], summary: string): ProjectData['category'] {
  const hay = `${title} ${tech.join(' ')} ${summary}`.toLowerCase();
  if (/ai\b|llm|agent|vertex|phobert|sentiment|chatbot|prompt|ml\b|nlp/.test(hay)) return 'Intelligent Workflows';
  if (/selenium|postman|test|qa\b|playwright|e2e/.test(hay)) return 'Developer Tools';
  if (/api|jwt|docker|nginx|backend|pipeline|gin\b|microservice/.test(hay)) return 'Backend & APIs';
  return 'Web Products';
}

function entryYear(date: string): string {
  const m = date.match(/(19|20)\d{2}/);
  return m ? m[0] : '2026';
}

const SKILL_CATEGORIES: Array<{ category: TechnologyData['category']; items: string[] }> = [
  { category: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'PHP'] },
  { category: 'Data', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQL'] },
  { category: 'Tools', items: ['Git', 'Linux', 'Postman', 'Claude Code', 'Codex'] },
  { category: 'Frontend', items: ['ReactJS'] },
  { category: 'Backend', items: ['.NET', 'Spring Boot', 'REST/JSON'] },
  { category: 'AI', items: ['AI chatbots'] },
];

function skillCategory(item: string): TechnologyData['category'] | null {
  const low = item.toLowerCase();
  if (/vietnamese|english|toeic/.test(low)) return null;
  for (const group of SKILL_CATEGORIES) {
    if (group.items.some((k) => low.includes(k.toLowerCase()))) return group.category;
  }
  return 'Tools';
}

export async function importCv(): Promise<CvImportResult> {
  const result: CvImportResult = {
    reposSeen: 0,
    projectsCreated: 0,
    projectsSkipped: [],
    experienceCreated: 0,
    experienceSkipped: [],
    skillsCreated: 0,
    skillsSkipped: [],
    globalsUpdated: false,
    failed: [],
  };

  const cvDir = await findCvDir();
  if (!cvDir) throw new Error('CV repo not found (looked for ../cv and ./cv).');

  const secDir = path.join(cvDir, 'cv-en', 'roles', 'ai', 'sections');
  const [expText, workText, skillsText] = await Promise.all([
    fs.readFile(path.join(secDir, 'experience.tex'), 'utf-8'),
    fs.readFile(path.join(secDir, 'work_experience.tex'), 'utf-8'),
    fs.readFile(path.join(secDir, 'skills.tex'), 'utf-8'),
  ]);

  const projects = parseEntries(expText);
  const jobs = parseEntries(workText).filter((e) => e.company && !/garena|allianc|ismart|tournament|esport|observer|referee|collaborator/i.test(e.company));
  result.reposSeen = projects.length + jobs.length;

  const existing = await getEntries();
  const bySlug = new Map(existing.map((e) => [e.slug, e] as const));
  const byTitle = new Map(existing.map((e) => [e.title.toLowerCase(), e] as const));
  let order = existing.length;

  const create = async (payload: Omit<CmsEntry, '_id' | 'revision' | 'createdAt' | 'updatedAt' | 'hasUnpublishedChanges'>) => {
    order += 1;
    return createEntry(payload, 'owner');
  };

  // ---- Projects ----
  for (const p of projects) {
    const slug = slugify(p.title);
    try {
      if (bySlug.has(slug)) {
        result.projectsSkipped.push(p.title);
        continue;
      }
      const github = p.links.find((l) => /github\.com/.test(l.url));
      const demo = p.links.find((l) => !/github\.com|figma\.com|drive\.|1drv|docs\.google/.test(l.url) && /^https?:/.test(l.url));
      const extra = p.links.filter((l) => l !== github && l !== demo).map((l) => ({ label: l.label.slice(0, 120) || l.text.slice(0, 120), url: l.url.slice(0, 2048) }));
      const summary = (p.bullets[0] || p.title).slice(0, 500);
      const year = entryYear(p.date);
      const category = projectCategory(p.title, p.tech, summary);
      const created = await create({
        type: 'project',
        title: p.title,
        slug,
        locale: 'en',
        status: 'draft',
        sortOrder: order,
        featured: false,
        references: [],
        seo: { title: p.title, description: summary },
        data: {
          title: p.title,
          slug,
          year,
          index: String(order).padStart(2, '0'),
          category,
          summary,
          accent: 'sun',
          tags: p.tech.slice(0, 4),
          status: demo ? 'In Production' : 'Open Source',
          featured: false,
          demoUrl: demo?.url,
          repoUrl: github?.url,
          links: extra.length > 0 ? extra : undefined,
          techStack: p.tech.slice(0, 30),
          caseStudy: {
            overview: {
              product: p.title,
              targetUsers: 'Developers, businesses and end-users',
              timeline: p.date.replace(/---/g, '—'),
              role: p.role || 'Creator',
              status: demo ? 'Live' : 'Active',
            },
            problem: summary,
            contribution: p.bullets.slice(1),
            approach: { summary: '', architecturePoints: [] },
            highlights: [],
            outcomes: [],
            lessons: [],
          },
        },
      });
      bySlug.set(slug, created);
      result.projectsCreated += 1;
    } catch (err) {
      result.failed.push({ item: `project:${p.title}`, error: (err as Error).message });
    }
  }

  // ---- Work experience + education + milestone ----
  const eduYear = '2022 — 2027';
  const expItems: Array<{ title: string; data: ExperienceData }> = jobs.map((j, i) => ({
    title: `${j.role || 'Software Engineer'} @ ${j.company}`,
    data: {
      year: j.date.replace(/---/g, '—'),
      startDate: '',
      endDate: /present/i.test(j.date) ? 'Present' : '',
      isCurrent: /present/i.test(j.date),
      type: 'Work',
      organization: j.company,
      roleAtTime: j.role || 'Software Engineer',
      description: j.bullets[0] || '',
      highlights: j.bullets.slice(1),
      accent: (['sun', 'sky', 'coral', 'lime'] as const)[i % 4],
      links: [],
    },
  }));
  expItems.push({
    title: 'Information Technology @ Saigon University',
    data: {
      year: eduYear,
      startDate: '2022-10',
      endDate: '2027',
      isCurrent: true,
      type: 'Education',
      organization: 'Saigon University',
      roleAtTime: 'Information Technology',
      description: 'Bachelor of Information Technology (Expected 2027).',
      highlights: ['TOEIC Listening & Reading 695/990'],
      accent: 'sky',
      links: [],
    },
  });
  expItems.push({
    title: 'TOEIC 695 @ IIG Vietnam',
    data: {
      year: '2025',
      startDate: '2025',
      endDate: '2025',
      isCurrent: false,
      type: 'Milestone',
      organization: 'IIG Vietnam',
      roleAtTime: 'English Certification',
      description: 'TOEIC Listening & Reading 695/990.',
      highlights: [],
      accent: 'lime',
      links: [],
    },
  });

  for (const item of expItems) {
    try {
      if (byTitle.has(item.title.toLowerCase())) {
        result.experienceSkipped.push(item.title);
        continue;
      }
      const created = await create({
        type: 'experience',
        title: item.title,
        locale: 'en',
        sortOrder: order,
        status: 'draft',
        references: [],
        seo: {},
        data: item.data,
      });
      byTitle.set(item.title.toLowerCase(), created);
      result.experienceCreated += 1;
    } catch (err) {
      result.failed.push({ item: `experience:${item.title}`, error: (err as Error).message });
    }
  }

  // ---- Skills (keep the 4 CV groups, split into items) ----
  const seenSkills = new Set(existing.filter((e) => e.type === 'skill').map((e) => e.title.toLowerCase()));
  let skillOrder = 0;
  for (const line of skillsText.split('\n')) {
    const m = line.match(/\\skills\{([^}]*)\}\s*&\s*&\s*(.*?)\s*\\\\\s*$/);
    if (!m) continue;
    const items = m[2]
      .split(',')
      .map((t) =>
        t
          .trim()
          .replace(/\\#/g, '#')
          .replace(/\\&/g, '&')
          .replace(/\.$/, '')
          .trim()
      )
      .filter(Boolean);
    for (const item of items) {
      const category = skillCategory(item);
      if (!category) continue;
      try {
        if (seenSkills.has(item.toLowerCase())) {
          result.skillsSkipped.push(item);
          continue;
        }
        skillOrder += 1;
        const created = await create({
          type: 'skill',
          title: item,
          locale: 'en',
          sortOrder: skillOrder,
          status: 'draft',
          references: [],
          seo: {},
          data: { name: item, category, featured: false, order: skillOrder },
        });
        seenSkills.add(item.toLowerCase());
        void created;
        result.skillsCreated += 1;
      } catch (err) {
        result.failed.push({ item: `skill:${item}`, error: (err as Error).message });
      }
    }
  }

  // ---- Site globals (fill only missing identity fields) ----
  try {
    const globals = await getGlobals();
    const site = (globals.siteSettings || {}) as Partial<SiteSettings>;
    const social = [...(site.socialLinks || [])];
    const has = (p: string) => social.some((s) => s.platform === p);
    if (!has('github')) social.push({ platform: 'github', label: 'GitHub', url: 'https://github.com/tongthanhdat009' });
    if (!has('linkedin')) social.push({ platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/dat-jadt' });
    const patch: Partial<SiteSettings> = {};
    if (!site.ownerName) patch.ownerName = 'Tống Thành Đạt';
    if (!site.tagline) patch.tagline = 'AI Agent Engineer';
    if (!site.logoText) patch.logoText = 'DAT';
    if (!site.contactEmail) patch.contactEmail = 'tongthanhdat.work@gmail.com';
    if (!site.description) patch.description = 'Software Engineer with full-stack experience and applied AI.';
    if (social.length !== (site.socialLinks || []).length) patch.socialLinks = social;
    if (Object.keys(patch).length > 0) {
      await updateGlobals({ siteSettings: { ...(site as SiteSettings), ...patch } }, 'owner');
      result.globalsUpdated = true;
    }
  } catch (err) {
    result.failed.push({ item: 'globals', error: (err as Error).message });
  }

  return result;
}
