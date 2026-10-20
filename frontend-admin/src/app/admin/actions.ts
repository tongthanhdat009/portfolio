'use server';

import { revalidatePath } from 'next/cache';
import { login, logout, isAuthenticated } from '@/lib/auth';
import {
  saveDraft,
  createEntry,
  publishEntry,
  unpublishEntry,
  archiveEntry,
  restoreEntry,
  deleteEntry,
  restoreRevision,
  addMedia,
  deleteMedia,
  updateGlobals,
  getGlobals,
  getEntryByKey,
} from '@/lib/cms/service';
import { CmsEntry, CmsGlobals } from '@/types';
import { defaultHomeBlocks } from '@/lib/page-blocks';
import { importCv, CvImportResult } from '@/lib/cv-import';
import { syncGithubProjects, GithubSyncResult } from '@/lib/github';

async function checkAuth() {
  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function loginAction(email: string, password: string) {
  const success = await login(email, password);
  if (success) {
    revalidatePath('/admin');
  }
  return { success };
}

export async function logoutAction() {
  await logout();
  revalidatePath('/admin');
}

export async function saveDraftAction(
  id: string,
  entryUpdate: Partial<CmsEntry>,
  expectedRevision?: number
) {
  await checkAuth();
  const res = await saveDraft(id, entryUpdate, 'owner', expectedRevision);
  revalidatePath('/admin');
  revalidatePath(`/admin/content`);
  return res;
}

export async function createEntryAction(
  newEntry: Omit<CmsEntry, '_id' | 'revision' | 'createdAt' | 'updatedAt' | 'hasUnpublishedChanges'>
) {
  await checkAuth();
  const res = await createEntry(newEntry, 'owner');
  revalidatePath('/admin');
  revalidatePath('/admin/content');
  return res;
}

export async function publishEntryAction(id: string) {
  await checkAuth();
  const res = await publishEntry(id, 'owner');
  revalidatePath('/admin');
  revalidatePath('/admin/publishing');
  revalidatePath('/admin/content');
  return res;
}

export async function unpublishEntryAction(id: string) {
  await checkAuth();
  const res = await unpublishEntry(id, 'owner');
  revalidatePath('/admin');
  revalidatePath('/admin/publishing');
  revalidatePath('/admin/content');
  return res;
}

export async function archiveEntryAction(id: string) {
  await checkAuth();
  const res = await archiveEntry(id, 'owner');
  revalidatePath('/admin');
  revalidatePath('/admin/content');
  return res;
}

export async function deleteEntryAction(id: string) {
  await checkAuth();
  const res = await deleteEntry(id, 'owner');
  revalidatePath('/admin');
  revalidatePath('/admin/content');
  return { success: res };
}

export async function restoreEntryAction(id: string) {
  await checkAuth();
  const res = await restoreEntry(id, 'owner');
  revalidatePath('/admin');
  revalidatePath('/admin/content');
  return res;
}

export async function seedHomeAction() {  await checkAuth();
  const existing = await getEntryByKey('home');
  if (existing) return existing;
  const created = await createEntry(
    {
      type: 'page',
      key: 'home',
      title: 'Home',
      locale: 'en',
      status: 'draft',
      sortOrder: 0,
      featured: false,
      references: [],
      seo: { title: 'Home' },
      data: { blocks: defaultHomeBlocks() },
    },
    'owner'
  );
  revalidatePath('/admin/content/pages/home');
  return created;
}

export async function restoreRevisionAction(entryId: string, revisionNumber: number) {
  await checkAuth();
  const res = await restoreRevision(entryId, revisionNumber, 'owner');
  revalidatePath('/admin');
  revalidatePath(`/admin/history`);
  return res;
}

export async function addMediaAction(asset: {
  filename: string;
  storageKey: string;
  url: string;
  mimeType: string;
  size: number;
  dimensions: { width: number; height: number };
  alt: string;
}) {
  await checkAuth();
  const res = await addMedia(asset, 'owner');
  revalidatePath('/admin/media');
  return res;
}

export async function deleteMediaAction(id: string) {
  await checkAuth();
  const res = await deleteMedia(id, 'owner');
  revalidatePath('/admin/media');
  return res;
}

export async function updateGlobalsAction(updates: Partial<CmsGlobals>) {
  await checkAuth();
  const res = await updateGlobals(updates, 'owner');
  revalidatePath('/admin/settings');
  return res;
}

export async function revalidatePublicCacheAction() {
  await checkAuth();
  // Simulates or triggers revalidation of public routes
  try {
    revalidatePath('/', 'layout');
    return { success: true, message: 'All public routes and tags invalidated successfully.' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function syncGithubAction(): Promise<GithubSyncResult> {
  await checkAuth();
  const res = await syncGithubProjects();
  revalidatePath('/admin');
  revalidatePath('/admin/content');
  revalidatePath('/admin/content/projects');
  return res;
}

export async function importCvAction(): Promise<CvImportResult> {
  await checkAuth();
  const res = await importCv();
  revalidatePath('/admin');
  revalidatePath('/admin/content');
  return res;
}
