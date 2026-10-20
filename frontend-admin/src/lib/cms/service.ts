import { apiFetch } from '../api/client';
import {
  CmsEntry,
  CmsPublication,
  CmsRevision,
  CmsGlobals,
  MediaAsset,
  AuditLog,
  ContentType,
  EntryStatus,
  ContentHealthIssue,
  RedirectRule,
} from '@/types';

function toEntry(r: any): CmsEntry {
  return {
    _id: String(r.id),
    type: r.type as ContentType,
    key: r.key ?? undefined,
    slug: r.slug ?? undefined,
    locale: r.locale ?? 'en',
    title: r.title ?? '',
    status: r.status as EntryStatus,
    data: r.data ?? {},
    seo: {
      title: r.seo?.title,
      description: r.seo?.description,
      ogImage: r.seo?.ogMediaId,
      keywords: r.seo?.keywords,
      canonicalUrl: r.seo?.canonicalUrl,
    },
    references: r.references ?? [],
    featured: r.featured,
    sortOrder: r.sortOrder ?? 0,
    revision: r.revision ?? 1,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    createdBy: r.createdBy,
    updatedBy: r.updatedBy,
    publishedAt: r.publishedAt,
    lastPublishedRevision: r.lastPublishedRevision,
    hasUnpublishedChanges: r.hasUnpublishedChanges,
    archivedAt: r.archivedAt,
  };
}

function toApiPayload(entry: Partial<CmsEntry>): Record<string, any> {  const { _id, id, createdAt, updatedAt, revision, hasUnpublishedChanges, publishedAt, lastPublishedRevision, archivedAt, createdBy, updatedBy, ...rest } = entry as any;
  const payload: Record<string, any> = { ...rest };
  if (payload.seo) {
    const { ogImage, ...seoRest } = payload.seo;
    payload.seo = { ...seoRest, ...(ogImage ? { ogMediaId: ogImage } : {}) };
  }
  return payload;
}

/**
 * apiFetch already unwraps the `{ data }` envelope, so list endpoints resolve
 * to a bare array. Accept both shapes defensively.
 */
function asList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === 'object' && Array.isArray((res as { data?: unknown }).data)) {
    return (res as { data: T[] }).data;
  }
  return [];
}

