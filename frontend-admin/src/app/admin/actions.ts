'use server';

import { revalidatePath } from 'next/cache';
import { login, logout, isAuthenticated } from '@/lib/auth';
import {
  saveDraft,
  createEntry,
  publishEntry,
  unpublishEntry,
  archiveEntry,
  deleteEntry,
  restoreRevision,
  addMedia,
  deleteMedia,
  updateGlobals,
  getGlobals,
} from '@/lib/cms/service';
import { CmsEntry, CmsGlobals } from '@/types';

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
