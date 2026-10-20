const API_BASE = process.env.API_BASE_URL || 'http://localhost:9000';

export interface ApiPublication {
  id: string;
  type: string;
  key: string | null;
  slug: string | null;
  locale: string;
  data: Record<string, any>;
  seo: Record<string, any>;
  schemaVersion: number;
  sourceRevision: number;
  publishedAt: string;
}

async function get<T>(path: string, tag: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      headers: { Accept: 'application/json' },
      next: { tags: [`cms-${tag}`] },
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return (payload?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export function fetchPublicationList(type: string): Promise<ApiPublication[] | null> {
  const plural: Record<string, string> = {
    project: 'projects',
    note: 'notes',
    experiment: 'experiments',
    capability: 'capabilities',
    skill: 'skills',
    experience: 'experiences',
  };
  return get<ApiPublication[]>(`/public/${plural[type] ?? type}?limit=100`, type);
}

export function fetchPublicationOne(
  type: 'page' | 'project' | 'note' | 'experiment',
  slugOrKey: string,
): Promise<ApiPublication | null> {
  if (type === 'page') return get<ApiPublication>(`/public/pages/${slugOrKey}`, 'page');
  const singular: Record<string, string> = { project: 'projects', note: 'notes', experiment: 'experiments' };
  return get<ApiPublication>(`/public/${singular[type]}/${slugOrKey}`, type);
}

export function fetchGlobals(): Promise<Record<string, ApiPublication> | null> {
  return get<Record<string, ApiPublication>>('/public/globals', 'globals');
}

export function apiBase(): string {
  return API_BASE;
}
