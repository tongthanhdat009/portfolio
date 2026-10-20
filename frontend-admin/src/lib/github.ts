import { createEntry, getEntries, saveDraft, addMedia } from './cms/service';
import type { CmsEntry, ProjectData, ProjectCaseStudy } from '@/types';

/**
 * Manual GitHub → CMS sync. Fetches public repos (+ README as description
 * source) and creates missing ones as `draft` project entries. Existing
 * entries are only ever backfilled where a field is missing (or still holds
 * the generic filler this sync writes) — hand-written content is preserved.
 */

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'tongthanhdat009';
const IGNORED_REPOS = ['portfolio', 'cv', 'tongthanhdat009'];

interface GithubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazerCount: number;
  language: string | null;
  topics: string[];
  fork: boolean;
  private: boolean;
  created_at: string;
  updated_at: string;
}

export interface GithubSyncResult {
  reposSeen: number;
  created: number;
  updated: number;
  skipped: number;
  privateSkipped: number;
  coversUploaded: number;
  failed: Array<{ repo: string; error: string }>;
  createdEntries: CmsEntry<ProjectData>[];
  updatedEntries: CmsEntry<ProjectData>[];
}

function githubHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...extra,
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchGithubRepos(): Promise<GithubRepo[]> {
  // Authenticated endpoint includes collaborator + org-member repos, not just
  // owned ones. Without a token, fall back to public owned repos only.
  const url = process.env.GITHUB_TOKEN
    ? 'https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&per_page=100&sort=updated'
    : `https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=100&sort=updated&type=public`;
  const res = await fetch(url, { headers: githubHeaders(), cache: 'no-store' });
  if (res.status === 403) {
    throw new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN and retry.');
  }
  if (!res.ok) {
    throw new Error(`GitHub API returned ${res.status}: ${res.statusText}`);
  }
  const repos = (await res.json()) as any[];
  return repos.map((r) => ({
    name: r.name,
    full_name: r.full_name,
    description: r.description ?? null,
    html_url: r.html_url,
    homepage: r.homepage || null,
    stargazerCount: r.stargazers_count || 0,
    language: r.language ?? null,
    topics: Array.isArray(r.topics) ? r.topics : [],
    fork: !!r.fork,
    private: !!r.private,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

async function fetchRepoReadme(repo: GithubRepo): Promise<string | null> {
  const res = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
    headers: githubHeaders({ Accept: 'application/vnd.github.raw' }),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (res.status === 403) {
    throw new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN and retry.');
  }
  if (!res.ok) return null;
  const text = await res.text();
  return text.trim() ? text : null;
}

/** Strip markdown decoration, return first meaningful paragraph. */
export function readmeToSummary(markdown: string | null, fallbackDesc: string | null): string {
  if (!markdown) {
    return (
      fallbackDesc?.trim() ||
      'High-impact engineering project. See the repository README for details.'
    );
  }
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[>\-|*+\d.]+\s+/gm, '')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/\|/g, ' ')
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(
      (p) =>
        p.length >= 40 &&
        !/shields\.io|github\.com.*\/(actions|workflows|badge)|licen[sc]e|copyright/i.test(p)
    );
  const pick = cleaned[0] || fallbackDesc?.trim() || '';
  if (!pick) return 'High-impact engineering project. See the repository README for details.';
  return pick.length > 500 ? pick.slice(0, 497).trimEnd() + '…' : pick;
}

const HAS_TOKEN = () => !!process.env.GITHUB_TOKEN;

/** Generic filler sentences this sync writes — safe to replace with real content. */
const GENERIC_CONTRIBUTION = 'Architected the core system modules and codebase structure.';
const GENERIC_APPROACH =
  'Engineered using clean architecture principles with strong static typing and verifiable test coverage.';
const GENERIC_HIGHLIGHT_HOSTED = 'Hosted publicly with transparent open-source code on GitHub.';
const GENERIC_OUTCOME = 'Successfully deployed and actively maintained in production.';
const GENERIC_LESSON =
  'Clear architectural boundaries accelerate both feature delivery and long-term maintainability.';

function isGenericProblem(text: string | undefined): boolean {
  return (
    !text ||
    /^Addressing efficiency, reliability, and usability constraints in .* workflows\.$/.test(text)
  );
}

function isGenericStarsHighlight(text: string | undefined): boolean {
  return !!text && /GitHub Stars from the developer community\.$/.test(text);
}

async function fetchRepoLanguages(repo: GithubRepo): Promise<string[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, {
      headers: githubHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, number>;
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);
  } catch {
    return [];
  }
}

interface ReadmeSection {
  title: string;
  lines: string[];
}

function splitReadmeSections(markdown: string): { preamble: string[]; sections: ReadmeSection[] } {
  const preamble: string[] = [];
  const sections: ReadmeSection[] = [];
  let current: ReadmeSection | null = null;
  for (const rawLine of markdown.split('\n')) {
    const heading = rawLine.match(/^#{1,4}\s+(.+?)\s*$/);
    if (heading) {
      current = { title: heading[1].trim(), lines: [] };
      sections.push(current);
      continue;
    }
    if (/^\s*```/.test(rawLine)) {
      if (current) current.lines.push('```');
      else preamble.push('```');
      continue;
    }
    if (current) current.lines.push(rawLine);
    else preamble.push(rawLine);
  }
  return { preamble, sections };
}

function cleanInline(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // Strip emphasis markers but keep intra-word underscores (snake_case identifiers).
    .replace(/(?<!\w)__([^_\n]+?)__(?!\w)/g, '$1')
    .replace(/(?<!\w)_([^_\n]+?)_(?!\w)/g, '$1')
    .replace(/\*{1,3}/g, '')
    .replace(/~{1,3}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sectionBullets(lines: string[]): string[] {
  const out: string[] = [];
  let inCode = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^```/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (line.includes('|')) continue;
    const m = line.match(/^(?:[-*+]|\d+[.)])\s+(.+)$/);
    if (!m) continue;
    const text = cleanInline(m[1]);
    if (text.length < 8) continue;
    if (/shields|badge|license|copyright|coverage|workflow/i.test(text)) continue;
    if (/^!?\[/.test(text)) continue;
    out.push(text.length > 220 ? text.slice(0, 217).trimEnd() + '…' : text);
    if (out.length >= 8) break;
  }
  return out;
}

function sectionProse(lines: string[], maxChars: number): string {
  const paras: string[] = [];
  let inCode = false;
  let buf: string[] = [];
  const flush = () => {
    const p = cleanInline(buf.join(' '));
    buf = [];
    if (p.length < 40) return;
    if (/shields|badge|license|copyright|coverage|workflow/i.test(p)) return;
    paras.push(p);
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^```/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (/^(?:[-*+]|\d+[.)])\s+/.test(line)) continue;
    if (line.includes('|')) continue;
    if (/^\s*>/.test(rawLine)) continue;
    if (/^(Q|A):\s/.test(line)) continue;
    if (/^(\$|pip|npm|pnpm|yarn|cd|make|docker|git|python3?|node|uv|curl|wget|sudo|apt(-get)?|brew|export|source|mkdir|cp|mv|rm|chmod|netstat|grep|awk|sed|mvn|gradle|dotnet|composer|kubectl|\.\/|\.\.\/)/.test(line)) continue;
    if (/^#{1,6}\s+/.test(line) || line === '' || line === '---' || line === '***') {
      flush();
      continue;
    }
    buf.push(line);
  }
  flush();
  const joined = paras.join('\n\n');
  return joined.length > maxChars ? joined.slice(0, maxChars - 1).trimEnd() + '…' : joined;
}

function normalizeHeading(title: string): string {
  return title
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function findSections(sections: ReadmeSection[], pattern: RegExp): ReadmeSection[] {
  return sections.filter((s) => pattern.test(normalizeHeading(s.title)));
}

interface ReadmeEnrichment {
  techStack: string[];
  demoUrl?: string;
  highlights: string[];
  approachSummary: string;
  outcomes: string[];
  lessons: string[];
  coverImages: Array<{ alt: string; url: string }>;
}

const HEADING_FEATURES = /feature|highlight|capabilit|function|tinh nang|chuc nang|yeu cau|diem noi bat|gioi thieu|tong quan|why |how it works|supported|what('s| is) (new|included|inside)|choose your path|overview|about/;
const HEADING_USAGE = /usage|quick[ -]?start|getting[ -]?started|install|setup|prerequisit|chay|run\b|docker|deploy|how (to use|it works)|huong dan|su dung|cau truc|structure|guide|bat dau/;
const HEADING_RESULTS = /results?|benchmarks?|evaluation|performance|comparison|outcomes?|experiments?|changelog|releases?|thong ke|stats|statistics|ket qua/;
const HEADING_LESSONS = /take ?aways?|lessons?( learned)?|retrospective|learned|conclusion|tong ket|kinh nghiem/;
const HEADING_TECHSTACK = /tech stack|technolog|built with|\bstack\b|cong nghe|backend|frontend|tich hop|integration|prerequisit/;

const TECH_CATEGORY_LABEL =
  /^(framework|language|languages|database|orm|security|auth|migration|migrations|websocket|websockets|email|build tools?|state management|routing|http client|form handling|icons|ui librar\w*|styling|testing|deployment|package managers?|runtime|librar\w*|tools?|devtools?|editor)$/i;

function extractTechNames(lines: string[]): string[] {
  const out: string[] = [];
  const push = (raw: string) => {
    let t = cleanInline(raw).replace(/[()]/g, '').trim();
    const ci = t.indexOf(':');
    if (ci > 0) {
      const lab = t.slice(0, ci).trim();
      const val = t.slice(ci + 1).trim();
      if (TECH_CATEGORY_LABEL.test(lab)) t = val;
      else if (lab) t = lab;
    }
    if (!t || t.length > 30) return;
    if (/=/.test(t)) return;
    if (/__/.test(t)) return;
    if (/^[A-Z0-9_]+$/.test(t) && (t.includes('_') || t.length > 12)) return;
    if (/shields|badge|license|copyright|coverage/i.test(t)) return;
    if (/^[:\-\s]+$/.test(t)) return;
    if (!/[A-Za-z\u00C0-\u024F]/.test(t)) return;
    if (!/\s/.test(t) && t.length > 20) return;
    if (!/^[A-Z0-9\u00C0-\u00DE]/.test(t) && !/[0-9]/.test(t)) return;
    if (/[\/\\]/.test(t)) return;
    if (/^[\w.+-]+(\.[\w.+-]+)+$/.test(t)) {
      const parts = t.split('.').filter(Boolean);
      if (
        parts.length > 1 &&
        parts.every((w) => /^[A-Z\u00C0-\u00DE]/.test(w.replace(/^[^A-Za-z\u00C0-\u024F]+/, '')))
      )
        return;
    }
    if (/\s/.test(t)) {
      for (const w of t.split(/\s+/)) {
        const c = w.replace(/^[^A-Za-z0-9\u00C0-\u024F]+/, '');
        if (!c) continue;
        if (/[0-9]/.test(c)) continue;
        if (/^[a-z\u00E0-\u00FF]/.test(c)) return;
      }
    }
    if (!out.includes(t)) out.push(t);
  };
  let inCode = false;
  let tableHead = 0;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^```/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (/^</.test(line)) continue;
    if (line === '' || /^#{1,6}\s/.test(line)) {
      tableHead = 0;
      continue;
    }
    if (line.includes('|')) {
      tableHead += 1;
      // First two pipe-lines of a block are the header + separator row.
      if (tableHead <= 2) continue;
    } else {
      tableHead = 0;
    }
    const m = line.match(/^(?:[-*+]|\d+[.)])\s+(.+)$/);
    if (m) {
      for (const part of m[1].split(/[|,;]|\s+\/\s+/)) push(part);
      continue;
    }
    if (line.includes('|')) {
      for (const cell of line.split('|')) push(cell);
      continue;
    }
    if (/[:,]$/.test(line)) continue;
    const codes = [...line.matchAll(/`([^`]+)`/g)].map((x) => x[1]);
    if (codes.length > 0) {
      for (const c of codes) push(c);
      continue;
    }
    push(line);
    if (out.length >= 12) break;
  }
  return out.slice(0, 12);
}

function enrichFromReadme(
  markdown: string | null,
  fallbackDesc: string | null,
  owner: string,
  repo: string
): {
  summary: string;
  techStack: string[];
  demoUrl?: string;
  caseStudy: {
    highlights: string[];
    approachSummary: string;
    outcomes: string[];
    lessons: string[];
  };
  coverImages: Array<{ alt: string; url: string }>;
} {
  const empty = {
    summary: readmeToSummary(markdown, fallbackDesc),
    techStack: [],
    demoUrl: undefined as string | undefined,
    caseStudy: { highlights: [], approachSummary: '', outcomes: [], lessons: [] },
    coverImages: [] as Array<{ alt: string; url: string }>,
  };
  if (!markdown) return empty;

  const { preamble, sections } = splitReadmeSections(markdown);

  const seen = (arr: string[], b: string) => arr.some((x) => x.slice(0, 40) === b.slice(0, 40));
  const trunc = (t: string) => (t.length > 220 ? t.slice(0, 217).trimEnd() + '…' : t);
  const highlights: string[] = [];
  for (const sec of findSections(sections, HEADING_FEATURES)) {
    for (const b of sectionBullets(sec.lines)) {
      if (highlights.length >= 6) break;
      if (!seen(highlights, b)) highlights.push(b);
    }
    if (highlights.length >= 6) break;
  }
  if (highlights.length === 0) {
    for (const b of sectionBullets(preamble)) {
      if (highlights.length >= 6) break;
      if (!seen(highlights, b)) highlights.push(b);
    }
  }
  if (highlights.length === 0) {
    for (const sec of sections) {
      if (HEADING_USAGE.test(normalizeHeading(sec.title))) continue;
      for (const b of sectionBullets(sec.lines)) {
        if (highlights.length >= 6) break;
        if (!seen(highlights, b)) highlights.push(b);
      }
      if (highlights.length >= 6) break;
    }
  }
  if (highlights.length === 0) {
    for (const sec of findSections(sections, HEADING_FEATURES)) {
      const t = trunc(cleanInline(sec.title));
      if (t.length >= 10 && !seen(highlights, t)) highlights.push(t);
      if (highlights.length >= 6) break;
    }
  }
  let approachSummary = '';
  for (const sec of findSections(sections, HEADING_USAGE)) {
    const part = sectionProse(sec.lines, 800 - approachSummary.length);
    if (part) approachSummary += (approachSummary ? '\n\n' : '') + part;
    if (approachSummary.length >= 790) break;
  }
  const outcomes: string[] = [];
  for (const sec of findSections(sections, HEADING_RESULTS)) {
    const prose = sectionProse(sec.lines, 600);
    if (prose && !seen(outcomes, prose)) outcomes.push(prose);
    for (const b of sectionBullets(sec.lines).slice(0, 4)) {
      if (outcomes.length >= 6) break;
      if (!seen(outcomes, b)) outcomes.push(b);
    }
    if (outcomes.length >= 6) break;
  }
  const lessons: string[] = [];
  for (const sec of findSections(sections, HEADING_LESSONS)) {
    for (const b of sectionBullets(sec.lines)) {
      if (lessons.length >= 5) break;
      if (!seen(lessons, b)) lessons.push(b);
    }
    if (lessons.length >= 5) break;
  }
  const techStack: string[] = [];
  for (const sec of findSections(sections, HEADING_TECHSTACK)) {
    for (const t of extractTechNames(sec.lines)) {
      if (techStack.length >= 12) break;
      if (!techStack.includes(t)) techStack.push(t);
    }
    if (techStack.length >= 12) break;
  }
  return {
    summary: empty.summary,
    techStack,
    demoUrl: extractDemoLink(markdown),
    caseStudy: { highlights, approachSummary, outcomes, lessons },
    coverImages: extractReadmeImages(markdown, owner, repo),
  };
}

function extractDemoLink(markdown: string): string | undefined {
  const re = /\[([^\]]+)\]\((https?:[^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const label = m[1];
    const url = m[2];
    if (!/^https?:\/\//i.test(url)) continue;
    if (/github\.com|shields\.io|badgen|badge|img\.shields/i.test(url)) continue;
    if (/demo|live|deploy|playground|try( it| live)?|example|app|site|preview|homepage|website/i.test(label)) {
      return url;
    }
  }
  return undefined;
}

const BADGE_HOSTS = [
  'shields.io',
  'badgen.net',
  'github-readme-stats',
  'coveralls.io',
  'codecov.io',
  'travis-ci',
  'circleci',
  'sonarcloud',
  'img.shields.io',
  'badge',
  'github.com/',
  'workflows',
  'actions',
];
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'avif'];

function extractReadmeImages(
  markdown: string,
  owner: string,
  repo: string
): Array<{ alt: string; url: string }> {
  const found: Array<{ alt: string; url: string }> = [];
  const seen = new Set<string>();
  const push = (alt: string, url: string) => {
    const clean = url.trim();
    if (!clean || seen.has(clean)) return;
    if (/^data:/i.test(clean) || clean.startsWith('#')) return;
    const lower = clean.toLowerCase();
    if (lower.endsWith('.svg')) return;
    if (BADGE_HOSTS.some((h) => lower.includes(h))) return;
    if (/badge|shield|coverage|workflow|license|version/i.test(alt)) return;
    let absolute = clean;
    if (!/^https?:\/\//i.test(clean)) {
      const path = clean.replace(/^\.\//, '').replace(/^\/+/, '');
      if (!path || /\s/.test(path)) return;
      absolute = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`;
    }
    const noQuery = absolute.split(/[?#]/)[0].toLowerCase();
    const ext = noQuery.split('.').pop() || '';
    if (!IMAGE_EXTS.includes(ext)) return;
    seen.add(clean);
    found.push({ alt: alt.trim().slice(0, 120), url: absolute });
  };
  const mdRe = /!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = mdRe.exec(markdown)) !== null) push(m[1], m[2]);
  const htmlRe = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((m = htmlRe.exec(markdown)) !== null) push('', m[1]);
  return found;
}

async function tryUploadCoverImage(
  repo: GithubRepo,
  imageUrl: string,
  alt: string,
  title: string,
  slug: string,
  isSocialCard: boolean
): Promise<{ url: string; alt: string } | null> {
  try {
    const head = await fetch(imageUrl, { method: 'HEAD', redirect: 'follow' });
    if (!head.ok) return null;
    const contentType = (head.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const extByMime: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
    };
    const ext = extByMime[contentType];
    if (!ext) return null;
    const size = parseInt(head.headers.get('content-length') || '0', 10);
    if (!size || size > 10 * 1024 * 1024) return null;
    const filename = `github-cover-${slug}.${ext}`;
    const asset = await addMedia(
      {
        filename,
        storageKey: `covers/${filename}`,
        url: imageUrl,
        mimeType: contentType,
        size,
        dimensions: isSocialCard ? { width: 1200, height: 630 } : { width: 0, height: 0 },
        alt: alt || `${title} preview`,
      },
      'owner'
    );
    if (!asset?.url) return null;
    return { url: asset.url, alt: asset.alt || `${title} preview` };
  } catch {
    return null;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getCategoryByRepo(repo: GithubRepo): ProjectData['category'] {
  const name = repo.name.toLowerCase();
  const desc = (repo.description || '').toLowerCase();
  const lang = (repo.language || '').toLowerCase();

  if (
    name.includes('router') ||
    name.includes('cua') ||
    name.includes('agent') ||
    name.includes('computer-use') ||
    name.includes('alpha') ||
    name.includes('sentiment') ||
    desc.includes('ai') ||
    desc.includes('llm') ||
    desc.includes('alpha')
  ) {
    return 'Intelligent Workflows';
  }
  if (
    name.includes('cli') ||
    name.includes('tool') ||
    name.includes('widget') ||
    name.includes('sync') ||
    name.includes('profile')
  ) {
    return 'Developer Tools';
  }
  if (
    lang === 'c#' ||
    lang === 'php' ||
    lang === 'blade' ||
    lang === 'html' ||
    name.includes('web') ||
    name.includes('store') ||
    name.includes('market') ||
    name.includes('booking') ||
    name.includes('showcase') ||
    name.includes('airline')
  ) {
    return 'Web Products';
  }
  if (
    lang === 'go' ||
    lang === 'rust' ||
    desc.includes('backend') ||
    desc.includes('stream') ||
    desc.includes('pipeline') ||
    name.includes('api') ||
    name.includes('backend')
  ) {
    return 'Backend & APIs';
  }
  return 'Web Products';
}

function getAccentByIndex(index: number): ProjectData['accent'] {
  const accents: ProjectData['accent'][] = ['sky', 'sun', 'coral', 'lime', 'paper'];
  return accents[index % accents.length];
}

interface RepoEnrichment {
  techStack: string[];
  demoUrl?: string;
  highlights: string[];
  approachSummary: string;
  outcomes: string[];
  lessons: string[];
  coverUrl?: string;
  coverAlt?: string;
}

const EMPTY_ENRICHMENT: RepoEnrichment = {
  techStack: [],
  demoUrl: undefined,
  highlights: [],
  approachSummary: '',
  outcomes: [],
  lessons: [],
  coverUrl: undefined,
  coverAlt: undefined,
};

function mapRepoToProjectEntry(
  repo: GithubRepo,
  summary: string,
  index: number,
  enrich: RepoEnrichment = EMPTY_ENRICHMENT
): Omit<
  CmsEntry<ProjectData>,
  '_id' | 'revision' | 'createdAt' | 'updatedAt' | 'hasUnpublishedChanges'
> {
  const slug = slugify(repo.name);
  const year = repo.created_at ? new Date(repo.created_at).getFullYear().toString() : '2026';
  const category = getCategoryByRepo(repo);
  const tags: string[] = [];
  if (repo.language) tags.push(repo.language);
  repo.topics.slice(0, 3).forEach((t) => tags.push(t));
  if (tags.length === 0) tags.push('Open Source');
  if (tags.length === 1 && category === 'Intelligent Workflows') tags.push('AI Systems');
  if (tags.length === 1 && category === 'Web Products') tags.push('Fullstack');

  const title = repo.name.replace(/[-_]/g, ' ');
  const liveStatus = repo.homepage ? 'Live in Production' : 'Active Public Open Source';
  const techStack = [...new Set([...(repo.language ? [repo.language] : []), ...enrich.techStack])].slice(0, 12);
  const contribution =
    enrich.highlights.length > 0
      ? enrich.highlights.slice(0, 3)
      : ['Architected the core system modules and codebase structure.'];
  const highlights =
    enrich.highlights.length > 0
      ? enrich.highlights
      : [
          repo.stargazerCount > 0
            ? `${repo.stargazerCount} GitHub Stars from the developer community.`
            : 'Hosted publicly with transparent open-source code on GitHub.',
        ];

  return {
    type: 'project',
    title,
    slug,
    locale: 'en',
    status: 'draft',
    sortOrder: index + 1,
    featured: false,
    references: [],
    seo: {
      title,
      description: summary,
    },
    data: {
      title,
      slug,
      year,
      index: String(index + 1).padStart(2, '0'),
      category,
      summary,
      accent: getAccentByIndex(index),
      tags: tags.slice(0, 4),
      techStack,
      status: repo.homepage ? 'In Production' : 'Open Source',
      featured: false,
      demoUrl: repo.homepage || enrich.demoUrl || undefined,
      repoUrl: repo.html_url,
      coverImage: enrich.coverUrl,
      coverAlt: enrich.coverAlt,
      caseStudy: {
        overview: {
          product: repo.name,
          targetUsers: 'Developers, businesses and end-users',
          timeline: `${year} - Active`,
          role: 'Creator & Maintainer',
          status: liveStatus,
        },
        problem: summary,
        contribution,
        approach: {
          summary:
            enrich.approachSummary ||
            'Engineered using clean architecture principles with strong static typing and verifiable test coverage.',
          architecturePoints: ['Separation of concerns between business logic and transport protocols.'],
        },
        highlights,
        outcomes:
          enrich.outcomes.length > 0
            ? enrich.outcomes
            : ['Successfully deployed and actively maintained in production.'],
        lessons:
          enrich.lessons.length > 0
            ? enrich.lessons
            : [
                'Clear architectural boundaries accelerate both feature delivery and long-term maintainability.',
              ],
      },
    },
  };
}

function isGenericContribution(items: string[] | undefined): boolean {
  return !items || items.length === 0 || (items.length === 1 && items[0] === GENERIC_CONTRIBUTION);
}

function isGenericTextList(items: string[] | undefined, generic: string): boolean {
  return !items || items.length === 0 || (items.length === 1 && items[0] === generic);
}

function patchCaseStudy(
  existing: unknown,
  summary: string | undefined,
  repo: GithubRepo,
  enrich: RepoEnrichment & { readmeImages: Array<{ alt: string; url: string }> }
): ProjectData['caseStudy'] | null {
  const cs = (existing || {}) as Partial<ProjectCaseStudy>;
  const year = repo.created_at ? new Date(repo.created_at).getFullYear().toString() : '2026';
  const liveStatus = repo.homepage ? 'Live in Production' : 'Active Public Open Source';
  const genericHighlights =
    repo.stargazerCount > 0
      ? [`${repo.stargazerCount} GitHub Stars from the developer community.`]
      : [GENERIC_HIGHLIGHT_HOSTED];
  const keepMined = (current: string[] | undefined, mined: string[], generic: string[]) =>
    mined.length > 0 ? mined : current && current.length > 0 ? current : generic;
  const next: ProjectData['caseStudy'] = {
    overview: {
      product: cs.overview?.product || repo.name,
      targetUsers: cs.overview?.targetUsers || 'Developers, businesses and end-users',
      timeline: cs.overview?.timeline || `${year} - Active`,
      role: cs.overview?.role || 'Creator & Maintainer',
      status: cs.overview?.status || liveStatus,
    },
    problem: !isGenericProblem(cs.problem) && cs.problem ? cs.problem : summary || cs.problem || '',
    contribution:
      !isGenericContribution(cs.contribution) && cs.contribution!.length > 0
        ? cs.contribution!
        : keepMined(cs.contribution, enrich.highlights.slice(0, 3), [GENERIC_CONTRIBUTION]),
    approach: {
      summary:
        cs.approach?.summary && cs.approach.summary !== GENERIC_APPROACH
          ? cs.approach.summary
          : enrich.approachSummary || cs.approach?.summary || GENERIC_APPROACH,
      architecturePoints:
        cs.approach?.architecturePoints?.length && cs.approach.architecturePoints[0] !== ''
          ? cs.approach.architecturePoints
          : ['Separation of concerns between business logic and transport protocols.'],
    },
    highlights:
      cs.highlights?.length &&
      !(cs.highlights.length === 1 &&
        (cs.highlights[0] === GENERIC_HIGHLIGHT_HOSTED || isGenericStarsHighlight(cs.highlights[0])))
        ? cs.highlights
        : keepMined(cs.highlights, enrich.highlights, genericHighlights),
    outcomes:
      !isGenericTextList(cs.outcomes, GENERIC_OUTCOME) && cs.outcomes!.length > 0
        ? cs.outcomes!
        : keepMined(cs.outcomes, enrich.outcomes, [GENERIC_OUTCOME]),
    lessons:
      !isGenericTextList(cs.lessons, GENERIC_LESSON) && cs.lessons!.length > 0
        ? cs.lessons!
        : keepMined(cs.lessons, enrich.lessons, [GENERIC_LESSON]),
  };
  const norm = (v: unknown) => JSON.stringify(v ?? null);
  const orig = (existing || {}) as Partial<ProjectCaseStudy>;
  const changed =
    norm(next.problem) !== norm(orig.problem) ||
    norm(next.contribution) !== norm(orig.contribution) ||
    norm(next.approach) !== norm(orig.approach) ||
    norm(next.highlights) !== norm(orig.highlights) ||
    norm(next.outcomes) !== norm(orig.outcomes) ||
    norm(next.lessons) !== norm(orig.lessons) ||
    norm(next.overview) !== norm(orig.overview);
  return changed ? next : null;
}

export async function syncGithubProjects(): Promise<GithubSyncResult> {
  const existing = await getEntries({ type: 'project' });
  const bySlug = new Map<string, CmsEntry<ProjectData>>();
  const byRepoUrl = new Map<string, CmsEntry<ProjectData>>();
  existing.forEach((e) => {
    const entry = e as CmsEntry<ProjectData>;
    const data = (entry.data || {}) as Partial<ProjectData>;
    if (entry.slug) bySlug.set(entry.slug, entry);
    if (data.slug) bySlug.set(data.slug, entry);
    if (data.repoUrl) byRepoUrl.set(data.repoUrl, entry);
  });

  let privateSkipped = 0;
  const repos = (await fetchGithubRepos()).filter((r) => {
    if (IGNORED_REPOS.includes(r.name.toLowerCase())) return false;
    if (r.fork && (!r.description || r.description.trim().length === 0)) return false;
    if (r.private) {
      privateSkipped += 1;
      return false;
    }
    return true;
  });

  const result: GithubSyncResult = {
    reposSeen: repos.length,
    created: 0,
    updated: 0,
    skipped: 0,
    privateSkipped,
    coversUploaded: 0,
    failed: [],
    createdEntries: [],
    updatedEntries: [],
  };

  const tokenPresent = !!process.env.GITHUB_TOKEN;

  async function collectEnrichment(
    repo: GithubRepo,
    readme: string | null
  ): Promise<RepoEnrichment & { readmeImages: Array<{ alt: string; url: string }> }> {
    const [owner] = repo.full_name.split('/');
    const sections = readme ? enrichFromReadme(readme, repo.description, owner, repo.name) : null;
    const techStack: string[] = [];
    if (tokenPresent) {
      const langs = await fetchRepoLanguages(repo);
      for (const t of [...(repo.language ? [repo.language] : []), ...langs]) {
        if (t && !techStack.includes(t)) techStack.push(t);
      }
    } else if (repo.language) {
      techStack.push(repo.language);
    }
    for (const t of sections?.techStack ?? []) {
      if (t && !techStack.includes(t) && techStack.length < 12) techStack.push(t);
    }
    return {
      techStack,
      demoUrl: sections?.demoUrl,
      highlights: sections?.caseStudy.highlights ?? [],
      approachSummary: sections?.caseStudy.approachSummary ?? '',
      outcomes: sections?.caseStudy.outcomes ?? [],
      lessons: sections?.caseStudy.lessons ?? [],
      coverUrl: undefined,
      coverAlt: undefined,
      readmeImages: sections?.coverImages ?? [],
    };
  }

  async function uploadCover(
    repo: GithubRepo,
    title: string,
    slug: string,
    images: Array<{ alt: string; url: string }>
  ): Promise<{ url: string; alt: string } | null> {
    if (!tokenPresent) return null;
    const candidates = [...images];
    const [owner] = repo.full_name.split('/');
    candidates.push({
      alt: `${title} preview`,
      url: `https://opengraph.githubassets.com/1/${owner}/${repo.name}`,
    });
    for (const img of candidates.slice(0, 3)) {
      const uploaded = await tryUploadCoverImage(repo, img.url, img.alt || `${title} preview`, title, slug, img.url.includes('opengraph.githubassets.com'));
      if (uploaded) return uploaded;
    }
    return null;
  }

  let dataIndex = existing.length;
  for (const repo of repos) {
    const slug = slugify(repo.name);
    // html_url is globally unique; slug alone can collide across owners.
    let knownEntry = byRepoUrl.get(repo.html_url);
    if (!knownEntry) {
      const slugMatch = bySlug.get(slug);
      const slugData = (slugMatch?.data || {}) as Partial<ProjectData>;
      if (slugMatch && !slugData.repoUrl) knownEntry = slugMatch;
    }
    if (!knownEntry) {
      try {
        const readme = await fetchRepoReadme(repo);
        const summary = readmeToSummary(readme, repo.description);
        const enrich = await collectEnrichment(repo, readme);
        const title = repo.name.replace(/[-_]/g, ' ');
        const cover = await uploadCover(repo, title, slug, enrich.readmeImages);
        if (cover) result.coversUploaded += 1;
        const payload = mapRepoToProjectEntry(repo, summary, dataIndex, {
          techStack: enrich.techStack,
          demoUrl: enrich.demoUrl,
          highlights: enrich.highlights,
          approachSummary: enrich.approachSummary,
          outcomes: enrich.outcomes,
          lessons: enrich.lessons,
          coverUrl: cover?.url,
          coverAlt: cover?.alt,
        });
        const created: CmsEntry<ProjectData> = await createEntry(payload, 'owner');
        bySlug.set(slug, created);
        byRepoUrl.set(repo.html_url, created);
        dataIndex += 1;
        result.created += 1;
        result.createdEntries.push(created);
      } catch (err) {
        result.failed.push({ repo: repo.name, error: (err as Error).message });
      }
      continue;
    }
    // Backfill missing fields; never overwrite hand-written content.
    try {
      const data = (knownEntry.data || {}) as Partial<ProjectData>;
      const patch: Partial<ProjectData> = {};
      if (!data.repoUrl) patch.repoUrl = repo.html_url;
      if (!data.demoUrl && repo.homepage) patch.demoUrl = repo.homepage;

      const cs = (data.caseStudy || {}) as Partial<ProjectCaseStudy>;
      const csMissing =
        !data.caseStudy ||
        !cs.problem ||
        !cs.contribution?.length ||
        !cs.highlights?.length ||
        !cs.approach?.summary ||
        !cs.outcomes?.length ||
        !cs.lessons?.length;
      const csGeneric =
        isGenericProblem(cs.problem) ||
        (cs.highlights?.length === 1 &&
          (cs.highlights[0] === GENERIC_HIGHLIGHT_HOSTED || isGenericStarsHighlight(cs.highlights[0])));
      const demoMissing = !data.demoUrl && !repo.homepage;
      const needsEnrich =
        !data.techStack?.length || demoMissing || !data.coverImage || csMissing || csGeneric;

      let readme: string | null = null;
      let enrich: (RepoEnrichment & { readmeImages: Array<{ alt: string; url: string }> }) | null = null;
      if (!data.summary || needsEnrich) {
        readme = await fetchRepoReadme(repo);
        if (!data.summary) patch.summary = readmeToSummary(readme, repo.description);
      }
      if (needsEnrich) {
        enrich = await collectEnrichment(repo, readme);
        if (!data.techStack?.length && enrich.techStack.length > 0) {
          patch.techStack = enrich.techStack;
        }
        if (demoMissing && enrich.demoUrl) {
          patch.demoUrl = enrich.demoUrl;
        }
        const patchedCs = patchCaseStudy(data.caseStudy, patch.summary ?? data.summary, repo, enrich);
        if (patchedCs) patch.caseStudy = patchedCs as ProjectData['caseStudy'];
        if (!data.coverImage) {
          const title = (data.title as string) || knownEntry.title || repo.name;
          const cover = await uploadCover(repo, title, data.slug || slug, enrich.readmeImages);
          if (cover) {
            patch.coverImage = cover.url;
            if (!data.coverAlt) patch.coverAlt = cover.alt;
            result.coversUploaded += 1;
          }
        }
      } else if (!data.caseStudy) {
        if (readme === null && patch.summary === undefined) {
          readme = await fetchRepoReadme(repo);
        }
        const summary = patch.summary ?? data.summary ?? readmeToSummary(readme, repo.description);
        if (!data.summary) patch.summary = summary;
        patch.caseStudy = mapRepoToProjectEntry(repo, summary, 0).data.caseStudy;
      }
      if (Object.keys(patch).length === 0) {
        result.skipped += 1;
        continue;
      }
      const { entry } = await saveDraft(knownEntry._id, { data: { ...data, ...patch } });
      result.updated += 1;
      result.updatedEntries.push(entry as CmsEntry<ProjectData>);
    } catch (err) {
      result.failed.push({ repo: repo.name, error: (err as Error).message });
    }
  }

  return result;
}