export async function getEntries(filter?: {
  type?: ContentType;
  status?: EntryStatus | 'all';
  search?: string;
  category?: string;
  sort?: 'updated' | 'order' | 'title';
}): Promise<CmsEntry[]> {
  const query: Record<string, string | number | undefined> = { limit: 100 };
  if (filter?.type) query.type = filter.type;
  if (filter?.status && filter.status !== 'all') query.status = filter.status;
  if (filter?.search) query.q = filter.search;

  const res = await apiFetch<{ data: any[] }>('/admin/entries', { query });
  let items = asList<any>(res).map(toEntry);

  if (filter?.category && filter.category !== 'all') {
    items = items.filter((i) => i.data?.category === filter.category);
  }

  if (filter?.sort === 'order') {
    items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } else if (filter?.sort === 'title') {
    items.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  return items;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

const DEFAULT_PER_PAGE = 10;

function toPaged<T>(
  envelope: { data?: any[]; meta?: { current_page?: number; per_page?: number; total?: number; last_page?: number } } | null | undefined,
  map: (r: any) => T,
  fallbackPerPage: number
): PagedResult<T> {
  const list = Array.isArray(envelope?.data) ? envelope.data : [];
  const meta = envelope?.meta ?? {};
  const total = meta.total ?? list.length;
  const perPage = meta.per_page ?? fallbackPerPage;
  const page = meta.current_page ?? 1;
  return {
    items: list.map(map),
    total,
    page,
    perPage,
    lastPage: meta.last_page ?? Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getEntriesPaged(filter?: {
  type?: ContentType;
  status?: EntryStatus | 'all' | EntryStatus[];
  search?: string;
  category?: string;
  sort?: 'updated' | 'order';
  page?: number;
  perPage?: number;
}): Promise<PagedResult<CmsEntry>> {
  const perPage = filter?.perPage ?? DEFAULT_PER_PAGE;
  const query: Record<string, string | number | undefined> = {
    limit: perPage,
    page: filter?.page ?? 1,
  };
  if (filter?.type) query.type = filter.type;
  if (Array.isArray(filter?.status)) {
    filter.status.forEach((s, i) => {
      query[`status[${i}]`] = s;
    });
  } else if (filter?.status && filter.status !== 'all') {
    query.status = filter.status;
  }
  if (filter?.search) query.q = filter.search;
  if (filter?.category && filter.category !== 'all') query.category = filter.category;
  if (filter?.sort) query.sort = filter.sort;
  const envelope = await apiFetch<{ data: any[]; meta: any }>('/admin/entries', { query, raw: true });
  return toPaged(envelope, toEntry, perPage);
}

export async function getEntryById(id: string): Promise<CmsEntry | null> {
  try {
    const data = await apiFetch<any>(`/admin/entries/${id}`);
    return toEntry(data);
  } catch (e: any) {
    if (e?.status === 404) return null;
    throw e;
  }
}

export async function getEntryByKey(key: string): Promise<CmsEntry | null> {
  const pageKeys = ['home', 'about', 'contact'];
  try {
    if (pageKeys.includes(key)) {
      const data = await apiFetch<any>(`/admin/pages/${key}`);
      return toEntry(data);
    }
    const res = await apiFetch<{ data: any[] }>('/admin/entries', { query: { limit: 100 } });
    const found = asList<any>(res).find((r: any) => r.key === key);
    return found ? toEntry(found) : null;
  } catch (e: any) {
    if (e?.status === 404) return null;
    throw e;
  }
}

async function resolveRevision(id: string, expectedRevision?: number): Promise<number> {
  if (expectedRevision !== undefined) return expectedRevision;
  const entry = await getEntryById(id);
  if (!entry) throw new Error(`Entry ${id} not found`);
  return entry.revision;
}

export async function saveDraft(
  id: string,
  entryUpdate: Partial<CmsEntry>,
  actor: string = 'owner',
  expectedRevision?: number
): Promise<{ entry: CmsEntry; revision: number }> {
  void actor;
  const revision = await resolveRevision(id, expectedRevision);
  const data = await apiFetch<any>(`/admin/entries/${id}`, {
    method: 'PATCH',
    body: { ...toApiPayload(entryUpdate), expectedRevision: revision },
  });
  const entry = toEntry(data);
  return { entry, revision: entry.revision };
}

export async function createEntry(
  newEntry: Omit<CmsEntry, '_id' | 'revision' | 'createdAt' | 'updatedAt' | 'hasUnpublishedChanges'>,
  actor: string = 'owner'
): Promise<CmsEntry> {
  void actor;
  const data = await apiFetch<any>('/admin/entries', {
    method: 'POST',
    body: toApiPayload(newEntry),
  });
  return toEntry(data);
}

export async function publishEntry(
  id: string,
  actor: string = 'owner'
): Promise<{ publication: CmsPublication; entry: CmsEntry }> {
  void actor;
  const current = await getEntryById(id);
  if (!current) throw new Error(`Entry ${id} not found`);

  await apiFetch<any>(`/admin/entries/${id}/publish`, {
    method: 'POST',
    body: { expectedRevision: current.revision },
  });

  const entry = (await getEntryById(id))!;
  const publication: CmsPublication = {
    _id: `pub_${entry._id}`,
    entryId: entry._id,
    type: entry.type,
    slug: entry.slug,
    locale: entry.locale,
    key: entry.key,
    publicData: entry.data,
    publicSeo: entry.seo,
    publishedAt: entry.publishedAt || new Date().toISOString(),
    sourceRevision: entry.lastPublishedRevision ?? entry.revision,
    referencedIds: entry.references,
    schemaVersion: 1,
  };
  return { publication, entry };
}

export async function unpublishEntry(
  id: string,
  actor: string = 'owner'
): Promise<CmsEntry> {
  void actor;
  await apiFetch<any>(`/admin/entries/${id}/unpublish`, { method: 'POST', body: {} });
  const entry = await getEntryById(id);
  if (!entry) throw new Error(`Entry ${id} not found`);
  return entry;
}

export async function archiveEntry(
  id: string,
  actor: string = 'owner'
): Promise<CmsEntry> {
  void actor;
  const data = await apiFetch<any>(`/admin/entries/${id}/archive`, { method: 'POST', body: {} });
  return toEntry(data);
}

export async function restoreEntry(
  id: string,
  actor: string = 'owner'
): Promise<CmsEntry> {
  void actor;
  const data = await apiFetch<any>(`/admin/entries/${id}/restore`, { method: 'POST', body: {} });
  return toEntry(data);
}

export async function deleteEntry(id: string, actor: string = 'owner'): Promise<boolean> {
  await archiveEntry(id, actor);
  return true;
}

function toRevision(entryId: string, r: any): CmsRevision {
  return {
    _id: `rev_${entryId}_${r.revision}`,
    entryId,
    revision: r.revision,
    action: r.revision === 1 ? 'created' : 'saved',
    actor: r.actorId ?? '',
    summary: r.changeSummary ?? '',
    snapshot: undefined,
    createdAt: r.createdAt,
  };
}

export async function getRevisions(entryId: string): Promise<CmsRevision[]> {
  const res = await apiFetch<{ data: any[] }>(`/admin/entries/${entryId}/revisions`, {
    query: { limit: 50 },
  });
  const items = asList<any>(res);
  return items.map((r: any) => toRevision(entryId, r));
}

export async function getRevisionsPaged(
  entryId: string,
  opts?: { page?: number; perPage?: number }
): Promise<PagedResult<CmsRevision>> {
  const perPage = opts?.perPage ?? DEFAULT_PER_PAGE;
  const envelope = await apiFetch<{ data: any[]; meta: any }>(`/admin/entries/${entryId}/revisions`, {
    query: { limit: perPage, page: opts?.page ?? 1 },
    raw: true,
  });
  return toPaged(envelope, (r: any) => toRevision(entryId, r), perPage);
}

export async function restoreRevision(
  entryId: string,
  revisionNumber: number,
  actor: string = 'owner'
): Promise<CmsEntry> {
  void actor;
  const data = await apiFetch<any>(`/admin/entries/${entryId}/restore-revision`, {
    method: 'POST',
    body: { revision: revisionNumber },
  });
  return toEntry(data);
}

function toMediaAsset(r: any): MediaAsset {
  return {
    _id: String(r.id),
    filename: r.filename ?? '',
    storageKey: r.storageKey ?? '',
    url: r.url ?? '',
    mimeType: r.mimeType ?? '',
    size: r.size ?? 0,
    dimensions: { width: r.width ?? 0, height: r.height ?? 0 },
    alt: r.alt ?? '',
    caption: r.caption,
    usageReferences: [],
    createdAt: r.createdAt,
  };
}

export async function getMedia(filter?: { search?: string; type?: string }): Promise<MediaAsset[]> {
  const query: Record<string, string | number | undefined> = { limit: 100 };
  if (filter?.search) query.q = filter.search;
  if (filter?.type && filter.type !== 'all') query.mimeType = filter.type;
  const res = await apiFetch<{ data: any[] }>('/admin/media', { query });
  return asList<any>(res).map((r: any) =>
    toMediaAsset({ ...r.asset, url: r.url ?? r.asset?.url })
  );
}

export async function getMediaPaged(filter?: {
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<PagedResult<MediaAsset>> {
  const perPage = filter?.perPage ?? DEFAULT_PER_PAGE;
  const query: Record<string, string | number | undefined> = {
    limit: perPage,
    page: filter?.page ?? 1,
  };
  if (filter?.search) query.q = filter.search;
  const envelope = await apiFetch<{ data: any[]; meta: any }>('/admin/media', { query, raw: true });
  return toPaged(
    envelope,
    (r: any) => toMediaAsset({ ...r.asset, url: r.url ?? r.asset?.url }),
    perPage
  );
}

export async function addMedia(
  asset: Omit<MediaAsset, '_id' | 'createdAt' | 'usageReferences'>,
  actor: string = 'owner'
): Promise<MediaAsset> {
  void actor;
  const mimeType = asset.mimeType || 'image/jpeg';
  const usage = mimeType === 'application/pdf' ? 'resumes' : mimeType.startsWith('image/') ? 'projects' : 'site';

  const issued = await apiFetch<any>('/admin/media/uploads', {
    method: 'POST',
    body: {
      filename: asset.filename,
      mimeType,
      size: asset.size || 1024,
      usage,
      visibility: 'public',
      alt: asset.alt ?? '',
    },
  });

  const bytesRes = await fetch(asset.url);
  if (!bytesRes.ok) {
    throw new Error(`Could not fetch source file for import (status ${bytesRes.status}).`);
  }
  const bytes = new Uint8Array(await bytesRes.arrayBuffer());

  const putRes = await fetch(issued.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType, 'Content-Length': String(bytes.byteLength) },
    body: bytes,
  });
  if (!putRes.ok) {
    throw new Error(`Direct upload to object storage failed (status ${putRes.status}).`);
  }

  const completed = await apiFetch<any>(`/admin/media/uploads/${issued.uploadId}/complete`, {
    method: 'POST',
    body: {},
  });

  const id = String(completed.asset.id);
  const patched = await apiFetch<any>(`/admin/media/${id}`, {
    method: 'PATCH',
    body: {
      alt: asset.alt ?? '',
      ...(asset.dimensions ? { width: asset.dimensions.width, height: asset.dimensions.height } : {}),
    },
  });

  const shown = await apiFetch<any>(`/admin/media/${id}`);
  void patched;
  return toMediaAsset({ ...shown.asset, url: shown.url });
}

export async function updateMediaAlt(id: string, alt: string): Promise<MediaAsset | null> {
  try {
    const data = await apiFetch<any>(`/admin/media/${id}`, { method: 'PATCH', body: { alt } });
    const shown = await apiFetch<any>(`/admin/media/${id}`);
    return toMediaAsset({ ...data, url: shown.url });
  } catch (e: any) {
    if (e?.status === 404) return null;
    throw e;
  }
}

export async function deleteMedia(
  id: string,
  actor: string = 'owner'
): Promise<{ success: boolean; blockedReason?: string }> {
  void actor;
  try {
    await apiFetch<any>(`/admin/media/${id}`, { method: 'DELETE' });
    return { success: true };
  } catch (e: any) {
    if (e?.status === 404) return { success: false, blockedReason: 'Asset not found' };
    if (e?.status === 409) {
      return {
        success: false,
        blockedReason: e.message || 'Cannot delete: this asset is currently referenced. Remove the references first.',
      };
    }
    throw e;
  }
}

const SITE_KEY = 'site';

export async function getGlobals(): Promise<CmsGlobals> {
  let site: any = {};
  try {
    const data = await apiFetch<any>(`/admin/globals/${SITE_KEY}`);
    // apiFetch unwraps the {data} envelope; the resource nests the payload
    // one more level under `data`.
    site = data?.data ?? {};
  } catch (e: any) {
    if (e?.status !== 404) throw e;
  }

  let redirects: RedirectRule[] = [];
  try {
    const res = await apiFetch<{ data: any[] }>('/admin/redirects', { query: { limit: 100 } });
    redirects = asList<any>(res).map((r: any) => ({
      id: String(r.id),
      source: r.fromPath,
      destination: r.toPath,
      permanent: true,
      createdAt: r.createdAt,
    }));
  } catch {
    redirects = [];
  }

  return {
    siteSettings: site.siteSettings ?? ({} as CmsGlobals['siteSettings']),
    announcement: site.announcement ?? ({} as CmsGlobals['announcement']),
    navigation: site.navigation ?? [],
    appearance: site.appearance ?? { accentPreset: 'sun' },
    redirects,
  };
}

export async function updateGlobals(
  updates: Partial<CmsGlobals>,
  actor: string = 'owner'
): Promise<CmsGlobals> {
  void actor;
  const { redirects, ...siteUpdates } = updates;

  let revision = 0;
  try {
    const current = await apiFetch<any>(`/admin/globals/${SITE_KEY}`);
    // `current` is the resource; the editable payload lives under `data`.
    const currentData = current?.data ?? {};
    revision = current?.revision ?? 0;
    const merged = { ...currentData, ...siteUpdates };
    await apiFetch<any>(`/admin/globals/${SITE_KEY}`, {
      method: 'PATCH',
      body: { data: merged, expectedRevision: revision },
    });
  } catch (e: any) {
    if (e?.status === 404) {
      await apiFetch<any>(`/admin/globals/${SITE_KEY}`, {
        method: 'PATCH',
        body: { data: siteUpdates, expectedRevision: 0 },
      });
    } else {
      throw e;
    }
  }

  // Publish the globals snapshot so the public site picks up the change.
  // Settings edits are low-risk and the UI offers no separate publish step.
  const fresh = await apiFetch<any>(`/admin/globals/${SITE_KEY}`);
  await apiFetch<any>(`/admin/globals/${SITE_KEY}/publish`, {
    method: 'POST',
    body: { expectedRevision: fresh?.revision ?? 0 },
  });

  if (redirects) {
    const existing = await apiFetch<{ data: any[] }>('/admin/redirects', { query: { limit: 100 } });
    const existingList: any[] = asList<any>(existing);
    const wanted = new Map(redirects.map((r) => [r.source, r.destination]));

    for (const cur of existingList) {
      if (!wanted.has(cur.fromPath)) {
        await apiFetch<any>(`/admin/redirects/${cur.id}`, { method: 'DELETE' });
      } else if (wanted.get(cur.fromPath) !== cur.toPath) {
        await apiFetch<any>(`/admin/redirects/${cur.id}`, { method: 'DELETE' });
        await apiFetch<any>('/admin/redirects', {
          method: 'POST',
          body: { fromPath: cur.fromPath, toPath: wanted.get(cur.fromPath) },
        });
      }
    }
    for (const [source, destination] of wanted) {
      if (!existingList.some((cur: any) => cur.fromPath === source)) {
        await apiFetch<any>('/admin/redirects', { method: 'POST', body: { fromPath: source, toPath: destination } });
      }
    }
  }

  return getGlobals();
}

export async function getContentHealth(): Promise<ContentHealthIssue[]> {
  const allEntries = await getEntries();
  const issues: ContentHealthIssue[] = [];

  for (const entry of allEntries) {
    if (entry.data?.coverImage && !entry.data?.coverAlt) {
      issues.push({
        id: `alt_${entry._id}`,
        level: 'warning',
        title: 'Missing cover image alt text',
        description: `Project "${entry.title}" has a cover image but lacks an accessible alt description.`,
        targetType: entry.type,
        targetId: entry._id,
        targetTitle: entry.title,
        fixAction: `/admin/content/projects/${entry._id}?tab=media`,
      });
    }

    if (!entry.seo?.description || entry.seo.description.trim().length < 15) {
      issues.push({
        id: `seo_${entry._id}`,
        level: 'suggestion',
        title: 'Short or missing SEO description',
        description: `Entry "${entry.title}" has a missing or brief meta description.`,
        targetType: entry.type,
        targetId: entry._id,
        targetTitle: entry.title,
        fixAction: `/admin/content/${entry.type === 'page' ? 'pages/home' : entry.type + 's/' + entry._id}?tab=seo`,
      });
    }

    if (entry.type === 'page' && entry.data?.sections) {
      for (const sec of entry.data.sections) {
        if (sec.type === 'hero_poster' && sec.props?.featuredProjectId) {
          const featuredProj = allEntries.find((e: CmsEntry) => e._id === sec.props.featuredProjectId);
          if (featuredProj && featuredProj.status !== 'published') {
            issues.push({
              id: `unpub_ref_${entry._id}`,
              level: 'blocker',
              title: 'Homepage features an unpublished project',
              description: `Hero Section references "${featuredProj.title}" which is still in Draft state.`,
              targetType: 'page',
              targetId: entry._id,
              targetTitle: entry.title,
              fixAction: `/admin/content/projects/${featuredProj._id}`,
            });
          }
        }
      }
    }
  }

  return issues;
}

export async function getDashboardMetrics() {
  const allEntries = await getEntries();
  const allMedia = await getMedia();

  const publishedCount = allEntries.filter((e: CmsEntry) => e.status === 'published').length;
  const draftCount = allEntries.filter((e: CmsEntry) => e.status === 'draft' || e.hasUnpublishedChanges).length;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentChangesCount = allEntries.filter((e: CmsEntry) => e.updatedAt >= oneWeekAgo).length;

  const health = await getContentHealth();
  const warningsCount = health.length;

  return {
    publishedCount,
    draftCount,
    recentChangesCount,
    warningsCount,
    totalMediaCount: allMedia.length,
    totalEntriesCount: allEntries.length,
  };
}

const AUDIT_ACTION_MAP: Record<string, AuditLog['action']> = {
  'entry.created': 'create',
  'entry.saved_draft': 'update',
  'entry.published': 'publish',
  'entry.unpublished': 'unpublish',
  'entry.archived': 'update',
  'entry.restored': 'restore',
  'entry.restored_revision': 'restore',
  'media.upload_completed': 'upload',
  'media.deleted': 'delete',
  'global.saved_draft': 'update',
  'global.published': 'publish',
};

export async function getAuditLogs(limit: number = 20): Promise<AuditLog[]> {
  const res = await apiFetch<{ data: any[] }>('/admin/audit-logs', { query: { limit } });
  return asList<any>(res).map((r: any) => ({
    _id: String(r.id),
    actor: r.actorId ?? '',
    action: AUDIT_ACTION_MAP[r.event] ?? 'update',
    targetType: r.resourceType ?? '',
    targetId: r.resourceId ?? '',
    targetTitle: r.metadata?.title ?? r.resourceId ?? '',
    details: r.metadata?.operationId ? `Operation ${r.metadata.operationId}` : r.event,
    createdAt: r.createdAt,
  }));
}
