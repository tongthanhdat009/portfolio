'use server';

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { revalidatePath } from 'next/cache';
import { Announcement, Project, Experiment, Note } from '@/types';
import {
  verifyAdminPassword,
  setAdminSession,
  clearAdminSession,
  isAuthenticated,
} from '@/lib/admin/auth';
import {
  getAnnouncement,
  getProjects,
  getExperiments,
  getNotes,
} from '@/lib/cms';

const execAsync = promisify(exec);

function getContentFilePath(fileName: string): string {
  const localCandidate = path.resolve(process.cwd(), 'src/content', fileName);
  if (fs.existsSync(localCandidate)) {
    return localCandidate;
  }
  return path.resolve(process.cwd(), 'frontend/src/content', fileName);
}

export async function loginAction(pin: string): Promise<{ success: boolean; error?: string }> {
  const isValid = await verifyAdminPassword(pin);
  if (!isValid) {
    return { success: false, error: 'Invalid security PIN or password.' };
  }
  await setAdminSession();
  revalidatePath('/admin');
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  revalidatePath('/admin');
}

export async function saveAnnouncementAction(data: Announcement): Promise<{ success: boolean; error?: string }> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Unauthorized: Session expired.' };
  }

  try {
    const content = `import { Announcement } from '@/types';\n\nexport const announcementData: Announcement = ${JSON.stringify(
      data,
      null,
      2
    )};\n`;
    fs.writeFileSync(getContentFilePath('announcements.ts'), content, 'utf-8');
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save announcement' };
  }
}

export async function saveProjectAction(
  project: Project,
  isNew: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Unauthorized: Session expired.' };
  }

  try {
    const projects = await getProjects();
    let updated: Project[];

    if (isNew) {
      if (projects.some((p) => p.slug === project.slug)) {
        return { success: false, error: `Project slug "${project.slug}" already exists.` };
      }
      project.order = projects.length + 1;
      project.index = String(project.order).padStart(2, '0');
      updated = [project, ...projects];
    } else {
      updated = projects.map((p) => (p.slug === project.slug ? project : p));
    }

    const content = `import { Project } from '@/types';\n\nexport const projectsData: Project[] = ${JSON.stringify(
      updated,
      null,
      2
    )};\n`;
    fs.writeFileSync(getContentFilePath('projects.ts'), content, 'utf-8');
    revalidatePath('/');
    revalidatePath('/work');
    revalidatePath(`/work/${project.slug}`);
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save project' };
  }
}

export async function deleteProjectAction(slug: string): Promise<{ success: boolean; error?: string }> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Unauthorized: Session expired.' };
  }

  try {
    const projects = await getProjects();
    const updated = projects.filter((p) => p.slug !== slug);
    const content = `import { Project } from '@/types';\n\nexport const projectsData: Project[] = ${JSON.stringify(
      updated,
      null,
      2
    )};\n`;
    fs.writeFileSync(getContentFilePath('projects.ts'), content, 'utf-8');
    revalidatePath('/');
    revalidatePath('/work');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete project' };
  }
}

export async function saveExperimentAction(
  experiment: Experiment,
  isNew: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Unauthorized: Session expired.' };
  }

  try {
    const experiments = await getExperiments();
    let updated: Experiment[];

    if (isNew) {
      if (experiments.some((e) => e.slug === experiment.slug)) {
        return { success: false, error: `Experiment slug "${experiment.slug}" already exists.` };
      }
      updated = [experiment, ...experiments];
    } else {
      updated = experiments.map((e) => (e.slug === experiment.slug ? experiment : e));
    }

    const content = `import { Experiment } from '@/types';\n\nexport const experimentsData: Experiment[] = ${JSON.stringify(
      updated,
      null,
      2
    )};\n`;
    fs.writeFileSync(getContentFilePath('experiments.ts'), content, 'utf-8');
    revalidatePath('/');
    revalidatePath('/lab');
    revalidatePath(`/lab/${experiment.slug}`);
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save experiment' };
  }
}

export async function deleteExperimentAction(slug: string): Promise<{ success: boolean; error?: string }> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Unauthorized: Session expired.' };
  }

  try {
    const experiments = await getExperiments();
    const updated = experiments.filter((e) => e.slug !== slug);
    const content = `import { Experiment } from '@/types';\n\nexport const experimentsData: Experiment[] = ${JSON.stringify(
      updated,
      null,
      2
    )};\n`;
    fs.writeFileSync(getContentFilePath('experiments.ts'), content, 'utf-8');
    revalidatePath('/');
    revalidatePath('/lab');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete experiment' };
  }
}

export async function saveNoteAction(
  note: Note,
  isNew: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Unauthorized: Session expired.' };
  }

  try {
    const notes = await getNotes();
    let updated: Note[];

    if (isNew) {
      if (notes.some((n) => n.slug === note.slug)) {
        return { success: false, error: `Note slug "${note.slug}" already exists.` };
      }
      updated = [note, ...notes];
    } else {
      updated = notes.map((n) => (n.slug === note.slug ? note : n));
    }

    const content = `import { Note } from '@/types';\n\nexport const notesData: Note[] = ${JSON.stringify(
      updated,
      null,
      2
    )};\n`;
    fs.writeFileSync(getContentFilePath('notes.ts'), content, 'utf-8');
    revalidatePath('/');
    revalidatePath('/notes');
    revalidatePath(`/notes/${note.slug}`);
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save note' };
  }
}

export async function deleteNoteAction(slug: string): Promise<{ success: boolean; error?: string }> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Unauthorized: Session expired.' };
  }

  try {
    const notes = await getNotes();
    const updated = notes.filter((n) => n.slug !== slug);
    const content = `import { Note } from '@/types';\n\nexport const notesData: Note[] = ${JSON.stringify(
      updated,
      null,
      2
    )};\n`;
    fs.writeFileSync(getContentFilePath('notes.ts'), content, 'utf-8');
    revalidatePath('/');
    revalidatePath('/notes');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete note' };
  }
}

export async function triggerGithubSyncAction(): Promise<{ success: boolean; message: string }> {
  if (!(await isAuthenticated())) {
    return { success: false, message: 'Unauthorized: Session expired.' };
  }

  try {
    const scriptCandidate1 = path.resolve(process.cwd(), 'scripts/sync-github.mjs');
    const scriptCandidate2 = path.resolve(process.cwd(), 'frontend/scripts/sync-github.mjs');
    const scriptPath = fs.existsSync(scriptCandidate1) ? scriptCandidate1 : scriptCandidate2;
    const workingDir = path.dirname(path.dirname(scriptPath));

    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, { cwd: workingDir });
    revalidatePath('/');
    revalidatePath('/work');
    revalidatePath('/admin');
    return {
      success: true,
      message: stdout || stderr || 'GitHub sync completed successfully.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to execute GitHub sync script.',
    };
  }
}
